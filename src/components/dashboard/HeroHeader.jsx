/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useMemo } from 'react';
import { convertTemp, formatTime } from '../../utils/converters';
import { useSettings } from '../../context/SettingsContext';

export const HeroHeader = ({ weatherData, locationState, onSaveCity, isCitySaved, onExport }) => {
    const { settings } = useSettings();
    const [greeting, setGreeting] = useState('--');
    const [bestTimeText, setBestTimeText] = useState('--');
    const [currentTime, setCurrentTime] = useState('--:--');

    const current = weatherData.current;
    const cityTimezone = weatherData.cityTimezone;
    const wmo = weatherData.wmo; // [desc, icon, id]
    const temp = convertTemp(current.temperature_2m, settings.temperatureUnit);
    const feelsLike = convertTemp(current.apparent_temperature, settings.temperatureUnit);
    const daily = useMemo(() => weatherData.dailyMap[weatherData.availableDates[0]] || {}, [weatherData]);

    // Greeting
    useEffect(() => {
        const h = new Date((Date.now() / 1000 + cityTimezone) * 1000).getUTCHours();
        if (h >= 5 && h < 12) setGreeting("Good Morning ☀️");
        else if (h >= 12 && h < 17) setGreeting("Good Afternoon 🌤");
        else if (h >= 17 && h < 21) setGreeting("Good Evening 🌙");
        else setGreeting("Good Night 🌌");
    }, [cityTimezone]);

    // Best time
    useEffect(() => {
        if (!settings.bestTime) { setBestTimeText(''); return; }
        const forecast = weatherData.unifiedHourly.slice(0, 8);
        const best = forecast.find(i => (i.pop || 0) < 30 && i.temp > 20 && i.temp < 32);
        if (best) {
            const d = new Date((best.dt + cityTimezone) * 1000);
            let h = d.getUTCHours();
            setBestTimeText(`Ideal time out: ${h % 12 || 12} ${h >= 12 ? "PM" : "AM"} 🌤`);
        } else {
            setBestTimeText("No ideal window today ⛈️");
        }
    }, [weatherData, cityTimezone, settings.bestTime]);

    // Clock
    useEffect(() => {
        const tick = () => {
            const nowUnix = Math.floor(Date.now() / 1000);
            setCurrentTime(formatTime(nowUnix, cityTimezone));
        };
        tick();
        const timer = setInterval(tick, 60000);
        return () => clearInterval(timer);
    }, [cityTimezone]);

    // Last updated
    const lastUpdated = useMemo(() => {
        if (!settings.showUpdate) return null;
        const d = new Date();
        return `Updated: ${d.getHours() % 12 || 12}:${d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
    }, [settings.showUpdate]);

    // AI Briefing
    const aiBriefing = useMemo(() => {
        if (!settings.aiSummary) return null;
        const tempC = current.temperature_2m;
        const fl = current.apparent_temperature;
        const rainPop = daily.pop || 0;
        const isFreezing = tempC <= 0;
        let brief = `Conditions are mostly ${wmo[0].toLowerCase()}. `;
        if (tempC > 32 || fl >= 35) brief += `Extreme heat warning, stay hydrated and avoid prolonged sun exposure. `;
        else if (tempC <= 5) brief += `Freezing temperatures, dress warmly. `;
        else if (fl > tempC + 2) brief += `High humidity makes it feel warmer. `;
        else if (fl < tempC - 2) brief += `Wind chill makes it feel colder. `;
        if (rainPop > 60) brief += isFreezing ? `High probability of snowfall. ` : `High probability of precipitation. `;
        else if (current.wind_speed_10m > 30) brief += `Expect strong gusts of wind. `;
        else if (rainPop < 20 && tempC > 18 && tempC < 28) brief += `Ideal conditions for outdoor activities. `;
        return brief;
    }, [current, wmo, daily, settings.aiSummary]);

    const stateText = (locationState.state && locationState.state !== locationState.name) ? `, ${locationState.state}` : '';

    return (
        <section className="hero-block glass-card stagger-anim">
            <div className="hero-header-row">
                <div className="hero-text">
                    <p id="greeting-text" className="greeting-text mv-boli">{greeting}</p>
                    <h2 id="city-name" className="city-title font-outfit">{locationState.name}{stateText}</h2>
                    <p id="country-name" className="country-title font-inter mb-1">{locationState.country}</p>

                    <div className="time-row mb-2">
                        <p id="full-time-display" className="time-stamp font-tech">{currentTime}</p>
                        {settings.showUpdate && (
                            <>
                                <span className="divider op-7" style={{margin: '0 8px'}}>|</span>
                                <span id="last-updated" className="last-updated">{lastUpdated}</span>
                            </>
                        )}
                    </div>

                    {settings.bestTime && bestTimeText && (
                        <p className="best-time-text best-time-desktop font-inter">{bestTimeText}</p>
                    )}
                </div>

                <div className="hero-right-panel">
                    <div className="hero-actions">
                        <button id="export-btn" className="action-btn glass-card" aria-label="Copy Weather Info" onClick={onExport}>
                            <i className="fa-solid fa-share-nodes"></i>
                        </button>
                        <button id="save-city-btn" className={`save-btn glass-card action-btn ${isCitySaved ? 'saved' : ''}`} aria-label="Save Location" onClick={onSaveCity}>
                            <i className={`fa-${isCitySaved ? 'solid' : 'regular'} fa-bookmark`}></i>
                        </button>
                    </div>
                    {settings.bestTime && bestTimeText && (
                        <p className="best-time-text best-time-mobile mt-3 font-inter">{bestTimeText}</p>
                    )}
                </div>
            </div>

            <div className="main-display">
                <div className="animated-icon-container">
                    <img id="weather-icon" src={`https://openweathermap.org/img/wn/${wmo[1]}@4x.png`} alt="Weather Condition" className="realtime-icon float-anim" />
                </div>
                <div className="temp-wrap">
                    <div style={{display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '5px'}}>
                        <h1 id="temperature" className="main-temp arial-rounded">{temp}°</h1>
                        <p className="font-inter" style={{fontSize: '1.1rem', color: 'var(--text-muted)', paddingBottom: '8px'}}>
                            Feels like <strong className="feels-like temp-value" style={{color: '#fff'}}>{feelsLike}°</strong>
                        </p>
                    </div>
                    <p id="weather-description" className="weather-desc font-outfit" style={{marginTop: 0}}>{wmo[0]}</p>
                    {aiBriefing && (
                        <div className="ai-briefing glass-inner mt-2">
                            <i className="fa-solid fa-sparkles text-accent" aria-hidden="true"></i>
                            <span id="ai-summary" className="font-inter text-sm">{aiBriefing}</span>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};


