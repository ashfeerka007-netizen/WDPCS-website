const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

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

async function checkPage(page, width) {
  const htmlWrapper = `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0;">
<iframe id="testframe" src="http://localhost:8080/${page}" style="width:${width}px; height:800px; border:none;"></iframe>
<script>
const frame = document.getElementById('testframe');
frame.onload = () => {
  setTimeout(() => {
    const doc = frame.contentDocument;
    const win = frame.contentWindow;
    const vw = win.innerWidth;
    const bodyWidth = doc.body.scrollWidth;
    const docWidth = doc.documentElement.scrollWidth;
    
    const badElements = [];
    doc.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 || r.width > vw + 1) {
        // Exclude html/body/wrappers
        if (el.tagName !== 'HTML' && el.tagName !== 'BODY') {
          badElements.push({
            tag: el.tagName,
            cls: el.className,
            id: el.id,
            right: Math.round(r.right),
            width: Math.round(r.width),
            text: (el.textContent || '').trim().slice(0, 30)
          });
        }
      }
    });

    const out = {
      page: '${page}',
      width: ${width},
      vw: vw,
      bodyWidth: bodyWidth,
      docWidth: docWidth,
      badCount: badElements.length,
      badElements: badElements.slice(0, 10)
    };
    
    const div = document.createElement('div');
    div.id = 'RESULTS_JSON';
    div.textContent = JSON.stringify(out);
    document.body.appendChild(div);
  }, 300);
};
</script>
</body>
</html>
  `;

  const tmpFile = path.resolve(`scratch/test_${width}_${page}`);
  fs.writeFileSync(tmpFile, htmlWrapper);

  return new Promise(resolve => {
    execFile(chrome, [
      '--headless=new',
      '--disable-gpu',
      `--window-size=${width+50},900`,
      '--run-all-compositor-stages-before-draw',
      '--virtual-time-budget=2000',
      '--dump-dom',
      tmpFile
    ], (err, stdout) => {
      const match = stdout.match(/<div id="RESULTS_JSON">(.*?)<\/div>/);
      if (match) {
        try {
          const res = JSON.parse(match[1]);
          resolve(res);
          return;
        } catch(e) {}
      }
      resolve({ page, width, error: 'Could not parse output' });
    });
  });
}

async function runAll() {
  console.log('Testing pages for mobile overflow at 360px and 390px...\n');
  for (const p of pages) {
    const res360 = await checkPage(p, 360);
    const res390 = await checkPage(p, 390);
    console.log(`Page: ${p}`);
    console.log(`  360px: bodyScrollWidth=${res360.bodyWidth}, docScrollWidth=${res360.docWidth}, badCount=${res360.badCount}`);
    if (res360.badCount > 0) {
      console.log('    Top bad elements (360px):', JSON.stringify(res360.badElements, null, 2));
    }
    console.log(`  390px: bodyScrollWidth=${res390.bodyWidth}, docScrollWidth=${res390.docWidth}, badCount=${res390.badCount}`);
    if (res390.badCount > 0) {
      console.log('    Top bad elements (390px):', JSON.stringify(res390.badElements, null, 2));
    }
    console.log('--------------------------------------------------');
  }
}

runAll();
