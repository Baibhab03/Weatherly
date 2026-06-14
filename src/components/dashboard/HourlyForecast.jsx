import { convertTemp } from '../../utils/converters';
import { useSettings } from '../../context/SettingsContext';

export const HourlyForecast = ({ weatherData, cityTimezone }) => {
    const { settings } = useSettings();

    const hourly24 = weatherData?.unifiedHourly ? weatherData.unifiedHourly.slice(0, 24) : [];

    if (!hourly24 || hourly24.length === 0) return null;

    return (
        <section className="hourly-panel glass-card stagger-anim" style={{animationDelay: '0.1s'}}>
            <h3 className="font-outfit section-label border-0" id="hourly-label">24-Hour Forecast</h3>
            <div className="hourly-scroll min-h-120" id="hourly-forecast" role="list">
                {hourly24.map((item, idx) => {
                    const d = new Date((item.dt + cityTimezone) * 1000);
                    let h = d.getUTCHours();
                    const timeStr = `${h % 12 || 12} ${h >= 12 ? 'PM' : 'AM'}`;
                    return (
                        <div key={idx} className="hourly-card" tabIndex="0" role="listitem">
                            <span className="hc-time font-tech">{idx === 0 ? 'Now' : timeStr}</span>
                            <img src={`https://openweathermap.org/img/wn/${item.icon}.png`} className="hc-icon" alt="" />
                            <span className="hc-temp font-tech">{convertTemp(item.temp, settings.temperatureUnit)}°</span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
