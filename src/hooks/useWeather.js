/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars, no-empty */
import { useState, useCallback, useEffect, useRef } from 'react';
import { getWMOWeather } from '../utils/converters';
import { useSettings } from '../context/SettingsContext';

const API_KEY = '9f34652a455fc21b6f7b332dcadaa12e';

const showToast = (msg, type = 'info') => {
    window.dispatchEvent(new CustomEvent('showToast', { detail: { msg, type } }));
};

export const useWeather = () => {
    const { settings, CACHE_PREFIX } = useSettings();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const [locationState, setLocationState] = useState(null);
    const [gpsModalOpen, setGpsModalOpen] = useState(false);
    const gpsResolveRef = useRef(null);

    const mapUSAQIToScale = (us_aqi) => {
        if (!us_aqi) return 1;
        return us_aqi;
    };

    const processData = (weather, aqiObj, geoInfo, lat, lon) => {
        const cityTimezone = weather.utc_offset_seconds || 0;
        const current = weather.current;
        const daily = weather.daily || {};
        const isDay = current.is_day === 1;
        const wmo = getWMOWeather(current.weather_code, isDay);
        
        let dailyMap = {};
        if (daily && daily.time) {
            daily.time.forEach((t, idx) => {
                const dStr = new Date((t + cityTimezone) * 1000).toISOString().split('T')[0];
                dailyMap[dStr] = {
                    maxTemp: daily.temperature_2m_max[idx],
                    minTemp: daily.temperature_2m_min[idx],
                    sunrise: daily.sunrise[idx],
                    sunset: daily.sunset[idx],
                    pop: daily.precipitation_probability_max[idx] || 0,
                    icon: getWMOWeather(daily.weather_code[idx], true).icon
                };
            });
        }

        let unifiedHourly = [];
        const nowUnix = current.time;
        let startIndex = weather.hourly.time.findIndex(t => t >= nowUnix);
        if(startIndex < 0) startIndex = 0;

        for(let i = startIndex; i < weather.hourly.time.length; i++) {
            const hIsDay = weather.hourly.is_day ? weather.hourly.is_day[i] === 1 : true;
            const hWmo = getWMOWeather(weather.hourly.weather_code[i], hIsDay);
            
            let hAqiNum = 1, hPm25 = 0, hPm10 = 0, hO3 = 0, hNo2 = 0, hSo2 = 0, hCo = 0;
            if(aqiObj && aqiObj.hourly) {
                const aqiIdx = aqiObj.hourly.time.findIndex(t => t >= weather.hourly.time[i]);
                if(aqiIdx > -1) {
                    hAqiNum = mapUSAQIToScale(aqiObj.hourly.us_aqi[aqiIdx]);
                    hPm25 = aqiObj.hourly.pm2_5[aqiIdx] || 0;
                    hPm10 = aqiObj.hourly.pm10[aqiIdx] || 0;
                    hO3 = (aqiObj.hourly.ozone[aqiIdx] / 1.96) || 0;
                    hNo2 = (aqiObj.hourly.nitrogen_dioxide[aqiIdx] / 1.88) || 0;
                    hSo2 = (aqiObj.hourly.sulphur_dioxide[aqiIdx] / 2.62) || 0;
                    hCo = (aqiObj.hourly.carbon_monoxide[aqiIdx] / 1.145) || 0;
                }
            }

            const localDateObj = new Date((weather.hourly.time[i] + cityTimezone) * 1000);
            const dStr = localDateObj.toISOString().split('T')[0];

            unifiedHourly.push({
                dt: weather.hourly.time[i],
                dateStr: dStr, 
                temp: weather.hourly.temperature_2m[i],
                feels_like: weather.hourly.apparent_temperature ? weather.hourly.apparent_temperature[i] : weather.hourly.temperature_2m[i],
                pop: weather.hourly.precipitation_probability[i] || 0, 
                rain: weather.hourly.precipitation ? weather.hourly.precipitation[i] || 0 : 0,
                wind_speed: weather.hourly.wind_speed_10m ? weather.hourly.wind_speed_10m[i] : 0,
                gusts: weather.hourly.wind_gusts_10m ? weather.hourly.wind_gusts_10m[i] || 0 : 0,
                wind_dir: weather.hourly.wind_direction_10m ? weather.hourly.wind_direction_10m[i] : 0,
                humidity: weather.hourly.relative_humidity_2m ? weather.hourly.relative_humidity_2m[i] : 50,
                clouds: weather.hourly.cloud_cover ? weather.hourly.cloud_cover[i] : 0,
                pressure: weather.hourly.pressure_msl ? weather.hourly.pressure_msl[i] : 1013,
                visibility: weather.hourly.visibility ? weather.hourly.visibility[i] || 10000 : 10000,
                icon: hWmo.icon,
                aqiNum: hAqiNum,
                pm25: hPm25, pm10: hPm10, o3: hO3, no2: hNo2, so2: hSo2, co: hCo
            });
        }

        let groupedForecast = {}; 
        let availableDates = [];
        unifiedHourly.forEach(item => {
            if (!groupedForecast[item.dateStr]) { 
                groupedForecast[item.dateStr] = []; 
                availableDates.push(item.dateStr); 
            }
            groupedForecast[item.dateStr].push(item);
        });

        setWeatherData({
            current,
            dailyMap,
            unifiedHourly,
            groupedForecast,
            availableDates: availableDates.slice(0, 5),
            cityTimezone,
            wmo: [wmo.desc, wmo.icon, wmo.id],
            aqiCurrent: aqiObj && aqiObj.current ? aqiObj.current : null
        });
        setLocationState(geoInfo);
        setLoading(false);
        setError(null);
    };

    const fetchWeatherByCoords = useCallback(async (lat, lon, geoInfo, isBackgroundRefresh = false) => {
        if (!isBackgroundRefresh) setLoading(true);
        setError(null);
        try {
            let hourlyParams = `temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl,visibility,is_day`;
            
            if (settings.lowDataMode) {
                hourlyParams = `temperature_2m,precipitation_probability,weather_code`; 
            }

            let weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility&hourly=${hourlyParams}&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timeformat=unixtime&timezone=auto`;
            let aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,ozone,nitrogen_dioxide,carbon_monoxide,sulphur_dioxide&hourly=us_aqi,pm10,pm2_5,ozone,nitrogen_dioxide,carbon_monoxide,sulphur_dioxide&timeformat=unixtime&timezone=auto`;

            let weatherRes = await fetch(weatherUrl);
            if (!weatherRes.ok) {
                weatherUrl = weatherUrl.replace('timezone=auto', 'timezone=GMT');
                weatherRes = await fetch(weatherUrl);
                if (!weatherRes.ok) throw new Error("Weather servers unreachable.");
            }

            const aqiRes = settings.lowDataMode ? {ok: false} : await fetch(aqiUrl);

            const weather = await weatherRes.json(); 
            const aqiObj = aqiRes.ok ? await aqiRes.json() : null; 
            
            processData(weather, aqiObj, geoInfo, lat, lon);
            
            localStorage.setItem(`${CACHE_PREFIX}last_city`, JSON.stringify(geoInfo));
            
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }, [settings.lowDataMode, CACHE_PREFIX]);

    const fetchWeatherByQuery = useCallback(async (query) => {
        setLoading(true);
        setError(null);
        try {
            const results = [];
            const uniqueLabels = new Set();

            function add(name, state, countryCode, lat, lon) {
                const country = countryCode; 
                const st = (state && state !== name) ? state : '';
                const ctry = (country && country !== st && country !== name) ? country : '';
                const label = [name, st, ctry].filter(Boolean).join(', ');

                if (!uniqueLabels.has(label.toLowerCase())) {
                    uniqueLabels.add(label.toLowerCase());
                    results.push({ label, name, state: st, country: ctry, lat, lon });
                }
            }

            const [omRes, owmRes] = await Promise.allSettled([
                fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`).then(res => res.json()),
                fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${API_KEY}`).then(res => res.json())
            ]);

            if (omRes.status === 'fulfilled' && omRes.value.results && omRes.value.results.length > 0) {
                const r = omRes.value.results[0];
                add(r.name, r.admin1, r.country_code, r.latitude, r.longitude);
            } else if (owmRes.status === 'fulfilled' && Array.isArray(owmRes.value) && owmRes.value.length > 0) {
                const r = owmRes.value[0];
                add(r.name, r.state, r.country, r.lat, r.lon);
            } else {
                throw new Error("City not found.");
            }
            
            const loc = results[0];
            await fetchWeatherByCoords(loc.lat, loc.lon, loc);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }, [fetchWeatherByCoords]);

    const fallbackToLastOrDefault = useCallback(async (showError = false) => {
        const lastViewed = localStorage.getItem(`${CACHE_PREFIX}last_city`);
        if (lastViewed) {
            try {
                const locObj = JSON.parse(lastViewed);
                if (typeof locObj === 'object' && locObj.lat) {
                    await fetchWeatherByCoords(locObj.lat, locObj.lon, locObj);
                    return;
                }
            } catch(e) {}
        }
        if (showError) {
            setError('Could not determine location. Please search for a city.');
            setLoading(false);
        } else {
            setLoading(true);
            try {
                const res = await fetch('https://ipapi.co/json/');
                if(!res.ok) throw new Error("IP Geolocation failed");
                const data = await res.json();
                const geoInfo = { label: `${data.city}, ${data.region}, ${data.country_name}`, lat: data.latitude, lon: data.longitude, name: data.city, state: data.region, country: data.country_name };
                await fetchWeatherByCoords(data.latitude, data.longitude, geoInfo);
            } catch(e) {
                await fetchWeatherByQuery("London");
            }
        }
    }, [fetchWeatherByCoords, fetchWeatherByQuery, CACHE_PREFIX]);

    const handleGeoError = useCallback((geoErr) => {
        switch(geoErr.code) {
            case geoErr.PERMISSION_DENIED:
                showToast("Location permission denied. Allow it in your browser settings.", "warning");
                break;
            case geoErr.POSITION_UNAVAILABLE:
                showToast("GPS appears to be off. Please enable Location Services.", "error");
                break;
            case geoErr.TIMEOUT:
                showToast("Location request timed out. Please try again.", "warning");
                break;
            default:
                showToast("Unable to retrieve location.", "error");
        }
        fallbackToLastOrDefault(true);
    }, [fallbackToLastOrDefault]);

    const performGeolocation = useCallback(async () => {
        setLoading(true);
        setError(null);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`);
                    if (!res.ok) throw new Error("Reverse geocoding failed");
                    const data = await res.json();
                    const address = data.address || {};
                    const geoInfo = {
                        name: address.city || address.town || address.village || address.county || "Local",
                        state: address.state || "",
                        country: address.country || "",
                        label: [address.city || address.town || address.village || address.county || "Local", address.state, address.country].filter(Boolean).join(', '),
                        lat,
                        lon
                    };
                    await fetchWeatherByCoords(lat, lon, geoInfo);
                } catch (err) {
                    fallbackToLastOrDefault(true);
                }
            },
            (err) => {
                handleGeoError(err);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
    }, [fetchWeatherByCoords, handleGeoError, fallbackToLastOrDefault]);

    const showGpsModal = useCallback(() => {
        return new Promise((resolve) => {
            setGpsModalOpen(true);
            gpsResolveRef.current = resolve;
        });
    }, []);

    const handleGpsDecision = useCallback((allowed) => {
        setGpsModalOpen(false);
        if (gpsResolveRef.current) {
            gpsResolveRef.current(allowed);
            gpsResolveRef.current = null;
        }
    }, []);

    const autoLocate = useCallback(async () => {
        if (!navigator.geolocation) {
            showToast("Geolocation is not supported by your browser.", "error");
            fallbackToLastOrDefault(true);
            return;
        }

        if (navigator.permissions && navigator.permissions.query) {
            try {
                const permStatus = await navigator.permissions.query({ name: 'geolocation' });
                if (permStatus.state === 'granted') {
                    performGeolocation();
                } else if (permStatus.state === 'denied') {
                    showToast("Location access is blocked. Enable it in your browser settings.", "warning");
                    fallbackToLastOrDefault(true);
                } else {
                    const userAccepted = await showGpsModal();
                    if (userAccepted) performGeolocation();
                    else fallbackToLastOrDefault(true);
                }
            } catch(e) {
                const userAccepted = await showGpsModal();
                if (userAccepted) performGeolocation();
                else fallbackToLastOrDefault(true);
            }
        } else {
            const userAccepted = await showGpsModal();
            if (userAccepted) performGeolocation();
            else fallbackToLastOrDefault(true);
        }
    }, [performGeolocation, showGpsModal, fallbackToLastOrDefault]);

    useEffect(() => {
        const lastViewed = localStorage.getItem(`${CACHE_PREFIX}last_city`);
        if (settings.forceGps) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            autoLocate();
        } else if (lastViewed && settings.openLast) {
            try {
                const geoInfo = JSON.parse(lastViewed);
                if (geoInfo && geoInfo.lat && geoInfo.lon) {
                    fetchWeatherByCoords(geoInfo.lat, geoInfo.lon, geoInfo);
                } else if (settings.autoLocation) {
                    autoLocate();
                } else {
                    fallbackToLastOrDefault(true);
                }
            } catch(e) {
                if (settings.autoLocation) autoLocate();
                else fallbackToLastOrDefault(true);
            }
        } else {
            if (settings.autoLocation) autoLocate();
            else fallbackToLastOrDefault(true);
        }
    }, [settings.forceGps, settings.openLast, settings.autoLocation, autoLocate, fallbackToLastOrDefault, fetchWeatherByCoords, CACHE_PREFIX]);

    return { 
        loading, 
        error, 
        weatherData, 
        locationState, 
        fetchWeatherByQuery, 
        fetchWeatherByCoords, 
        autoLocate,
        gpsModalOpen,
        handleGpsDecision
    };
};


