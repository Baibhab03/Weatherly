import { useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';

export const BackgroundRenderer = ({ weatherCode, isDay, temp, wmoId, wmoIcon }) => {
    const { settings } = useSettings();

    useEffect(() => {
        const body = document.body;
        body.className = '';
        const animLayer = document.getElementById('weather-anim-layer');
        if (!animLayer) return;
        animLayer.innerHTML = '';

        const id = wmoId || 800;
        const iconIsDay = wmoIcon ? wmoIcon.includes('d') : isDay;

        const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || !settings.animations;
        const isMobile = window.innerWidth < 768;
        const getCount = (c) => isReduced ? 0 : (isMobile ? Math.floor(c / 2) : c);

        const createElems = (type, rawCount, heavy = false) => {
            let count = getCount(rawCount);
            for (let i = 0; i < count; i++) {
                const e = document.createElement('div');
                e.className = type;
                e.style.left = `${Math.random() * 100}%`;
                if (type === 'rain-drop') {
                    e.style.animationDuration = heavy ? `${0.4 + Math.random() * 0.3}s` : `${0.8 + Math.random() * 0.5}s`;
                    e.style.animationDelay = `${Math.random() * 2}s`;
                    if (heavy) e.style.background = 'linear-gradient(transparent, rgba(255,255,255,0.8))';
                }
                if (type === 'snow-flake') {
                    e.style.width = `${4 + Math.random() * 6}px`;
                    e.style.height = e.style.width;
                    e.style.animationDuration = `${4 + Math.random() * 4}s`;
                    e.style.animationDelay = `${Math.random() * 5}s`;
                }
                if (type === 'floating-cloud') {
                    e.style.width = `${150 + Math.random() * 250}px`;
                    e.style.height = `${60 + Math.random() * 100}px`;
                    e.style.top = `${Math.random() * 50}%`;
                    e.style.left = `${-20 + Math.random() * 100}%`;
                    e.style.animationDuration = `${20 + Math.random() * 20}s`;
                    e.style.animationDelay = `${Math.random() * 5}s`;
                }
                if (type === 'twinkle-star') {
                    e.style.width = `${1 + Math.random() * 3}px`;
                    e.style.height = e.style.width;
                    e.style.top = `${Math.random() * 100}%`;
                    e.style.animationDuration = `${1 + Math.random() * 3}s`;
                    e.style.animationDelay = `${Math.random() * 2}s`;
                }
                animLayer.appendChild(e);
            }
        };

        if (temp <= -10) {
            body.classList.add('bg-snow');
            createElems('snow-flake', 30);
            if (!isReduced) { animLayer.innerHTML += `<div class="fog-layer" style="top:10%; opacity:0.3;"></div>`; }
            return;
        }

        if (id >= 200 && id < 300) {
            body.classList.add('bg-thunder');
            createElems('rain-drop', 40, true);
            animLayer.appendChild(Object.assign(document.createElement('div'), { className: 'lightning-flash' }));
        } else if ((id >= 300 && id < 400) || id === 500 || id === 501) {
            body.classList.add('bg-rain-light');
            createElems('rain-drop', 15);
        } else if (id > 501 && id < 600) {
            body.classList.add('bg-rain-heavy');
            createElems('rain-drop', 40, true);
        } else if (id >= 600 && id < 700) {
            body.classList.add('bg-snow');
            createElems('snow-flake', 30);
        } else if (id >= 700 && id < 800) {
            body.classList.add('bg-fog');
            if (!isReduced) { animLayer.innerHTML = `<div class="fog-layer" style="top:10%"></div><div class="fog-layer" style="bottom:0; animation-direction:reverse"></div>`; }
        } else if (id === 800) {
            if (iconIsDay) {
                body.classList.add(temp > 30 ? 'bg-clear-hot' : 'bg-clear-normal');
                if (!isReduced) animLayer.innerHTML = `<div class="sunny-sun ${temp > 30 ? 'hot' : ''}"></div>`;
            } else {
                body.classList.add('bg-clear-night');
                createElems('twinkle-star', 30);
            }
        } else if (id === 801 || id === 802) {
            if (iconIsDay) {
                body.classList.add(temp > 30 ? 'bg-cloudy-hot' : 'bg-cloudy-sun');
                if (!isReduced) animLayer.innerHTML = `<div class="sunny-sun ${temp > 30 ? 'hot' : ''}"></div>`;
            } else {
                body.classList.add('bg-cloudy-night');
                createElems('twinkle-star', 30);
            }
            createElems('floating-cloud', 3);
        } else if (id === 803 || id === 804) {
            body.classList.add(iconIsDay ? 'bg-clouds' : 'bg-clouds-night');
            createElems('floating-cloud', 4);
        }

        localStorage.setItem('weatherAppBackground', body.className);
    }, [weatherCode, isDay, temp, wmoId, wmoIcon, settings.animations]);

    return null;
};

