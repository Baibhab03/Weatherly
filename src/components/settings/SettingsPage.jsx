import { useSettings } from '../../context/SettingsContext';

const ToggleSwitch = ({ id, checked, onChange }) => (
    <label className="toggle-switch">
        <input type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="toggle-slider-round">
            <span className="toggle-state toggle-state-off" aria-hidden="true"></span>
            <span className="toggle-state toggle-state-on" aria-hidden="true"></span>
        </span>
    </label>
);

const UnitToggle = ({ id, leftLabel, rightLabel, isRight, onToggle }) => (
    <div className="glass-toggle small-toggle" id={id} data-selected={isRight ? 'right' : 'left'} role="radiogroup">
        <div className="toggle-slider" style={{ transform: isRight ? 'translateX(100%)' : 'translateX(0)' }}></div>
        <button className={`toggle-btn unit-btn ${!isRight ? 'active' : ''}`} onClick={() => onToggle(false)}>{leftLabel}</button>
        <button className={`toggle-btn unit-btn ${isRight ? 'active' : ''}`} onClick={() => onToggle(true)}>{rightLabel}</button>
    </div>
);

export const SettingsPage = ({ onBack }) => {
    const { settings, updateSetting, CACHE_PREFIX } = useSettings();

    const showToast = (msg, type = 'info') => {
        window.dispatchEvent(new CustomEvent('showToast', { detail: { msg, type } }));
    };

    const clearCache = () => {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX) && !k.includes('saved') && !k.includes('recents'));
        keys.forEach(k => localStorage.removeItem(k));
        showToast('Cache cleared!', 'success');
    };

    const clearSaved = () => {
        localStorage.removeItem(`${CACHE_PREFIX}saved`);
        showToast('Saved cities cleared!', 'success');
    };

    const clearRecents = () => {
        localStorage.removeItem(`${CACHE_PREFIX}recents`);
        showToast('Search history cleared!', 'success');
    };

    const factoryReset = () => {
        Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX) || k === 'weatherAppSettings').forEach(k => localStorage.removeItem(k));
        showToast('App has been reset!', 'success');
        setTimeout(() => window.location.reload(), 500);
    };

    return (
        <>
            <header className="settings-header">
                <div className="settings-header-inner">
                    <a href="#" className="back-btn" aria-label="Go back to dashboard" onClick={(e) => { e.preventDefault(); onBack(); }}>
                        <i className="fa-solid fa-chevron-left"></i>
                    </a>
                    <h1 className="font-outfit">Settings</h1>
                    <div style={{width: '40px'}}></div>
                </div>
            </header>
            <div className="settings-wrapper">

            <main className="settings-content">
                {/* Units & Measurement */}
                <section className="settings-group glass-card stagger-anim" style={{animationDelay: '0.05s'}}>
                    <h2 className="font-outfit group-title"><i className="fa-solid fa-ruler text-accent"></i> Units &amp; Measurement</h2>
                    <div className="setting-item">
                        <span className="setting-label font-inter">Temperature</span>
                        <UnitToggle id="temp-toggle" leftLabel="°C" rightLabel="°F"
                            isRight={settings.temperatureUnit === 'F'}
                            onToggle={(r) => updateSetting('temperatureUnit', r ? 'F' : 'C')} />
                    </div>
                    <div className="setting-item">
                        <span className="setting-label font-inter">Wind Speed</span>
                        <UnitToggle id="wind-toggle" leftLabel="km/h" rightLabel="mph"
                            isRight={settings.windUnit === 'mph'}
                            onToggle={(r) => updateSetting('windUnit', r ? 'mph' : 'kmh')} />
                    </div>
                    <div className="setting-item">
                        <span className="setting-label font-inter">Distance</span>
                        <UnitToggle id="dist-toggle" leftLabel="km" rightLabel="mi"
                            isRight={settings.distanceUnit === 'mi'}
                            onToggle={(r) => updateSetting('distanceUnit', r ? 'mi' : 'km')} />
                    </div>
                    <div className="setting-item border-0">
                        <span className="setting-label font-inter">Pressure</span>
                        <UnitToggle id="press-toggle" leftLabel="hPa" rightLabel="mmHg"
                            isRight={settings.pressureUnit === 'mmHg'}
                            onToggle={(r) => updateSetting('pressureUnit', r ? 'mmHg' : 'hPa')} />
                    </div>
                </section>

                {/* Location Preferences */}
                <section className="settings-group glass-card stagger-anim" style={{animationDelay: '0.1s'}}>
                    <h2 className="font-outfit group-title"><i className="fa-solid fa-location-crosshairs text-accent"></i> Location Preferences</h2>
                    <div className="setting-item">
                        <div className="setting-info">
                            <span className="setting-label font-inter">Auto-detect Location</span>
                            <span className="setting-desc font-inter">Locate on launch if no city is saved.</span>
                        </div>
                        <ToggleSwitch id="loc_auto" checked={settings.autoLocation} onChange={(v) => updateSetting('autoLocation', v)} />
                    </div>
                    <div className="setting-item border-0">
                        <div className="setting-info">
                            <span className="setting-label font-inter">Force GPS Every Time</span>
                            <span className="setting-desc font-inter">Always use device GPS on app launch.</span>
                        </div>
                        <ToggleSwitch id="loc_gps_always" checked={settings.forceGps} onChange={(v) => updateSetting('forceGps', v)} />
                    </div>
                </section>

                {/* Notifications */}
                <section className="settings-group glass-card stagger-anim" style={{animationDelay: '0.15s'}}>
                    <h2 className="font-outfit group-title"><i className="fa-solid fa-bell text-accent"></i> Notifications</h2>
                    <div className="setting-item">
                        <span className="setting-label font-inter">Weather Alerts</span>
                        <ToggleSwitch id="notif_weather" checked={settings.weatherAlerts} onChange={(v) => updateSetting('weatherAlerts', v)} />
                    </div>
                    <div className="setting-item">
                        <span className="setting-label font-inter">Rain Alerts</span>
                        <ToggleSwitch id="notif_rain" checked={settings.rainAlerts} onChange={(v) => updateSetting('rainAlerts', v)} />
                    </div>
                    <div className="setting-item">
                        <span className="setting-label font-inter">Heat Warnings</span>
                        <ToggleSwitch id="notif_heat" checked={settings.heatWarnings} onChange={(v) => updateSetting('heatWarnings', v)} />
                    </div>
                    <div className="setting-item border-0">
                        <span className="setting-label font-inter">AQI Alerts</span>
                        <ToggleSwitch id="notif_aqi" checked={settings.aqiAlerts} onChange={(v) => updateSetting('aqiAlerts', v)} />
                    </div>
                </section>

                {/* Performance */}
                <section className="settings-group glass-card stagger-anim" style={{animationDelay: '0.2s'}}>
                    <h2 className="font-outfit group-title"><i className="fa-solid fa-gauge-high text-accent"></i> Performance</h2>
                    <div className="setting-item">
                        <div className="setting-info">
                            <span className="setting-label font-inter">Enable Animations</span>
                            <span className="setting-desc font-inter">Rain, snow, and floating UI effects.</span>
                        </div>
                        <ToggleSwitch id="perf_anim" checked={settings.animations} onChange={(v) => updateSetting('animations', v)} />
                    </div>
                    <div className="setting-item border-0">
                        <div className="setting-info">
                            <span className="setting-label font-inter">Low Data Mode</span>
                            <span className="setting-desc font-inter">Reduce API calls and background syncing.</span>
                        </div>
                        <ToggleSwitch id="perf_low_data" checked={settings.lowDataMode} onChange={(v) => updateSetting('lowDataMode', v)} />
                    </div>
                </section>

                {/* Smart Features */}
                <section className="settings-group glass-card stagger-anim" style={{animationDelay: '0.25s'}}>
                    <h2 className="font-outfit group-title"><i className="fa-solid fa-sparkles text-accent"></i> Smart Features</h2>
                    <div className="setting-item">
                        <span className="setting-label font-inter">AI Weather Summary</span>
                        <ToggleSwitch id="smart_ai" checked={settings.aiSummary} onChange={(v) => updateSetting('aiSummary', v)} />
                    </div>
                    <div className="setting-item">
                        <span className="setting-label font-inter">Smart Insights Badges</span>
                        <ToggleSwitch id="smart_insights" checked={settings.smartInsights} onChange={(v) => updateSetting('smartInsights', v)} />
                    </div>
                    <div className="setting-item border-0">
                        <span className="setting-label font-inter">Best Time Suggestions</span>
                        <ToggleSwitch id="smart_best_time" checked={settings.bestTime} onChange={(v) => updateSetting('bestTime', v)} />
                    </div>
                </section>

                {/* App Behavior */}
                <section className="settings-group glass-card stagger-anim" style={{animationDelay: '0.3s'}}>
                    <h2 className="font-outfit group-title"><i className="fa-solid fa-mobile-screen text-accent"></i> App Behavior</h2>
                    <div className="setting-item">
                        <span className="setting-label font-inter">Open Last Searched City</span>
                        <ToggleSwitch id="app_open_last" checked={settings.openLast} onChange={(v) => updateSetting('openLast', v)} />
                    </div>
                    <div className="setting-item border-0">
                        <span className="setting-label font-inter">Show Last Updated Time</span>
                        <ToggleSwitch id="app_show_update" checked={settings.showUpdate} onChange={(v) => updateSetting('showUpdate', v)} />
                    </div>
                </section>

                {/* Data & Privacy */}
                <section className="settings-group glass-card stagger-anim" style={{animationDelay: '0.35s'}}>
                    <h2 className="font-outfit group-title"><i className="fa-solid fa-database text-accent"></i> Data &amp; Privacy</h2>
                    <div className="setting-item">
                        <span className="setting-label font-inter">Clear Cache</span>
                        <button id="clear-cache-btn" className="action-btn outline-btn" onClick={clearCache}>Clear</button>
                    </div>
                    <div className="setting-item">
                        <span className="setting-label font-inter">Clear Saved Cities</span>
                        <button id="clear-saved-btn" className="action-btn outline-btn" onClick={clearSaved}>Clear</button>
                    </div>
                    <div className="setting-item">
                        <span className="setting-label font-inter">Clear Search History</span>
                        <button id="clear-recents-btn" className="action-btn outline-btn" onClick={clearRecents}>Clear</button>
                    </div>
                    <div className="setting-item border-0">
                        <div className="setting-info">
                            <span className="setting-label font-inter text-danger">Reset App</span>
                            <span className="setting-desc font-inter">Wipes all settings and user data.</span>
                        </div>
                        <button id="factory-reset-btn" className="action-btn danger-btn" onClick={factoryReset}>Reset</button>
                    </div>
                </section>
            </main>

            <footer className="about-footer stagger-anim" style={{animationDelay: '0.4s'}}>
                <p className="font-tech text-accent mb-1" style={{fontSize: '1.1rem', fontWeight: 600}}>Weatherly Pro</p>
                <p className="font-inter text-sm op-7 mb-1">Version 2.0.0</p>
                <p className="font-inter text-sm op-7 mb-2">Powered by Open-Meteo &amp; OpenWeatherMap</p>
            </footer>
        </div>
        </>
    );
};

