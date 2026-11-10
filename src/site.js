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
/* Direct file previews use index.html; published pages keep directory URLs. */
if(location.protocol==='file:')document.querySelectorAll('a[href]').forEach(link=>{
  const raw=link.getAttribute('href');
  if(!raw||raw.startsWith('#')||/^(https?:|mailto:|tel:)/i.test(raw))return;
  const target=new URL(raw,location.href);
  if(target.protocol==='file:'&&target.pathname.endsWith('/')){target.pathname+='index.html';link.href=target.href;}
});
