import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { convertTemp, formatTime } from '../../utils/converters';
import { useSettings } from '../../context/SettingsContext';

export const TemperatureChart = ({ hourlyForActiveDate, cityTimezone }) => {
    const { settings } = useSettings();
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!hourlyForActiveDate || hourlyForActiveDate.length === 0) return;
        if (!chartRef.current) return;
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const dataToPlot = hourlyForActiveDate.slice(0, 24);
        const labels = dataToPlot.map(h => formatTime(h.dt, cityTimezone));
        const temps = dataToPlot.map(h => convertTemp(h.temp, settings.temperatureUnit));

        const ctx = chartRef.current.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(100, 210, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(100, 210, 255, 0.0)');

        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: `Temperature (°${settings.temperatureUnit})`,
                    data: temps,
                    borderColor: '#64d2ff',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#0b0c10',
                    pointBorderColor: '#64d2ff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
                scales: {
                    x: { grid: { display: false, drawBorder: false }, ticks: { color: 'rgba(255,255,255,0.7)', maxTicksLimit: 6 } },
                    y: { grid: { color: 'rgba(255,255,255,0.1)', drawBorder: false }, ticks: { color: 'rgba(255,255,255,0.7)', stepSize: 5 } }
                }
            }
        });

        return () => {
            if (chartInstance.current) chartInstance.current.destroy();
        };
    }, [hourlyForActiveDate, settings.temperatureUnit, cityTimezone]);

    return (
        <div className="chart-container" style={{height: '200px', width: '100%', marginBottom: '20px'}}>
            <canvas id="temp-chart" ref={chartRef}></canvas>
        </div>
    );
};

