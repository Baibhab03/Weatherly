import { useState, useEffect, useRef, useMemo } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { convertTemp, convertSpeed, getSpeedUnit } from '../../utils/converters';
import { HeroHeader } from './HeroHeader';
import { HourlyForecast } from './HourlyForecast';
import { MetricsGrid } from './MetricsGrid';
import Chart from 'chart.js/auto';

export const Dashboard = ({ weatherData, locationState, activeDate, setActiveDate, onSaveCity, isCitySaved, onExport }) => {
    const { settings } = useSettings();
    const [selectedMetric, setSelectedMetric] = useState('overview');
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const hourlyForActiveDate = useMemo(() => {
        return (weatherData && activeDate) ? (weatherData.groupedForecast[activeDate] || []) : [];
    }, [weatherData, activeDate]);

    const isToday = weatherData && weatherData.availableDates && activeDate === weatherData.availableDates[0];
    
    let currentMetrics;
    if (weatherData && activeDate) {
        if (isToday) {
            const nowUnix = weatherData.current.time;
            currentMetrics = hourlyForActiveDate.find(h => h.dt >= nowUnix) || hourlyForActiveDate[0];
        } else {
            currentMetrics = hourlyForActiveDate[Math.floor(hourlyForActiveDate.length / 2)];
        }
        if (!currentMetrics) currentMetrics = weatherData.unifiedHourly[0];
    }

    const dailyData = (weatherData && activeDate) ? (weatherData.dailyMap[activeDate] || {}) : {};
    const cityTimezone = weatherData ? weatherData.cityTimezone : 0;

    // Chart drawing
    useEffect(() => {
        if (!chartRef.current || !hourlyForActiveDate || hourlyForActiveDate.length === 0) return;
        if (chartInstance.current) chartInstance.current.destroy();

        const ctx = chartRef.current.getContext('2d');
        const dayData = hourlyForActiveDate;
        const labels = dayData.map(item => {
            const d = new Date((item.dt + cityTimezone) * 1000);
            let h = d.getUTCHours();
            return `${h % 12 || 12} ${h >= 12 ? 'PM' : 'AM'}`;
        });

        let datasets = [];
        let yAxisConfig = { display: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.6)', padding: 10, font: { family: 'Space Grotesk' } } };
        let gradientFill = ctx.createLinearGradient(0, 0, 0, 300);
        let scalesExtra = {};

        switch (selectedMetric) {
            case 'overview': {
                gradientFill.addColorStop(0, 'rgba(255, 183, 77, 0.5)');
                gradientFill.addColorStop(1, 'rgba(255, 183, 77, 0.0)');
                const temps = dayData.map(d => convertTemp(d.temp, settings.temperatureUnit));
                yAxisConfig.suggestedMin = Math.min(...temps) - 5;
                yAxisConfig.suggestedMax = Math.max(...temps) + 5;
                datasets = [
                    { label: `Temp (°${settings.temperatureUnit})`, data: temps, borderColor: '#ffb74d', backgroundColor: gradientFill, tension: 0.4, fill: true, borderWidth: 3, pointRadius: 4 },
                    { label: `Feels Like`, data: dayData.map(d => convertTemp(d.feels_like, settings.temperatureUnit)), borderColor: 'rgba(255, 255, 255, 0.8)', borderDash: [6, 4], tension: 0.4, fill: false, borderWidth: 2, pointRadius: 0 }
                ];
                break;
            }
            case 'precipitation':
                datasets = [
                    { label: 'Vol (mm)', data: dayData.map(d => d.rain), backgroundColor: 'rgba(100, 210, 255, 0.8)', type: 'bar', borderRadius: 6, yAxisID: 'y' },
                    { label: 'Prob (%)', data: dayData.map(d => d.pop), borderColor: '#ff6b6b', type: 'line', tension: 0.4, yAxisID: 'y1' }
                ];
                yAxisConfig.min = 0;
                scalesExtra = { y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, min: 0, max: 100, ticks: { color: '#ff6b6b' } } };
                break;
            case 'wind':
                gradientFill.addColorStop(0, 'rgba(52, 199, 89, 0.5)');
                gradientFill.addColorStop(1, 'rgba(52, 199, 89, 0.0)');
                datasets = [{ label: `Speed (${getSpeedUnit(settings.windUnit)})`, data: dayData.map(d => convertSpeed(d.wind_speed, settings.windUnit)), borderColor: '#34c759', backgroundColor: gradientFill, tension: 0.4, fill: true }];
                yAxisConfig.min = 0;
                break;
            case 'aqi': {
                let absoluteMax = 0;
                dayData.forEach(d => absoluteMax = Math.max(absoluteMax, d.aqiNum, d.pm25, d.pm10, d.o3, d.no2, d.so2));
                yAxisConfig.min = 0;
                yAxisConfig.max = Math.ceil(absoluteMax) + 50;
                datasets = [
                    { label: 'Index', data: dayData.map(d => d.aqiNum), borderColor: '#af52de', backgroundColor: 'rgba(175, 82, 222, 0.2)', tension: 0.4, fill: true, type: 'line', borderWidth: 3, yAxisID: 'y' },
                    { label: 'PM2.5', data: dayData.map(d => d.pm25), borderColor: '#ff453a', tension: 0.4, fill: false, borderWidth: 1.5, pointRadius: 2, yAxisID: 'y' },
                    { label: 'PM10', data: dayData.map(d => d.pm10), borderColor: '#ff9f0a', tension: 0.4, fill: false, borderWidth: 1.5, pointRadius: 2, yAxisID: 'y' },
                    { label: 'O3', data: dayData.map(d => d.o3), borderColor: '#64d2ff', tension: 0.4, fill: false, borderWidth: 1.5, pointRadius: 2, yAxisID: 'y' },
                    { label: 'NO2', data: dayData.map(d => d.no2), borderColor: '#30d158', tension: 0.4, fill: false, borderWidth: 1.5, pointRadius: 2, yAxisID: 'y' },
                    { label: 'SO2', data: dayData.map(d => d.so2), borderColor: '#ffd60a', tension: 0.4, fill: false, borderWidth: 1.5, pointRadius: 2, yAxisID: 'y' },
                    { label: 'CO', data: dayData.map(d => d.co), borderColor: '#ffffff', tension: 0.4, fill: false, borderWidth: 1.5, pointRadius: 2, yAxisID: 'y1' }
                ];
                scalesExtra = { y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, min: 0, ticks: { color: '#ffffff' } } };
                break;
            }
            case 'humidity':
            case 'clouds': {
                const color = selectedMetric === 'humidity' ? '#0a84ff' : '#8e8e93';
                gradientFill.addColorStop(0, `${color}88`);
                gradientFill.addColorStop(1, `${color}00`);
                datasets = [{ label: `${selectedMetric} (%)`, data: selectedMetric === 'humidity' ? dayData.map(d => d.humidity) : dayData.map(d => d.clouds), borderColor: color, backgroundColor: gradientFill, tension: 0.4, fill: true }];
                yAxisConfig.min = 0;
                yAxisConfig.max = 100;
                break;
            }
        }

        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, animation: { duration: 400, easing: 'easeOutQuart' },
                plugins: {
                    legend: { labels: { color: '#fff', usePointStyle: true, font: { family: 'Inter' } } },
                    tooltip: { backgroundColor: 'rgba(20, 20, 30, 0.9)', titleColor: '#fff', padding: 12, cornerRadius: 12 }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.6)', font: { family: 'Space Grotesk' }, maxTicksLimit: 8, maxRotation: 0, minRotation: 0 } },
                    y: yAxisConfig,
                    ...scalesExtra
                }
            }
        });

        return () => { if (chartInstance.current) chartInstance.current.destroy(); };
    }, [hourlyForActiveDate, selectedMetric, settings.temperatureUnit, settings.windUnit, cityTimezone]);

    if (!weatherData || !activeDate) return null;

    const tabs = [
        { key: 'overview', label: 'Overview' },
        { key: 'precipitation', label: 'Precipitation' },
        { key: 'wind', label: 'Wind' },
        { key: 'aqi', label: 'Air Quality' },
        { key: 'humidity', label: 'Humidity' },
        { key: 'clouds', label: 'Cloud cover' }
    ];

    return (
        <div id="weather-content" aria-live="polite">
            <HeroHeader
                weatherData={weatherData}
                locationState={locationState}
                onSaveCity={onSaveCity}
                isCitySaved={isCitySaved}
                onExport={onExport}
            />

            <HourlyForecast 
                weatherData={weatherData}
                cityTimezone={cityTimezone}
            />

            {/* Master Panel with Chart Tabs + Day Selector + Chart */}
            <section className="master-panel glass-card stagger-anim skeleton-target min-h-450" style={{animationDelay: '0.2s'}}>
                <div className="metric-tabs font-outfit" id="chart-tabs" role="tablist">
                    {tabs.map(tab => (
                        <button key={tab.key} className={`tab-btn ${selectedMetric === tab.key ? 'active' : ''}`}
                            data-metric={tab.key} role="tab" aria-selected={selectedMetric === tab.key}
                            onClick={() => setSelectedMetric(tab.key)}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="day-selector" id="day-selector" role="tablist">
                    {weatherData.availableDates.map((dateStr, idx) => {
                        const dayHourly = weatherData.groupedForecast[dateStr];
                        if (!dayHourly || dayHourly.length === 0) return null;

                        const max = convertTemp(Math.max(...dayHourly.map(d => d.temp)), settings.temperatureUnit);
                        const min = convertTemp(Math.min(...dayHourly.map(d => d.temp)), settings.temperatureUnit);
                        const peakHour = dayHourly.reduce((maxH, h) => h.temp > maxH.temp ? h : maxH, dayHourly[0]);
                        const icon = peakHour.icon;
                        const isActive = dateStr === activeDate;

                        return (
                            <div key={dateStr} className={`day-card ${isActive ? 'active' : ''}`}
                                role="tab" aria-selected={isActive} tabIndex={0}
                                onClick={() => setActiveDate(dateStr)}
                                onKeyPress={(e) => { if (e.key === 'Enter') setActiveDate(dateStr); }}>
                                <div className="dc-name font-outfit">{idx === 0 ? 'Today' : new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                <img className="dc-icon" src={`https://openweathermap.org/img/wn/${icon}@2x.png`} alt="" />
                                <div className="dc-temps font-tech"><span>{max}°</span><span className="op-7">{min}°</span></div>
                            </div>
                        );
                    })}
                </div>

                <div className="chart-wrapper">
                    <canvas id="weatherChart" ref={chartRef} aria-label="Interactive Weather Graph"></canvas>
                </div>
            </section>

            <MetricsGrid 
                currentMetrics={currentMetrics}
                dailyData={dailyData}
                weatherData={weatherData}
            />
        </div>
    );
};
