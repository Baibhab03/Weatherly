export const convertTemp = (c, unit) => unit === 'F' ? Math.round((c * 9/5) + 32) : Math.round(c);
export const convertSpeed = (kmh, unit) => unit === 'mph' ? Math.round(kmh * 0.621371) : Math.round(kmh);
export const convertDist = (km, unit) => unit === 'mi' ? (km * 0.621371).toFixed(1) : km.toFixed(1);
export const convertAlt = (m, unit) => unit === 'mi' ? Math.round(m * 3.28084) : Math.round(m);
export const convertPress = (hpa, unit) => unit === 'mmHg' ? Math.round(hpa * 0.750062) : Math.round(hpa);

export const getTempUnit = (unit) => `°${unit}`;
export const getSpeedUnit = (unit) => unit === 'mph' ? 'mph' : 'km/h';
export const getDistUnit = (unit) => unit === 'mi' ? 'mi' : 'km';
export const getAltUnit = (unit) => unit === 'mi' ? 'ft' : 'm';
export const getPressUnit = (unit) => unit === 'mmHg' ? 'mmHg' : 'hPa';

export const getWMOWeather = (code, isDay) => {
    const d = isDay ? 'd' : 'n';
    const map = {
        0:  { desc: "Clear Sky", icon: `01${d}`, id: 800 },
        1:  { desc: "Mainly Clear", icon: `02${d}`, id: 801 },
        2:  { desc: "Partly Cloudy", icon: `03${d}`, id: 802 },
        3:  { desc: "Overcast", icon: `04${d}`, id: 804 },
        45: { desc: "Fog", icon: `50${d}`, id: 741 },
        48: { desc: "Depositing Rime Fog", icon: `50${d}`, id: 741 },
        51: { desc: "Light Drizzle", icon: `09${d}`, id: 300 },
        53: { desc: "Moderate Drizzle", icon: `09${d}`, id: 301 },
        55: { desc: "Dense Drizzle", icon: `09${d}`, id: 302 },
        56: { desc: "Light Freezing Drizzle", icon: `09${d}`, id: 310 },
        57: { desc: "Dense Freezing Drizzle", icon: `09${d}`, id: 312 },
        61: { desc: "Light Rain", icon: `10${d}`, id: 500 },
        63: { desc: "Moderate Rain", icon: `10${d}`, id: 501 },
        65: { desc: "Heavy Rain", icon: `10${d}`, id: 502 },
        66: { desc: "Light Freezing Rain", icon: `13${d}`, id: 511 },
        67: { desc: "Heavy Freezing Rain", icon: `13${d}`, id: 511 },
        71: { desc: "Light Snow", icon: `13${d}`, id: 600 },
        73: { desc: "Moderate Snow", icon: `13${d}`, id: 601 },
        75: { desc: "Heavy Snow", icon: `13${d}`, id: 602 },
        77: { desc: "Snow Grains", icon: `13${d}`, id: 611 },
        80: { desc: "Light Rain Showers", icon: `09${d}`, id: 520 },
        81: { desc: "Moderate Rain Showers", icon: `09${d}`, id: 521 },
        82: { desc: "Violent Rain Showers", icon: `09${d}`, id: 522 },
        85: { desc: "Light Snow Showers", icon: `13${d}`, id: 620 },
        86: { desc: "Heavy Snow Showers", icon: `13${d}`, id: 622 },
        95: { desc: "Thunderstorm", icon: `11${d}`, id: 200 },
        96: { desc: "Thunderstorm with Hail", icon: `11${d}`, id: 211 },
        99: { desc: "Severe Thunderstorm", icon: `11${d}`, id: 212 }
    };
    return map[code] || { desc: "Unknown", icon: `01${d}`, id: 800 };
};

export const getDir = (deg) => { 
    const dirs = ['N','NE','E','SE','S','SW','W','NW']; 
    deg = (deg + 180) % 360; 
    return dirs[Math.round((deg < 0 ? deg + 360 : deg) / 45) % 8]; 
};

export const formatTime = (unix, timezoneOffset) => {
    const d = new Date((unix + timezoneOffset) * 1000); 
    let h = d.getUTCHours(), m = d.getUTCMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12; h = h ? h : 12;
    m = m < 10 ? '0' + m : m;
    return `${h}:${m} ${ampm}`;
};

export const getAQIMeta = (aqi) => {
    if (aqi <= 50) return { label: 'Good (0-50). Ideal air quality.', color: 'rgb(89, 182, 31)' };
    if (aqi <= 100) return { label: 'Moderate (51-100). Acceptable air quality.', color: 'rgb(238, 199, 50)' };
    if (aqi <= 200) return { label: 'Poor (101-200). Sensitive individuals should take care.', color: 'rgb(234, 140, 52)' };
    if (aqi <= 300) return { label: 'Unhealthy (201-300). May cause breathing discomfort.', color: 'rgb(233, 84, 120)' };
    if (aqi <= 400) return { label: 'Severe (301-400). Health warnings of emergency conditions.', color: 'rgb(179, 63, 186)' };
    return { label: 'Hazardous (400+). Serious health effects for everyone.', color: 'rgb(201, 32, 51)' };
};

export const evaluateComfort = (dp) => {
    if (dp < 10) return "Dry & Comfortable";
    if (dp < 15) return "Very Comfortable";
    if (dp < 18) return "Slightly Humid";
    if (dp < 21) return "Humid & Sticky";
    if (dp < 24) return "Very Muggy";
    return "Oppressive";
};

export const calculateDewPoint = (temp, humidity) => { 
    const a = 17.27, b = 237.7, alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100.0); 
    return (b * alpha) / (a - alpha); 
};

