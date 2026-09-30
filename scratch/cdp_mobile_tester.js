const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('scratch/mobile_audits');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const PAGES = [
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

const VIEWPORTS = [
  { name: 'iPhone_SE_375', width: 375, height: 667, scale: 2 },
  { name: 'Android_360', width: 360, height: 800, scale: 2 },
  { name: 'iPhone_14_390', width: 390, height: 844, scale: 3 },
  { name: 'Small_320', width: 320, height: 568, scale: 2 }
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.pending = new Map();
    this.events = new Map();

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  async ready() {
    if (this.ws.readyState === WebSocket.OPEN) return;
    return new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
  }

  send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }

  async setViewport(width, height, deviceScaleFactor = 2) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor,
      mobile: true,
      screenOrientation: { angle: 0, type: 'portraitPrimary' }
    });
    await this.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
    await sleep(600);
  }

  async screenshot(filePath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
  }

  close() {
    this.ws.close();
  }
}

async function getPageTarget() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const targets = JSON.parse(data);
        const page = targets.find(t => t.type === 'page');
        if (page) resolve(page.webSocketDebuggerUrl);
        else reject(new Error('No page target found'));
      });
    }).on('error', reject);
  });
}

async function runAudit() {
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    'about:blank'
  ]);

  await sleep(1200);

  try {
    const wsUrl = await getPageTarget();
    const cdp = new CDPClient(wsUrl);
    await cdp.ready();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');

    console.log('====================================================');
    console.log('MOBILE COMPATIBILITY AUDIT: TESTING ALL PAGES & VIEWPORTS');
    console.log('====================================================\n');

    const issues = [];

    for (const vp of VIEWPORTS) {
      console.log(`\n>>> Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) <<<`);
      await cdp.setViewport(vp.width, vp.height, vp.scale);

      for (const pageName of PAGES) {
        const url = `http://localhost:8080/${pageName}`;
        await cdp.navigate(url);
        await sleep(300);

        // Check overflow
        const overflowData = await cdp.eval(`
          (() => {
            const vw = window.innerWidth;
            const docWidth = document.documentElement.scrollWidth;
            const bodyWidth = document.body.scrollWidth;
            
            function isInsideScrollContainer(el) {
              let p = el.parentElement;
              while (p && p !== document.body && p !== document.documentElement) {
                const s = getComputedStyle(p);
                if (s.overflowX === 'auto' || s.overflowX === 'scroll' || s.overflow === 'auto' || s.overflow === 'scroll') {
                  return true;
                }
                p = p.parentElement;
              }
              return false;
            }

            const bad = [];
            document.querySelectorAll('*').forEach(el => {
              if (el.tagName === 'HTML' || el.tagName === 'BODY' || el.classList.contains('main-nav')) return;
              if (isInsideScrollContainer(el)) return; // Valid responsive table/tab container

              const r = el.getBoundingClientRect();
              if (r.right > vw + 1.5) {
                bad.push({
                  tag: el.tagName,
                  cls: (el.className && typeof el.className === 'string') ? el.className.trim() : '',
                  id: el.id || '',
                  right: Math.round(r.right),
                  width: Math.round(r.width),
                  text: (el.textContent || '').trim().slice(0, 30)
                });
              }
            });

            const headerInner = document.querySelector('.header-inner');
            const toggle = document.querySelector('.mobile-menu-toggle');
            const brand = document.querySelector('.society-brand');
            const searchBtn = document.querySelector('.header-search-btn');

            return {
              vw,
              docWidth,
              bodyWidth,
              hasHorizontalScroll: docWidth > vw || bodyWidth > vw,
              badCount: bad.length,
              bad: bad.slice(0, 8),
              headerLayout: {
                toggleVisible: toggle ? getComputedStyle(toggle).display !== 'none' : false,
                toggleRect: toggle ? { r: Math.round(toggle.getBoundingClientRect().right), w: Math.round(toggle.getBoundingClientRect().width) } : null,
                searchVisible: searchBtn ? getComputedStyle(searchBtn).display !== 'none' : false,
                searchRect: searchBtn ? { r: Math.round(searchBtn.getBoundingClientRect().right), w: Math.round(searchBtn.getBoundingClientRect().width) } : null,
                brandRect: brand ? { r: Math.round(brand.getBoundingClientRect().right), w: Math.round(brand.getBoundingClientRect().width) } : null,
                headerInnerRect: headerInner ? { r: Math.round(headerInner.getBoundingClientRect().right), w: Math.round(headerInner.getBoundingClientRect().width) } : null
              }
            };
          })()
        `);

        // Screenshot
        const ssPath = path.join(outDir, `${vp.name}_${pageName.replace('.html', '')}.png`);
        await cdp.screenshot(ssPath);

        const isGood = !overflowData.hasHorizontalScroll && overflowData.badCount === 0;
        if (isGood) {
          console.log(`  [OK] ${pageName.padEnd(24)} -> perfect fit (vw: ${overflowData.vw}px)`);
        } else {
          console.log(`  [WARN] ${pageName.padEnd(24)} -> docW:${overflowData.docWidth}, bodyW:${overflowData.bodyWidth}, overflow items: ${overflowData.badCount}`);
          issues.push({
            viewport: vp.name,
            page: pageName,
            data: overflowData
          });
          if (overflowData.bad.length > 0) {
            console.log('    Bad elements:', JSON.stringify(overflowData.bad, null, 2));
          }
        }
      }
    }

    // Interactive tests: Test Mobile Menu Drawer open & close on index.html
    console.log('\n>>> Testing Mobile Menu Drawer Interaction at 390px <<<');
    await cdp.setViewport(390, 844, 3);
    await cdp.navigate('http://localhost:8080/index.html');
    await sleep(300);
    
    // Click toggle button
    await cdp.eval(`
      (() => {
        const toggle = document.querySelector('.mobile-menu-toggle');
        if (toggle) toggle.click();
      })()
    `);
    await sleep(300);
    
    const menuState = await cdp.eval(`
      (() => {
        const nav = document.querySelector('.main-nav');
        const links = Array.from(document.querySelectorAll('.main-nav .nav-link')).map(a => ({
          text: a.textContent.trim(),
          href: a.getAttribute('href'),
          visible: a.offsetParent !== null,
          height: a.getBoundingClientRect().height
        }));
        return {
          navActive: nav ? nav.classList.contains('active') : false,
          navDisplay: nav ? getComputedStyle(nav).display : null,
          linksCount: links.length,
          links: links
        };
      })()
    `);
    console.log('  Menu Drawer Open State:', menuState.navActive ? 'ACTIVE' : 'INACTIVE', `(${menuState.linksCount} links visible)`);
    await cdp.screenshot(path.join(outDir, 'mobile_menu_open_390.png'));

    // Test Search Modal on 390px
    console.log('\n>>> Testing Header Search Modal Interaction at 390px <<<');
    await cdp.eval(`
      (() => {
        const searchBtn = document.querySelector('.header-search-btn');
        if (searchBtn) searchBtn.click();
      })()
    `);
    await sleep(300);
    const searchModalState = await cdp.eval(`
      (() => {
        const modal = document.getElementById('headerSearchModal');
        const input = document.getElementById('headerSearchInput');
        return {
          modalActive: modal ? modal.classList.contains('active') : false,
          inputFocused: document.activeElement === input
        };
      })()
    `);
    console.log('  Search Modal State:', searchModalState.modalActive ? 'ACTIVE' : 'INACTIVE');
    await cdp.screenshot(path.join(outDir, 'mobile_search_modal_open_390.png'));

    cdp.close();
    chromeProc.kill();

    console.log('\n====================================================');
    console.log(`AUDIT COMPLETE: ${issues.length} issues identified across all viewports.`);
    console.log('====================================================');

    fs.writeFileSync(path.join(outDir, 'audit_report.json'), JSON.stringify(issues, null, 2));

  } catch (err) {
    console.error('Audit failed:', err);
    chromeProc.kill();
  }
}

runAudit();
