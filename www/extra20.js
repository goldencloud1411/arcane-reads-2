/* Arcane Reads v2.9.12 — audiolibros en "Libros": % real, portada cuadrada de audiolibro y barra de progreso */
(function(){
const AUD=b=>b&&b.format==='Audiolibro';
const tot=b=>(+b.audioMins||0)+(+b.audioSecs||0)/60;
const heard=b=>(data.sessions||[]).filter(s=>s.bookId===b.id).reduce((a,s)=>a+(+(s.minutes||s.mins||s.duration||s.min)||0)+(+s.secs||0)/60,0);
const prog=b=>b.status==='Leído'?100:tot(b)?Math.min(100,Math.round(heard(b)/tot(b)*100)):null;
const st=document.createElement('style');
st.textContent='.hbook.au-sq .hcov{height:auto!important;aspect-ratio:1/1!important;border-radius:12px!important}.hbook.au-sq .hcov img{object-fit:cover!important}.book-card.au-sq .book-cover{aspect-ratio:1/1!important;max-height:none!important;border-radius:12px;overflow:hidden}.book-card.au-sq .book-cover img{object-fit:cover!important;width:100%;height:100%}.gg .hbook.au-sq .hcov{aspect-ratio:1/1!important}';
document.head.appendChild(st);
const idOf=el=>el.dataset.id||((el.getAttribute('onclick')||'').match(/\('([^']+)'\)/)||[])[1]||'';
function cover(el,b,sel){
  const c=el.querySelector(sel);if(!c)return;el.classList.add('au-sq');
  const src=(b.audio&&b.audio.cover)||b.cover||'';if(!src)return;
  let img=c.querySelector('img');
  if(img){if(img.getAttribute('src')!==src)img.setAttribute('src',src)}
  else{const ph=c.querySelector(':scope > div:not([class])');if(ph)ph.remove();c.insertAdjacentHTML('afterbegin',`<img src="${esc(src)}" alt="">`)}
}
function fix(root){
  (root||document).querySelectorAll('.hbook,.book-card').forEach(el=>{
    if(el.dataset.au20)return;const b=getBook(idOf(el));if(!AUD(b))return;el.dataset.au20='1';
    const card=el.classList.contains('book-card'),p=prog(b);
    cover(el,b,card?'.book-cover':'.hcov');
    if(p==null)return;
    if(card){
      const sm=el.querySelector('.small.muted');
      if(sm&&(b.status==='Leyendo'||p>0)&&b.status!=='Leído'){sm.textContent=`${b.status||'Leyendo'} · ${p}%`;
        let br=el.querySelector('.bar');if(br){const i=br.querySelector('i');if(i)i.style.width=p+'%'}else sm.insertAdjacentHTML('afterend',bar(p))}
    }else{
      const sp=[...el.querySelectorAll('span')].pop();if(!sp)return;const t=sp.textContent.trim();
      if(/^(En curso|\d+%)$/.test(t)||sp.querySelector('.bar'))sp.innerHTML=`${p}%`+bar(p);
      else if(/^Leyendo( · \d+%)?$/.test(t))sp.textContent=`Leyendo · ${p}%`;
    }
  });
}
const _r=render;render=function(){_r();fix()};
const dlg=$('dlg');if(dlg)new MutationObserver(()=>fix(dlg)).observe(dlg,{childList:true,subtree:true});
setTimeout(()=>fix(),0);
})();
