const fs = require('fs');
const path = 'client/src/pages/Dashboard.jsx';
let src = fs.readFileSync(path, 'utf8');
src = src.split("margin: '0 -24px',").join("margin: '0 -24px', padding: '0 24px 16px',");
// Also clean up the scrollbarWidth line
src = src.replace(/scrollbarWidth:\s+'none'/, "scrollbarWidth: 'none'");
fs.writeFileSync(path, src);
