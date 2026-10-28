import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = root;
const styleVersion = createHash('sha256').update(readFileSync(path.join(root, 'style.css'))).digest('hex').slice(0,12);
const data = JSON.parse(readFileSync(path.join(root, 'content.json'), 'utf8'));
const config = JSON.parse(readFileSync(path.join(root, 'site.config.json'), 'utf8'));
const origin = (process.env.SITE_URL || config.siteUrl).replace(/\/$/, '');
if (!/^https:\/\//.test(origin)) throw new Error('SITE_URL must be an absolute HTTPS URL.');
const analyticsId = config.googleAnalyticsMeasurementId || '';
if (analyticsId && !/^G-[A-Z0-9]+$/.test(analyticsId)) throw new Error('Google Analytics Measurement ID must start with G- and contain only uppercase letters and numbers.');
const analyticsTag = analyticsId ? `
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${analyticsId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${analyticsId}');
</script>
` : '';
const p = data.person;
const publications = [...data.publications].sort((a, b) => b.year - a.year);
const years = [...new Set(publications.map(item => item.year))];
mkdirSync(output, { recursive: true });
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const absolute = file => `${origin}/${file}`;
const external = (url, label, cls = '') => `<a href="${escape(url)}"${cls ? ` class="${cls}"` : ''}>${label}</a>`;
const portrait = `<img src="portrait.svg" width="660" height="825" alt="Portrait of Ke Wang" fetchpriority="high">`;
const arrow = '<span class="arrow" aria-hidden="true">↗</span>';
const email = p.email;
const titleFor = page => page === 'Home' ? config.title : `${page} | Ke Wang`;

function socialLinks() {
  return [[p.scholar,'Google Scholar'],[p.linkedin,'LinkedIn'],[p.researchgate,'ResearchGate']]
    .filter(([url]) => url).map(([url,label]) => external(url, escape(label))).join('');
}
function header(active) {
  return `<a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><div class="wrap header-inner">
    <a class="wordmark" href="index.html" aria-label="Ke Wang, home"><span class="monogram" aria-hidden="true">kw</span><span class="wordmark-name">KE WANG</span></a>
    <button class="menu-toggle" data-menu-toggle aria-expanded="false" aria-controls="primary-navigation">Menu <span aria-hidden="true">☰</span></button>
    <nav class="nav" id="primary-navigation" aria-label="Main navigation">${[['Home','index.html'],['Research','research.html'],['Publications','publications.html'],['About','about.html']].map(([name,url]) => `<a href="${url}"${name === active ? ' aria-current="page"' : ''}>${name}</a>`).join('')}<a href="#contact">Contact <span aria-hidden="true">↗</span></a></nav>
  </div></header>`;
}
function footer() {
  return `<section class="contact-band" id="contact" aria-labelledby="contact-heading"><div class="wrap contact-inner">
    <div><p class="eyebrow">Contact</p><h2 id="contact-heading">Get in touch.</h2></div>
    <div><a class="contact-email" href="mailto:${escape(email)}">${escape(email)} ${arrow}</a>
    ${p.secondaryEmail && p.secondaryEmail !== email ? `<p class="contact-small">Also at <a href="mailto:${escape(p.secondaryEmail)}">${escape(p.secondaryEmail)}</a></p>` : ''}</div>
  </div></section><footer class="site-footer"><div class="wrap footer-inner"><span>© ${new Date().getUTCFullYear()} Ke Wang · Condensed Matter Theory</span><div class="footer-links">${socialLinks()}</div></div></footer>`;
}
function page(name, filename, description, body) {
  const person = {
    '@context':'https://schema.org', '@type':'Person', name:p.name,
    url:origin, '@id':`${origin}/#ke-wang`, image:absolute('portrait.svg'),
    jobTitle:p.role, affiliation:{'@type':'CollegeOrUniversity',name:p.institution},
    email:`mailto:${email}`, sameAs:[p.scholar,p.linkedin,p.researchgate].filter(Boolean),
    knowsAbout:data.research.map(topic => topic.title)
  };
  const html = `<!doctype html>
<html lang="en"><head>${analyticsTag}<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${filename === '404.html' ? `<base href="${escape(origin)}/">` : ''}
<title>${escape(titleFor(name))}</title><meta name="description" content="${escape(description)}">
<meta name="theme-color" content="#f6f5f0"><link rel="canonical" href="${absolute(filename === 'index.html' ? '' : filename)}">
<meta property="og:type" content="${name === 'About' ? 'profile' : 'website'}"><meta property="og:title" content="${escape(titleFor(name))}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${absolute(filename === 'index.html' ? '' : filename)}"><meta property="og:image" content="${absolute('portrait.svg')}"><meta property="og:site_name" content="Ke Wang"><meta property="og:locale" content="en_US"><meta name="twitter:card" content="summary_large_image">
${config.googleSiteVerification ? `<meta name="google-site-verification" content="${escape(config.googleSiteVerification)}">` : ''}
<link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="style.css?v=${styleVersion}"><script src="site.js" defer></script>
<script type="application/ld+json">${JSON.stringify(person).replace(/</g,'\\u003c')}</script></head><body>${header(name)}${body}${footer()}</body></html>`;
  writeFileSync(path.join(output, filename), html);
}
function publication(item, index) {
  const authors = escape(item.authors).replace(/\bKe Wang\b/g,'<strong>Ke Wang</strong>').replace(/\bK\. Wang\b/g,'<strong>K. Wang</strong>');
  const links = [];
  if (item.url) links.push(external(item.url, 'Read paper '+arrow));
  if (item.arxiv && item.arxiv !== item.url) links.push(external(item.arxiv, 'arXiv'));
  return `<li class="publication-item"><span class="publication-number" aria-hidden="true">${String(index+1).padStart(2,'0')}</span><div><h3 class="publication-title">${external(item.url,escape(item.title))}</h3><p class="publication-authors">${authors}</p><p class="publication-meta">${escape(item.venue || 'Preprint')}${String(item.venue || '').includes(String(item.year)) ? '' : ` · ${item.year}`}${links.join('')}</p></div></li>`;
}
function heading(label, title, intro) {
  return `<div class="page-heading"><p class="eyebrow">${escape(label)}</p><h1>${escape(title)}</h1><p class="lead">${escape(intro)}</p></div>`;
}
function home() {
  const featured = publications.filter(item => item.featured);
  const selected = (featured.length ? featured : publications).slice(0,3);
  const activities = data.activities.slice(0,4);
  return `<main id="main"><div class="wrap"><section class="home-hero" aria-labelledby="hero-heading"><div><p class="eyebrow">Condensed matter theory · Ultracold atoms</p><h1 class="hero-name" id="hero-heading">Ke Wang</h1><p class="hero-statement">Exploring correlated<br>quantum matter.</p><p class="hero-role"><strong>${escape(p.role)}</strong><br>${escape(p.institution)}</p><div class="hero-links"><a class="button-link" href="research.html">Explore my research <span aria-hidden="true">↗</span></a>${external(p.scholar,'Google Scholar '+arrow,'text-link')}</div></div><figure class="portrait">${portrait}<figcaption>Theoretical physics · Ke Wang</figcaption></figure></section>
  <section class="section intro-grid" aria-labelledby="intro-heading"><div><p class="section-index">01 / RESEARCH</p><h2 id="intro-heading">Many particles.<br>New possibilities.</h2></div><div><p class="lead">${escape(p.bio)}</p><div class="research-links">${data.research.map(topic => `<a href="research.html#${escape(topic.id)}">${escape(topic.title)} <span aria-hidden="true">↗</span></a>`).join('')}</div></div></section>
  <section class="section home-publications" aria-labelledby="selected-heading"><p class="section-index">02 / PUBLICATIONS</p><div class="section-head"><h2 id="selected-heading">Recent work</h2><a class="text-link" href="publications.html">All publications ${arrow}</a></div><ol class="publication-list">${selected.map(publication).join('')}</ol></section>
  <section class="section news-layout" aria-labelledby="news-heading"><div><p class="section-index">03 / UPDATES</p><h2 id="news-heading">Around the<br>community.</h2><p class="muted">Recent talks, meetings, and activities.</p><a class="text-link" href="about.html#activities">More activities ${arrow}</a></div><ul class="news-list">${activities.map(item => `<li class="news-item"><span class="news-year">${item.year}</span><p>${item.url ? external(item.url,escape(item.text)) : escape(item.text)}</p></li>`).join('')}</ul></section></div></main>`;
}
function research() {
  return `<main id="main" class="wrap">${heading('Research','Correlated quantum matter.','I study condensed matter physics and ultracold atoms, with a focus on the mechanisms underlying few- and many-body phenomena.')}<div class="page-body">${data.research.map((topic,index) => `<section class="research-topic" id="${escape(topic.id)}" aria-labelledby="topic-${index}"><span class="topic-number">${String(index+1).padStart(2,'0')} / RESEARCH</span><div><h2 class="topic-title" id="topic-${index}">${escape(topic.title)}</h2><div class="research-prose">${topic.paragraphs.map(text => `<p>${escape(text)}</p>`).join('')}</div>${topic.image?.path && existsSync(path.join(output,topic.image.path)) ? `<figure class="research-figure"><img src="${escape(topic.image.path)}" alt="${escape(topic.image.caption)}" loading="lazy"><figcaption>${escape(topic.image.caption)}</figcaption></figure>` : ''}${topic.papers?.length ? `<ul class="topic-papers">${topic.papers.map(paper => `<li>${external(paper.url,escape(paper.title)+' '+arrow)}</li>`).join('')}</ul>` : ''}</div></section>`).join('')}</div></main>`;
}
function publicationPage() {
  return `<main id="main" class="wrap">${heading('Publications','Papers & preprints.','Research on superconductivity, quantum matter, and ultracold atomic and molecular systems.')}<div class="page-body"><div class="filter-bar" role="group" aria-label="Filter publications by year"><button class="filter-button" data-year-filter="all" aria-pressed="true">All years</button>${years.map(year => `<button class="filter-button" data-year-filter="${year}" aria-pressed="false">${year}</button>`).join('')}</div><p class="visually-hidden" data-filter-status role="status" aria-live="polite">Showing all publications.</p>${years.map(year => `<section class="year-group" data-publication-year="${year}" aria-labelledby="year-${year}"><h2 class="year-heading" id="year-${year}">${year}</h2><ol class="publication-list">${publications.filter(item => item.year === year).map(item => publication(item,publications.indexOf(item))).join('')}</ol></section>`).join('')}<p class="publication-note">For citation information and additional records, visit ${external(p.scholar,'Google Scholar '+arrow)}.</p></div></main>`;
}
function about() {
  return `<main id="main" class="wrap">${heading('About','A little background.','Theoretical physicist working on correlated phases of quantum matter.')}<div class="page-body"><div class="about-grid"><div><p class="lead">${escape(p.bio)}</p><p class="muted">I am an ${escape(p.role)} at the ${escape(p.institution)}. Previously, I was a Kadanoff Postdoctoral Fellow at the University of Chicago. I received my Ph.D. in Physics from the University of Massachusetts Amherst.</p><ol class="timeline">${data.positions.map(position => `<li><time>${escape(position.dates)}</time><div><h3>${position.url ? external(position.url,escape(position.institution)) : escape(position.institution)}</h3><p>${escape(position.role)}</p></div></li>`).join('')}</ol><div class="about-links">${socialLinks()}</div>${p.quote ? `<blockquote class="quote" lang="zh">${escape(p.quote)}</blockquote>` : ''}</div><figure class="about-photo">${portrait}</figure></div>
  <section class="section" id="activities" aria-labelledby="activities-heading" style="margin-top:55px"><p class="section-index">TALKS & ACTIVITIES</p><h2 id="activities-heading">Conversations in physics.</h2><ul class="news-list">${data.activities.map(item => `<li class="news-item"><span class="news-year">${item.year}</span><p>${item.url ? external(item.url,escape(item.text)) : escape(item.text)}</p></li>`).join('')}</ul></section></div></main>`;
}
page('Home','index.html',config.description,home());
page('Research','research.html','Research interests of Ke Wang: superconductivity, two-dimensional materials, quantum simulation, and quantum criticality.',research());
page('Publications','publications.html','Publications and preprints by Ke Wang in condensed matter theory and ultracold atomic and molecular physics.',publicationPage());
page('About','about.html','Academic background, talks, activities, and contact information for Ke Wang at the University of Rochester.',about());
page('Page not found','404.html','The requested page could not be found.',`<main class="wrap not-found" id="main"><p class="eyebrow">404 / Page not found</p><h1 style="font-size:72px">Let’s return home.</h1><p>This address is unavailable. You can find my research, publications, and contact details from the homepage.</p><a class="button-link" href="index.html">Back to homepage →</a></main>`);
writeFileSync(path.join(output,'.nojekyll'),'\n');
writeFileSync(path.join(output,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${absolute('sitemap.xml')}\n`);
writeFileSync(path.join(output,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['','research.html','publications.html','about.html'].map(file => `<url><loc>${escape(absolute(file))}</loc></url>`).join('')}</urlset>\n`);
console.log(`Built 4 pages + 404; ${publications.length} publications and ${data.research.length} research topics. Canonical origin: ${origin}`);
