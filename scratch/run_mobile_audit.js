const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const runnerHtml = `
<!DOCTYPE html>
<html>
<head><title>Test Runner</title></head>
<body>
<div id="status">Running tests...</div>
<div id="output"></div>
<script>
const pages = [
  'index.html',
  'about.html',
  'services.html',
  'downloads.html',
  'gallery.html',
  'rooms-dormitories.html',
  'contact.html',
  'notices.html',
  'faq.html',
  'search.html'
];

const widths = [360, 390, 320];

async function runTest(page, width) {
  return new Promise((resolve) => {
    const ifr = document.createElement('iframe');
    ifr.style.width = width + 'px';
    ifr.style.height = '800px';
    ifr.style.border = 'none';
    ifr.src = '/' + page;
    
    ifr.onload = () => {
      setTimeout(() => {
        try {
          const doc = ifr.contentDocument || ifr.contentWindow.document;
          const win = ifr.contentWindow;
          const vw = win.innerWidth;
          
          const overflowing = [];
          doc.querySelectorAll('*').forEach(el => {
            const r = el.getBoundingClientRect();
            // check elements that overflow the right boundary
            if (r.right > vw + 1) {
              overflowing.push({
                tag: el.tagName,
                className: el.className,
                id: el.id,
                right: Math.round(r.right),
                width: Math.round(r.width),
                text: (el.textContent || '').trim().slice(0, 35)
              });
            }
          });

          const res = {
            page,
            width,
            vw,
            bodyWidth: doc.body.scrollWidth,
            docWidth: doc.documentElement.scrollWidth,
            overflowCount: overflowing.length,
            overflowing: overflowing.slice(0, 8)
          };
          document.body.removeChild(ifr);
          resolve(res);
        } catch(e) {
          document.body.removeChild(ifr);
          resolve({ page, width, error: e.toString() });
        }
      }, 400);
    };
    document.body.appendChild(ifr);
  });
}

async function run() {
  const allResults = [];
  for (const p of pages) {
    for (const w of widths) {
      const res = await runTest(p, w);
      allResults.push(res);
    }
  }
  const out = document.getElementById('output');
  out.textContent = 'ALL_RESULTS:' + JSON.stringify(allResults);
  document.getElementById('status').textContent = 'DONE';
}

window.onload = run;
</script>
</body>
</html>
`;

fs.writeFileSync(path.resolve('scratch/mobile_test_runner.html'), runnerHtml);

execFile(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--window-size=1000,1000',
  '--run-all-compositor-stages-before-draw',
  '--virtual-time-budget=15000',
  '--dump-dom',
  'http://localhost:8080/scratch/mobile_test_runner.html'
], (err, stdout) => {
  const match = stdout.match(/ALL_RESULTS:(.*?)<\/div>/);
  if (match) {
    try {
      const results = JSON.parse(match[1]);
      console.log('Mobile Compatibility Test Results:\n');
      results.forEach(r => {
        if (r.error) {
          console.log(`[ERROR] ${r.page} (${r.width}px):`, r.error);
        } else if (r.overflowCount > 0 || r.bodyWidth > r.width || r.docWidth > r.width) {
          console.log(`[OVERFLOW] ${r.page} @ ${r.width}px -> bodyWidth: ${r.bodyWidth}, docWidth: ${r.docWidth}, bad elements: ${r.overflowCount}`);
          r.overflowing.forEach(el => {
            console.log(`   - <${el.tag} class="${el.className}" id="${el.id}"> w=${el.width} r=${el.right} text="${el.text}"`);
          });
        } else {
          console.log(`[PERFECT] ${r.page} @ ${r.width}px -> bodyWidth: ${r.bodyWidth}, docWidth: ${r.docWidth}`);
        }
      });
    } catch(e) {
      console.error('JSON parse error:', e);
    }
  } else {
    console.log('Output preview:', stdout.slice(0, 500));
  }
});
