const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const html = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="http://localhost:8080/css/main.css">
<link rel="stylesheet" href="http://localhost:8080/css/components.css">
<link rel="stylesheet" href="http://localhost:8080/css/responsive.css">
</head>
<body>
<div id="output"></div>
<script>
window.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:8080/downloads.html')
    .then(r => r.text())
    .then(t => {
      document.body.innerHTML = t;
      setTimeout(() => {
        const menu = document.querySelector('.mobile-menu-toggle');
        const search = document.querySelector('.header-search-btn');
        const brand = document.querySelector('.society-brand');
        const inner = document.querySelector('.header-inner');
        const actions = document.querySelector('.header-actions');
        
        const result = {
          innerWidth: inner ? inner.getBoundingClientRect() : null,
          brandRect: brand ? brand.getBoundingClientRect() : null,
          actionsRect: actions ? actions.getBoundingClientRect() : null,
          searchRect: search ? search.getBoundingClientRect() : null,
          menuRect: menu ? menu.getBoundingClientRect() : null,
          menuComputedDisplay: menu ? getComputedStyle(menu).display : null,
          menuComputedVisibility: menu ? getComputedStyle(menu).visibility : null
        };
        document.title = JSON.stringify(result);
      }, 500);
    });
});
</script>
</body>
</html>
`;

fs.writeFileSync(path.resolve('scratch/inspect.html'), html);

execFile(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--window-size=390,844',
  '--screenshot=' + path.resolve('scratch/inspect.png'),
  'http://localhost:8080/downloads.html'
], (err) => {
  console.log('Done inspect');
});
