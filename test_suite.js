const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;

const REQUIRED_PAGES = [
  'index.html',
  'about.html',
  'services.html',
  'downloads.html',
  'gallery.html',
  'rooms-dormitories.html',
  'contact.html',
  'privacy-policy.html',
  'terms.html',
  'disclaimer.html',
  'accessibility.html',
  'notices.html',
  'faq.html',
  'search.html',
  '404.html'
];

const REQUIRED_CSS = [
  'css/main.css',
  'css/components.css',
  'css/responsive.css'
];

const REQUIRED_JS = [
  'js/main.js',
  'js/downloads.js',
  'js/gallery.js',
  'js/contact.js',
  'js/faq.js',
  'js/notices.js',
  'js/search.js'
];

const REQUIRED_ASSETS = [
  'assets/images/society-logo.svg',
  'assets/images/society-building.jpg',
  'assets/images/building-inauguration-2014-1.jpg',
  'assets/images/building-inauguration-2014-2.jpg',
  'assets/images/favicon.svg',
  'assets/images/room-guest-room.svg',
  'assets/images/room-dormitory.svg',
  'assets/images/gallery-1.svg',
  'assets/images/gallery-2.svg',
  'assets/images/gallery-3.svg',
  'assets/images/gallery-4.svg',
  'assets/images/gallery-5.svg',
  'assets/images/gallery-6.svg',
  'assets/downloads/emergency-loan-application.pdf',
  'assets/downloads/loan-voucher-promissory-note.pdf',
  'assets/downloads/consumer-goods-loan-application.pdf',
  'assets/downloads/deposit-loan-overdraft-application.pdf',
  'assets/downloads/festival-loan-application.pdf',
  'assets/downloads/medium-term-loan-application.pdf',
  'sitemap.xml',
  'robots.txt'
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${message}`);
  }
}

console.log('==================================================');
console.log('1. VERIFYING ALL 16 PAGES & SYSTEM ASSETS');
console.log('==================================================');

[...REQUIRED_PAGES, ...REQUIRED_CSS, ...REQUIRED_JS, ...REQUIRED_ASSETS].forEach(file => {
  const filePath = path.join(ROOT_DIR, file);
  assert(fs.existsSync(filePath), `File exists: ${file}`);
});

console.log('\n==================================================');
console.log('2. VERIFYING INTERNAL LINK INTEGRITY');
console.log('==================================================');

REQUIRED_PAGES.forEach(page => {
  const content = fs.readFileSync(path.join(ROOT_DIR, page), 'utf-8');
  
  // Find hrefs like "about.html" or "services.html#deposits" or "downloads.html?category=loan"
  const hrefMatches = content.match(/href="([^"#:]+)(\?[^"#]*)?(#[^"]*)?"/g) || [];
  
  hrefMatches.forEach(hrefAttr => {
    const rawHref = hrefAttr.replace(/^href="/, '').replace(/"$/, '');
    const cleanHref = rawHref.split('?')[0].split('#')[0];
    
    // Ignore external or empty or javascript
    if (!cleanHref || cleanHref.startsWith('http') || cleanHref.startsWith('mailto') || cleanHref.startsWith('tel') || cleanHref === '#') return;
    
    const targetPath = path.join(ROOT_DIR, cleanHref);
    assert(fs.existsSync(targetPath), `${page} -> valid link target: ${cleanHref}`);
  });
});

console.log('\n==================================================');
console.log('3. VERIFYING SERVICES SPECIFICATIONS (services.html)');
console.log('==================================================');

const servicesContent = fs.readFileSync(path.join(ROOT_DIR, 'services.html'), 'utf-8');

const expectedDeposits = [
  'Savings Deposit',
  'Recurring Deposit',
  'Fixed Deposit',
  'Monthly Savings Scheme',
  'Group Deposit Scheme'
];

const expectedLoans = [
  'Emergency Loan',
  'Hire Purchase Loan',
  'Medium Term Loan',
  'Festival Loan',
  'Deposit Loan'
];

expectedDeposits.forEach(dep => {
  assert(servicesContent.includes(dep), `services.html contains deposit scheme: "${dep}"`);
});

expectedLoans.forEach(loan => {
  assert(servicesContent.includes(loan), `services.html contains loan product: "${loan}"`);
});

console.log('\n==================================================');
console.log('4. VERIFYING DOWNLOADS FORMS (downloads.html)');
console.log('==================================================');

const downloadsContent = fs.readFileSync(path.join(ROOT_DIR, 'downloads.html'), 'utf-8');

const expectedForms = [
  'Emergency Loan Application',
  'Hire Purchase Loan Application',
  'Medium Term Loan Application',
  'Festival Loan Application',
  'Deposit Loan Application',
  'Savings Deposit Application',
  'Recurring Deposit Application',
  'Fixed Deposit Application',
  'Education Award for Children',
  'Application for Loan Statement',
  'Application for Other Certifications'
];

expectedForms.forEach(form => {
  assert(downloadsContent.includes(form), `downloads.html contains form: "${form}"`);
});

console.log('\n==================================================');
console.log('5. VERIFYING INSTITUTIONAL IDENTITY & REGISTRATION');
console.log('==================================================');

REQUIRED_PAGES.forEach(page => {
  const content = fs.readFileSync(path.join(ROOT_DIR, page), 'utf-8');
  assert(content.includes('WAYANAD DISTRICT POLICE') || content.includes('Wayanad District Police'), `${page} has correct society name`);
  assert(content.includes('W 208'), `${page} has society registration number W 208`);
  assert(content.includes('header-search-btn'), `${page} has header search button`);
  assert(content.includes('headerSearchModal'), `${page} has header search modal`);
  assert(content.includes('site-footer'), `${page} has standardized footer`);
  assert(content.includes('04936 205940') || content.includes('04936205940'), `${page} contains official telephone 04936 205940`);
});

console.log('\n==================================================');
console.log('5.1 VERIFYING ABOUT THE SOCIETY (about.html) DETAILS');
console.log('==================================================');

const aboutContent = fs.readFileSync(path.join(ROOT_DIR, 'about.html'), 'utf-8');
assert(aboutContent.includes('24 May 1996'), 'about.html contains Registration Date: 24 May 1996');
assert(aboutContent.includes('21 August 1996'), 'about.html contains Commencement Date: 21 August 1996');
assert(aboutContent.includes('P. Aboobacker IPS'), 'about.html contains founding patron Sri. P. Aboobacker IPS');
assert(aboutContent.includes('Class 1 Special Grade'), 'about.html contains Class 1 Special Grade classification');
assert(aboutContent.includes("Best Employees' Co-operative Society in Wayanad District"), 'about.html contains recognition award');
assert(aboutContent.includes('SATHEESH KUMAR P G'), 'about.html contains President: SATHEESH KUMAR P G');
assert(aboutContent.includes('BIPIN SUNNY'), 'about.html contains Vice President: BIPIN SUNNY');

const expectedDirectors = [
  'MOHANAN M',
  'ERSHAD MUBARAK',
  'AJEESH P S',
  'RAJESH V S',
  'SHEEJA A R',
  'VINEESHA C',
  'ARSHADA N P'
];
expectedDirectors.forEach(dir => {
  assert(aboutContent.includes(dir), `about.html contains Director: ${dir}`);
});

console.log('\n==================================================');
console.log('6. VERIFYING SUPPORTING & LEGAL PAGES SPECIFICS');
console.log('==================================================');

// 6.1 Privacy Policy
const privacyContent = fs.readFileSync(path.join(ROOT_DIR, 'privacy-policy.html'), 'utf-8');
const privacySections = [
  'Introduction',
  'Information We Collect',
  'Information Submitted Through Enquiry Forms',
  'How Information Is Used',
  'Information Sharing',
  'Document Downloads',
  'External Websites and Booking Applications',
  'Cookies and Website Analytics',
  'Data Security',
  'Data Retention',
  'User Rights',
  'Changes to This Privacy Policy',
  'Contact Information'
];
privacySections.forEach(sec => {
  assert(privacyContent.includes(sec), `privacy-policy.html includes section: "${sec}"`);
});
assert(privacyContent.includes('Effective Date:'), 'privacy-policy.html includes Effective Date indicator');

// 6.2 Terms & Conditions
const termsContent = fs.readFileSync(path.join(ROOT_DIR, 'terms.html'), 'utf-8');
const termsSections = [
  'Acceptance of Terms',
  'Website Use',
  'Accuracy of Information',
  'Services and Product Information',
  'Application Forms',
  'Downloaded Documents',
  'External Links',
  'External Booking Services',
  'Intellectual Property',
  'Website Availability',
  'Limitation of Responsibility',
  'Changes to Website Content',
  'Contact Information'
];
termsSections.forEach(sec => {
  assert(termsContent.includes(sec), `terms.html includes section: "${sec}"`);
});
assert(
  termsContent.includes('Official terms, conditions, rules and eligibility criteria of the society shall prevail'),
  'terms.html includes mandatory prevailing clause'
);

// 6.3 Disclaimer
const disclaimerContent = fs.readFileSync(path.join(ROOT_DIR, 'disclaimer.html'), 'utf-8');
assert(
  disclaimerContent.includes('For official or transaction-related matters, members should contact the society directly through its authorised communication channels.'),
  'disclaimer.html contains mandatory prominent transaction notice'
);

// 6.4 Accessibility Statement
const accessContent = fs.readFileSync(path.join(ROOT_DIR, 'accessibility.html'), 'utf-8');
assert(accessContent.includes('Accessibility Feedback'), 'accessibility.html contains feedback section');
assert(accessContent.includes('Last Reviewed:'), 'accessibility.html contains Last Reviewed indicator');
assert(accessContent.includes('wdpcs.208@gmail.com'), 'accessibility.html contains official accessibility email wdpcs.208@gmail.com');

// 6.5 Notices & Circulars
const noticesContent = fs.readFileSync(path.join(ROOT_DIR, 'notices.html'), 'utf-8');
assert(noticesContent.includes('notice-category-row') || noticesContent.includes('notice-filter-pill'), 'notices.html contains category filter');
assert(noticesContent.includes('noticeYearSelect'), 'notices.html contains year filter');
assert(noticesContent.includes('noticeSearchInput'), 'notices.html contains notices search');
assert(noticesContent.includes('General Notices'), 'notices.html contains General Notices category');
assert(noticesContent.includes('Loan Notices'), 'notices.html contains Loan Notices category');
assert(noticesContent.includes('Deposit Notices'), 'notices.html contains Deposit Notices category');

// 6.6 FAQ Page
const faqContent = fs.readFileSync(path.join(ROOT_DIR, 'faq.html'), 'utf-8');
const faqCategories = [
  'General',
  'Deposits',
  'Loans',
  'Applications &amp; Documents',
  'Society Rooms &amp; Dormitories'
];
faqCategories.forEach(cat => {
  assert(faqContent.includes(cat), `faq.html includes FAQ category: "${cat}"`);
});
assert(faqContent.includes('accordion-header') || faqContent.includes('faq-item'), 'faq.html contains accordion items');

// 6.7 Global Search Results
const searchContent = fs.readFileSync(path.join(ROOT_DIR, 'search.html'), 'utf-8');
assert(searchContent.includes('globalSearchInput'), 'search.html contains search input');
assert(searchContent.includes('searchKeywordDisplay'), 'search.html displays search keyword');
assert(searchContent.includes('searchNoResultsState'), 'search.html contains no-results state');

// 6.8 404 Page
const notFoundContent = fs.readFileSync(path.join(ROOT_DIR, '404.html'), 'utf-8');
assert(notFoundContent.includes('Page Not Found'), '404.html contains Page Not Found title');
assert(notFoundContent.includes('Go to Homepage'), '404.html contains Go to Homepage CTA');
assert(notFoundContent.includes('Search Website'), '404.html contains Search Website CTA');

// 7. OFFICIAL INSTITUTIONAL CONTACT INTEGRITY ACROSS ALL 16 PAGES
console.log('\n--- 7. Official Contact Integrity Across All 16 Pages ---');
REQUIRED_PAGES.forEach(page => {
  const content = fs.readFileSync(path.join(ROOT_DIR, page), 'utf-8');
  assert(content.includes('04936 205940') || content.includes('04936205940'), `${page} contains official landline 04936 205940`);
  assert(content.includes('8301995940'), `${page} contains official mobile 8301995940`);
  assert(content.includes('wdpcs.208@gmail.com'), `${page} contains official email wdpcs.208@gmail.com`);
  assert(content.includes('Kalpetta North') && content.includes('673122'), `${page} contains official address (Kalpetta North, 673122)`);
  assert(!content.includes('[SOCIETY ADDRESS]'), `${page} has no leftover [SOCIETY ADDRESS] placeholder`);
  assert(!content.includes('[MOBILE NUMBER]'), `${page} has no leftover [MOBILE NUMBER] placeholder`);
  assert(!content.includes('[EMAIL ADDRESS]'), `${page} has no leftover [EMAIL ADDRESS] placeholder`);
  assert(!content.includes('[ACCESSIBILITY EMAIL]'), `${page} has no leftover [ACCESSIBILITY EMAIL] placeholder`);
});

// WhatsApp Link & Working Hours verification
const contactHtml = fs.readFileSync(path.join(ROOT_DIR, 'contact.html'), 'utf-8');
assert(contactHtml.includes('wa.me/918301995940'), 'contact.html contains direct WhatsApp link');
assert(contactHtml.includes('10:00 AM') && contactHtml.includes('5:00 PM'), 'contact.html contains official working hours 10:00 AM to 5:00 PM');

const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');
assert(indexHtml.includes('10:00 AM') && indexHtml.includes('5:00 PM'), 'index.html contains official working hours in topbar & notices');

const faqHtml = fs.readFileSync(path.join(ROOT_DIR, 'faq.html'), 'utf-8');
assert(faqHtml.includes('10:00 AM') && faqHtml.includes('5:00 PM'), 'faq.html contains official working hours in Q5');

const noticesHtml = fs.readFileSync(path.join(ROOT_DIR, 'notices.html'), 'utf-8');
assert(noticesHtml.includes('10:00 AM') && noticesHtml.includes('5:00 PM'), 'notices.html contains official working hours in Notice 3');

// 8. VERIFYING NEAT HEADER ALIGNMENT ACROSS ALL 16 PAGES
console.log('\n--- 8. Header Alignment & Structure Across All 16 Pages ---');
REQUIRED_PAGES.forEach(page => {
  const content = fs.readFileSync(path.join(ROOT_DIR, page), 'utf-8');
  assert(content.includes('class="topbar"'), `${page} contains .topbar`);
  assert(content.includes('class="topbar-info"'), `${page} contains .topbar-info`);
  assert(content.includes('class="topbar-actions"'), `${page} contains .topbar-actions`);
  assert(content.includes('class="topbar-badge"'), `${page} contains .topbar-badge`);
  assert(content.includes('class="font-resizer"'), `${page} contains .font-resizer`);
  assert(content.includes('class="site-header"'), `${page} contains .site-header`);
  assert(content.includes('class="society-brand"'), `${page} contains .society-brand`);
  assert(content.includes('class="brand-logo-wrap"'), `${page} contains .brand-logo-wrap`);
  assert(content.includes('class="header-right"'), `${page} contains .header-right wrapper`);
  assert(content.includes('class="main-nav"'), `${page} contains .main-nav`);
  assert(content.includes('class="header-actions"'), `${page} contains .header-actions`);
  assert(content.includes('class="header-search-btn"'), `${page} contains .header-search-btn`);
  assert(content.includes('class="nav-cta-btn"'), `${page} contains .nav-cta-btn`);
  assert(content.includes('class="mobile-menu-toggle"'), `${page} contains .mobile-menu-toggle`);
});

console.log('\n==================================================');
console.log(`TEST SUMMARY: ${passedTests}/${totalTests} tests passed (${failedTests} failures)`);
console.log('==================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\n>>> ALL INSTITUTIONAL WEBSITE INTEGRITY TESTS PASSED SUCCESSFULLY! <<<');
  process.exit(0);
}
