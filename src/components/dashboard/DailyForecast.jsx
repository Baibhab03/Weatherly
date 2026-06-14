import { convertTemp } from '../../utils/converters';
import { useSettings } from '../../context/SettingsContext';

export const DailyForecast = ({ weatherData, activeDate, setActiveDate }) => {
    const { settings } = useSettings();

    if (!weatherData || !weatherData.availableDates) return null;

    return (
        <div className="day-selector" style={{overflowY: 'visible'}} id="day-selector" role="tablist">
            {weatherData.availableDates.map((date, idx) => {
                const dayData = weatherData.dailyMap[date];
                const dateObj = new Date(date);
                const dayName = idx === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const dateNum = dateObj.getDate();
                const isActive = activeDate === date;

                return (
                    <button 
                        key={date} 
                        className={`day-card ${isActive ? 'active' : ''}`} 
                        role="tab" 
                        aria-selected={isActive} 
                        onClick={() => setActiveDate(date)}
                    >
                        <span className="day-name font-outfit">{dayName}</span>
                        <span className="day-date font-inter">{dateNum}</span>
                        <i className={`fa-solid ${dayData.icon} day-icon`}></i>
                        <div className="day-temp-bar">
                            <span className="day-temp-max font-outfit temp-value">{convertTemp(dayData.maxTemp, settings.temperatureUnit)}°</span>
                            <div className="temp-bar-bg"><div className="temp-bar-fill"></div></div>
                            <span className="day-temp-min font-inter temp-value">{convertTemp(dayData.minTemp, settings.temperatureUnit)}°</span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

