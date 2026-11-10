import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const site=read('content/site.json'),media=read('content/media.json'),pubs=read('content/publications.json');
const sourceIndex=read('docs/source-index.json');
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
    if(relative==='404.html'&&!raw.startsWith('#'))assert(raw.startsWith(base+'/'),'404 link must work at unknown URL depths: '+raw);
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
  const suppliedSource=sourceIndex.additionalSources.find(s=>s.id===m.source?.id&&s.type?.startsWith('User-supplied'));
  assert(m.source?.id==='S11'||(suppliedSource&&m.source.suppliedOn===suppliedSource.date&&m.source.authorization),'Missing source provenance: '+m.id);
  for(const file of [m.path,m.poster].filter(Boolean))assert(fs.existsSync(path.join(directory,file)),'Missing media: '+file);
  for(const [file,digest] of Object.entries(m.sourceHashes||{})){
    const target=path.join(directory,file);
    if(fs.existsSync(target))assert(crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex')===digest,'Media changed from supplied review derivative: '+file);
  }
}
const unique=new Set();
assert(new Set(pubs.map(p=>p.id)).size===pubs.length,'Duplicate publication IDs');
for(const p of pubs){
  if(p.doi){const normalized=p.doi.toLowerCase();assert(!unique.has(normalized),'Duplicate DOI: '+p.doi);unique.add(normalized);assert(p.url==='https://doi.org/'+p.doi,'DOI URL mismatch: '+p.id);}
  assert(['published','accepted','preprint','archive'].includes(p.status)&&p.authors.length>0&&p.title&&p.year&&p.venue&&p.source_reference,'Publication not ready: '+p.id);
  assert(/^https:\/\//.test(p.url),'Publication record needs a source link: '+p.id);
  if(p.citationComplete===false)continue;
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
for(const route of ['publications/','students/'])assert(sitemap.includes(origin+base+'/'+route),'Directory missing from sitemap: '+route);
const research=read('content/research.json');
const projects=fs.readdirSync(path.join(root,'content/projects')).filter(f=>f.endsWith('.json')).map(f=>read('content/projects/'+f));
const researchHtml=fs.readFileSync(path.join(directory,'research/index.html'),'utf8');
assert((researchHtml.match(/data-directory-item/g)||[]).length===projects.length,'Research index omits or duplicates a project');
for(const p of projects){
  assert(research.themes.some(t=>t.id===p.themeId),'Project has no valid research theme: '+p.slug);
  assert(sitemap.includes(origin+base+'/research/'+p.slug+'/'),'Project missing from sitemap: '+p.slug);
  assert(researchHtml.includes('href="'+p.slug+'/"'),'Project not linked from research index: '+p.slug);
  if(p.type!=='catalogue')continue;
  assert(p.problem?.paragraphs.length&&p.approach?.paragraphs.length&&p.evidence?.length&&p.sourceReferences?.length,'Project content or provenance missing: '+p.slug);
  for(const id of p.publicationIds)assert(pubs.some(pub=>pub.id===id),'Unknown project publication '+id);
  assert(p.status!=='Published research'||p.publicationIds.length>0,'Published project needs a publication: '+p.slug);
  for(const selected of p.media){
    const asset=media.find(m=>m.id===selected.id);
    assert(asset&&selected.caption&&selected.description,'Project media missing context: '+p.slug+' / '+selected.id);
    if(asset?.experimentType==='simulation')assert(/simulation/i.test(selected.label),'Simulation footage mislabeled: '+p.slug+' / '+selected.id);
    if(/concept|design animation|explanatory animation/.test(asset?.experimentType||''))assert(/concept|design|explanatory|illustration/i.test(selected.label),'Concept/illustration label missing: '+p.slug+' / '+selected.id);
  }
}
const studentRecords=read('content/students.json').records;
assert(new Set(studentRecords.map(s=>s.id)).size===studentRecords.length,'Duplicate supervision records');
assert(studentRecords.every(s=>s.name&&s.topic&&s.source_reference&&['current','previous'].includes(s.status)),'Supervision record missing provenance or status');
const ines=studentRecords.find(s=>s.personId==='ines-marques');
assert(ines?.degree==='Bachelor'&&ines.status==='previous'&&ines.period==='2026','Inês Marques attribution differs from user correction');
const homeHtml=pages.get(path.join(directory,'index.html'));
assert(!homeHtml.includes('the later planner comparison is simulated'),'Removed homepage caption phrase returned');
assert(homeHtml.includes('custom-lidar-drone.jpg')&&homeHtml.includes('Rodrigo Ventura')&&homeHtml.includes('meysam-basiri.jpg'),'Requested homepage people or media missing');
for(const file of files){assert(fs.statSync(file).size<100*1024*1024,'File exceeds ordinary GitHub limit: '+file);assert(!/\.(pptx|docx|zip|pdf)$/i.test(file),'Research original in deployable output: '+file);}
if(failures.length){for(const failure of failures)console.error('FAIL '+failure);process.exit(1);}
console.log('PASS '+htmlFiles.length+' HTML documents; '+linksChecked+' internal links and assets; '+pubs.filter(p=>p.citationComplete!==false).length+' exact citations + '+pubs.filter(p=>p.citationComplete===false).length+' linked archive records; '+studentRecords.length+' supervision records; '+media.length+' source-attributed media records.');
console.log('PASS simulation/hardware separation, controlled video loading, alt text, heading/ARIA references, and '+(base||'/')+' base path.');
console.log('Static output: '+(files.reduce((sum,f)=>sum+fs.statSync(f).size,0)/1024/1024).toFixed(2)+' MiB. No external packages required.');
