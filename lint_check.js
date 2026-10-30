const fs = require('fs');
const s = fs.readFileSync('lint.txt','utf8');
const lines = s.split(/\r?\n/);
console.log(lines[lines.length-2]);
console.log(lines[lines.length-1]);
