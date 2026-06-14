/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useRef } from 'react';
import { useWeather } from './hooks/useWeather';
import { useSettings } from './context/SettingsContext';
import { BackgroundRenderer } from './components/layout/BackgroundRenderer';
import { Dashboard } from './components/dashboard/Dashboard';
import { SettingsPage } from './components/settings/SettingsPage';
import { ToastContainer } from './components/layout/ToastContainer';

function App() {
    const { loading, error, weatherData, locationState, fetchWeatherByQuery, autoLocate, fetchWeatherByCoords, gpsModalOpen, handleGpsDecision } = useWeather();
    const { settings } = useSettings();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [activeDate, setActiveDate] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [savedCities, setSavedCities] = useState([]);
    const [recents, setRecents] = useState([]);
    
    // Search suggestions
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimeout = useRef(null);
    const API_KEY = '9f34652a455fc21b6f7b332dcadaa12e';
    const cityInputRef = useRef(null);

    const CACHE_PREFIX = 'weatherly_v1_';

    useEffect(() => {
        if (weatherData && weatherData.availableDates && !activeDate) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveDate(weatherData.availableDates[0]);
        }
    }, [weatherData, activeDate]);

    function loadSidebarData() {
        const s = JSON.parse(localStorage.getItem(`${CACHE_PREFIX}saved`)) || [];
        const r = JSON.parse(localStorage.getItem(`${CACHE_PREFIX}recents`)) || [];
        setSavedCities(Array.isArray(s) ? s.filter(x => typeof x !== 'string') : []);
        setRecents(Array.isArray(r) ? r.filter(x => typeof x !== 'string') : []);
    }

    useEffect(() => {
        loadSidebarData();
    }, [sidebarOpen]);

    useEffect(() => {
        if (locationState) {
            setRecents(prev => {
                const filtered = prev.filter(item => item.label !== locationState.label);
                const updated = [locationState, ...filtered].slice(0, 5); // keep last 5
                localStorage.setItem(`${CACHE_PREFIX}recents`, JSON.stringify(updated));
                return updated;
            });
        }
    }, [locationState]);

    const handleSearch = (query) => {
        if (!query || !query.trim()) return;
        setSidebarOpen(false);
        setSearchQuery('');
        fetchWeatherByQuery(query.trim());
    };

    const handleSearchInput = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        
        if (!val.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        searchTimeout.current = setTimeout(async () => {
            try {
                const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(val)}&limit=5&appid=${API_KEY}`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                setSuggestions(data || []);
                setShowSuggestions(data && data.length > 0);
            } catch {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);
    };

    const toggleMenu = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const isCitySaved = () => {
        if (!locationState) return false;
        return savedCities.some(c => c.label === locationState.label);
    };

    const handleSaveCity = () => {
        if (!locationState) return;
        let saved = [...savedCities];
        const idx = saved.findIndex(c => c.label === locationState.label);
        if (idx > -1) {
            saved.splice(idx, 1);
        } else {
            saved.push(locationState);
        }
        setSavedCities(saved);
        localStorage.setItem(`${CACHE_PREFIX}saved`, JSON.stringify(saved));
    };

    const handleClearHistory = () => {
        setRecents([]);
        localStorage.removeItem(`${CACHE_PREFIX}recents`);
    };

    const handleDeleteSaved = (label) => {
        const updated = savedCities.filter(c => c.label !== label);
        setSavedCities(updated);
        localStorage.setItem(`${CACHE_PREFIX}saved`, JSON.stringify(updated));
    };

    const handleExport = () => {
        if (!weatherData || !locationState) return;
        const tempUnit = settings.temperatureUnit === 'F' ? '°F' : '°C';
        const temp = settings.temperatureUnit === 'F' 
            ? Math.round((weatherData.current.temperature_2m * 9/5) + 32) 
            : Math.round(weatherData.current.temperature_2m);
        navigator.clipboard.writeText(`Weather in ${locationState.label}\nTemp: ${temp}${tempUnit}`);
        window.dispatchEvent(new CustomEvent('showToast', { detail: { msg: 'Copied to clipboard!', type: 'success' } }));
    };

    if (settingsOpen) {
        return (
            <>
                <ToastContainer />
                <SettingsPage onBack={() => setSettingsOpen(false)} />
            </>
        );
    }

    return (
        <>
            <div id="toast-container-root">
                <ToastContainer />
            </div>
            <div id="weather-anim-layer" className="weather-anim-layer" aria-hidden="true"></div>

            {weatherData && weatherData.current && (
                <BackgroundRenderer 
                    weatherCode={weatherData.current.weather_code} 
                    isDay={weatherData.current.is_day === 1}
                    temp={weatherData.current.temperature_2m}
                    wmoId={weatherData.wmo ? weatherData.wmo[2] : 800}
                    wmoIcon={weatherData.wmo ? weatherData.wmo[1] : '01d'}
                />
            )}

            {/* GPS Permission Modal */}
            {gpsModalOpen && (
                <div id="gps-modal-overlay" className="gps-modal-overlay" aria-modal="true" role="dialog" aria-labelledby="gps-modal-title">
                    <div className="gps-modal glass-card">
                        <div className="gps-modal-icon">
                            <i className="fa-solid fa-location-crosshairs"></i>
                        </div>
                        <h2 id="gps-modal-title" className="font-outfit">Enable Location Access</h2>
                        <p className="font-inter gps-modal-desc">Allow Weatherly to access your location for accurate local weather data, forecasts, and air quality information.</p>
                        <div className="gps-modal-actions">
                            <button id="gps-allow-btn" className="gps-btn gps-btn-primary font-outfit" onClick={() => handleGpsDecision(true)}>
                                <i className="fa-solid fa-location-dot"></i> Allow Location
                            </button>
                            <button id="gps-deny-btn" className="gps-btn gps-btn-secondary font-inter" onClick={() => handleGpsDecision(false)}>
                                Search Manually
                            </button>
                        </div>
                        <p className="gps-modal-note font-inter">Your location data is never stored on our servers.</p>
                    </div>
                </div>
            )}

            {/* Navbar */}
            <header className="navbar">
                <div className="navbar-inner">
                    <button id="menu-btn" className={`menu-trigger ${sidebarOpen ? 'active' : ''}`} aria-label="Open Menu" onClick={toggleMenu}>
                        <span></span><span></span>
                    </button>
                    <div className="search-wrapper" onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget)) setShowSuggestions(false);
                    }}>
                        <div className="search-container glass-card no-hover" role="search">
                            <input 
                                type="text" 
                                id="city-input" 
                                ref={cityInputRef}
                                placeholder="Search city or country..." 
                                autoComplete="off" 
                                aria-label="Search location"
                                value={searchQuery}
                                onChange={handleSearchInput}
                                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') { setShowSuggestions(false); handleSearch(searchQuery); } }}
                            />
                            <button id="search-btn" className="action-btn" aria-label="Execute search" onClick={() => { setShowSuggestions(false); handleSearch(searchQuery); }}>
                                <i className="fa-solid fa-magnifying-glass"></i>
                            </button>
                        </div>
                        <ul id="search-suggestions" className={`suggestions-list ${showSuggestions ? '' : 'hidden'}`} role="listbox">
                            {suggestions.map((s, idx) => (
                                <li key={idx} className="suggestion-item" role="option" aria-selected="false" tabIndex="0"
                                    onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                                    onClick={() => {
                                        const query = `${s.name}${s.state ? ', ' + s.state : ''}, ${s.country}`;
                                        setSearchQuery(query);
                                        setShowSuggestions(false);
                                        handleSearch(query);
                                    }}>
                                    <i className="fa-solid fa-location-dot"></i>
                                    <div className="sugg-text">
                                        <span className="sugg-city">{s.name}, </span>
                                        <span className="sugg-country">{s.state ? `${s.state}, ` : ''}{s.country}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <nav id="sidebar" className={`sidebar glass-card ${sidebarOpen ? 'active' : ''}`} aria-label="Main Navigation">
                <div className="sidebar-header">
                    <h2 className="mv-boli">Weatherly</h2>
                    <button id="close-menu-btn" className="close-btn" aria-label="Close menu" onClick={() => setSidebarOpen(false)}>&times;</button>
                </div>
                <div className="sidebar-body">
                    <ul className="menu-links">
                        <li><a href="#" className="nav-item active" id="home-btn" aria-label="Dashboard" onClick={(e) => { e.preventDefault(); setSidebarOpen(false); }}><i className="fa-solid fa-house"></i> Dashboard</a></li>
                        <li><a href="#" className="nav-item" id="auto-locate-btn" aria-label="Locate Me" onClick={(e) => { e.preventDefault(); setSidebarOpen(false); autoLocate(); }}><i className="fa-solid fa-location-crosshairs"></i> Auto Locate</a></li>
                        <li><a href="#" className="nav-item" aria-label="Settings" onClick={(e) => { e.preventDefault(); setSidebarOpen(false); setSettingsOpen(true); }}><i className="fa-solid fa-gear"></i> Settings</a></li>
                    </ul>

                    <div className="sidebar-section mt-3">
                        <div className="section-header-row">
                            <h3 className="font-outfit text-sm">Recent Searches</h3>
                            {recents.length > 0 && (
                                <button id="clear-history-btn" className="clear-btn" aria-label="Clear history" onClick={handleClearHistory}>
                                    <i className="fa-solid fa-eraser"></i> Clear
                                </button>
                            )}
                        </div>
                        <ul id="recent-searches-list" className="sidebar-list" role="list">
                            {recents.length === 0 ? (
                                <li style={{opacity: 0.5, fontSize: '14px', paddingLeft: '15px'}}>No recent searches.</li>
                            ) : (
                                recents.map((locObj, idx) => (
                                    <li key={idx} onClick={() => { setSidebarOpen(false); fetchWeatherByQuery(locObj.label); }}>
                                        <span className="city-name-link font-tech" style={{width: '100%'}} tabIndex="0" role="button">
                                            <i className="fa-solid fa-clock-rotate-left" style={{marginRight: '10px', opacity: 0.5}}></i>
                                            {locObj.label}
                                        </span>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    <div className="sidebar-section">
                        <h3 className="font-outfit text-sm">Saved Locations</h3>
                        <ul id="saved-cities-list" className="sidebar-list" role="list">
                            {savedCities.length === 0 ? (
                                <li style={{opacity: 0.5, paddingLeft: '15px', fontSize: '14px'}}>No saved locations.</li>
                            ) : (
                                savedCities.map((locObj, idx) => (
                                    <li key={idx}>
                                        <span className="city-name-link font-tech" style={{flex: 1}} tabIndex="0" role="button" onClick={() => { setSidebarOpen(false); fetchWeatherByCoords(locObj.lat, locObj.lon, locObj); }}>
                                            <i className="fa-solid fa-star" style={{marginRight: '10px', color: '#ffb74d'}}></i>
                                            {locObj.label}
                                        </span>
                                        <button className="delete-city" aria-label="Delete" onClick={(e) => { e.stopPropagation(); handleDeleteSaved(locObj.label); }}>
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Overlay */}
            <div id="overlay" className={`overlay ${sidebarOpen ? 'active' : ''}`} aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>

            {/* Main Content */}
            <main className="app-wrapper">
                <div id="pull-to-refresh" className="ptr-container">
                    <div className="ptr-icon glass-card">
                        <i className="fa-solid fa-arrow-down ptr-arrow"></i>
                        <i className="fa-solid fa-circle-notch fa-spin ptr-spinner" style={{display: 'none'}}></i>
                    </div>
                </div>

                {error && (
                    <div id="error-msg" className="error-msg glass-card font-outfit" role="alert">
                        {error}
                        <br/>
                        <button onClick={autoLocate} className="action-btn" style={{marginTop: '15px', padding: '8px 20px', borderRadius: '100px', fontSize: '0.9rem', cursor: 'pointer'}}>
                            <i className="fa-solid fa-rotate-right"></i> Try Again
                        </button>
                    </div>
                )}

                {loading && !error && (
                    <div id="weather-content" className="is-loading" aria-live="polite">
                        {/* Skeleton loading sections */}
                        <section className="hero-block glass-card stagger-anim">
                            <div className="hero-header-row">
                                <div className="hero-text">
                                    <p className="greeting-text mv-boli skeleton-target">--</p>
                                    <h2 className="city-title font-outfit skeleton-target">--</h2>
                                    <p className="country-title font-inter skeleton-target mb-1">--</p>
                                </div>
                            </div>
                            <div className="main-display">
                                <div className="animated-icon-container skeleton-target circle-skeleton"></div>
                                <div className="temp-wrap">
                                    <h1 className="main-temp arial-rounded skeleton-target">--°</h1>
                                </div>
                            </div>
                        </section>
                        <section className="hourly-panel glass-card stagger-anim" style={{animationDelay: '0.1s'}}>
                            <h3 className="font-outfit section-label border-0">24-Hour Forecast</h3>
                            <div className="hourly-scroll skeleton-target min-h-120" role="list"></div>
                        </section>
                        <section className="master-panel glass-card stagger-anim skeleton-target min-h-450" style={{animationDelay: '0.2s'}}></section>
                    </div>
                )}

                {!loading && !error && weatherData && locationState && activeDate && (
                    <Dashboard 
                        weatherData={weatherData} 
                        locationState={locationState} 
                        activeDate={activeDate}
                        setActiveDate={setActiveDate}
                        onSaveCity={handleSaveCity}
                        isCitySaved={isCitySaved()}
                        onExport={handleExport}
                    />
                )}
            </main>
        </>
    );
}

export default App;

