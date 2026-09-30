const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const htmlContent = `<!DOCTYPE html>
<html lang="ml">
<head>
<meta charset="UTF-8">
<title>ഗൃഹോപകരണ വായ്പയ്ക്കുള്ള അപേക്ഷ - WDPCS</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;500;600;700;800&family=Noto+Serif+Malayalam:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  @page {
    size: A4 portrait;
    margin: 15mm 18mm 15mm 18mm;
  }
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    font-family: 'Noto Sans Malayalam', 'Noto Serif Malayalam', 'Kartika', 'Nirmala UI', sans-serif;
    color: #111;
    font-size: 12.5px;
    line-height: 1.5;
    background: #fff;
    -webkit-font-smoothing: antialiased;
  }

  .page {
    width: 100%;
    min-height: 267mm;
    max-height: 267mm;
    height: 267mm;
    position: relative;
    page-break-after: always;
    break-after: page;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 2mm 0;
  }
  .page:last-child {
    page-break-after: avoid;
    break-after: avoid;
  }

  /* Header styles */
  .header {
    text-align: center;
    margin-bottom: 8px;
  }
  .header h2 {
    font-size: 19px;
    font-weight: 700;
    letter-spacing: 0.2px;
    margin-bottom: 2px;
  }
  .header h3 {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 2px;
  }
  .header .phone {
    font-size: 11.5px;
    font-weight: 500;
    color: #222;
  }

  /* Title Box */
  .title-wrap {
    text-align: center;
    margin: 6px 0 14px 0;
  }
  .title-heading {
    display: inline-block;
    font-size: 16px;
    font-weight: 800;
    text-decoration: underline;
    text-underline-offset: 4px;
    letter-spacing: 0.3px;
  }

  /* Form table & rows */
  .form-container {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .field-row {
    display: flex;
    align-items: flex-end;
    margin-bottom: 2px;
    font-size: 12px;
    line-height: 1.35;
  }
  .field-label {
    white-space: nowrap;
    font-weight: 500;
  }
  .field-colon {
    padding: 0 4px;
    font-weight: bold;
  }
  .dotted-line {
    flex: 1;
    border-bottom: 1px dotted #333;
    height: 12px;
    margin-bottom: 2px;
  }
  .dotted-row {
    width: 100%;
    border-bottom: 1px dotted #333;
    height: 12px;
    margin-bottom: 3px;
  }
  .dotted-row-indent {
    width: calc(100% - 25px);
    margin-left: 25px;
    border-bottom: 1px dotted #333;
    height: 12px;
    margin-bottom: 3px;
  }
  .field-row-split {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 2px;
    font-size: 12px;
  }
  .split-part {
    display: flex;
    align-items: flex-end;
    flex: 1;
  }
  .split-part:first-child {
    margin-right: 12px;
  }

  .indent-1 {
    padding-left: 18px;
  }
  .indent-2 {
    padding-left: 25px;
  }

  /* Page 2 & 3 styles */
  .declaration-box {
    margin-bottom: 12px;
  }
  .declaration-text {
    font-size: 12px;
    text-align: justify;
    line-height: 1.65;
    margin-bottom: 14px;
  }
  .dec-sign-row {
    display: flex;
    align-items: flex-end;
    margin-bottom: 12px;
    font-size: 12px;
  }
  .dec-sign-label {
    width: 250px;
    white-space: nowrap;
  }

  .consent-header {
    text-align: center;
    margin: 10px 0 8px 0;
  }
  .consent-header h2 {
    font-size: 16px;
    font-weight: 800;
    text-decoration: underline;
    text-underline-offset: 4px;
    margin-bottom: 3px;
  }
  .consent-header p {
    font-size: 12px;
    font-weight: 600;
  }

  .role-title {
    font-size: 14px;
    font-weight: 800;
    margin: 10px 0 4px 0;
  }
  .consent-para {
    font-size: 11.8px;
    text-align: justify;
    line-height: 1.7;
    margin-bottom: 10px;
  }

  .sign-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: 6px;
    font-size: 12px;
  }
  .sign-footer-left {
    line-height: 1.8;
  }
  .sign-footer-right {
    padding-right: 25px;
    font-weight: 600;
  }

  /* Page 3 Office Note */
  .office-note-title {
    text-align: center;
    font-size: 15px;
    font-weight: 800;
    text-decoration: underline;
    text-underline-offset: 3px;
    margin-top: 16px;
    margin-bottom: 3px;
    letter-spacing: 0.5px;
  }
  .office-note-sub {
    text-align: center;
    font-size: 12.5px;
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 2px;
    margin-bottom: 12px;
  }
  .liability-group {
    margin-bottom: 8px;
  }
  .liability-group-title {
    font-size: 12.5px;
    font-weight: 700;
    margin-bottom: 2px;
  }
  .liability-group-desc {
    font-size: 11.5px;
    font-style: italic;
    margin-bottom: 2px;
  }
  .liability-grid {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    line-height: 1.6;
  }
  .liability-col-1 {
    width: 32%;
  }
  .liability-col-2 {
    width: 36%;
  }
  .liability-col-3 {
    width: 32%;
  }

  /* Page 4 styles */
  .board-header {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    font-weight: 600;
    margin-top: 15px;
    margin-bottom: 50px;
  }
  .board-signatures {
    display: flex;
    justify-content: space-between;
    padding: 0 40px;
    font-size: 13.5px;
    font-weight: 700;
    margin-bottom: 50px;
  }
  .receipt-heading {
    font-size: 12.5px;
    line-height: 2;
    margin-top: 40px;
    margin-bottom: 35px;
  }
</style>
</head>
<body>

<!-- ================= PAGE 1 ================= -->
<div class="page" id="page1">
  <div class="header">
    <h2>വയനാട് ജില്ലാ പോലീസ് സഹകരണ സംഘം</h2>
    <h3>ക്ലിപ്തം നമ്പർ W 208 കൽപ്പറ്റ നോർത്ത്</h3>
    <p class="phone">ഫോൺ : 04936 - 205940, +91 8301995940</p>
  </div>

  <div class="title-wrap">
    <div class="title-heading">ഗൃഹോപകരണ വായ്പയ്ക്കുള്ള അപേക്ഷ</div>
  </div>

  <div class="form-container">
    <div>
      <div class="field-row">
        <span class="field-label">1. അപേക്ഷകന്റെ അംഗനമ്പർ</span>
        <span class="field-colon">:</span>
        <div class="dotted-line"></div>
      </div>

      <div class="field-row">
        <span class="field-label">2. അപേക്ഷകന്റെ പേര്</span>
        <span class="field-colon">:</span>
        <div class="dotted-line"></div>
      </div>

      <div class="field-row">
        <span class="field-label">3. അപേക്ഷകന്റെ ഉദ്യോഗപ്പേര് G L. No.</span>
        <span class="field-colon">:</span>
        <div class="dotted-line"></div>
      </div>

      <div class="field-row">
        <span class="field-label">4. ഔദ്യോഗിക മേൽവിലാസം</span>
        <span class="field-colon">:</span>
        <div class="dotted-line"></div>
      </div>
      <div class="dotted-row"></div>
      <div class="dotted-row"></div>

      <div class="field-row">
        <span class="field-label">5. അപേക്ഷകന്റെ സ്ഥിരമായ മേൽവിലാസം</span>
        <span class="field-colon">:</span>
        <div class="dotted-line"></div>
      </div>
      <div class="dotted-row"></div>
      <div class="dotted-row"></div>

      <div class="field-row">
        <span class="field-label">6. അപേക്ഷകൻ പെൻഷൻ പറ്റുന്ന തീയതി</span>
        <span class="field-colon">:</span>
        <div class="dotted-line"></div>
      </div>

      <div class="field-row">
        <span class="field-label">7. അപേക്ഷിക്കുന്ന വായ്പ തുക</span>
        <span class="field-colon">:</span>
        <span style="font-weight:600; padding: 0 4px;">Rs.</span>
        <div class="dotted-line" style="flex:2;"></div>
        <span style="padding: 0 4px;">/(</span>
        <div class="dotted-line" style="flex:3;"></div>
      </div>
      <div class="dotted-row" style="text-align: right; display:flex; justify-content:flex-end; align-items:flex-end;">
        <span style="white-space:nowrap; background:#fff; padding-left:5px;">മാത്രം)</span>
      </div>

      <div class="field-row" style="margin-top:2px;">
        <div style="line-height:1.25; display:inline-block;">
          <div>8. ആവശ്യപ്പെടുന്ന കാലാവധിയും</div>
          <div style="padding-left:14px;">തവണകളുടെ എണ്ണവും</div>
        </div>
        <span class="field-colon" style="align-self: flex-end;">:</span>
        <div class="dotted-line"></div>
      </div>

      <div class="field-row" style="margin-top:2px;">
        <span class="field-label">9. (a) വാങ്ങുവാൻ ഉദ്ദേശിക്കുന്ന സാധനങ്ങളുടെ വില</span>
        <span class="field-colon">:</span>
        <div class="dotted-line"></div>
      </div>
      <div class="field-row indent-1">
        <span class="field-label">(b) ഇൻവോയിസിൽ കാണിച്ചിരിക്കുന്ന വില</span>
        <span class="field-colon">:</span>
        <div class="dotted-line"></div>
      </div>

      <div class="field-row" style="margin-top:2px;">
        <div style="line-height:1.25; display:inline-block;">
          <div>10. ശമ്പളം വിതരണം ചെയ്യുന്ന ഉദ്യോഗസ്ഥന്റെ</div>
          <div style="padding-left:20px;">ഔദ്യോഗിക മേൽവിലാസം</div>
        </div>
        <span class="field-colon" style="align-self: flex-end;">:</span>
        <div class="dotted-line"></div>
      </div>
      <div class="dotted-row"></div>

      <div class="field-row" style="margin-top:2px;">
        <div style="line-height:1.25; display:inline-block;">
          <div>11. ശമ്പളം പാസാക്കുന്ന ഉദ്യോഗസ്ഥന്റെ</div>
          <div style="padding-left:20px;">ഔദ്യോഗിക മേൽവിലാസം</div>
        </div>
        <span class="field-colon" style="align-self: flex-end;">:</span>
        <div class="dotted-line"></div>
      </div>
      <div class="dotted-row"></div>

      <div class="field-row-split" style="margin-top:2px;">
        <div class="split-part">
          <span class="field-label">12. (a) ഒന്നാം ജാമ്യക്കാരന്റെ അംഗ നമ്പർ</span>
          <span class="field-colon">:</span>
          <div class="dotted-line"></div>
        </div>
        <div class="split-part">
          <span class="field-label">(b) ഒന്നാം ജാമ്യക്കാരന്റെ പേര്</span>
          <span class="field-colon">:</span>
          <div class="dotted-line"></div>
        </div>
      </div>
      <div class="field-row indent-1">
        <span class="field-label">(c) ഒന്നാം ജാമ്യക്കാരന്റെ ഔദ്യോഗിക മേൽവിലാസം</span>
        <span class="field-colon">:</span>
        <div class="dotted-line"></div>
      </div>
      <div class="dotted-row-indent"></div>
      <div class="field-row indent-1">
        <span class="field-label">(d) ഒന്നാം ജാമ്യക്കാരന്റെ സ്ഥിര മേൽവിലാസം</span>
        <span class="field-colon">:</span>
        <div class="dotted-line"></div>
      </div>
      <div class="dotted-row-indent"></div>

      <div class="field-row" style="margin-top:2px;">
        <span class="field-label">13. (a) രണ്ടാം ജാമ്യക്കാരന്റെ അംഗ നമ്പർ</span>
        <span class="field-colon">:</span>
        <div class="dotted-line"></div>
      </div>
      <div class="field-row indent-1">
        <span class="field-label">(b) രണ്ടാം ജാമ്യക്കാരന്റെ പേര്</span>
        <span class="field-colon">:</span>
        <div class="dotted-line"></div>
      </div>
      <div class="field-row indent-1">
        <span class="field-label">(c) രണ്ടാം നമ്പർ ജാമ്യക്കാരന്റെ ഔദ്യോഗിക മേൽവിലാസം</span>
        <span class="field-colon">:</span>
        <div class="dotted-line"></div>
      </div>
      <div class="dotted-row-indent"></div>
      <div class="field-row indent-1">
        <span class="field-label">(d) രണ്ടാം ജാമ്യക്കാരന്റെ സ്ഥിര മേൽവിലാസം</span>
        <span class="field-colon">:</span>
        <div class="dotted-line"></div>
      </div>
      <div class="dotted-row-indent"></div>
    </div>
  </div>
</div>

<!-- ================= PAGE 2 ================= -->
<div class="page" id="page2">
  <div class="dotted-row" style="margin-bottom: 22px;"></div>

  <div class="declaration-box">
    <p class="declaration-text">
      മേൽ കാണിച്ചിരിക്കുന്ന സംഗതികൾ എല്ലാം എന്റെ അറിവിലും വിശ്വാസത്തിലും പെട്ടിടത്തോളം സത്യമായിട്ടുള്ളതും ശരിയായിട്ടുള്ളതുമാണെന്നും ഇതിനാൽ പ്രതിജ്ഞ ചെയ്യുന്നു.
    </p>

    <div class="dec-sign-row">
      <span class="dec-sign-label">1. അപേക്ഷകന്റെ പേരും ഒപ്പും</span>
      <span class="field-colon">:</span>
      <div class="dotted-line"></div>
    </div>
    <div class="dec-sign-row">
      <span class="dec-sign-label">2. ഒന്നാം ജാമ്യക്കാരൻ പേരും ഒപ്പും</span>
      <span class="field-colon">:</span>
      <div class="dotted-line"></div>
    </div>
    <div class="dec-sign-row">
      <span class="dec-sign-label">2. രണ്ടാം ജാമ്യക്കാരന്റെ പേരും ഒപ്പും</span>
      <span class="field-colon">:</span>
      <div class="dotted-line"></div>
    </div>
  </div>

  <div class="consent-header">
    <h2>സമ്മതപത്രം</h2>
    <p>1969ലെ കേരള സഹകരണ സംഘം നിയമം 37-ാം വകുപ്പ് അനുസരിച്ചുള്ള സമ്മതപത്രം</p>
  </div>

  <!-- Loan Applicant Consent -->
  <div style="margin-top: 8px;">
    <div class="role-title">വായ്പക്കാരൻ</div>
    <p class="consent-para">
      (1) W 208 -ാം നമ്പർ വയനാട് ജില്ലാ പോലീസ് സഹകരണ സംഘത്തിലെ ..............................-ാം നമ്പർ........................................................ അംഗമായ ഞാൻ ടി. സംഘത്തിൽ നിന്നും വാങ്ങുന്ന .................................................. രൂപയുടെ ഗൃഹോപകരണ വായ്പ തിരിച്ചടവിൽ അടയ്ക്കേണ്ടതായ സംഖ്യ എന്റെ പ്രതിമാസ ശമ്പളത്തിൽ നിന്നും വസൂലാക്കി എന്റെ ചെലവിൽ ടി സംഘത്തിൽ അടയ്ക്കുന്നതിന് എന്റെ ഇപ്പോഴത്തെ മേലധികാരി ............................................. യേയും എന്നെ മാറ്റിയേക്കാവുന്ന മറ്റിതരാഫീസിലെ മേലധികാരിയേയും ഞാൻ ഇതിനാൽ അധികാരപ്പെടുത്തുന്നു.
    </p>
    <div class="sign-footer">
      <div class="sign-footer-left">
        <div>സ്ഥലം ..............................</div>
        <div style="margin-top: 4px;">തീയതി ..............................</div>
      </div>
      <div class="sign-footer-right">
        <div>(പേര്, ഒപ്പ്)</div>
      </div>
    </div>
  </div>

  <!-- Surety 1 Consent -->
  <div style="margin-top: 16px;">
    <div class="role-title">ഒന്നാം ജാമ്യക്കാരൻ</div>
    <p class="consent-para">
      (2) വയനാട് ജില്ലാ പോലീസ് സഹകരണ സംഘം ക്ലിപ്തം നമ്പർ W 208 ൽ ..........................-ാം നമ്പർ അംഗമായ ...................................................... എന്ന ഞാൻ ടി സംഘത്തിൽ നിന്നും ..........................-ാം നമ്പർ അംഗമായ ............................................................................................................................ എന്നയാൾ വാങ്ങിയ.................................................. രൂപയുടെ ഗൃഹോപകരണ വായ്പയുടെ തിരിച്ചടവ് അടച്ചുതീർക്കാതിരുന്നാൽ ടി, തുക എന്റെ പ്രതിമാസ ശമ്പള ത്തിൽനിന്നും വസൂലാക്കി എന്റെ ചെലവിൽ ടി സംഘത്തിൽ അടക്കുന്നതിന് എന്റെ മേലധികാരിയെ ഇതിനാൽ അധി കാരപ്പെടുത്തിക്കൊള്ളുന്നു. ഞാൻ എന്റെ ശമ്പളത്തിൽ നിന്നും സംഘം ആവശ്യപ്പെടുന്ന മുറക്ക് അടച്ചുകൊള്ളാമെന്ന് സമ്മതിച്ചുകൊള്ളുന്നു.
    </p>
    <div class="sign-footer">
      <div class="sign-footer-left">
        <div>സ്ഥലം ..............................</div>
        <div style="margin-top: 4px;">തീയതി ..............................</div>
      </div>
      <div class="sign-footer-right">
        <div>(പേര്, ഒപ്പ്)</div>
      </div>
    </div>
  </div>

  <div style="margin-top: 18px;">
    <div class="role-title" style="margin-bottom:0;">രണ്ടാം ജാമ്യക്കാരൻ</div>
  </div>
</div>

<!-- ================= PAGE 3 ================= -->
<div class="page" id="page3">
  <div style="margin-top: 2px;">
    <p class="consent-para">
      (3) വയനാട് ജില്ലാ പോലീസ് സഹകരണ സംഘം ക്ലിപ്തം നമ്പർ W 208 ൽ ..........................-ാം നമ്പർ അംഗമായ ...................................................... എന്ന ഞാൻ ടി സംഘത്തിൽ നിന്നും ..........................-ാം നമ്പർ അംഗമായ ............................................................................................................................ എന്നയാൾ വാങ്ങിയ.................................................. രൂപയുടെ ഗൃഹോപകരണ വായ്പയുടെ തിരിച്ചടവ് അടച്ചുതീർക്കാതിരുന്നാൽ ടി, തുക എന്റെ പ്രതിമാസ ശമ്പള ത്തിൽനിന്നും വസൂലാക്കി എന്റെ ചെലവിൽ ടി സംഘത്തിൽ അടക്കുന്നതിന് എന്റെ മേലധികാരിയെ ഇതിനാൽ അധി കാരപ്പെടുത്തിക്കൊള്ളുന്നു. ഞാൻ എന്റെ ശമ്പളത്തിൽ നിന്നും സംഘം ആവശ്യപ്പെടുന്ന മുറക്ക് അടച്ചുകൊള്ളാമെന്ന് സമ്മതിച്ചുകൊള്ളുന്നു.
    </p>
    <div class="sign-footer">
      <div class="sign-footer-left">
        <div>സ്ഥലം ..............................</div>
        <div style="margin-top: 4px;">തീയതി ..............................</div>
      </div>
      <div class="sign-footer-right">
        <div>(പേര്, ഒപ്പ്)</div>
      </div>
    </div>
  </div>

  <!-- Office Note -->
  <div style="margin-top: 20px;">
    <div class="office-note-title">OFFICE NOTE</div>
    <div class="office-note-sub">Liabilities of applicants and Sureties:</div>

    <div class="liability-group" style="margin-top: 10px;">
      <div class="liability-group-title">1. Member No. and Name of Applicant</div>
      <div class="liability-group-desc">Existing Loan Details:</div>
      <div class="liability-grid">
        <div class="liability-col-1">1. Loan No………………..</div>
        <div class="liability-col-2">Principal…………………………</div>
        <div class="liability-col-3">Overdue……………………..</div>
      </div>
      <div class="liability-grid">
        <div class="liability-col-1">2. Loan No………………..</div>
        <div class="liability-col-2">Principal…………………………</div>
        <div class="liability-col-3">Overdue……………………..</div>
      </div>
      <div class="liability-grid">
        <div class="liability-col-1">3. Loan No………………..</div>
        <div class="liability-col-2">Principal…………………………</div>
        <div class="liability-col-3">Overdue……………………..</div>
      </div>
    </div>

    <div class="liability-group" style="margin-top: 12px;">
      <div class="liability-group-title">2. Member No. and Name of Suerty</div>
      <div class="liability-group-desc">Existing Loan Details:</div>
      <div class="liability-grid">
        <div class="liability-col-1">1. Loan No………………..</div>
        <div class="liability-col-2">Principal…………………………</div>
        <div class="liability-col-3">Overdue……………………..</div>
      </div>
      <div class="liability-grid">
        <div class="liability-col-1">2. Loan No………………..</div>
        <div class="liability-col-2">Principal…………………………</div>
        <div class="liability-col-3">Overdue……………………..</div>
      </div>
      <div class="liability-grid">
        <div class="liability-col-1">3. Loan No………………..</div>
        <div class="liability-col-2">Principal…………………………</div>
        <div class="liability-col-3">Overdue……………………..</div>
      </div>
    </div>

    <div class="liability-group" style="margin-top: 12px;">
      <div class="liability-group-title">3. Member No. and Name of Suerty</div>
      <div class="liability-group-desc">Existing Loan Details:</div>
      <div class="liability-grid">
        <div class="liability-col-1">4. Loan No………………..</div>
        <div class="liability-col-2">Principal…………………………</div>
        <div class="liability-col-3">Overdue……………………..</div>
      </div>
      <div class="liability-grid">
        <div class="liability-col-1">5. Loan No………………..</div>
        <div class="liability-col-2">Principal…………………………</div>
        <div class="liability-col-3">Overdue……………………..</div>
      </div>
      <div class="liability-grid">
        <div class="liability-col-1">6. Loan No………………..</div>
        <div class="liability-col-2">Principal…………………………</div>
        <div class="liability-col-3">Overdue……………………..</div>
      </div>
    </div>

    <div style="margin-top: 18px;">
      <div style="font-size: 12px; margin-bottom: 8px;">
        <span>സെക്രട്ടറിയുടെ നോട്ട് : </span>
        <span style="border-bottom: 1px dotted #333; display: inline-block; width: calc(100% - 130px); height: 12px;"></span>
      </div>
      <div class="dotted-row"></div>
    </div>

    <div style="text-align: right; margin-top: 25px; padding-right: 25px; font-weight: 700; font-size: 13px;">
      സെക്രട്ടറി.
    </div>
  </div>
</div>

<!-- ================= PAGE 4 ================= -->
<div class="page" id="page4">
  <div class="board-header">
    <div>ഭരണസമിതി തീരുമാനം തീരുമാന നമ്പർ :</div>
    <div>തീയതി :</div>
  </div>

  <div class="board-signatures">
    <div>ഡയറക്ടർ</div>
    <div>ഡയറക്ടർ</div>
    <div>പ്രസിഡണ്ട്</div>
  </div>

  <div style="margin-top: 20px;">
    <div class="field-row" style="margin-bottom: 6px;">
      <span class="field-label" style="font-size:12.5px;">വാങ്ങിയ സാധനത്തിന്റെ വിവരം</span>
      <span class="field-colon">:</span>
      <div class="dotted-line"></div>
    </div>
    <div class="dotted-row" style="margin-bottom: 8px;"></div>

    <div class="field-row" style="margin-bottom: 8px;">
      <span class="field-label" style="font-size:12.5px;">വില</span>
      <span class="field-colon">:</span>
      <div class="dotted-line"></div>
    </div>

    <div class="field-row" style="margin-bottom: 8px;">
      <span class="field-label" style="font-size:12.5px;">സ്ഥാപനത്തിന്റെ പേര്</span>
      <span class="field-colon">:</span>
      <div class="dotted-line"></div>
    </div>

    <div class="field-row" style="margin-bottom: 8px;">
      <span class="field-label" style="font-size:12.5px;">ചെക്ക് നമ്പർ</span>
      <span class="field-colon">:</span>
      <div class="dotted-line"></div>
    </div>
  </div>

  <div class="receipt-heading">
    <div style="font-size: 12.5px; line-height: 2;">
      ....................................................................................സ്ഥാപനത്തിന്റെ..................................-ാംനമ്പർ
    </div>
    <div style="font-size: 12.5px; margin-top: 4px;">
      ഇൻവോയ്സ് പ്രകാരമുള്ള ഗൃഹോപകരണ സാമഗ്രികൾ തൃപ്തികരമായി കിട്ടിബോദ്ധിച്ചു.
    </div>
  </div>

  <div style="display: flex; justify-content: space-between; margin-top: 25px; font-size: 12.5px;">
    <div style="line-height: 2.2;">
      <div>കൽപ്പറ്റ</div>
      <div>തീയതി :</div>
    </div>
    <div style="line-height: 2.2; width: 55%;">
      <div>ഒപ്പ് : .........................................................................................</div>
      <div>പേര് : .........................................................................................</div>
    </div>
  </div>
</div>

</body>
</html>`;

const tempHtml = path.join(__dirname, 'hire_purchase_form.html');
const outPdf = path.join(__dirname, '..', 'assets', 'downloads', 'consumer-goods-loan-application.pdf');

fs.writeFileSync(tempHtml, htmlContent, 'utf-8');

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlUrl = 'file:///' + tempHtml.replace(/\\/g, '/');

console.log('Rendering 4-page PDF...');
execFile(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--no-pdf-header-footer',
  '--print-to-pdf=' + outPdf,
  htmlUrl
], (err) => {
  if (err) {
    console.error('Error generating PDF:', err);
    process.exit(1);
  }
  console.log('PDF rendered successfully: ' + fs.statSync(outPdf).size + ' bytes');
});
