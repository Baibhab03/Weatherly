/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('weatherAppSettings');
        const defaultSettings = {
            temperatureUnit: 'C', windUnit: 'kmh', distanceUnit: 'km', pressureUnit: 'hPa',
            autoLocation: true, forceGps: false, weatherAlerts: true, animations: true, lowDataMode: false,
            openLast: true, showUpdate: true,
            aiSummary: true, bestTime: true, smartInsights: true,
            rainAlerts: true, heatWarnings: true, aqiAlerts: true
        };
        if (saved) {
            try {
                return { ...defaultSettings, ...JSON.parse(saved) };
            } catch {
                return defaultSettings;
            }
        }
        return defaultSettings;
    });

    const CACHE_PREFIX = 'weatherly_v1_';

    useEffect(() => {
        if (settings.animations === false) {
            document.body.classList.add('disable-animations');
        } else {
            document.body.classList.remove('disable-animations');
        }
    }, [settings.animations]);

    const updateSetting = (key, value) => {
        setSettings(prev => {
            const newSettings = { ...prev, [key]: value };
            localStorage.setItem('weatherAppSettings', JSON.stringify(newSettings));
            return newSettings;
        });
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, CACHE_PREFIX }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);

