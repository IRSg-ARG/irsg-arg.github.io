'use strict';
document.documentElement.classList.add('js');
const toggle=document.querySelector('.menu-toggle');
const navigation=document.querySelector('.site-nav');
if(toggle&&navigation){
  const closeMenu=()=>{navigation.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');};
  toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));navigation.classList.toggle('is-open',open);});
  navigation.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){closeMenu();toggle.focus();}});
  matchMedia('(min-width:641px)').addEventListener('change',closeMenu);
}
document.querySelectorAll('[data-open-dialog]').forEach(link=>link.addEventListener('click',event=>{
  const dialog=document.getElementById(link.dataset.openDialog);
  if(!dialog||typeof dialog.showModal!=='function')return;
  event.preventDefault();dialog.showModal();
  dialog.querySelector('video')?.focus();
}));
document.querySelectorAll('dialog').forEach(dialog=>{
  dialog.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>dialog.close()));
  dialog.addEventListener('close',()=>dialog.querySelectorAll('video').forEach(video=>video.pause()));
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const r=dialog.getBoundingClientRect();
    if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
  });
});
document.querySelectorAll('video').forEach(video=>video.addEventListener('play',()=>document.querySelectorAll('video').forEach(other=>{if(other!==video)other.pause();})));
document.querySelectorAll('[data-copy-target]').forEach(button=>button.addEventListener('click',async()=>{
  const source=document.getElementById(button.dataset.copyTarget),status=button.parentElement.querySelector('[role="status"]');
  if(!source)return;
  try{
    if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');
    await navigator.clipboard.writeText(source.textContent);
    if(status)status.textContent='Citation copied.';
  }catch{
    const selection=window.getSelection(),range=document.createRange();
    range.selectNodeContents(source);selection.removeAllRanges();selection.addRange(range);source.focus();
    if(status)status.textContent='Citation selected. Use your copy shortcut or download the BibTeX file.';
  }
}));
/* Directory content remains visible without JavaScript. Search is an enhancement. */
document.querySelectorAll('[data-directory]').forEach(directory=>{
  const search=directory.querySelector('[data-search]');
  const filters=[...directory.querySelectorAll('[data-filter]')];
  const items=[...directory.querySelectorAll('[data-directory-item]')];
  const normalize=value=>String(value).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
  const resultUnit=directory.dataset.resultUnit||(items.some(item=>item.classList.contains('publication'))?'publication':'supervision record');
  const update=()=>{
    const terms=normalize(search?.value||'').trim().split(/\s+/).filter(Boolean);
    let visible=0;
    items.forEach(item=>{
      const matches=terms.every(term=>normalize(item.dataset.searchText).includes(term))&&filters.every(filter=>!filter.value||item.dataset[filter.dataset.filter]===filter.value);
      item.hidden=!matches;if(matches)visible++;
    });
    directory.querySelectorAll('[data-directory-section]').forEach(section=>{section.hidden=![...section.querySelectorAll('[data-directory-item]')].some(item=>!item.hidden);});
    const count=directory.querySelector('[data-result-count]');
    if(count)count.textContent=visible+(visible===items.length?'':' of '+items.length)+' '+resultUnit+(items.length===1?'':'s');
    const empty=directory.querySelector('[data-empty]');if(empty)empty.hidden=visible>0;
    directory.querySelectorAll('.year-jump a').forEach(anchor=>{const section=document.getElementById(anchor.hash.slice(1));anchor.hidden=!!section?.hidden;});
  };
  directory.querySelectorAll('[data-enhanced-controls]').forEach(control=>{control.hidden=false;});
  search?.addEventListener('input',update);filters.forEach(filter=>filter.addEventListener('change',update));update();
});
/* Direct file previews use index.html; published pages keep directory URLs. */
if(location.protocol==='file:')document.querySelectorAll('a[href]').forEach(link=>{
  const raw=link.getAttribute('href');
  if(!raw||raw.startsWith('#')||/^(https?:|mailto:|tel:)/i.test(raw))return;
  const target=new URL(raw,location.href);
  if(target.protocol==='file:'&&target.pathname.endsWith('/')){target.pathname+='index.html';link.href=target.href;}
});
