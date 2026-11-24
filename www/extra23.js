/* Arcane Reads v3.0 — Detalles del libro: diseño ordenado con datos de Hardcover y menú ⋯ (acciones manuales) */
(function(){
const hcOn=()=>!!(window.hcOn&&window.hcOn());
const num=n=>Number(n).toLocaleString('es');
const chips=(a,cls,max,key)=>{a=a||[];const sh=a.slice(0,max),rest=a.slice(max);
  return`<div class="dx-chips${cls?' '+cls:''}">${sh.map(t=>`<span class="dx-chip">${esc(t)}</span>`).join('')}${rest.length?`<span class="dx-more-chips" hidden>${rest.map(t=>`<span class="dx-chip">${esc(t)}</span>`).join('')}</span><button type="button" class="dx-chip dx-plus" onclick="this.previousElementSibling.hidden=false;this.remove()">+${rest.length} más</button>`:''}</div>`};
const row=(l,v)=>v?`<div class="dx-row"><span>${l}</span><b>${esc(String(v))}</b></div>`:'';
const edRow=e=>`<div class="dx-ed"><span class="dx-fmt">${esc(e.f||'Edición')}</span><div><b>${esc(e.u||'Editorial desconocida')}</b><small>${esc([e.y,e.l,e.p?e.p+' pág.':''].filter(Boolean).join(' · '))}</small></div>${e.i?`<code>${esc(e.i)}</code>`:''}</div>`;
const sec=(t,html,id)=>html?`<h3 class="dx-h"${id?` id="${id}"`:''}>${t}</h3>${html}`:'';

function draw(id,keepScroll){const b=getBook(id);if(!b)return;
  const h=b.hc||{},sh=document.querySelector('#dlg .sheet'),sc=keepScroll&&sh?sh.scrollTop:0;
  const ss=data.sessions.filter(s=>s.bookId===id),pg=ss.reduce((a,s)=>a+(+s.pages||0),0),mn=ss.reduce((a,s)=>a+(+s.minutes||0),0),first=ss.map(s=>s.date).sort()[0];
  const notes=(data.notes||[]).filter(n=>n.bookId===id),tg=tagsOf(b),cols=String(b.collection||'').split(',').map(s=>s.trim()).filter(Boolean);
  const rating=h.r||0,pub=b.publisher||h.pub||'',lang=b.language||h.lang||'';
  /* tira principal de 3 cifras */
  const big=(v,l)=>v?`<div class="dx-big"><b>${esc(String(v))}</b><span>${l}</span></div>`:'';
  const strip=[big(b.pages,'páginas'),big(pubTxt(b)||h.y,'publicado'),rating?`<div class="dx-big gold"><b>★ ${rating.toFixed(1)}</b><span>${h.rc?num(h.rc)+' valoraciones':'Hardcover'}</span></div>`:(b.grRating?`<div class="dx-big gold"><b>★ ${Number(b.grRating).toFixed(1)}</b><span>${b.grRatings?num(b.grRatings)+' valoraciones':'Goodreads'}</span></div>`:'')].join('');
  const ficha=[row('Serie',b.saga?b.saga+(b.sagaN?' · #'+b.sagaN:''):''),row('Editorial',pub),row('Idioma',lang),row('ISBN',b.isbn),row('ASIN',b.asin),row('Formato',b.format),row('Lectores',h.u?num(h.u)+(h.ur?' · '+num(h.ur)+' lo han leído':''):'')].join('');
  const eds=h.e&&h.e.length?`<details class="dx-det"><summary><b>Ediciones</b><span>${h.e.length}</span></summary><div class="dx-eds">${h.e.map(edRow).join('')}</div></details>`:'';
  const warn=h.w&&h.w.length?`<details class="dx-det warn"><summary><b>Advertencias de contenido</b><span>${h.w.length}</span></summary>${chips(h.w,'warn',99)}</details>`:'';
  const pend=hcOn()&&!h.x&&h.id&&b.format!=='Audiolibro';
  const chars=h.c&&h.c.length?chips(h.c,'char',12):'';
  const links=[h.slug?`<a href="https://hardcover.app/books/${esc(h.slug)}" target="_blank" rel="noopener">Hardcover ↗</a>`:'',b.goodreadsUrl?`<a href="${esc(b.goodreadsUrl)}" target="_blank" rel="noopener">Goodreads ↗</a>`:''].filter(Boolean).join('');
  const syn=b.description?`<div class="dx-syn"><p class="dtxt" style="white-space:pre-line">${esc(b.description)}</p></div><button class="link-btn" onclick="const p=this.previousElementSibling.querySelector('p');p.classList.toggle('open');this.previousElementSibling.classList.toggle('open');this.textContent=p.classList.contains('open')?'Leer menos':'Leer más'">Leer más</button>`:'<p class="muted" id="dwait">Buscando la sinopsis oficial…</p>';
  showSheet(`<div class="dt dx"><div class="dt-hero"><div class="dt-bg" style="${b.cover?`background-image:url(${b.cover})`:`background:${b.color||'#7b5472'}`}"></div>
   <button class="vx dt-x" onclick="closeSheet()" aria-label="Cerrar">×</button>
   <button class="vx dt-more" onclick="dtMenu('${id}',event)" aria-label="Más opciones"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg></button>
   <div class="dt-cov">${coverHtml(b)}</div><h2>${esc(b.title)}</h2>${h.sub?`<div class="dx-sub">${esc(h.sub)}</div>`:''}<div class="dt-au">${esc(b.author||'Sin autor')}</div>
   ${b.saga?`<button class="dx-saga" onclick="openGroup('saga',this.dataset.n)" data-n="${esc(b.saga)}">✦ ${esc(b.saga)}${b.sagaN?' · #'+esc(String(b.sagaN)):''}</button>`:''}
   <div class="dt-meta"><span class="dt-stars">${starsRO(b.rating)}</span><span class="stp">${esc(b.status||'Por leer')}</span>${b.format?`<span class="stp ghost">${esc(b.format)}</span>`:''}</div></div>
  <div class="dt-body" data-id="${id}">
   ${b.pages?`<div class="dt-card dx-prog"><div class="label-row"><b>Progreso</b><span class="muted small">Página ${b.current||0} de ${b.pages} · ${pct(b)}%</span></div>${bar(pct(b))}</div>`:''}
   ${strip?`<div class="dx-strip">${strip}</div>`:''}
   <h3 class="dx-h">Sinopsis</h3>${syn}
   ${tg.length||(h.m&&h.m.length)?`<div class="dx-card">${tg.length?`<div class="dx-lbl">Géneros</div><div class="dx-chips">${tg.map(t=>`<button class="dx-chip g" onclick="openGroup('categories',this.dataset.n)" data-n="${esc(t)}">${esc(t)}</button>`).join('')}</div>`:''}${h.m&&h.m.length?`<div class="dx-lbl">Ambiente</div>${chips(h.m,'mood',8)}`:''}</div>`:''}
   ${warn}
   ${chars?`<div class="dx-card"><div class="dx-lbl">Personajes</div>${chars}</div>`:''}
   ${ficha?`<div class="dx-card"><div class="dx-lbl">Ficha del libro</div>${ficha}</div>`:''}
   ${eds}
   ${pend?`<div class="dx-wait">Completando personajes y ediciones…</div>`:''}
   ${cols.length?`<div class="dx-card"><div class="dx-lbl">Colecciones</div><div class="dx-chips">${cols.map(t=>`<button class="dx-chip c" onclick="openGroup('collection',this.dataset.n)" data-n="${esc(t)}">${esc(t)}</button>`).join('')}</div></div>`:''}
   <div class="dx-card"><div class="dx-lbl">Mis etiquetas</div><div class="dx-chips">${(b.tags||[]).map(t=>`<button class="dx-chip u" onclick="openGroup('tags',this.dataset.n)" data-n="${esc(t)}">${esc(t)}</button>`).join('')}<button class="dx-chip dx-plus" onclick="addTagTo('${id}')">+ Etiqueta</button></div></div>
   ${ss.length?`<h3 class="dx-h">Tu lectura</h3><div class="dx-strip">${big(ss.length,'sesiones')}${big(pg,'págs. leídas')}${big(mn,'minutos')}</div>${first?`<div class="muted small" style="margin-top:-4px">Desde ${esc(first)}</div>`:''}`:''}
   ${b.notes?`<h3 class="dx-h">Mi reseña</h3><p class="dx-card" style="white-space:pre-line;margin:0">${esc(b.notes)}</p>`:''}
   ${notes.length?`<h3 class="dx-h">Notas y citas</h3>${notes.map(n=>`<div class="dt-note"><p class="hand">${esc(n.text)}</p><span class="muted small">${n.page?'pág. '+n.page+' · ':''}${n.date}</span></div>`).join('')}`:''}
   ${links?`<div class="dx-links">${links}</div>`:''}
  </div><div class="dt-bar"><button class="btn-soft" onclick="startSession('${id}')">${ic('hourglass')} Empezar sesión</button><button class="mini-btn" onclick="openBook('${id}')">${ic('mark')} Visor</button><button class="mini-btn" onclick="editBook('${id}')">${ic('quill')} Editar</button></div></div>`);
  $('dlg').classList.add('detfull');
  requestAnimationFrame(()=>{const p=document.querySelector('.dx-syn .dtxt');if(p&&p.scrollHeight<=p.clientHeight+2){const bt=p.parentElement.nextElementSibling;if(bt&&bt.classList.contains('link-btn'))bt.remove();p.parentElement.classList.add('open')}});
  if(keepScroll){const s2=document.querySelector('#dlg .sheet');if(s2)s2.scrollTop=sc}}

/* ── menú ⋯ (esquina superior derecha) ── */
window.dtMenu=(id,ev)=>{ev&&ev.stopPropagation();const old=document.getElementById('dtPop');if(old){old.remove();return}
  const b=getBook(id),h=(b&&b.hc)||{};const items=[
    ['↻',hcOn()?(h.x||h.id?'Volver a traer datos de Hardcover':'Traer datos de Hardcover'):'Conectar Hardcover',hcOn()?`hcData('${id}')`:`hcConfig()`],
    ['🔗','Vincular con enlace de Hardcover',`hcLink('${id}')`],
    ['🖼','Cambiar o buscar portada',`coverTools('${id}',true)`],
    ['✎','Editar libro',`editBook('${id}')`],
    ['☆','Datos de Goodreads (respaldo)',`grExtra('${id}')`]];
  const pop=document.createElement('div');pop.id='dtPop';pop.className='dt-pop';
  pop.innerHTML=items.map(([i,t,f])=>`<button type="button" onclick="document.getElementById('dtPop')?.remove();${f}"><i>${i}</i>${t}</button>`).join('');
  document.querySelector('#dlg .dt').appendChild(pop);
  setTimeout(()=>{const off=e=>{if(!pop.contains(e.target)){pop.remove();document.removeEventListener('click',off,true)}};document.addEventListener('click',off,true)},0)};

/* ── abrir detalle ── */
bookDetails=function(id){const b=getBook(id);if(!b)return;draw(id);
  const stillHere=()=>{const d=document.querySelector('#dlg .dt-body');return d&&d.dataset.id===id};
  const redraw=()=>{if(stillHere())draw(id,true)};
  if(hcOn()&&b.format!=='Audiolibro'){
    if(!b.hc&&window.hcEnrichBook&&!(b.hcMiss&&Date.now()-b.hcMiss<864e5)){window.hcEnrichBook(b).then(ok=>{if(ok)redraw();else if(!b.description&&typeof enrich==='function')enrich(b).then(redraw).catch(()=>{})}).catch(()=>{})}
    else if(b.hc&&!b.hc.x&&b.hc.id&&window.hcTopUp&&!(b.hcXTry&&Date.now()-b.hcXTry<36e5)){b.hcXTry=Date.now();window.hcTopUp(b).then(ok=>{if(ok)redraw();else{const w=document.querySelector('.dx-wait');if(w)w.remove()}})}
  }else if(!b.description&&typeof enrich==='function'){enrich(b).then(()=>{if(b.description&&$('dwait'))redraw();else if($('dwait'))$('dwait').textContent='No encontré sinopsis. Puedes escribirla en Editar.'})}
  if(hcOn()&&!b.description&&b.hc&&$('dwait')){setTimeout(()=>{if($('dwait'))$('dwait').textContent='No encontré sinopsis. Puedes escribirla en Editar.'},9000)}};
window.__dtRefresh=id=>{const d=document.querySelector('#dlg .dt-body');if(d&&d.dataset.id===id)draw(id,true)};

/* ══ Perfil limpio (reemplaza todas las capas anteriores): todo gira en torno a Hardcover ══ */
renderProfile=function(){
  const wrap=document.createElement('div');wrap.className='section-gap';
  const bks=(data.books||[]).filter(b=>b.format!=='Audiolibro'),on=hcOn();
  const pend=bks.filter(b=>window.__hcPending&&window.__hcPending(b)).length,noCov=bks.filter(b=>!b.cover).length;
  const lb=data.settings.lastBackup,days=lb?Math.floor((Date.now()-lb)/864e5):null;
  wrap.innerHTML=`
  <section><h2>Perfil</h2><div class="muted small">Tu rincón de lectura</div></section>
  <section class="card pf-hero"><img class="brand-badge" src="${LOGO_URI}" alt="" style="width:54px;height:54px"><div style="flex:1;min-width:0"><div class="field" style="margin:0"><label for="pName">Tu nombre</label><input id="pName" value="${esc(data.profile.name||'')}" onchange="data.profile.name=this.value.trim();save();rerender()"></div></div></section>
  <section class="card"><div class="label-row"><h3>Hardcover</h3><span class="pf-st ${on?'ok':''}">${on?'Conectado':'Sin conectar'}</span></div>
    <div class="muted small" style="margin:4px 0 12px">${on?'Portadas, sinopsis, géneros, personajes y ediciones se traen solos al agregar un libro.':'Pega tu clave de API para traer portadas y datos de tus libros automáticamente.'}</div>
    ${on?`<div class="pf-rows"><div class="dx-row"><span>Libros por completar</span><b>${pend}</b></div><div class="dx-row"><span>Libros sin portada</span><b>${noCov}</b></div></div>
    <div class="pf-btns"><button class="btn-soft" onclick="hcEnrichAll(true)" ${pend||noCov?'':'disabled'}>Completar ahora</button>${pend||noCov?`<button class="mini-btn" onclick="showPending()">Ver cuáles</button>`:''}</div>`:''}
    <div class="pf-btns" style="margin-top:${on?'8px':'0'}"><button class="${on?'mini-btn':'btn-soft'}" onclick="hcConfig()">${on?'Cambiar clave':'Conectar Hardcover'}</button></div></section>
  <section class="card"><h3>Lectura</h3><div class="field" style="margin-top:8px"><label for="pGoal">Meta de libros este año</label><input id="pGoal" type="number" min="1" inputmode="numeric" value="${data.goal}" onchange="data.goal=Math.max(1,Math.round(+this.value||1));save();rerender()"><label>Minutos de lectura al día</label><input type="number" min="5" max="600" inputmode="numeric" value="${data.settings.dailyMin||20}" onchange="data.settings.dailyMin=Math.max(5,+this.value||20);save();toast('Meta guardada')"></div></section>
  <section class="card"><h3>Apariencia</h3><div class="themes">${themePicker()}</div></section>
  <section class="card"><h3>Copia de seguridad</h3><div class="muted small" style="margin:6px 0 10px">${lb?'Última copia: '+(days?'hace '+days+' días':'hoy'):'Aún no has hecho ninguna copia.'}${days>=7?' · Te recomiendo hacer una nueva.':''}</div><div class="pf-btns"><button class="btn-soft" onclick="backup()">Exportar</button><button class="mini-btn" onclick="$('importer').click()">Importar</button></div><div class="muted small" style="margin-top:8px">Importar acepta tu copia (.json) o el CSV exportado de Goodreads.</div></section>
  <section class="card" id="installCard" hidden><h3>Instalar app</h3><div class="muted small" style="margin-bottom:10px">Ábrela desde tu pantalla de inicio, sin barra del navegador.</div><button class="btn-soft" onclick="installApp()">Instalar Arcane Reads</button></section>
  <div class="muted small" style="text-align:center;padding:10px">Arcane Reads · versión 3.0.4</div>`;
  applyTheme();return wrap};


/* ══ Lista de libros pendientes + vincular con enlace de Hardcover ══ */
window.showPending=()=>{const L=(data.books||[]).filter(b=>b.format!=='Audiolibro'&&((window.__hcPending&&window.__hcPending(b))||!b.cover)).sort((a,b)=>String(a.title).localeCompare(String(b.title)));
  const why=b=>!b.hc?'No lo encontré en Hardcover':(!b.cover?'Sin portada':'Faltan personajes y ediciones');
  showSheet(`<div class="sheet-header"><div><h2>Por completar</h2><div class="muted small">${L.length?L.length+' libro'+(L.length===1?'':'s'):'Todo completo ✦'}</div></div><button class="sheet-close" onclick="closeSheet()">×</button></div>
  <div class="ss-sec">${L.map(b=>`<div class="ss-row"><div><b>${esc(b.title)}</b><span>${esc(b.author||'')} · ${why(b)}</span></div><div style="display:flex;gap:6px;flex:none"><button class="mini-btn" type="button" onclick="closeSheet();hcData('${b.id}')">Reintentar</button><button class="mini-btn" type="button" onclick="hcLink('${b.id}')">Enlace</button></div></div>`).join('')}</div>
  ${L.length?'<div class="muted small" style="margin-top:10px">“Enlace”: abre el libro en hardcover.app, copia la dirección y pégala; se traen portada y datos al instante.</div>':''}`)};
window.hcLink=id=>{const b=getBook(id);if(!b)return;
  showSheet(`<div class="sheet-header"><div><h2>Vincular con Hardcover</h2><div class="muted small">${esc(b.title)}</div></div><button class="sheet-close" onclick="closeSheet()">×</button></div>
  <div class="field"><label for="hcLinkIn">Enlace del libro en Hardcover</label><input id="hcLinkIn" type="url" inputmode="url" autocomplete="off" placeholder="https://hardcover.app/books/…"></div>
  <button class="btn-soft" id="hcLinkGo" style="width:100%;margin-top:12px" onclick="hcLinkGo('${id}')">Vincular y traer datos</button>
  <div class="muted small" id="hcLinkMsg" style="margin-top:10px">Abre el libro en hardcover.app, copia la dirección de la página y pégala aquí.</div>`)};
window.hcLinkGo=async id=>{const i=$('hcLinkIn'),g=$('hcLinkGo'),m=$('hcLinkMsg');if(!i)return;g.disabled=true;m.textContent='Buscando en Hardcover…';
  let ok=false;try{ok=await hcLinkUrl(id,i.value.trim())}catch(e){}
  if(ok)closeSheet();else{g.disabled=false;m.textContent='No pude vincularlo. Revisa que sea un enlace de hardcover.app/books/… y tu conexión.'}};

/* ══ Editor: el botón de datos usa Hardcover primero (Goodreads queda de respaldo) y siempre responde ══ */
window.grSyncDraft=async function(){if(typeof draft==='undefined'||!draft)return;
  const say=t=>{const e=$('grSyncMsg');if(e)e.textContent=t},btn=()=>$('grSyncBtn'),race=(p,ms)=>Promise.race([p,new Promise((_,r)=>setTimeout(()=>r(new Error('tiempo')),ms))]);
  if(btn())btn().disabled=true;say('Buscando…');let ok='',err='';
  if(hcOn()&&window.__hcFind){try{const d=await race(window.__hcFind(draft),30000);
      if(d){await window.__hcApply(draft,d);try{await race(window.__hcExtras(draft,d),30000)}catch(e){}ok='Hardcover'}}
    catch(e){err=/clave/.test(e.message)?'Tu clave de Hardcover no es válida. ':''}}
  if(!ok&&typeof syncGoodreads==='function'){say('No estaba en Hardcover; probando Goodreads y otras fuentes…');
    try{const g=await race(syncGoodreads(draft,{force:true,search:true}),35000);if(g)ok=g.fallback?'Google Books / Open Library':'Goodreads'}catch(e){}}
  if(btn())btn().disabled=false;
  if(ok){toast('Datos traídos desde '+ok+' ✦');if(typeof editorOpen==='function'&&editorOpen(draft.id)&&typeof reopenEditor==='function')reopenEditor();else say('Listo: datos de '+ok+'.')}
  else say(err+'No encontré datos. Revisa el ISBN o el título, o usa “Vincular con enlace de Hardcover” desde el menú ⋯ del libro.')};


/* ══ "Leyendo ahora": primero el libro que leíste o actualizaste más recientemente ══ */
const snap=new Map(),sigOf=b=>(b.current||0)+'|'+b.status;
function touchBooks(){try{(data.books||[]).forEach(b=>{const g=sigOf(b);if(snap.has(b.id)&&snap.get(b.id)!==g)b.touched=Date.now();snap.set(b.id,g)})}catch(e){}}
setInterval(touchBooks,1200);
readingBooks=function(){const L=(data.books||[]).filter(b=>b.status==='Leyendo'),idx=new Map();
  (data.sessions||[]).forEach((s,i)=>idx.set(s.bookId,{i,t:Date.parse((s.date||'')+'T12:00:00')||0}));
  const sc=b=>{const x=idx.get(b.id);return Math.max(b.touched||0,x?x.t:0)},ix=b=>{const x=idx.get(b.id);return x?x.i:-1};
  return L.map((b,i)=>[b,i]).sort((a,b)=>sc(b[0])-sc(a[0])||ix(b[0])-ix(a[0])||a[1]-b[1]).map(x=>x[0])};

/* ══ Copia de seguridad: se guarda en Descargas/ArcaneReads (visible en Archivos) ══ */
backup=async function(){
  try{data.settings.lastBackup=Date.now();await save()}catch(e){}
  const json=JSON.stringify(data),name='arcane-reads-backup-'+new Date().toISOString().slice(0,10)+'.json';
  let done='';
  if(window.ArcaneNative&&window.ArcaneNative.save){
    try{const by=new TextEncoder().encode(json);let bin='';for(let i=0;i<by.length;i+=0x8000)bin+=String.fromCharCode.apply(null,by.subarray(i,i+0x8000));
      const r=String(window.ArcaneNative.save(name,btoa(bin),'application/json'));
      if(r.startsWith('OK:'))done='Copia guardada en '+r.slice(3);else console.warn(r)}catch(e){console.warn(e)}}
  if(!done){try{const f=new File([json],name,{type:'application/json'});
      if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'Copia de Arcane Reads'});done='Copia lista: elige dónde guardarla'}}catch(e){if(e&&e.name==='AbortError'){toast('Exportación cancelada');return}}}
  if(!done){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([json],{type:'application/json'}));a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);done='Copia exportada (revisa Descargas)'}
  toast(done);setTimeout(()=>{try{rerender()}catch(e){}},300)};

