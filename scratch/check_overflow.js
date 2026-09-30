const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const inspectScript = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
<iframe id="frame" src="http://localhost:8080/index.html" style="width:360px; height:800px; border:none;"></iframe>
<script>
window.addEventListener('message', () => {});
const iframe = document.getElementById('frame');
iframe.onload = () => {
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  const win = iframe.contentWindow;
  const vw = win.innerWidth;
  
  const overflowingElements = [];
  doc.querySelectorAll('*').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.right > vw + 1) {
      overflowingElements.push({
        tag: el.tagName,
        id: el.id,
        className: el.className,
        rect: { left: rect.left, right: rect.right, width: rect.width },
        text: (el.textContent || '').slice(0, 30).trim()
      });
    }
  });

  const headerInner = doc.querySelector('.header-inner');
  const headerRight = doc.querySelector('.header-right');
  const mobileToggle = doc.querySelector('.mobile-menu-toggle');
  const brand = doc.querySelector('.society-brand');

  const report = {
    vw,
    docScrollWidth: doc.documentElement.scrollWidth,
    bodyScrollWidth: doc.body.scrollWidth,
    headerInnerRect: headerInner ? headerInner.getBoundingClientRect() : null,
    headerRightRect: headerRight ? headerRight.getBoundingClientRect() : null,
    mobileToggleRect: mobileToggle ? mobileToggle.getBoundingClientRect() : null,
    brandRect: brand ? brand.getBoundingClientRect() : null,
    overflowingCount: overflowingElements.length,
    overflowingElements: overflowingElements.slice(0, 15)
  };

  document.title = 'REPORT:' + JSON.stringify(report);
};
</script>
</body>
</html>
`;

fs.writeFileSync('scratch/check_overflow.html', inspectScript);

execFile(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--window-size=360,800',
  '--dump-dom',
  path.resolve('scratch/check_overflow.html')
], (err, stdout) => {
  // Let's also read title via a small timeout if needed or run directly
  console.log('DOM length:', stdout.length);
});
