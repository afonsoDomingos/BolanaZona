const fs = require('fs');
let css = fs.readFileSync('client/src/index.css', 'utf8');

// Replace .bracket-center-final block
const bcfRegex = /\.bracket-center-final\s*\{[^}]+\}/;
const newBcf = `.bracket-center-final {
  background: rgba(10, 11, 92, 0.5);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  position: relative;
  z-index: 5;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  min-width: 140px;
}

.bracket-final-team-logo {
  width: 54px !important;
  height: 54px !important;
  font-size: 22px !important;
}

.bracket-final-trophy-img {
  width: 80px;
  height: auto;
  filter: drop-shadow(0 0 20px rgba(255, 214, 0, 0.4));
  margin-bottom: 8px;
}

.bracket-final-title {
  font-size: 22px;
  font-family: serif;
  font-style: italic;
  font-weight: 700;
  color: #fff;
  margin-top: 4px;
}

.bracket-final-subtitle {
  font-size: 12px;
  letter-spacing: 4px;
  font-weight: 300;
  color: #fff;
  text-transform: uppercase;
}
`;
css = css.replace(bcfRegex, newBcf);

// Insert into mobile media query
const mobileMediaQuery = '@media (max-width: 768px) {';
const mobileStyles = `
  .bracket-center-final {
    padding: 10px;
    border-radius: 12px;
    gap: 6px;
    min-width: 70px;
  }
  .bracket-final-team-logo {
    width: 28px !important;
    height: 28px !important;
    font-size: 12px !important;
  }
  .bracket-final-trophy-img {
    width: 35px;
    margin-bottom: 2px;
  }
  .bracket-final-title {
    font-size: 11px !important;
  }
  .bracket-final-subtitle {
    font-size: 6px !important;
  }
`;

css = css.replace(mobileMediaQuery, mobileMediaQuery + '\n' + mobileStyles);

fs.writeFileSync('client/src/index.css', css);