/* ══ Portadas: reintentar las que no cargan y repararlas buscando otra fuente (Hardcover primero) ══ */
const healQ=[];let healing=false;
async function healRun(){if(healing)return;healing=true;
  while(healQ.length){const bk=healQ.shift();
    try{if(!navigator.onLine)continue;const old=bk.cover;let u='';
      if(hcOn()&&window.__hcCover){try{u=await window.__hcCover(bk)}catch(e){}}
      if((!u||u===old)&&window.__coverFor){try{u=await window.__coverFor({...bk,hc:null,coverTried:0})}catch(e){}}
      if(u&&u!==old){bk.cover=u;bk.coverAuto=1;try{save()}catch(e){}
        document.querySelectorAll('img').forEach(im=>{if(im.getAttribute('src')===old){im.dataset.rt='0';im.src=u}})}}catch(e){}
    await new Promise(r=>setTimeout(r,1300))}
  healing=false}
document.addEventListener('error',e=>{const im=e.target;if(!im||im.tagName!=='IMG')return;const u=im.getAttribute('src')||'';if(!/^https?:/i.test(u))return;
  const bk=(data.books||[]).find(b=>b.cover===u&&b.format!=='Audiolibro');if(!bk)return;
  const n=(+im.dataset.rt||0)+1;im.dataset.rt=String(n);
  if(n<=2){setTimeout(()=>{if(im.isConnected&&im.getAttribute('src')===u){im.removeAttribute('src');im.src=u}},n*2500);return}
  if(n===3&&!(bk.coverHealAt&&Date.now()-bk.coverHealAt<216e5)){bk.coverHealAt=Date.now();healQ.push(bk);healRun()}},true);
})();
