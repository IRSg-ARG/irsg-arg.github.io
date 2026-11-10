import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const site=read('content/site.json'),media=read('content/media.json'),pubs=read('content/publications.json');
const arg=(name,fallback)=>{const i=process.argv.indexOf(name);return i<0?fallback:process.argv[i+1];};
const directory=path.resolve(root,arg('--out-dir','dist'));
if(!directory.startsWith(root+path.sep))throw Error('Check directory is outside project');
const base=arg('--base-path',process.env.SITE_BASE_PATH??site.basePath).replace(/\/+$/,'');
const origin=arg('--origin',process.env.SITE_ORIGIN||site.origin).replace(/\/+$/,'');
const failures=[];
const assert=(condition,message)=>{if(!condition)failures.push(message);};
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(item=>item.isDirectory()?walk(path.join(dir,item.name)):[path.join(dir,item.name)]);}
assert(fs.existsSync(directory),'Build output missing: run node scripts/build.mjs first');
if(!fs.existsSync(directory)){console.error(failures.join('\n'));process.exit(1);}
const files=walk(directory),htmlFiles=files.filter(f=>f.endsWith('.html'));
const decode=text=>text.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
const pages=new Map(htmlFiles.map(file=>[file,fs.readFileSync(file,'utf8')]));
let linksChecked=0;
for(const [file,html] of pages){
  const relative=path.relative(directory,file).replaceAll(path.sep,'/');
  const route=relative==='index.html'?'':relative.replace(/index\.html$/,'');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert(ids.length===new Set(ids).size,'Duplicate IDs: '+relative);
  assert((html.match(/<h1(?:\s|>)/g)||[]).length===1,'Expected one H1: '+relative);
  assert(/<html lang="en">/.test(html),'Language missing: '+relative);
  assert(/<meta name="description" content="[^"]+">/.test(html),'Description missing: '+relative);
  assert(html.includes('href="#main"'),'Skip link missing: '+relative);
  assert(!/\{\{[A-Z_]+\}\}/.test(html),'Unrendered template token: '+relative);
  assert(!/Siemens|Gorilla Tag|under review|verification pending|28×|9\.39 min/i.test(html),'Unapproved editorial content: '+relative);
  for(const image of html.matchAll(/<img\b[^>]*>/g))assert(/\balt="[^"]+"/.test(image[0]),'Image needs alt text: '+relative);
  for(const video of html.matchAll(/<video\b[^>]*>/g)){
    assert(/\bcontrols\b/.test(video[0])&&!/\bautoplay\b/.test(video[0]),'Video must have visitor controls: '+relative);
    assert(/preload="none"/.test(video[0]),'Video should not preload: '+relative);
  }
  for(const reference of html.matchAll(/\baria-(?:labelledby|describedby)="([^"]+)"/g))for(const id of reference[1].split(/\s+/))assert(ids.includes(id),'Broken ARIA reference '+id+': '+relative);
  for(const match of html.matchAll(/\b(?:href|src|poster)="([^"]+)"/g)){
    const raw=decode(match[1]);
    if(/^(https?:|mailto:|tel:|data:)/i.test(raw))continue;
    const url=new URL(raw,'https://check.invalid'+base+'/'+route);
    if(base&&!url.pathname.startsWith(base+'/')){assert(false,'Link escapes configured base path '+raw+': '+relative);continue;}
    let local=decodeURIComponent(url.pathname.slice(base.length)).replace(/^\/+/,'');
    if(!local||local.endsWith('/'))local+='index.html';
    const destination=path.resolve(directory,local);
    assert(destination.startsWith(directory+path.sep),'Link escapes build: '+raw);
    assert(fs.existsSync(destination),'Missing target '+raw+': '+relative);
    if(url.hash&&fs.existsSync(destination)&&destination.endsWith('.html')){
      const targetHtml=pages.get(destination)||fs.readFileSync(destination,'utf8');
      assert(targetHtml.includes('id="'+decodeURIComponent(url.hash.slice(1))+'"'),'Missing anchor '+raw+': '+relative);
    }
    linksChecked++;
  }
}
for(const m of media){
  assert(!/review-only/.test(m.path),'Withheld asset selected: '+m.id);
  assert(m.source?.id==='S11','Missing source provenance: '+m.id);
  for(const file of [m.path,m.poster].filter(Boolean))assert(fs.existsSync(path.join(directory,file)),'Missing media: '+file);
  for(const [file,digest] of Object.entries(m.sourceHashes||{})){
    const target=path.join(directory,file);
    if(fs.existsSync(target))assert(crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex')===digest,'Media changed from supplied review derivative: '+file);
  }
}
const unique=new Set();
for(const p of pubs){
  assert(!unique.has(p.doi),'Duplicate DOI: '+p.doi);unique.add(p.doi);
  assert(p.status==='published'&&p.authors.length>0,'Publication not ready: '+p.id);
  assert(p.url==='https://doi.org/'+p.doi,'DOI URL mismatch: '+p.id);
  const bib=fs.readFileSync(path.join(directory,'citations',p.id+'.bib'),'utf8');
  assert(bib.includes(p.title),'BibTeX title differs: '+p.id);
  assert(bib.includes(p.authors.join(' and ')),'BibTeX author order differs: '+p.id);
  for(const [key,value] of Object.entries({year:p.year,doi:p.doi,volume:p.volume,number:p.number,pages:p.pages}).filter(([,v])=>v!=null))assert(bib.includes(key+' = {'+value+'}'),'BibTeX '+key+' differs: '+p.id);
}
const featured=pubs.find(p=>p.id==='devassy2026frontier');
assert(JSON.stringify(featured?.authors)===JSON.stringify(['John Lewis Devassy','Meysam Basiri','Mário A. T. Figueiredo','Pedro U. Lima']),'Featured author attribution changed');
assert(featured?.volume==='11'&&featured?.number==='8'&&featured?.pages==='9359--9366'&&featured?.year===2026&&featured?.doi==='10.1109/LRA.2026.3703222','Featured citation differs from supplied published metadata');
const project=read('content/projects/probabilistic-frontier-prioritization.json');
for(const id of ['fame','froshe','ablation'])assert(project.results.find(r=>r.id===id)?.evaluation==='simulation','Simulation result misclassified: '+id);
const hardware=project.results.find(r=>r.id==='hardware');
assert(hardware?.evaluation==='outdoor hardware'&&hardware.teamSize===2&&JSON.stringify(hardware.value)==='[77,83,85]','Hardware evidence changed');
const sitemap=fs.readFileSync(path.join(directory,'sitemap.xml'),'utf8');
assert(sitemap.includes(origin+base+'/research/probabilistic-frontier-prioritization/'),'Sitemap base-path mismatch');
for(const file of files){assert(fs.statSync(file).size<100*1024*1024,'File exceeds ordinary GitHub limit: '+file);assert(!/\.(pptx|docx|zip|pdf)$/i.test(file),'Research original in deployable output: '+file);}
if(failures.length){for(const failure of failures)console.error('FAIL '+failure);process.exit(1);}
console.log('PASS '+htmlFiles.length+' HTML documents; '+linksChecked+' internal links and assets; '+pubs.length+' exact citations; '+media.length+' source-attributed media records.');
console.log('PASS simulation/hardware separation, controlled video loading, alt text, heading/ARIA references, and '+(base||'/')+' base path.');
console.log('Static output: '+(files.reduce((sum,f)=>sum+fs.statSync(f).size,0)/1024/1024).toFixed(2)+' MiB. No external packages required.');
