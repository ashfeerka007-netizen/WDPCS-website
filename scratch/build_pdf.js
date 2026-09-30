const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const tempHtml = path.join(__dirname, 'temp.html');
const tempPdf = path.join(__dirname, 'temp.pdf');

fs.writeFileSync(tempHtml, '<!DOCTYPE html><html><body><h1>WDPCS Test</h1></body></html>', 'utf-8');

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlUrl = 'file:///' + tempHtml.replace(/\\/g, '/');

execFile(chrome, ['--headless=new', '--disable-gpu', '--print-to-pdf=' + tempPdf, '--no-pdf-header-footer', htmlUrl], (err, stdout, stderr) => {
  console.log('err:', err);
  console.log('exists:', fs.existsSync(tempPdf));
  if (fs.existsSync(tempPdf)) {
    console.log('size:', fs.statSync(tempPdf).size);
    fs.unlinkSync(tempPdf);
  }
  if (fs.existsSync(tempHtml)) {
    fs.unlinkSync(tempHtml);
  }
});
