/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';

export const Sidebar = ({ isOpen, onClose, onSearch, onAutoLocate, currentLocState }) => {
    const { CACHE_PREFIX } = useSettings();
    const [query, setQuery] = useState('');
    const [recents, setRecents] = useState([]);
    const [savedCities, setSavedCities] = useState([]);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const loadSaved = () => {
            const s = JSON.parse(localStorage.getItem(`${CACHE_PREFIX}saved`)) || [];
            const r = JSON.parse(localStorage.getItem(`${CACHE_PREFIX}recents`)) || [];
            setSavedCities(Array.isArray(s) ? s.filter(x => typeof x !== 'string') : []);
            setRecents(Array.isArray(r) ? r.filter(x => typeof x !== 'string') : []);
        };
        if (isOpen) {
            loadSaved();
        }
    }, [isOpen, CACHE_PREFIX]);

    useEffect(() => {
        if (currentLocState) {
            setIsSaved(savedCities.some(c => c.label === currentLocState.label));
        }
    }, [currentLocState, savedCities]);

    const handleSaveCurrent = () => {
        if (!currentLocState) return;
        let s = [...savedCities];
        const idx = s.findIndex(c => c.label === currentLocState.label);
        if (idx > -1) {
            s.splice(idx, 1);
        } else {
            s.push(currentLocState);
        }
        setSavedCities(s);
        localStorage.setItem(`${CACHE_PREFIX}saved`, JSON.stringify(s));
    };

    const handleClearHistory = () => {
        setRecents([]);
        localStorage.removeItem(`${CACHE_PREFIX}recents`);
    };

    return (
        <aside className={`sidebar glass-card ${isOpen ? 'active' : ''}`} id="sidebar">
            <div className="sidebar-header">
                <h2 className="font-outfit" style={{fontSize: '1.2rem', margin: 0}}>Locations</h2>
                <button className="icon-btn" id="close-menu-btn" aria-label="Close menu" onClick={onClose}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div className="sidebar-content">
                <div className="search-box">
                    <i className="fa-solid fa-magnifying-glass search-icon"></i>
                    <input 
                        type="text" 
                        className="font-inter" 
                        placeholder="Search for a city..." 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && query.trim()) {
                                onSearch(query.trim());
                                setQuery('');
                            }
                        }}
                    />
                    <button className="search-btn action-btn glass-card" onClick={() => { if(query.trim()) onSearch(query.trim()); setQuery(''); }}>Search</button>
                </div>
                
                <ul className="search-suggestions hidden" id="search-suggestions"></ul>

                <button className="action-btn glass-card font-inter w-full mt-3 flex justify-center gap-2" id="auto-locate-btn" onClick={onAutoLocate}>
                    <i className="fa-solid fa-location-crosshairs"></i> Current Location
                </button>

                <div className="menu-section mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-outfit section-label border-0 text-sm m-0">Saved Locations</h3>
                        <button className="icon-btn text-accent" id="save-city-btn" title="Save current city" onClick={handleSaveCurrent}>
                            <i className={`fa-${isSaved ? 'solid' : 'regular'} fa-bookmark`}></i>
                        </button>
                    </div>
                    <ul className="loc-list" id="saved-cities-list">
                        {savedCities.length === 0 ? (
                            <li className="empty-msg text-sm text-muted">No saved locations.</li>
                        ) : (
                            savedCities.map((city, idx) => (
                                <li key={idx} onClick={() => onSearch(city.label)}>
                                    <i className="fa-solid fa-thumbtack text-accent"></i> 
                                    <div className="flex flex-col ml-2">
                                        <span className="font-inter text-sm">{city.name}</span>
                                        <span className="text-xs text-muted">{city.state ? city.state + ', ' : ''}{city.country}</span>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                <div className="menu-section mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-outfit section-label border-0 text-sm m-0">Recent Searches</h3>
                        {recents.length > 0 && (
                            <button className="text-xs text-muted hover-accent" style={{background: 'none', border: 'none', cursor: 'pointer'}} onClick={handleClearHistory}>
                                Clear
                            </button>
                        )}
                    </div>
                    <ul className="loc-list" id="recent-searches-list">
                        {recents.length === 0 ? (
                            <li className="empty-msg text-sm text-muted">No recent searches.</li>
                        ) : (
                            recents.map((city, idx) => (
                                <li key={idx} onClick={() => onSearch(city.label)}>
                                    <i className="fa-solid fa-clock-rotate-left text-muted"></i> 
                                    <div className="flex flex-col ml-2">
                                        <span className="font-inter text-sm">{city.name}</span>
                                        <span className="text-xs text-muted">{city.state ? city.state + ', ' : ''}{city.country}</span>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </aside>
    );
};


