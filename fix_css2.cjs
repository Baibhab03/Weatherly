const fs = require('fs');

function processFile(filename) {
    let content = fs.readFileSync(filename, 'utf8');
    
    // First, remove saturate(180%) from any backdrop-filter
    content = content.replace(/ saturate\(180\%\)/g, '');

    // Now, we find all backdrop-filter lines.
    // They are typically: backdrop-filter: blur(35px); -webkit-backdrop-filter: blur(35px);
    // Or single: backdrop-filter: blur(10px);
    
    // Let's manually replace the known ones instead of relying on complex regex to avoid mistakes
    // Because there are only ~8 instances, a global regex replace on standard pattern is fine IF simple enough.
    
    // Step 1: Remove any existing -webkit-backdrop-filter
    content = content.replace(/\s*-webkit-backdrop-filter:[^;]+;/g, '');
    
    // Step 2: Replace backdrop-filter with the combo
    content = content.replace(/backdrop-filter:\s*blur\(([^)]+)\);/g, '-webkit-backdrop-filter: blur($1); backdrop-filter: blur($1); transform: translateZ(0);');

    fs.writeFileSync(filename, content);
}

processFile('src/weather.css');
processFile('src/settings.css');
console.log('Fixed CSS cleanly');
