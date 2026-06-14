const fs = require('fs');

['src/weather.css', 'src/settings.css'].forEach(f => {
    let lines = fs.readFileSync(f, 'utf8').split('\n');
    lines = lines.map(line => {
        // Find if line contains backdrop-filter
        if (line.includes('backdrop-filter:')) {
            // Extract the blur amount
            const match = line.match(/blur\(([^)]+)\)/);
            if (match) {
                const amount = match[1]; // e.g. "35px"
                // Replace everything from the first backdrop-filter to the end of its declarations
                // In weather.css it's usually written in one go: backdrop-filter: ...; -webkit-backdrop-filter: ...;
                // Let's just strip out all backdrop-filter declarations and replace them cleanly
                return line.replace(/(-webkit-backdrop-filter:\s*[^;]+;)?\s*backdrop-filter:\s*[^;]+;(\s*-webkit-backdrop-filter:\s*[^;]+;)?(\s*transform:\s*translateZ\(0\);)?/g, 
                    `-webkit-backdrop-filter: blur(${amount}); backdrop-filter: blur(${amount}); transform: translateZ(0);`);
            }
        }
        return line;
    });
    fs.writeFileSync(f, lines.join('\n'));
});
console.log('CSS fixed correctly.');
