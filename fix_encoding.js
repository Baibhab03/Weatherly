const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.jsx') || dirFile.endsWith('.js')) {
          filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'src'));
files.push(path.join(__dirname, 'src/App.jsx'));

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;
    
    // Replace degree symbols (using global replace with exact strings)
    content = content.replace(/Â°/g, '°');
    content = content.replace(/├é┬░/g, '°');
    content = content.replace(/Ã‚Â°/g, '°');
    content = content.replace(/A/g, '°');

    // Replace mu symbols
    content = content.replace(/Âµ/g, 'µ');
    content = content.replace(/├é┬Á/g, 'µ');
    content = content.replace(/Ag/g, 'µg');

    // Replace cubed symbols
    content = content.replace(/Â³/g, '³');
    content = content.replace(/├é┬│/g, '³');
    content = content.replace(/mA3/g, 'm³');

    // Replace moon phases
    content = content.replace(/ðŸŒ‘|dYO`/g, '🌑');
    content = content.replace(/ðŸŒ’|dYO'/g, '🌒');
    content = content.replace(/ðŸŒ“|dYO"/g, '🌓');
    content = content.replace(/ðŸŒ”|dYO"/g, '🌔');
    content = content.replace(/ðŸŒ•|dYO /g, '🌕');
    content = content.replace(/ðŸŒ–|dYO-/g, '🌖');
    content = content.replace(/ðŸŒ—|dYO-/g, '🌗');
    content = content.replace(/ðŸŒ˜|dYO~/g, '🌘');
    
    // Replace weather emojis
    content = content.replace(/â˜€ï¸ |├ó╦£Γé¼├»┬╕┬Å/g, '☀️');
    content = content.replace(/ðŸŒ¤|├░┼╕┼Æ┬ñ/g, '🌤');
    content = content.replace(/ðŸŒ™|├░┼╕┼ÆΓäó/g, '🌙');
    content = content.replace(/ðŸŒŒ|├░┼╕┼Æ┼Æ/g, '🌌');
    content = content.replace(/ðŸ›ï¸ |├░┼╕ΓÇ║ΓÇ╣├»┬╕┬Å/g, '⛈️');

    if (content !== original) {
        fs.writeFileSync(f, content, 'utf8');
        console.log('Fixed', f);
    }
});
