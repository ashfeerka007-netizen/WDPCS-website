const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const pages = [
  { name: 'home_390', url: 'http://localhost:8080/', width: 390, height: 844 },
  { name: 'home_360', url: 'http://localhost:8080/', width: 360, height: 800 },
  { name: 'home_320', url: 'http://localhost:8080/', width: 320, height: 600 },
  { name: 'downloads_390', url: 'http://localhost:8080/downloads.html', width: 390, height: 844 },
  { name: 'downloads_360', url: 'http://localhost:8080/downloads.html', width: 360, height: 800 },
  { name: 'services_390', url: 'http://localhost:8080/services.html', width: 390, height: 844 },
  { name: 'rooms_390', url: 'http://localhost:8080/rooms-dormitories.html', width: 390, height: 844 },
  { name: 'contact_390', url: 'http://localhost:8080/contact.html', width: 390, height: 844 },
  { name: 'about_390', url: 'http://localhost:8080/about.html', width: 390, height: 844 },
  { name: 'notices_390', url: 'http://localhost:8080/notices.html', width: 390, height: 844 },
  { name: 'gallery_390', url: 'http://localhost:8080/gallery.html', width: 390, height: 844 }
];

async function captureAll() {
  for (const p of pages) {
    const outPath = path.resolve(`scratch/mobile_${p.name}.png`);
    await new Promise(resolve => {
      execFile(chrome, [
        '--headless=new',
        '--disable-gpu',
        `--window-size=${p.width},${p.height}`,
        `--screenshot=${outPath}`,
        p.url
      ], (err) => {
        if (err) console.error(`Error capturing ${p.name}:`, err);
        else console.log(`Captured ${p.name} -> ${outPath}`);
        resolve();
      });
    });
  }
}

captureAll();
