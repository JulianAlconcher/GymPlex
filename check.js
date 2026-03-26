const fs = require('fs');
const path = 'c:/Users/fachi/OneDrive/Escritorio/Personales/GymPlex/src/data/routine_data.json';
const logPath = 'c:/Users/fachi/OneDrive/Escritorio/Personales/GymPlex/check_log.txt';
try {
  JSON.parse(fs.readFileSync(path, 'utf8'));
  fs.writeFileSync(logPath, 'VALID');
} catch (e) {
  fs.writeFileSync(logPath, 'INVALID: ' + e.message);
}
