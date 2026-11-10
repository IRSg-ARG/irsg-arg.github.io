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
const students=read('content/students.json');
const research=read('content/research.json');
const projects=fs.readdirSync(path.join(root,'content/projects')).filter(f=>f.endsWith('.json')).sort().map(filename=>read('content/projects/'+filename));
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
  if(from==='404.html')return base+'/'+target.replace(/^\/+/, '');
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
  const asset=options.poster||m.type==='video'?m.poster:m.path;
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
function header(route){return '<header class="site-header"><div class="wrap header-inner">'+brand(route)+'<button type="button" class="menu-toggle" aria-expanded="false" aria-controls="primary-navigation">Menu <span aria-hidden="true">☰</span></button><nav id="primary-navigation" class="site-nav" aria-label="Primary">'+site.nav.map(n=>'<a href="'+h(n.href?link(route,n.href):route?link(route,'')+'#'+n.anchor:'#'+n.anchor)+'"'+(n.href===route?' aria-current="page"':'')+'>'+h(n.label)+'</a>').join('')+'<a class="nav-join" href="'+h(route?link(route,'')+'#join':'#join')+'">Work with us <span aria-hidden="true">↗</span></a></nav></div></header>';}
function footer(route){
  return '<footer id="contact" class="site-footer"><div class="wrap"><div class="footer-main"><div class="footer-identity">'+brand(route)+'<p>'+h(site.fullName)+'<br>'+h(site.institution)+' · '+h(site.university)+'</p></div><div class="footer-contact"><a href="mailto:'+h(site.email)+'">'+h(site.email)+'</a><p>'+h(site.contact.address)+'</p></div></div><div class="footer-bottom"><details class="media-credit"><summary>Research media & credits</summary><p>Research photographs, portraits and silent review videos supplied by Meysam Basiri. The homepage photograph shows the group’s custom UAV with onboard 3D LiDAR, used in exploration and perception research with John Lewis Devassy, Nivand Khosravi and Niusha Khosravi. It is a platform photograph, not evidence of a specific paper’s results. Trimodal field footage is credited to Afonso Vale, Meysam Basiri and Frederico Afonso (IROS 2025). Simulation, hardware and explanatory animations are labelled in context. Other portraits follow the supplied acknowledgment mapping.</p></details><div class="footer-links"><a href="'+h(link(route,'students/'))+'">Students & alumni</a><a href="'+h(link(route,'publications/'))+'">Publications</a><a href="'+h(site.github)+'">GitHub ↗</a><a href="'+h(site.contact.orcid)+'">Meysam Basiri · ORCID ↗</a></div></div></div></footer>';
}
function join(){return '<section id="join" class="join-section" aria-labelledby="join-title"><div class="wrap join-inner"><div><p class="eyebrow">STUDENTS & COLLABORATORS</p><h2 id="join-title">'+h(home.join.heading)+'</h2></div><div><p>'+h(home.join.text)+'</p><a class="button" href="mailto:'+h(site.email)+'">'+h(site.email)+' <span aria-hidden="true">↗</span></a></div></div></section>';}
function venue(p){
  return h(p.venue)+(p.volume?' '+h(p.volume):'')+(p.number?'('+h(p.number)+')':'')+(p.pages?', '+h(p.pages.replaceAll('--','–')):'')+' · '+h(p.year);
}
function publication(p,route,directory=false){
  const searchable=[p.title,...p.authors,p.venue,p.theme,p.doi,p.year].filter(Boolean).join(' ');
  const badge=p.status==='accepted'?'Accepted':p.status==='preprint'?'Preprint':p.citationComplete===false?'Archive record':p.kind;
  const authorLine=p.citationComplete===false?'See the source archive for bibliographic details.':p.authors.join(', ');
  return '<article class="publication"'+(directory?' data-directory-item data-kind="'+h(p.kind)+'" data-search-text="'+h(searchable)+'"':'')+'><span class="publication-year">'+p.year+'</span><div>'+(directory?'<p class="publication-kind">'+h(badge)+'</p>':'')+'<h3><a href="'+h(p.url)+'">'+h(p.title)+'</a></h3><p class="publication-authors">'+h(authorLine)+'</p><p class="publication-venue">'+venue(p)+'</p></div><div class="publication-links"><a href="'+h(p.url)+'" aria-label="Publication record: '+h(p.title)+'">'+(p.citationComplete===false?'Record':p.status==='preprint'||p.url===p.preprint?'Preprint':'Paper')+' ↗</a>'+(p.citationComplete!==false?'<a href="'+h(link(route,'citations/'+p.id+'.bib'))+'" download aria-label="Download BibTeX for '+h(p.title)+'">BibTeX ↓</a>':'')+(p.preprint&&p.url!==p.preprint?'<a href="'+h(p.preprint)+'">Preprint ↗</a>':'')+'</div></article>';
}
function personCard(id,route,author=false){
  const p=personById(id);
  const collaborator=p.displayContext.toLowerCase().endsWith('collaborator');
  const portrait=p.portrait?image(p.portrait,route,{alt:'Portrait of '+p.name}):'<div class="initials" aria-hidden="true">'+h(p.initials||p.name.split(' ').map(s=>s[0]).slice(0,2).join(''))+'</div>';
  return '<article class="'+(author?'author-card':'person-card'+(collaborator?' is-collaborator':''))+'"'+(author?' id="author-'+h(p.id)+'"':'')+'>'+portrait+'<div>'+(collaborator&&!author?'<p class="collaborator-label">'+h(p.displayContext.toUpperCase())+'</p>':'')+'<h3>'+h(p.name)+'</h3><p>'+h(author?'Publication author':p.appointment||p.interest)+'</p></div></article>';
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
const projectBySlug=slug=>{const p=projects.find(p=>p.slug===slug);if(!p)throw Error('Unknown project '+slug);return p;};
const themeFor=p=>research.themes.find(t=>t.id===p.themeId);
const primaryMedia=p=>p.primaryMediaId||p.mainMediaId||null;
function projectCard(p,route,directory=false){
  const target=link(route,'research/'+p.slug+'/'),cover=primaryMedia(p),theme=themeFor(p),ongoing=p.status==='Research in progress';
  const searchText=[p.title,p.description,p.introduction,p.theme,...(p.people||p.authorIds?.map(id=>personById(id).name)||[]),...(p.publicationIds||[p.publicationId]).filter(Boolean).map(id=>pubById(id).title)].join(' ');
  const visual=cover?image(cover,route):'<div class="project-card-graphic" aria-hidden="true"><span>'+h(p.slug==='moving-platform-landing'?'VISION + MOTION':'UAV + UGV')+'</span><svg viewBox="0 0 180 90"><path d="M15 65H165M35 65V30H75V65M105 65V45H145V65M55 30L115 20M115 20L145 45"/><circle cx="55" cy="25" r="8"/><circle cx="115" cy="20" r="8"/></svg></div>';
  return '<article class="project-card"'+(directory?' data-directory-item data-theme="'+h(p.themeId)+'" data-status="'+(ongoing?'ongoing':'published')+'" data-search-text="'+h(searchText)+'"':'')+'><a class="project-card-visual" href="'+h(target)+'" aria-label="Explore '+h(p.title)+'">'+visual+'</a><div class="project-card-copy"><p class="project-card-meta">'+h(theme?.title||p.theme)+'<span class="project-state'+(ongoing?' is-ongoing':'')+'">'+h(ongoing?'In progress':'Published research')+'</span></p><h3><a href="'+h(target)+'">'+h(p.title)+'</a></h3><p>'+h(p.description||p.introduction)+'</p></div></article>';
}
function projectContributor(name,route,index){
  const normalize=s=>s.toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/[^a-z0-9]/g,'');
  const person=people.find(p=>normalize(p.name)===normalize(name));
  const student=students.records.find(p=>normalize(p.name)===normalize(name));
  const portrait=person?.portrait||student?.portrait||media.find(m=>m.experimentType==='portrait'&&normalize(m.title)===normalize(name))?.id;
  const visual=portrait?image(portrait,route,{alt:'Portrait of '+name}):'<div class="initials" aria-hidden="true">'+h(name.split(' ').map(s=>s[0]).slice(0,2).join(''))+'</div>';
  return '<article class="author-card" id="researcher-'+index+'">'+visual+'<div><h3>'+h(name)+'</h3><p>'+h(person?.appointment||'Project contributor')+'</p></div></article>';
}
function projectFigure(item,route,id,primary=false){
  const m=mediaById(item.id),body=m.type==='video'?video(m.id,route,m.title,id):image(m.id,route,{eager:primary});
  return '<figure class="project-media-item'+(primary?' is-primary':'')+'"><p class="eyebrow">'+h(item.label)+'</p><div class="project-media-frame">'+body+'</div><figcaption id="'+id+'">'+h(item.caption)+'</figcaption><details class="visual-description"><summary>Visual description</summary><p>'+h(item.description)+'</p>'+(m.audio&&m.audio.includes('retained')?'<p>This recording retains its source audio. Playback and volume are controlled by the visitor.</p>':'')+'</details></figure>';
}
function catalogueProject(p,route){
  const theme=themeFor(p),primary=p.media.find(m=>m.id===p.primaryMediaId),other=p.media.filter(m=>m.id!==p.primaryMediaId);
  const paper=p.publicationIds.length?pubById(p.publicationIds[0]):null;
  const publicationSection=paper?'<section id="publications" class="wrap section-space project-publications" aria-labelledby="project-papers-title"><p class="eyebrow">PUBLICATIONS & RESOURCES</p><h2 id="project-papers-title">Read the work.</h2><div class="publication-list">'+p.publicationIds.map(id=>publication(pubById(id),route)).join('')+'</div></section>':'<section class="wrap section-space project-publications" aria-labelledby="project-contact-title"><p class="eyebrow">RESEARCH IN PROGRESS</p><h2 id="project-contact-title">Discuss this research.</h2><p>This ongoing project forms part of our aerial robotics programme. Get in touch to discuss its research questions or potential collaboration.</p><a class="text-link" href="mailto:'+h(site.email)+'">Contact Meysam Basiri ↗</a></section>';
  return template('project-detail',{
    HOME:h(link(route,'')),RESEARCH:h(link(route,'research/')),THEME_LINK:h(link(route,'research/#theme-'+p.themeId)),THEME:h(theme?.title||p.theme),STATUS:h(p.status),TITLE:h(p.title),INTRODUCTION:h(p.introduction),
    PEOPLE_LINKS:p.people.map((name,i)=>'<a href="#researcher-'+i+'">'+h(name)+'</a>').join(''),
    PRIMARY_ACTION:paper?'<a class="button" href="'+h(paper.url)+'">Read the '+(p.publicationIds.length>1?'primary ':'')+'paper <span aria-hidden="true">↗</span></a>':'<a class="button" href="mailto:'+h(site.email)+'">Discuss the project <span aria-hidden="true">↗</span></a>',
    MEDIA_NAV:primary?'<a href="#media">Research media</a>':'',PUBLICATION_NAV:paper?'<a href="#publications">Publications</a>':'',
    PRIMARY_MEDIA:primary?'<section id="media" class="project-experiment wrap" aria-labelledby="project-media-title"><div class="media-heading"><h2 id="project-media-title">'+h(mediaById(primary.id).type==='video'?'See the work in motion.':'A closer look.')+'</h2></div>'+projectFigure(primary,route,'primary-media-caption',true)+'</section>':'',
    PROBLEM_HEADING:h(p.problem.heading),PROBLEM_COPY:paragraphs(p.problem.paragraphs),METHOD_HEADING:h(p.approach.heading),METHOD_COPY:paragraphs(p.approach.paragraphs),
    METHOD_STEPS:p.approach.steps?.length?'<ol class="method-flow" aria-label="Research approach">'+p.approach.steps.map(s=>'<li><h3>'+h(s.title)+'</h3><p>'+h(s.text)+'</p></li>').join('')+'</ol>':'',
    EVIDENCE:p.evidence.map(e=>'<article class="evidence-card evidence-'+h(e.kind)+'"><p class="eyebrow">'+h({hardware:'Hardware',simulation:'Simulation',benchmark:'Benchmark',concept:'Concept',context:'Research context'}[e.kind])+'</p><h3>'+h(e.label)+'</h3><p>'+h(e.text)+'</p></article>').join(''),
    ADDITIONAL_MEDIA:other.length?'<div class="project-media-gallery">'+other.map((m,i)=>projectFigure(m,route,'additional-media-caption-'+i)).join('')+'</div>':'',
    PEOPLE:p.people.map((name,i)=>projectContributor(name,route,i)).join(''),PUBLICATIONS:publicationSection,
    RELATED:p.relatedSlugs.map(slug=>projectCard(projectBySlug(slug),route)).join(''),JOIN:join()
  });
}
const homeBody=template('home',{
  HERO_EYEBROW:h(home.hero.eyebrow),HERO_TITLE:home.hero.lines.map(line=>'<span>'+h(line)+'</span>').join(''),
  HERO_SUMMARY:h(home.hero.summary),HERO_IMAGE:image(home.hero.mediaId,'',{eager:true}),
  INSTITUTION_LOGO:image('s11-image87','',{alt:'Técnico Lisboa'}),INTRO_HEADING:h(home.introduction.heading),INTRO_TEXT:h(home.introduction.text),
  FEATURED_EYEBROW:h(home.featured.eyebrow),FEATURED_HEADING:h(home.featured.heading),FEATURED_SUMMARY:h(home.featured.summary),
  PROJECT_LINK:h(link('',projectRoute)),FEATURED_VIDEO:video(home.featured.mediaId,'','Outdoor court exploration followed by a simulation comparison'),
  THEMES:home.themes.map((t,i)=>'<details class="theme-item" id="theme-'+h(t.id)+'"><summary><span class="theme-number">'+String(i+1).padStart(2,'0')+'</span><span><span class="theme-title">'+h(t.title)+'</span><span class="theme-summary">'+h(t.summary)+'</span></span><span class="theme-toggle" aria-hidden="true">+</span></summary><div class="theme-body"><p>'+h(t.example)+'</p><ul>'+t.projectSlugs.map(slug=>'<li><a href="'+h(link('','research/'+slug+'/'))+'">'+h(projectBySlug(slug).title)+'</a></li>').join('')+'</ul>'+(t.id==='multimodal'?'<a class="text-link" href="'+h(link('',mediaById(home.fieldFilmId).path))+'" data-open-dialog="flight-film">Watch trimodal field tests ↗</a>':'')+'</div></details>').join(''),
  PUBLICATIONS:home.publicationIds.map(id=>publication(pubById(id),'')).join(''),SELECTED_BIB:h(link('','citations/selected-publications.bib')),
  PEOPLE_HEADING:h(home.people.heading),PEOPLE_TEXT:h(home.people.text),STUDENTS_LINK:h(link('','students/')),PUBLICATIONS_LINK:h(link('','publications/')),RESEARCH_LINK:h(link('','research/')),
  LEAD:'<article class="lead-card">'+image(lead.portrait,'',{alt:'Portrait of Meysam Basiri'})+'<h3>'+h(lead.name)+'</h3><p class="lead-role">Research lead</p><p>'+h(lead.interest)+'<br>'+h(site.institute)+'</p><a class="text-link" href="'+h(lead.profile)+'">Profile on ORCID ↗</a><a class="text-link" href="'+h(link('','students/'))+'">Students & alumni →</a></article>',
  PEOPLE:home.contributorIds.filter(id=>!personById(id).displayContext.toLowerCase().endsWith('collaborator')).map(id=>personCard(id,'')).join(''),
  COLLABORATORS:home.contributorIds.filter(id=>personById(id).displayContext.toLowerCase().endsWith('collaborator')).map(id=>personCard(id,'')).join(''),JOIN:join(),FLIGHT_VIDEO:video(home.fieldFilmId,'','Real field tests of the trimodal UAV')
});
fs.writeFileSync(path.join(output,'index.html'),page('',site.name+' | ISR-Lisboa',home.description,homeBody));
const routes=[''];
for(const p of projects){
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug))throw Error('Invalid project slug');
  const route='research/'+p.slug+'/';
  if(p.type==='catalogue'){
    const body=catalogueProject(p,route),schema={'@context':'https://schema.org','@type':'TechArticle',headline:p.title,author:p.people.map(name=>({'@type':'Person',name})),citation:p.publicationIds.map(id=>pubById(id).url),about:p.theme};
    fs.mkdirSync(path.join(output,route),{recursive:true});fs.writeFileSync(path.join(output,route,'index.html'),page(route,p.title+' | Aerial Robotics',p.description,body,{article:true,mediaId:p.primaryMediaId||undefined,schema}));routes.push(route);continue;
  }
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
    HOME:h(link(route,'')),RESEARCH:h(link(route,'research/')),THEME:h(p.theme),PROJECT_TITLE:h(p.title),INTRODUCTION:h(p.introduction),
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
    RELATED:p.related.map(r=>{const publication=pubById(r.publicationId);return '<article class="related-card">'+image(r.mediaId,route)+'<p class="eyebrow">'+h(r.label)+'</p><h3>'+h(r.title)+'</h3><p>'+h(r.summary)+'</p><a class="text-link" href="'+h(r.projectSlug?link(route,'research/'+r.projectSlug+'/'):publication.url)+'">'+(r.projectSlug?'Explore the project':'Read the '+publication.year+' paper')+' ↗</a></article>';}).join(''),
    JOIN:join()
  });
  const schema={'@context':'https://schema.org','@type':'ScholarlyArticle',headline:paper.title,author:paper.authors.map(name=>({'@type':'Person',name})),datePublished:String(paper.year),identifier:paper.doi,url:paper.url,isPartOf:{'@type':'Periodical',name:paper.venue},about:p.title};
  fs.mkdirSync(path.join(output,route),{recursive:true});
  fs.writeFileSync(path.join(output,route,'index.html'),page(route,p.title+' | Aerial Robotics',p.description,body,{article:true,mediaId:p.mainMediaId,schema}));
  routes.push(route);
}
function writeDirectory(route,title,description,body){
  fs.mkdirSync(path.join(output,route),{recursive:true});
  const schema={'@context':'https://schema.org','@type':'CollectionPage',name:title,url:absolute(route),isPartOf:{'@type':'WebSite',name:site.name,url:absolute('')}};
  fs.writeFileSync(path.join(output,route,'index.html'),page(route,title+' | Aerial Robotics',description,body,{schema}));
  routes.push(route);
}
const researchRoute='research/';
writeDirectory(researchRoute,'Research projects',research.description,template('research',{
  HOME:h(link(researchRoute,'')),TITLE:h(research.title),COUNT:String(projects.length),
  THEME_OPTIONS:research.themes.map(t=>'<option value="'+h(t.id)+'">'+h(t.title)+'</option>').join(''),
  PROJECT_GROUPS:research.themes.map(t=>'<section class="research-theme-group" id="theme-'+h(t.id)+'" data-directory-section><div class="research-theme-heading"><h2>'+h(t.title)+'</h2><p>'+h(t.summary)+'</p></div><div class="project-card-grid">'+projects.filter(p=>p.themeId===t.id).map(p=>projectCard(p,researchRoute,true)).join('')+'</div></section>').join(''),JOIN:join()
}));
const publicationRoute='publications/';
const years=[...new Set(publications.map(p=>p.year))].sort((a,b)=>b-a);
const kinds=['Journal article','Conference paper','Book chapter','Report & rulebook','Preprint','Thesis','Poster'];
writeDirectory(publicationRoute,'Publications','Publications by Meysam Basiri and collaborators: journal articles, conference papers, book chapters and other research outputs.',template('publications',{
  HOME:h(link(publicationRoute,'')),BIBLIOGRAPHY:h(link(publicationRoute,'citations/all-publications.bib')),PROFILE:'https://isr.tecnico.ulisboa.pt/author/meysam/',CV:h(students.source),COUNT:String(publications.length),YEAR_RANGE:Math.min(...years)+'–'+Math.max(...years),
  TYPE_OPTIONS:kinds.filter(k=>publications.some(p=>p.kind===k)).map(k=>'<option value="'+h(k)+'">'+h(k)+'</option>').join(''),
  YEARS:years.map(y=>'<a href="#year-'+y+'">'+y+'</a>').join(''),
  PUBLICATIONS:years.map(y=>'<section class="publication-year-group" id="year-'+y+'" data-directory-section><h3 class="year-heading">'+y+'</h3><div class="publication-list">'+publications.filter(p=>p.year===y).map(p=>publication(p,publicationRoute,true)).join('')+'</div></section>').join(''),JOIN:join()
}));
function studentCard(s,route){
  const portrait=s.portrait?image(s.portrait,route,{alt:'Portrait of '+s.name}):'<div class="initials" aria-hidden="true">'+h(s.name.split(' ').map(n=>n[0]).filter(Boolean).slice(0,2).join(''))+'</div>';
  const searchable=[s.name,s.fullName,s.topic,s.degree,s.programmeLabel,s.period,s.institution,s.completionNote].filter(Boolean).join(' ');
  const paper=s.publicationId?pubById(s.publicationId):null;
  const paperLabel=paper?(paper.venue.match(/\(([^)]+)\)/)?.[1]||'Publication')+' '+paper.year+' paper ↗':'';
  const related=paper?'<a class="text-link" href="'+h(paper.url)+'">'+h(paperLabel)+'</a>':'';
  return '<article class="student-card" data-directory-item data-status="'+h(s.status)+'" data-degree="'+h(s.degree)+'" data-search-text="'+h(searchable)+'"><div class="student-identity">'+portrait+'<div><p class="student-meta">'+h(s.programmeLabel||(s.degree==='Research project'?'Research project':s.degree==='Master'?'Master’s':s.degree==='Bachelor'?'Bachelor’s':'PhD'))+(s.period?' · '+h(s.period):'')+'</p><h4>'+h(s.name)+'</h4><p class="student-role">'+h(s.supervision)+'</p></div></div><p class="student-topic">'+h(s.topic)+'</p>'+(s.institution?'<p class="student-institution">'+h(s.institution)+'</p>':'')+(s.completionNote?'<p class="student-outcome">'+h(s.completionNote)+'</p>':'')+related+'</article>';
}
const studentRoute='students/';
const studentGroups=[
  {id:'current-students',heading:'Current students',intro:'Doctoral research and ongoing thesis projects.',records:students.records.filter(s=>s.status==='current'&&s.degree!=='Research project')},
  {id:'previous-students',heading:'Previous students & alumni',intro:'Earlier supervision and co-supervision, including researchers who continued into a new degree.',records:students.records.filter(s=>s.status==='previous'&&s.degree!=='Research project')},
  {id:'research-placements',heading:'Research placements & projects',intro:'Additional supervised research at Instituto Superior Técnico and EPFL.',records:students.records.filter(s=>s.degree==='Research project')}
];
writeDirectory(studentRoute,'Students & alumni','Current and previous PhD, Master’s and Bachelor’s students supervised or co-supervised by Meysam Basiri, with research placements and topics.',template('students',{
  HOME:h(link(studentRoute,'')),CV:h(students.source),LEAD_PORTRAIT:image(lead.portrait,studentRoute,{alt:'Portrait of Meysam Basiri'}),COUNT:String(students.records.length),
  STUDENTS:studentGroups.map(g=>'<section id="'+g.id+'" class="student-section" data-directory-section><div class="student-section-heading"><h2>'+h(g.heading)+'</h2><p>'+h(g.intro)+'</p></div>'+['PhD','Master','Bachelor','Research project'].filter(d=>g.records.some(s=>s.degree===d)).map(d=>'<div class="student-degree-group" data-directory-section><h3 class="student-degree-heading">'+h(d==='Master'?'Master’s students':d==='Bachelor'?'Bachelor’s projects':d==='PhD'?'Doctoral students':'Supervised research')+'</h3><div class="student-grid">'+g.records.filter(s=>s.degree===d).map(s=>studentCard(s,studentRoute)).join('')+'</div></div>').join('')+'</section>').join(''),JOIN:join()
}));
const notFound='<section class="not-found wrap"><p class="eyebrow">404 / PAGE NOT FOUND</p><h1>Let’s find your next direction.</h1><p>This address does not match a page. Explore our research or get in touch with the group.</p><a class="button" href="'+h(base+'/')+'">Return to the homepage <span aria-hidden="true">→</span></a></section>';
let errorPage=page('404.html','Page not found | Aerial Robotics','Return to the Aerial Robotics and Multi Drone Systems research website.',notFound,{noindex:true});
/* A 404 can be returned at any unknown depth, so use configured root paths. */
errorPage=errorPage.replaceAll('href="assets/','href="'+base+'/assets/').replaceAll('src="assets/','src="'+base+'/assets/').replaceAll('href="favicon.svg"','href="'+base+'/favicon.svg"').replaceAll('href="./','href="'+base+'/');
fs.writeFileSync(path.join(output,'404.html'),errorPage);
fs.writeFileSync(path.join(output,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+routes.map(route=>'<url><loc>'+h(absolute(route))+'</loc></url>').join('')+'</urlset>\n');
fs.writeFileSync(path.join(output,'robots.txt'),'User-agent: *\n'+(site.indexable?'Allow: '+(base||'/')+'\nSitemap: '+absolute('sitemap.xml'):'Disallow: /')+'\n');
console.log('Built '+routes.length+' pages + 404 into '+output);
console.log('Configured publication URL: '+origin+base+'/');
