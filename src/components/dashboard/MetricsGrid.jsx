/* eslint-disable react-hooks/purity */
import { useSettings } from '../../context/SettingsContext';
import { convertTemp, convertSpeed, convertDist, convertAlt, convertPress, getSpeedUnit, getDistUnit, getAltUnit, getPressUnit, getDir, getAQIMeta, formatTime, calculateDewPoint, evaluateComfort } from '../../utils/converters';

export const MetricsGrid = ({ currentMetrics, dailyData, weatherData }) => {
    const { settings } = useSettings();

    if (!currentMetrics) return null;

    const speedUnit = getSpeedUnit(settings.windUnit);
    const distUnit = getDistUnit(settings.distanceUnit);
    const altUnit = getAltUnit(settings.distanceUnit);
    const pressUnit = getPressUnit(settings.pressureUnit);

    const feelsLike = convertTemp(currentMetrics.feels_like, settings.temperatureUnit);
    const maxTemp = dailyData.maxTemp != null ? convertTemp(dailyData.maxTemp, settings.temperatureUnit) : '--';
    const minTemp = dailyData.minTemp != null ? convertTemp(dailyData.minTemp, settings.temperatureUnit) : '--';
    const rainChance = dailyData.pop != null ? dailyData.pop : 0;

    const humidity = currentMetrics.humidity || 0;
    const dewPoint = calculateDewPoint(currentMetrics.temp, humidity);
    const dewPointConverted = convertTemp(dewPoint, settings.temperatureUnit);
    const comfort = evaluateComfort(dewPoint);

    const pressure = convertPress(currentMetrics.pressure, settings.pressureUnit);
    const visibility = convertDist((currentMetrics.visibility || 10000) / 1000, settings.distanceUnit);

    const windSpeed = convertSpeed(currentMetrics.wind_speed, settings.windUnit);
    const windGusts = convertSpeed(currentMetrics.gusts || 0, settings.windUnit);
    const windDirText = getDir(currentMetrics.wind_dir || 0);
    const windDirDeg = currentMetrics.wind_dir || 0;
    const clouds = currentMetrics.clouds || 0;
    const cloudBase = Math.max(0, convertAlt((currentMetrics.temp - dewPoint) * 125, settings.distanceUnit));

    const sunrise = dailyData.sunrise ? formatTime(dailyData.sunrise, weatherData.cityTimezone) : '--:--';
    const sunset = dailyData.sunset ? formatTime(dailyData.sunset, weatherData.cityTimezone) : '--:--';

    // Daylight left
    const nowUnix = Math.floor(Date.now() / 1000);
    let daylightLeft = '--';
    if (dailyData.sunrise && dailyData.sunset) {
        if (nowUnix < dailyData.sunrise) daylightLeft = 'Pre-dawn';
        else if (nowUnix < dailyData.sunset) {
            const rem = dailyData.sunset - nowUnix;
            daylightLeft = `${Math.floor(rem / 3600)}h ${Math.floor((rem % 3600) / 60)}m left`;
        } else {
            daylightLeft = 'After dusk';
        }
    }

    // Moon phase
    const getMoonPhase = (date) => {
        let y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
        if (m < 3) { y--; m += 12; }
        let jd = 365.25 * y + 30.6 * (m + 1) + d - 694039.09;
        let p = Math.round((jd / 29.5305882 - parseInt(jd / 29.5305882)) * 8);
        return ["New Moon 🌑", "Waxing Crescent 🌒", "First Quarter 🌓", "Waxing Gibbous 🌔", "Full Moon 🌕", "Waning Gibbous 🌖", "Third Quarter 🌗", "Waning Crescent 🌘"][p >= 8 ? 0 : p];
    };
    const moonPhase = getMoonPhase(new Date());

    // Sun arc position
    let sunDotCx = 100, sunDotCy = 15;
    if (dailyData.sunrise && dailyData.sunset) {
        let p = Math.max(0, Math.min(1, (nowUnix - dailyData.sunrise) / (dailyData.sunset - dailyData.sunrise)));
        sunDotCx = 10 + (p * 180);
        sunDotCy = 50 - Math.sin(p * Math.PI) * 40;
    }

    // AQI
    const aqiNum = currentMetrics.aqiNum || 1;
    const aqiMeta = getAQIMeta(aqiNum);
    const aqiCurrent = weatherData.aqiCurrent;

    return (
        <div className="grid-container stagger-anim" style={{animationDelay: '0.3s'}}>
            {/* Daylight & Astronomy */}
            <div className="glass-card data-group">
                <h3 className="font-outfit"><i className="fa-regular fa-sun text-accent"></i> Daylight &amp; Astronomy</h3>
                <div className="group-content">
                    <div className="data-row"><span className="label font-inter">Sunrise</span><strong className="value font-tech" id="sunrise">{sunrise}</strong></div>
                    <div className="data-row"><span className="label font-inter">Sunset</span><strong className="value font-tech" id="sunset">{sunset}</strong></div>
                    <div className="data-row"><span className="label font-inter">Daylight Left</span><strong className="value font-tech accent-text" id="daylight-left">{daylightLeft}</strong></div>
                    <div className="data-row"><span className="label font-inter">Moon Phase</span><strong className="value font-tech" id="moon-phase">{moonPhase}</strong></div>
                    <div className="sun-arc-wrap">
                        <svg viewBox="0 0 200 60" aria-label="Sun Arc Visualization">
                            <path d="M 10 50 Q 100 -20 190 50" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2"/>
                            <path d="M 10 50 Q 100 -20 190 50 Z" fill="rgba(100, 210, 255, 0.1)"/>
                            <circle id="sun-dot" cx={sunDotCx} cy={sunDotCy} r="5" fill="#ffb74d" filter="drop-shadow(0 0 5px #ffb74d)"/>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Extremes & Precipitation */}
            <div className="glass-card data-group">
                <h3 className="font-outfit"><i className="fa-solid fa-temperature-half text-accent"></i> Extremes &amp; Precipitation</h3>
                <div className="group-content">
                    <div className="data-row"><span className="label font-inter">Feels Like</span><strong className="value font-tech temp-value" id="feels-like">{feelsLike}°</strong></div>
                    <div className="data-row"><span className="label font-inter">Max Temp</span><strong className="value font-tech temp-value" id="temp-max">{maxTemp}°</strong></div>
                    <div className="data-row"><span className="label font-inter">Min Temp</span><strong className="value font-tech temp-value" id="temp-min">{minTemp}°</strong></div>
                    <div className="rain-prob-container mt-2">
                        <div className="data-row mb-0"><span className="label font-inter">Rain Chance</span><strong className="value font-tech" id="rain-chance-text">{rainChance}%</strong></div>
                        <div className="progress-bg"><div className="progress-fill" id="rain-bar" style={{width: `${rainChance}%`}}></div></div>
                    </div>
                </div>
            </div>

            {/* Atmosphere */}
            <div className="glass-card data-group">
                <h3 className="font-outfit"><i className="fa-solid fa-droplet text-accent"></i> Atmosphere</h3>
                <div className="group-content">
                    <div className="data-row"><span className="label font-inter">Humidity</span><strong className="value font-tech" id="humidity">{humidity}%</strong></div>
                    <div className="data-row">
                        <span className="label font-inter">Dew Point</span>
                        <div className="insight-value">
                            <strong className="value font-tech temp-value" id="dew-point">{dewPointConverted}°</strong>
                            <span id="comfort-index" className="insight-text">{comfort}</span>
                        </div>
                    </div>
                    <div className="data-row"><span className="label font-inter">Pressure</span><strong className="value font-tech" id="pressure">{pressure} {pressUnit}</strong></div>
                    <div className="data-row"><span className="label font-inter">Visibility</span><strong className="value font-tech dist-value" id="visibility">{visibility} {distUnit}</strong></div>
                </div>
            </div>

            {/* Aviation */}
            <div className="glass-card data-group">
                <h3 className="font-outfit"><i className="fa-solid fa-wind text-accent"></i> Aviation</h3>
                <div className="group-content">
                    <div className="data-row"><span className="label font-inter">Wind Speed</span><strong className="value font-tech speed-value" id="wind-speed">{windSpeed} {speedUnit}</strong></div>
                    <div className="data-row"><span className="label font-inter">Wind Gusts</span><strong className="value font-tech speed-value" id="wind-gusts">{windGusts} {speedUnit}</strong></div>
                    <div className="data-row">
                        <span className="label font-inter">Direction</span>
                        <div className="wind-dir-wrap">
                            <strong className="value font-tech" id="wind-dir-text">{windDirText}</strong>
                            <i className="fa-solid fa-location-arrow wind-arrow" id="wind-arrow" style={{transform: `rotate(${windDirDeg}deg)`}}></i>
                        </div>
                    </div>
                    <div className="data-row"><span className="label font-inter">Cloud Cover</span><strong className="value font-tech" id="clouds">{clouds}%</strong></div>
                    <div className="data-row"><span className="label font-inter">Cloud Ceiling</span><strong className="value font-tech alt-value" id="cloud-base">{cloudBase} {altUnit}</strong></div>
                </div>
            </div>

            {/* Real-time Air Quality */}
            <div className="glass-card data-group full-span">
                <h3 className="font-outfit"><i className="fa-solid fa-leaf text-accent"></i> Real-time Air Quality</h3>
                <div className="aqi-grid">
                    <div className="aqi-box"><span className="aqi-label font-inter">Index (0-500)</span><strong className="aqi-val font-tech" id="aqi-main">{aqiCurrent ? aqiCurrent.us_aqi || '--' : '--'}</strong></div>
                    <div className="aqi-box"><span className="aqi-label font-inter">PM2.5 (µg/m³)</span><strong className="aqi-val font-tech" id="aqi-pm25">{aqiCurrent && aqiCurrent.pm2_5 ? aqiCurrent.pm2_5.toFixed(1) : '--'}</strong></div>
                    <div className="aqi-box"><span className="aqi-label font-inter">PM10 (µg/m³)</span><strong className="aqi-val font-tech" id="aqi-pm10">{aqiCurrent && aqiCurrent.pm10 ? aqiCurrent.pm10.toFixed(1) : '--'}</strong></div>
                    <div className="aqi-box"><span className="aqi-label font-inter">Ozone (ppb)</span><strong className="aqi-val font-tech" id="aqi-o3">{aqiCurrent && aqiCurrent.ozone ? (aqiCurrent.ozone / 1.96).toFixed(1) : '--'}</strong></div>
                    <div className="aqi-box"><span className="aqi-label font-inter">NO2 (ppb)</span><strong className="aqi-val font-tech" id="aqi-no2">{aqiCurrent && aqiCurrent.nitrogen_dioxide ? (aqiCurrent.nitrogen_dioxide / 1.88).toFixed(1) : '--'}</strong></div>
                    <div className="aqi-box"><span className="aqi-label font-inter">SO2 (ppb)</span><strong className="aqi-val font-tech" id="aqi-so2">{aqiCurrent && aqiCurrent.sulphur_dioxide ? (aqiCurrent.sulphur_dioxide / 2.62).toFixed(1) : '--'}</strong></div>
                    <div className="aqi-box"><span className="aqi-label font-inter">CO (ppb)</span><strong className="aqi-val font-tech" id="aqi-co">{aqiCurrent && aqiCurrent.carbon_monoxide ? (aqiCurrent.carbon_monoxide / 1.145).toFixed(0) : '--'}</strong></div>
                </div>
                <p id="aqi-advice" className="insight-text mt-3 text-center" style={{fontSize: '1rem', borderRadius: '8px', color: aqiMeta.color}}>{aqiMeta.label}</p>
            </div>
        </div>
    );
};


