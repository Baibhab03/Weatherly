import { useSettings } from '../../context/SettingsContext';

const ToggleButton = ({ label, icon, options, activeValue, onChange }) => {
    return (
        <div className="flex justify-between items-center py-4 border-b border-white/5">
            <div className="flex items-center gap-3 text-white">
                <i className={`fa-solid ${icon} w-5 text-center text-accent`}></i>
                <span className="font-inter">{label}</span>
            </div>
            <div className="flex bg-white/5 p-1 rounded-full">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        className={`px-4 py-1.5 rounded-full text-sm font-outfit transition-all duration-300 ${
                            activeValue === opt.value
                                ? 'bg-accent text-bg-main shadow-lg shadow-accent/20'
                                : 'text-muted hover:text-white'
                        }`}
                        onClick={() => onChange(opt.value)}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

const Switch = ({ label, icon, checked, onChange, description }) => {
    return (
        <div className="flex justify-between items-center py-4 border-b border-white/5">
            <div className="flex items-start gap-3 text-white max-w-[80%]">
                <i className={`fa-solid ${icon} w-5 text-center text-accent mt-1`}></i>
                <div className="flex flex-col">
                    <span className="font-inter">{label}</span>
                    {description && <span className="text-xs text-muted mt-1 leading-relaxed">{description}</span>}
                </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={checked} 
                    onChange={(e) => onChange(e.target.checked)} 
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent shadow-inner"></div>
            </label>
        </div>
    );
};

export const SettingsModal = ({ isOpen, onClose }) => {
    const { settings, updateSetting } = useSettings();

    if (!isOpen) return null;

    return (
        <div className="settings-wrapper" style={{display: 'block'}}>
            <nav className="navbar glass-card border-b border-white/10 sticky top-0 z-50">
                <button className="icon-btn" onClick={onClose} aria-label="Back">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <div className="nav-center">
                    <span className="brand-text font-outfit">Settings</span>
                </div>
                <div className="w-10"></div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 py-8 pb-24">
                <div className="settings-section glass-card stagger-anim">
                    <h2 className="font-outfit section-label border-0 text-xl">Units & Formatting</h2>
                    <div className="px-4">
                        <ToggleButton
                            label="Temperature"
                            icon="fa-temperature-half"
                            options={[
                                { label: '°C', value: 'C' },
                                { label: '°F', value: 'F' }
                            ]}
                            activeValue={settings.temperatureUnit}
                            onChange={(val) => updateSetting('temperatureUnit', val)}
                        />
                        <ToggleButton
                            label="Wind Speed"
                            icon="fa-wind"
                            options={[
                                { label: 'km/h', value: 'kmh' },
                                { label: 'mph', value: 'mph' }
                            ]}
                            activeValue={settings.windUnit}
                            onChange={(val) => updateSetting('windUnit', val)}
                        />
                        <ToggleButton
                            label="Distance"
                            icon="fa-ruler"
                            options={[
                                { label: 'km', value: 'km' },
                                { label: 'mi', value: 'mi' }
                            ]}
                            activeValue={settings.distanceUnit}
                            onChange={(val) => updateSetting('distanceUnit', val)}
                        />
                        <ToggleButton
                            label="Pressure"
                            icon="fa-gauge-high"
                            options={[
                                { label: 'hPa', value: 'hPa' },
                                { label: 'mmHg', value: 'mmHg' }
                            ]}
                            activeValue={settings.pressureUnit}
                            onChange={(val) => updateSetting('pressureUnit', val)}
                        />
                    </div>
                </div>

                <div className="settings-section glass-card stagger-anim" style={{animationDelay: '0.1s'}}>
                    <h2 className="font-outfit section-label border-0 text-xl">Location & Privacy</h2>
                    <div className="px-4">
                        <Switch
                            label="Precise GPS Location"
                            icon="fa-location-crosshairs"
                            description="Use exact device GPS instead of network estimation."
                            checked={settings.forceGps}
                            onChange={(val) => updateSetting('forceGps', val)}
                        />
                        <Switch
                            label="Remember Last Location"
                            icon="fa-clock-rotate-left"
                            description="Automatically open the last viewed city on launch."
                            checked={settings.openLast}
                            onChange={(val) => updateSetting('openLast', val)}
                        />
                    </div>
                </div>

                <div className="settings-section glass-card stagger-anim" style={{animationDelay: '0.2s'}}>
                    <h2 className="font-outfit section-label border-0 text-xl">Display & Features</h2>
                    <div className="px-4">
                        <Switch
                            label="UI Animations"
                            icon="fa-wand-magic-sparkles"
                            description="Enable smooth transitions and interactive micro-animations."
                            checked={settings.animations}
                            onChange={(val) => updateSetting('animations', val)}
                        />
                        <Switch
                            label="Data Saver Mode"
                            icon="fa-database"
                            description="Reduce network usage by downloading fewer weather metrics."
                            checked={settings.lowDataMode}
                            onChange={(val) => updateSetting('lowDataMode', val)}
                        />
                        <Switch
                            label="Show 'Last Updated' Time"
                            icon="fa-clock"
                            description="Display the exact time data was fetched."
                            checked={settings.showUpdate}
                            onChange={(val) => updateSetting('showUpdate', val)}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

