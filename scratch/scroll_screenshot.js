const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('scratch/mobile_audits');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.pending = new Map();

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
    return res.result ? res.result.value : undefined;
  }

  async setViewport(width, height) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: true,
      screenOrientation: { angle: 0, type: 'portraitPrimary' }
    });
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

async function run() {
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    'about:blank'
  ]);

  await sleep(1200);

  const wsUrl = await getPageTarget();
  const cdp = new CDPClient(wsUrl);
  await cdp.ready();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  await cdp.setViewport(390, 844);

  // 1. Downloads page scrolled to loan cards
  await cdp.navigate('http://localhost:8080/downloads.html');
  await cdp.eval('window.scrollTo(0, 480)');
  await sleep(300);
  await cdp.screenshot(path.join(outDir, 'downloads_scrolled_390.png'));

  // 2. Services page scrolled
  await cdp.navigate('http://localhost:8080/services.html');
  await cdp.eval('window.scrollTo(0, 500)');
  await sleep(300);
  await cdp.screenshot(path.join(outDir, 'services_scrolled_390.png'));

  // 3. Rooms page scrolled
  await cdp.navigate('http://localhost:8080/rooms-dormitories.html');
  await cdp.eval('window.scrollTo(0, 350)');
  await sleep(300);
  await cdp.screenshot(path.join(outDir, 'rooms_scrolled_390.png'));

  // 4. Contact page scrolled
  await cdp.navigate('http://localhost:8080/contact.html');
  await cdp.eval('window.scrollTo(0, 450)');
  await sleep(300);
  await cdp.screenshot(path.join(outDir, 'contact_scrolled_390.png'));

  // 5. About page scrolled to board and staff
  await cdp.navigate('http://localhost:8080/about.html');
  await cdp.eval('window.scrollTo(0, 800)');
  await sleep(300);
  await cdp.screenshot(path.join(outDir, 'about_scrolled_390.png'));

  cdp.close();
  chromeProc.kill();
  console.log('Scrolled mobile screenshots captured successfully!');
}

run();
