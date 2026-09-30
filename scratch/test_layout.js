const { execFile } = require('child_process');
const http = require('http');

// Let's check using fetch / inspect or Chrome DOM dump
// We can use a node script to check CSS selectors
console.log('Inspecting CSS rules in main.css and responsive.css');
const fs = require('fs');
const resp = fs.readFileSync('css/responsive.css', 'utf-8');
const main = fs.readFileSync('css/main.css', 'utf-8');

console.log('Mobile menu toggle rules in responsive.css:');
resp.split('\n').forEach((l, idx) => {
  if (l.includes('mobile-menu-toggle')) console.log((idx+1) + ': ' + l);
});
