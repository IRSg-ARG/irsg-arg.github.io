import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const site=read('content/site.json');
const home=read('content/home.json');
const people=read('content/people.json');
const publications=read('content/publications.json');
const media=read('content/media.json');
const argument=(name,fallback)=>{const i=process.argv.indexOf(name);if(i<0)return fallback;if(!process.argv[i+1]||process.argv[i+1].startsWith('--'))throw Error('Missing value for '+name);return process.argv[i+1];};
const base=argument('--base-path',process.env.SITE_BASE_PATH??site.basePath).replace(/\/+$/,'');
if(base&&!/^\/[a-zA-Z0-9._/-]+$/.test(base))throw Error('Base path must be empty or a URL path starting with /');
if(base.split('/').includes('..'))throw Error('Unsafe base path');
const origin=argument('--origin',process.env.SITE_ORIGIN||site.origin).replace(/\/+$/,'');
const parsedOrigin=new URL(origin);
if(!['https:','http:'].includes(parsedOrigin.protocol)||parsedOrigin.pathname!=='/')throw Error('Origin must be an HTTP(S) origin without a path');
const outputName=argument('--out-dir','dist');
if(!['dist','.qa/subpath'].includes(outputName))throw Error('Output must be dist or .qa/subpath');
const output=path.resolve(root,outputName);
if(!output.startsWith(root+path.sep)||output===root)throw Error('Output is outside the project');
/* The resolved absolute generated directory is checked before clearing it. */
if(fs.existsSync(output))fs.rmSync(output,{recursive:true,force:true});
fs.mkdirSync(output,{recursive:true});
fs.cpSync(path.join(root,'public'),output,{recursive:true});
fs.mkdirSync(path.join(output,'assets'),{recursive:true});
fs.copyFileSync(path.join(root,'src/styles.css'),path.join(output,'assets/styles.css'));
fs.copyFileSync(path.join(root,'src/site.js'),path.join(output,'assets/site.js'));
const h=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#39;");
function template(name,values){
  return fs.readFileSync(path.join(root,'src/templates',name+'.html'),'utf8').replace(/\{\{([A-Z_]+)\}\}/g,(_,key)=>{
    if(!(key in values))throw Error('Missing '+key+' in '+name);
    return values[key];
  });
}
function link(from,target){
  if(/^(https?:|mailto:|tel:|#)/i.test(target))return target;
  const marker=target.indexOf('#');
  const pathname=marker<0?target:target.slice(0,marker);
  const hash=marker<0?'':target.slice(marker);
  const fromDirectory=from.endsWith('.html')?path.posix.dirname(from):from;
  let relative=path.posix.relative(fromDirectory,pathname)||'.';
  if(!pathname||pathname.endsWith('/'))relative+='/';
  return relative+hash;
}
const absolute=route=>origin+base+'/'+route;
const mediaById=id=>{const item=media.find(m=>m.id===id);if(!item)throw Error('Unknown media '+id);return item;};
const personById=id=>{const person=people.find(p=>p.id===id);if(!person)throw Error('Unknown person '+id);return person;};
const pubById=id=>{const publication=publications.find(p=>p.id===id);if(!publication)throw Error('Unknown publication '+id);return publication;};
const paragraphs=items=>items.map(text=>'<p>'+h(text)+'</p>').join('');
function image(id,route,options={}){
  const m=mediaById(id);
  const asset=options.poster?m.poster:m.path;
  if(!asset)throw Error('No image path '+id);
  return '<img src="'+h(link(route,asset))+'" width="'+m.width+'" height="'+m.height+'" alt="'+h(options.alt??m.alt)+'" '+(options.eager?'fetchpriority="high" loading="eager"':'loading="lazy"')+' decoding="async">';
}
function video(id,route,label,descriptionId){
  const m=mediaById(id);
  if(m.type!=='video')throw Error('Not a video '+id);
  return '<video controls playsinline preload="none" width="'+m.width+'" height="'+m.height+'" poster="'+h(link(route,m.poster))+'" aria-label="'+h(label||m.title)+'"'+(descriptionId?' aria-describedby="'+h(descriptionId)+'"':'')+'><source src="'+h(link(route,m.path))+'" type="video/mp4"><p>Your browser cannot play this video. <a href="'+h(link(route,m.path))+'">Download the experiment video</a>.</p></video>';
}
const brandIcon='<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><rect width="64" height="64" rx="12" fill="#124d81"/><g fill="none" stroke="#fff" stroke-width="2.3"><path d="M21 21l22 22M43 21L21 43"/><circle cx="18" cy="18" r="8"/><circle cx="46" cy="18" r="8"/><circle cx="18" cy="46" r="8"/><circle cx="46" cy="46" r="8"/><circle cx="32" cy="32" r="5"/></g></svg>';
function brand(route){return '<a class="brand" href="'+h(link(route,''))+'" aria-label="Aerial Robotics and Multi Drone Systems homepage">'+brandIcon+'<span><span class="brand-name">Aerial Robotics</span><span class="brand-subtitle">MULTI DRONE SYSTEMS · ISR-LISBOA</span></span></a>';}
function header(route){return '<header class="site-header"><div class="wrap header-inner">'+brand(route)+'<button type="button" class="menu-toggle" aria-expanded="false" aria-controls="primary-navigation">Menu <span aria-hidden="true">☰</span></button><nav id="primary-navigation" class="site-nav" aria-label="Primary">'+site.nav.map(n=>'<a href="'+h(route?link(route,'')+'#'+n.anchor:'#'+n.anchor)+'">'+h(n.label)+'</a>').join('')+'<a class="nav-join" href="'+h(route?link(route,'')+'#join':'#join')+'">Work with us <span aria-hidden="true">↗</span></a></nav></div></header>';}
function footer(route){
  return '<footer id="contact" class="site-footer"><div class="wrap"><div class="footer-main"><div class="footer-identity">'+brand(route)+'<p>'+h(site.fullName)+'<br>'+h(site.institution)+' · '+h(site.university)+'</p></div><div class="footer-contact"><a href="mailto:'+h(site.email)+'">'+h(site.email)+'</a><p>'+h(site.contact.address)+'</p></div></div><div class="footer-bottom"><details class="media-credit"><summary>Research media & credits</summary><p>Experimental photographs and silent review videos supplied by Meysam Basiri from the ISR research presentation. Project researchers are credited alongside their work. The homepage photograph shows the trimodal UAV of Afonso Vale, Meysam Basiri and Frederico Afonso (IROS 2025). Simulation, hardware and explanatory animations are labelled in context. Portraits follow the supplied acknowledgment mapping.</p></details><div class="footer-links"><a href="'+h(site.github)+'">GitHub ↗</a><a href="'+h(site.contact.orcid)+'">Meysam Basiri · ORCID ↗</a><a href="'+h(route?link(route,'')+'#join':'#join')+'">Get in touch</a></div></div></div></footer>';
}
function join(){return '<section id="join" class="join-section" aria-labelledby="join-title"><div class="wrap join-inner"><div><p class="eyebrow">STUDENTS & COLLABORATORS</p><h2 id="join-title">'+h(home.join.heading)+'</h2></div><div><p>'+h(home.join.text)+'</p><a class="button" href="mailto:'+h(site.email)+'">'+h(site.email)+' <span aria-hidden="true">↗</span></a></div></div></section>';}
function venue(p){
  return h(p.venue)+(p.volume?' '+h(p.volume):'')+(p.number?'('+h(p.number)+')':'')+(p.pages?', '+h(p.pages.replaceAll('--','–')):'')+' · '+h(p.year);
}
function publication(p,route){return '<article class="publication"><span class="publication-year">'+p.year+'</span><div><h3><a href="'+h(p.url)+'">'+h(p.title)+'</a></h3><p class="publication-authors">'+h(p.authors.join(', '))+'</p><p class="publication-venue">'+venue(p)+'</p></div><div class="publication-links"><a href="'+h(p.url)+'" aria-label="Read paper: '+h(p.title)+'">Paper ↗</a><a href="'+h(link(route,'citations/'+p.id+'.bib'))+'" download aria-label="Download BibTeX for '+h(p.title)+'">BibTeX ↓</a></div></article>';}
function personCard(id,route,author=false){
  const p=personById(id);
  const portrait=p.portrait?image(p.portrait,route,{alt:'Portrait of '+p.name}):'<div class="initials" aria-hidden="true">'+h(p.initials||p.name.split(' ').map(s=>s[0]).slice(0,2).join(''))+'</div>';
  return '<article class="'+(author?'author-card':'person-card')+'"'+(author?' id="author-'+h(p.id)+'"':'')+'>'+portrait+'<div><h3>'+h(p.name)+'</h3><p>'+h(author?'Publication author':p.interest)+'</p></div></article>';
}
function page(route,title,description,body,options={}){
  const og=mediaById(options.mediaId||home.hero.mediaId);
  const schema=options.schema||{'@context':'https://schema.org','@type':'ResearchOrganization',name:site.fullName,url:absolute(''),email:site.email,parentOrganization:{'@type':'CollegeOrUniversity',name:site.institution+' · '+site.university},sameAs:[site.github]};
  return template('layout',{
    LANG:h(site.language),TITLE:h(title),DESCRIPTION:h(description),ROBOTS:options.noindex||!site.indexable?'noindex, nofollow':'index, follow',
    CANONICAL:h(absolute(route)),OGTYPE:options.article?'article':'website',OGIMAGE:h(absolute(og.poster||og.path)),OGALT:h(og.alt),
    FAVICON:h(link(route,'favicon.svg')),STYLES:h(link(route,'assets/styles.css')),SCRIPT:h(link(route,'assets/site.js')),
    HEADER:header(route),MAIN:body,FOOTER:footer(route),BODYCLASS:options.article?'project-page':'home-page',
    JSONLD:JSON.stringify(schema).replaceAll('<','\\u003c')
  });
}
const projectRoute='research/'+home.featured.projectSlug+'/';
const lead=personById('meysam-basiri');
const homeBody=template('home',{
  HERO_EYEBROW:h(home.hero.eyebrow),HERO_TITLE:home.hero.lines.map(line=>'<span>'+h(line)+'</span>').join(''),
  HERO_SUMMARY:h(home.hero.summary),HERO_IMAGE:image(home.hero.mediaId,'',{eager:true}),HERO_FILM_LINK:h(link('',mediaById(home.hero.filmId).path)),
  INSTITUTION_LOGO:image('s11-image87','',{alt:'Técnico Lisboa'}),INTRO_HEADING:h(home.introduction.heading),INTRO_TEXT:h(home.introduction.text),
  FEATURED_EYEBROW:h(home.featured.eyebrow),FEATURED_HEADING:h(home.featured.heading),FEATURED_SUMMARY:h(home.featured.summary),
  PROJECT_LINK:h(link('',projectRoute)),FEATURED_VIDEO:video(home.featured.mediaId,'','Outdoor court exploration followed by a simulation comparison'),
  THEMES:home.themes.map((t,i)=>'<details class="theme-item" id="theme-'+h(t.id)+'"><summary><span class="theme-number">'+String(i+1).padStart(2,'0')+'</span><span><span class="theme-title">'+h(t.title)+'</span><span class="theme-summary">'+h(t.summary)+'</span></span><span class="theme-toggle" aria-hidden="true">+</span></summary><div class="theme-body"><p>'+h(t.example)+'</p><ul>'+t.publications.map(id=>{const p=pubById(id);return '<li><a href="'+h(p.url)+'">'+h(p.title)+'</a> ('+p.year+')</li>';}).join('')+'</ul>'+(t.project?'<a class="text-link" href="'+h(link('','research/'+t.project+'/'))+'">Explore the prioritization project →</a>':'')+'</div></details>').join(''),
  PUBLICATIONS:home.publicationIds.map(id=>publication(pubById(id),'')).join(''),SELECTED_BIB:h(link('','citations/selected-publications.bib')),
  PEOPLE_HEADING:h(home.people.heading),PEOPLE_TEXT:h(home.people.text),
  LEAD:'<article class="lead-card"><div class="initials" aria-hidden="true">MB</div><h3>'+h(lead.name)+'</h3><p class="lead-role">Research lead</p><p>'+h(lead.interest)+'<br>'+h(site.institute)+'</p><a class="text-link" href="'+h(lead.profile)+'">Profile on ORCID ↗</a></article>',
  PEOPLE:home.contributorIds.map(id=>personCard(id,'')).join(''),JOIN:join(),FLIGHT_VIDEO:video(home.hero.filmId,'','Real field tests of the trimodal UAV')
});
fs.writeFileSync(path.join(output,'index.html'),page('',site.name+' | ISR-Lisboa',home.description,homeBody));
const routes=[''];
for(const filename of fs.readdirSync(path.join(root,'content/projects')).filter(f=>f.endsWith('.json')).sort()){
  const p=read('content/projects/'+filename);
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug))throw Error('Invalid project slug');
  const route='research/'+p.slug+'/';
  const paper=pubById(p.publicationId);
  const sim=p.results.filter(r=>r.evaluation==='simulation');
  const hardware=p.results.find(r=>r.evaluation==='outdoor hardware');
  const ablation=sim.find(r=>r.presentation==='wide');
  const body=template('project',{
    PROJECT_KICKER:h(p.theme+' · '+(p.publicationLabel||paper.venue+' '+paper.year)),
EXPERIMENT_HEADING:h(p.experimentHeading||p.title),EXPERIMENT_LABEL:h(p.experimentLabel||mediaById(p.mainMediaId).experimentType),
EVIDENCE_HEADING:(p.evidenceHeading||['Results']).map(h).join('<br>'),EVIDENCE_INTRODUCTION:h(p.evidenceIntroduction||''),
PUBLICATION_KIND:paper.entry_type==='article'?'PUBLISHED JOURNAL ARTICLE':'PUBLISHED CONFERENCE PAPER',
SUPPLEMENTARY_RESOURCE:p.supplementaryVideo?'<a href="'+h(p.supplementaryVideo)+'">Published supplementary video <span aria-hidden="true">↗</span></a>':'',
CODE_RESOURCE:p.codeUrl?'<a href="'+h(p.codeUrl)+'">Project code <span aria-hidden="true">↗</span></a>':'',
SIMULATION_SECTION:sim.length?'<section class="simulation-results" aria-labelledby="simulation-title"><div class="result-heading"><h3 id="simulation-title">Simulation</h3><span class="evidence-label">COMPARATIVE EVALUATION</span></div><p class="result-context">'+h(p.simulationContext||'')+'</p><div class="metric-grid">'+sim.filter(r=>r.presentation!=='wide').map(r=>'<article class="metric"><span class="metric-value">'+h(r.display)+'</span><h4>'+h(r.label)+'</h4><p>'+h(r.method)+'</p><p class="baseline">Baseline: '+h(r.baseline)+'</p></article>').join('')+'</div>'+(ablation?'<div class="ablation"><strong>'+h(ablation.display)+'</strong><div><h4>'+h(ablation.label)+'</h4><p>'+h(ablation.teamSize)+' UAVs · '+h(ablation.environment)+'. '+h(ablation.method)+' compared with '+h(ablation.baseline)+'.</p></div></div>':'')+'</section>':'',
HARDWARE_SECTION:hardware?'<section class="hardware-results" aria-labelledby="hardware-title"><div class="result-heading"><h3 id="hardware-title">Outdoor hardware</h3><span class="evidence-label">FEASIBILITY TRIALS</span></div><p>'+h(p.hardwareContext||hardware.qualification)+'</p><div class="trial-grid">'+hardware.value.map((seconds,i)=>'<div class="trial"><span>TRIAL '+(i+1)+'</span><p>'+h(seconds)+'<small>'+h(hardware.units==='seconds'?'s':hardware.units)+'</small></p></div>').join('')+'</div><p class="evidence-note">'+h(p.hardwareNote||hardware.qualification)+'</p></section>':'',
HOME:h(link(route,'')),RESEARCH:h(link(route,'')+'#research'),THEME:h(p.theme),PROJECT_TITLE:h(p.title),INTRODUCTION:h(p.introduction),
    AUTHOR_LINKS:p.authorIds.map(id=>'<a href="#author-'+h(id)+'">'+h(personById(id).name)+'</a>').join(''),
    PAPER_URL:h(paper.url),BIB_URL:h(link(route,'citations/'+paper.id+'.bib')),MAIN_VIDEO:video(p.mainMediaId,route,p.title+' experiment and simulation comparison'),
    VIDEO_DESCRIPTION:h(p.videoDescription),PROBLEM_HEADING:h(p.problem.heading),PROBLEM_COPY:paragraphs(p.problem.paragraphs),
    METHOD_HEADING:h(p.method.heading),METHOD_COPY:paragraphs(p.method.paragraphs),
    METHOD_STEPS:p.method.steps.map(step=>'<li><h3>'+h(step.title)+'</h3><p>'+h(step.text)+'</p></li>').join(''),
    METHOD_MEDIA:p.method.mediaIds.map(id=>{const m=mediaById(id);return '<figure><p class="eyebrow">EXPLANATORY ANIMATION</p>'+video(id,route,m.title)+'<figcaption>'+h(m.caption)+' These animations explain the method rather than showing experimental trajectories.</figcaption></figure>';}).join(''),
    SIMULATION_METRICS:sim.filter(r=>r.id!=='ablation').map(r=>'<article class="metric"><span class="metric-value">'+h(r.display)+'</span><h4>'+h(r.label)+'</h4><p>'+h(r.method)+'</p><p class="baseline">Baseline: '+h(r.baseline)+'</p></article>').join(''),
    ABLATION:ablation?'<strong>'+h(ablation.display)+'</strong><div><h4>'+h(ablation.label)+'</h4><p>Two-UAV simulation · '+h(ablation.method)+' compared with '+h(ablation.baseline)+', across tested court and forest scenarios.</p></div>':'',
    HARDWARE_TRIALS:hardware?hardware.value.map((seconds,i)=>'<div class="trial"><span>TRIAL '+(i+1)+'</span><p>'+seconds+'<small>s</small></p></div>').join(''):'',
    AUTHORS:p.authorIds.map(id=>personCard(id,route,true)).join(''),
    PAPER_TITLE:h(paper.title),PAPER_AUTHORS:h(paper.authors.join(', ')),PAPER_VENUE:venue(paper),PAPER_DOI:h(paper.doi),SUPPLEMENTARY_VIDEO:h(p.supplementaryVideo),
    BIBTEX:h(fs.readFileSync(path.join(root,'public/citations',paper.id+'.bib'),'utf8').trim()),
    RELATED:p.related.map(r=>{const publication=pubById(r.publicationId);return '<article class="related-card">'+image(r.mediaId,route)+'<p class="eyebrow">'+h(r.label)+'</p><h3>'+h(r.title)+'</h3><p>'+h(r.summary)+'</p><a class="text-link" href="'+h(publication.url)+'">Read the '+publication.year+' paper ↗</a></article>';}).join(''),
    JOIN:join()
  });
  const schema={'@context':'https://schema.org','@type':'ScholarlyArticle',headline:paper.title,author:paper.authors.map(name=>({'@type':'Person',name})),datePublished:String(paper.year),identifier:paper.doi,url:paper.url,isPartOf:{'@type':'Periodical',name:paper.venue},about:p.title};
  fs.mkdirSync(path.join(output,route),{recursive:true});
  fs.writeFileSync(path.join(output,route,'index.html'),page(route,p.title+' | Aerial Robotics',p.description,body,{article:true,mediaId:p.mainMediaId,schema}));
  routes.push(route);
}
const notFound='<section class="not-found wrap"><p class="eyebrow">404 / PAGE NOT FOUND</p><h1>Let’s find your next direction.</h1><p>This address does not match a page. Explore our research or get in touch with the group.</p><a class="button" href="'+h(base+'/')+'">Return to the homepage <span aria-hidden="true">→</span></a></section>';
let errorPage=page('404.html','Page not found | Aerial Robotics','Return to the Aerial Robotics and Multi Drone Systems research website.',notFound,{noindex:true});
/* A 404 can be returned at any unknown depth, so use configured root paths. */
errorPage=errorPage.replaceAll('href="assets/','href="'+base+'/assets/').replaceAll('src="assets/','src="'+base+'/assets/').replaceAll('href="favicon.svg"','href="'+base+'/favicon.svg"').replaceAll('href="./','href="'+base+'/');
fs.writeFileSync(path.join(output,'404.html'),errorPage);
fs.writeFileSync(path.join(output,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+routes.map(route=>'<url><loc>'+h(absolute(route))+'</loc></url>').join('')+'</urlset>\n');
fs.writeFileSync(path.join(output,'robots.txt'),'User-agent: *\n'+(site.indexable?'Allow: '+(base||'/')+'\nSitemap: '+absolute('sitemap.xml'):'Disallow: /')+'\n');
console.log('Built '+routes.length+' pages + 404 into '+output);
console.log('Configured publication URL: '+origin+base+'/');
