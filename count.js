var fs=require('fs');
var s=fs.readFileSync('lint.txt','utf8');
var m=s.match(/error/gi);
console.log(m?m.length:0);
