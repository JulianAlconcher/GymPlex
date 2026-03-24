const fs = require('fs');
const p = 'c:/Users/fachi/OneDrive/Escritorio/Personales/GymPlex/src/data/routine_data.json';
let text = fs.readFileSync(p, 'utf8');
text = text.replace(/Remo a 90°/g, 'Barbell Row');
text = text.replace(/Remo a 90/g, 'Barbell Row');
fs.writeFileSync(p, text);
