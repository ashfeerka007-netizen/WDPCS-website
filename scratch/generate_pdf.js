const fs = require('fs');
const path = require('path');

class PDFDocument {
  constructor() {
    this.pages = [];
  }

  addPage(width = 595.28, height = 841.89) { // A4 in points (72 points/inch)
    const page = {
      width,
      height,
      commands: [],
      addText(text, x, y, options = {}) {
        const font = options.font || 'F1'; // F1: Regular, F2: Bold, F3: Italic
        const size = options.size || 10;
        const color = options.color || [0, 0, 0]; // RGB 0..1
        const align = options.align || 'left';
        
        // Escape special chars in PDF string
        const escaped = text
          .replace(/\\/g, '\\\\')
          .replace(/\(/g, '\\(')
          .replace(/\)/g, '\\)');
        
        let tx = x;
        // Approximate Helvetica width for alignment
        const charWidth = size * 0.55;
        const textWidth = text.length * charWidth;
        if (align === 'center') {
          tx = x - (textWidth / 2);
        } else if (align === 'right') {
          tx = x - textWidth;
        }

        this.commands.push(`q`);
        this.commands.push(`${color[0]} ${color[1]} ${color[2]} rg`);
        this.commands.push(`BT /${font} ${size} Tf ${tx.toFixed(2)} ${y.toFixed(2)} Td (${escaped}) Tj ET`);
        this.commands.push(`Q`);
      },
      addRect(x, y, w, h, options = {}) {
        const strokeColor = options.strokeColor || [0, 0, 0];
        const fillColor = options.fillColor || null;
        const lineWidth = options.lineWidth !== undefined ? options.lineWidth : 1;
        
        this.commands.push(`q`);
        this.commands.push(`${lineWidth} w`);
        this.commands.push(`${strokeColor[0]} ${strokeColor[1]} ${strokeColor[2]} RG`);
        if (fillColor) {
          this.commands.push(`${fillColor[0]} ${fillColor[1]} ${fillColor[2]} rg`);
          this.commands.push(`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re B`);
        } else {
          this.commands.push(`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`);
        }
        this.commands.push(`Q`);
      },
      addLine(x1, y1, x2, y2, options = {}) {
        const strokeColor = options.strokeColor || [0, 0, 0];
        const lineWidth = options.lineWidth !== undefined ? options.lineWidth : 1;
        const dash = options.dash || null; // e.g. [2, 2]
        
        this.commands.push(`q`);
        this.commands.push(`${lineWidth} w`);
        this.commands.push(`${strokeColor[0]} ${strokeColor[1]} ${strokeColor[2]} RG`);
        if (dash) {
          this.commands.push(`[${dash.join(' ')}] 0 d`);
        }
        this.commands.push(`${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
        this.commands.push(`Q`);
      }
    };
    this.pages.push(page);
    return page;
  }

  toBuffer() {
    const pageObjIds = [];
    const contentObjIds = [];
    let currentObjId = 6;

    for (let i = 0; i < this.pages.length; i++) {
      pageObjIds.push(currentObjId++);
      contentObjIds.push(currentObjId++);
    }

    const objStrings = [];
    objStrings[1] = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
    objStrings[2] = `2 0 obj\n<< /Type /Pages /Kids [${pageObjIds.map(id => id + ' 0 R').join(' ')}] /Count ${this.pages.length} >>\nendobj\n`;
    objStrings[3] = `3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n`;
    objStrings[4] = `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n`;
    objStrings[5] = `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>\nendobj\n`;

    for (let i = 0; i < this.pages.length; i++) {
      const p = this.pages[i];
      const pId = pageObjIds[i];
      const cId = contentObjIds[i];
      const streamContent = p.commands.join('\n');
      const streamLen = Buffer.byteLength(streamContent, 'utf-8');

      objStrings[pId] = `${pId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${p.width} ${p.height}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${cId} 0 R >>\nendobj\n`;
      objStrings[cId] = `${cId} 0 obj\n<< /Length ${streamLen} >>\nstream\n${streamContent}\nendstream\nendobj\n`;
    }

    let out = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
    let buffer = Buffer.from(out, 'binary');
    const xrefOffsets = [];

    for (let id = 1; id < objStrings.length; id++) {
      xrefOffsets[id] = buffer.length;
      buffer = Buffer.concat([buffer, Buffer.from(objStrings[id], 'binary')]);
    }

    const startXref = buffer.length;
    let xref = `xref\n0 ${objStrings.length}\n0000000000 65535 f \n`;
    for (let id = 1; id < objStrings.length; id++) {
      xref += String(xrefOffsets[id]).padStart(10, '0') + ' 00000 n \n';
    }
    xref += `trailer\n<< /Size ${objStrings.length} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;
    buffer = Buffer.concat([buffer, Buffer.from(xref, 'binary')]);
    return buffer;
  }
}

module.exports = PDFDocument;
