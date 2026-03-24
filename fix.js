const fs = require('fs');
const p = 'c:/Users/fachi/OneDrive/Escritorio/Personales/GymPlex/src/data/routine_data.json';
let data = JSON.parse(fs.readFileSync(p, 'utf8'));
let found = 0;
function traverse(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(traverse);
  } else if (obj !== null && typeof obj === 'object') {
    for (let k in obj) {
      if (typeof obj[k] === 'string' && obj[k].includes('Remo a 90')) {
        console.log('FOUND:', obj[k]);
        obj[k] = 'Barbell Row';
        found++;
      } else {
        traverse(obj[k]);
      }
    }
  }
}
traverse(data);
console.log('Total found:', found);
if (found > 0) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}
