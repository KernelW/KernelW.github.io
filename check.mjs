import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const dist=root;
const data=JSON.parse(readFileSync(path.join(root,'content.json'),'utf8'));
const errors=[];
for(const file of readdirSync(dist).filter(name=>name.endsWith('.html'))){
 const html=readFileSync(path.join(dist,file),'utf8');
 for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const url=match[1].replace(/&amp;/g,'&');
  if(/^(https?:|mailto:|data:)/.test(url)) continue;
  const [relative,fragment]=url.split('#');
  const localPath=relative.split('?')[0];
  const target=localPath ? path.join(dist,localPath) : path.join(dist,file);
  if(!existsSync(target)){errors.push(`${file}: missing ${url}`);continue;}
  if(fragment && target.endsWith('.html')){
   const targetHtml=readFileSync(target,'utf8');
   if(!targetHtml.includes(`id="${fragment}"`))errors.push(`${file}: missing anchor ${url}`);
  }
 }
 if(!/<h1\b/.test(html))errors.push(`${file}: missing h1`);
 if(!/name="description"/.test(html))errors.push(`${file}: missing description`);
 if(/<[^>]+(?:href|src)="(?:#|undefined|null)"/.test(html))errors.push(`${file}: placeholder link`);
 if(/TODO|Lorem ipsum|codex-preview/.test(html))errors.push(`${file}: placeholder content`);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
 if(new Set(ids).size!==ids.length) errors.push(`${file}: duplicate IDs`);
}
for(const publication of data.publications){
 if(!publication.title || !publication.authors || !publication.year || !/^https:\/\//.test(publication.url))errors.push('Publication missing source metadata');
}
if(new Set(data.publications.map(p=>p.url)).size!==data.publications.length)errors.push('Duplicate publication URLs');
if(!existsSync(path.join(dist,'portrait.svg')))errors.push('Missing portrait');
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log('Checked local links, section anchors, metadata, unique IDs, portrait, and publication sources.');
