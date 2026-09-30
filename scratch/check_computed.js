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
<div id="test">
  <button class="mobile-menu-toggle">Menu</button>
</div>
<script>
const btn = document.querySelector('.mobile-menu-toggle');
const style = window.getComputedStyle(btn);
console.log('DISPLAY:', style.display);
document.body.innerHTML = '<h1>DISPLAY: ' + style.display + '</h1>';
</script>
</body>
</html>
`;

fs.writeFileSync('scratch/test_menu.html', html);

execFile(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--window-size=390,844',
  '--screenshot=' + path.resolve('scratch/test_menu.png'),
  'http://localhost:8080/scratch/test_menu.html'
], (err) => {
  console.log('Rendered test_menu.png');
});
