/* Arcane Reads v2.9.14 — portadas automáticas, sagas desde el título, colecciones limpias,
   estantería por portada, botón "atrás" del teléfono y ajustes de pantalla completa */
(function(){
const NATIVE=!!(window.Capacitor&&typeof window.Capacitor.isNativePlatform==='function'&&window.Capacitor.isNativePlatform());
(function(){if(!NATIVE)return;const _f=window.fetch.bind(window);
  const unwrap=u=>{let m;if(m=u.match(/^https:\/\/corsproxy\.io\/\?url=(.+)$/))return[decodeURIComponent(m[1]),'raw'];if(m=u.match(/^https:\/\/api\.allorigins\.win\/raw\?url=(.+)$/))return[decodeURIComponent(m[1]),'raw'];if(m=u.match(/^https:\/\/api\.allorigins\.win\/get\?url=(.+)$/))return[decodeURIComponent(m[1]),'get'];if(m=u.match(/^https:\/\/api\.codetabs\.com\/v1\/proxy\?quest=(.+)$/))return[decodeURIComponent(m[1]),'raw'];if(m=u.match(/^https:\/\/thingproxy\.freeboard\.io\/fetch\/(.+)$/))return[m[1],'raw'];return null};
  const RT=(p,ms)=>Promise.race([p,new Promise((_,rj)=>setTimeout(()=>rj(new Error('tiempo')),ms))]);
  let directState=null,probe=null;try{if(Date.now()<(+localStorage.arcDirectBad||0))directState=false}catch(e){}
  const checkDirect=()=>directState!==null?Promise.resolve(directState):(probe||(probe=RT(_f('https://www.goodreads.com/book/auto_complete?format=json&q=hush',{}),5000).then(r=>r.ok?r.text():Promise.reject(new Error('http'))).then(t=>{JSON.parse(t);directState=true}).catch(()=>{directState=false;try{localStorage.arcDirectBad=String(Date.now()+864e5)}catch(e){}}).then(()=>directState)));
  window.fetch=function(inp,init){const u=typeof inp==='string'?inp:(inp&&inp.url)||'',w=u&&unwrap(u);
    if(!w)return RT(_f(inp,init),15000);
    const viaProxy=()=>RT(_f(inp,init),12000);
    return checkDirect().then(ok=>!ok?viaProxy():RT(_f(w[0],init),6000).then(r=>r.ok?r:Promise.reject(new Error('http'))).then(async r=>{if(w[1]==='get'){const t=await RT(r.text(),6000);return new Response(JSON.stringify({contents:t,status:{http_code:r.status}}),{status:200,headers:{'Content-Type':'application/json'}})}return r}).catch(viaProxy))}})();
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),enc=encodeURIComponent;
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
const good=(want,got)=>{const w=norm(want),g=norm(got);if(!w||!g)return false;const k=w.split(' ').filter(x=>x.length>2).slice(0,3);return k.length?k.every(x=>g.includes(x)):g.includes(w)};
const SER=/\s*\(([^()]+?)(?:,\s*|\s+)#\s*(\d+(?:\.\d+)?)\)\s*$/;
const STD=/^(to-read|currently-reading|read|did-not-finish|dnf|to-read-next)$/i;
const cleanList=v=>typeof v==='string'?v.split(',').map(s=>s.trim()).filter(s=>s&&!STD.test(s)).join(', '):v;
window.__parseSeries=t=>{const m=String(t||'').match(SER);return m?{saga:m[1].trim(),n:+m[2],title:String(t).replace(SER,'').trim()}:null};
const persist=()=>{try{save().catch(()=>{})}catch(e){}};
let psT=0;const persistSoon=()=>{clearTimeout(psT);psT=setTimeout(persist,1500)};
document.addEventListener('visibilitychange',()=>{if(document.hidden)persist()});addEventListener('pagehide',persist);

/* ── 1) normalizar libros: saga desde el título, colecciones sin "to-read", estantería por portada ── */
function normBook(b){
  if(b.m22)return false;
  const p=window.__parseSeries(b.title);
  if(p){if(!b.saga)b.saga=p.saga;if(!b.sagaN)b.sagaN=p.n;b.title=p.title}
  b.collection=cleanList(b.collection);b.categories=cleanList(b.categories);
  if((b.display==='Lomo'||!b.display)&&!b.spine)b.display='Portada';
  b.m22=1;return true}
function normAll(){let n=0;(data.books||[]).forEach(b=>{if(normBook(b))n++});if(n)persist();return n}

/* ── 2) buscador de portadas (Open Library, Google Books, Goodreads) ── */
let ERR=0;
async function getJSON(u,tries){tries=tries||2;for(let i=0;i<tries;i++){try{const c=new AbortController(),t=setTimeout(()=>c.abort(),9000);const r=await withTO(fetch(u,{signal:c.signal}),11000);clearTimeout(t);if(r.status===429||r.status>=500){await sleep(2500*(i+1));continue}if(!r.ok)return{};return await withTO(r.json(),8000)}catch(e){await sleep(700)}}ERR++;return{}}
const imgOk=u=>new Promise(r=>{const i=new Image(),t=setTimeout(()=>{i.onload=i.onerror=null;r(false)},6000);i.onload=()=>{clearTimeout(t);r(i.naturalWidth>=90&&i.naturalHeight>=120)};i.onerror=()=>{clearTimeout(t);r(false)};i.src=u});
const cleanT=t=>String(t||'').replace(SER,'').replace(/\s*\([^)]*\)\s*$/,'').replace(/\s*[:–—].*$/,'').trim();
const firstAu=a=>String(a||'').split(/,| y | and |&/)[0].trim();
const to10=i=>{i=String(i||'').replace(/[^0-9X]/gi,'').toUpperCase();if(i.length===10)return i;if(i.length===13&&i.startsWith('978')){const b=i.slice(3,12);let t=0;for(let k=0;k<9;k++)t+=(10-k)*(+b[k]);const c=(11-t%11)%11;return b+(c===10?'X':String(c))}return''};
async function amazon(isbn){const i=to10(isbn);if(!i)return'';for(const u of[`https://images-na.ssl-images-amazon.com/images/P/${i}.01.LZZZZZZZ.jpg`,`https://m.media-amazon.com/images/P/${i}.01.L.jpg`])if(await imgOk(u))return u;return''}
const PROX=[u=>'https://api.allorigins.win/raw?url='+enc(u),u=>'https://corsproxy.io/?url='+enc(u),u=>'https://api.codetabs.com/v1/proxy?quest='+enc(u)],pf=[0,0,0],pok=[0,0,0];
async function viaProxy(u){for(let k=0;k<PROX.length;k++){if(pf[k]>=4&&!pok[k])continue;try{const c=new AbortController(),t=setTimeout(()=>c.abort(),8000);const r=await fetch(PROX[k](u),{signal:c.signal});clearTimeout(t);if(!r.ok){pf[k]++;continue}const x=await r.text();if(x&&x.length>2000){pok[k]++;return x}pf[k]++}catch(e){pf[k]++}}ERR++;return''}
const PX5=[x=>'https://api.allorigins.win/raw?url='+enc(x),x=>'https://api.allorigins.win/get?url='+enc(x),x=>'https://corsproxy.io/?url='+enc(x),x=>'https://api.codetabs.com/v1/proxy?quest='+enc(x),x=>'https://thingproxy.freeboard.io/fetch/'+x];
function pageVia(u){const cs=[];const mk=p=>new Promise(async(res,rej)=>{try{const c=new AbortController(),tm=setTimeout(()=>c.abort(),9000);cs.push(c);const r=await withTO(fetch(p(u),{signal:c.signal}),11000);clearTimeout(tm);if(!r.ok)return rej();let h=await withTO(r.text(),9000);if(h[0]==='{'){try{h=JSON.parse(h).contents||''}catch(e){}}if(h.length>3000)res(h);else rej()}catch(e){rej()}});
  return Promise.any(PX5.map(mk)).then(h=>{cs.forEach(c=>c.abort());return h}).catch(()=>{ERR++;return''})}
async function grPage(b){const url=b.goodreadsUrl||(b.goodreadsId?'https://www.goodreads.com/book/show/'+b.goodreadsId:'');if(!url)return'';const h=await pageVia(url);if(!h)return'';
  const m=h.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)||h.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)||h.match(/"imageUrl":"(https:[^"]+)"/);if(!m)return'';
  const u=m[1].replace(/&amp;/g,'&').replace('http://','https://');if(/nophoto|no-cover/i.test(u))return'';return await imgOk(u)?u:''}
async function olIsbn(isbn){const u=`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;return await imgOk(u)?u:''}
async function gbCover(q,want){const j=await getJSON('https://www.googleapis.com/books/v1/volumes?maxResults=6&printType=books&q='+enc(q));
  for(const it of j.items||[]){const v=it.volumeInfo||{},im=v.imageLinks;if(!im)continue;if(want&&!good(want,v.title))continue;
    const u=String(im.thumbnail||im.smallThumbnail||'').replace('http://','https://').replace('&edge=curl','');if(!u)continue;
    const zs=/zoom=\d/.test(u)?['zoom=0','zoom=2','zoom=1']:[''];
    for(const z of zs){const uu=z?u.replace(/zoom=\d/,z):u;if(await imgOk(uu))return uu}}return''}
async function olSearch(t,a){const j=await getJSON(`https://openlibrary.org/search.json?title=${enc(t)}${a?'&author='+enc(a):''}&limit=5&fields=title,cover_i`);
  for(const d of j.docs||[]){if(d.cover_i&&good(t,d.title)){const u=`https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`;if(await imgOk(u))return u}}return''}
const withTO=(p,ms)=>Promise.race([p,new Promise((_,r)=>setTimeout(()=>r(new Error('tiempo')),ms))]);
async function grCover(b,t,a,isbn){if(typeof searchGoodreads!=='function')return'';
  const qs=[];if(isbn)qs.push(isbn);qs.push((t+' '+a).trim());if(a)qs.push(t);
  for(const q of qs){let rs;try{rs=await withTO(searchGoodreads(q),10000)}catch(e){ERR++;continue}
    const ok=x=>x&&x.cover&&!/nophoto|no-cover/i.test(x.cover);
    const pick=rs.find(x=>ok(x)&&b.goodreadsId&&x.extId===String(b.goodreadsId))||(q===isbn?rs.find(ok):null)||rs.find(x=>ok(x)&&good(t,x.title));
    if(pick&&await imgOk(pick.cover))return pick.cover}
  return''}
const firstOf=fs=>new Promise(res=>{let n=fs.length;if(!n)return res('');fs.forEach(f=>{Promise.resolve().then(f).then(u=>{if(u)res(u);else if(--n===0)res('')},()=>{if(--n===0)res('')})})});
async function coverFor(b){
  const t=cleanT(b.title),a=firstAu(b.author),isbn=String(b.isbn||'').replace(/[^0-9X]/gi,'');
  /* A: ficha de Goodreads por su número + imágenes por ISBN, a la vez */
  let u=await firstOf([()=>grPage(b),()=>isbn?olIsbn(isbn):'',()=>isbn?amazon(isbn):'']);if(u)return u;
  /* B: búsqueda interna de Goodreads (la misma que al agregar un libro) */
  try{u=await grCover(b,t,a,isbn)}catch(e){}if(u)return u;
  /* C: Google Books y Open Library, a la vez */
  return await firstOf([()=>hcCover(b),()=>isbn?gbCover('isbn:'+isbn,''):'',()=>gbCover(`intitle:"${t}"${a?' inauthor:"'+a+'"':''}`,t),()=>olSearch(t,a),()=>gbCover((t+' '+a).trim(),t)])}
function stat(msg,end){let e=document.getElementById('covStat');if(!e){e=document.createElement('div');e.id='covStat';document.body.appendChild(e)}e.textContent=msg;e.classList.add('on');if(end)setTimeout(()=>e.classList.remove('on'),3800)}
let running=false,runStart=0;
window.findMissingCovers=async function(force,pass){pass=pass||1;
  if(running&&Date.now()-runStart<6*60e3){if(force)toast('Ya estoy buscando portadas…');return}
  if(!navigator.onLine){if(force)toast('Sin conexión a internet');return}
  const list=(data.books||[]).filter(b=>!b.cover&&b.format!=='Audiolibro'&&(force||!b.coverTried||Date.now()-b.coverTried>3*864e5));
  if(!list.length){if(force)toast('Todos tus libros ya tienen portada ✦');return}
  ERR=0;running=true;runStart=Date.now();let done=0,found=0,i=0;stat(`Buscando portadas${pass>1?' (pasada '+pass+')':''}… 0/${list.length}`);
  const worker=async()=>{while(i<list.length){const b=list[i++];
    try{const e0=ERR,u=await withTO(coverFor(b),70000);if(ERR===e0)b.coverTried=Date.now();if(u){b.cover=u;b.coverAuto=1;if(!b.spine&&(b.display==='Lomo'||!b.display))b.display='Portada';found++;persistSoon()}}catch(e){}
    done++;stat(`Buscando portadas${pass>1?' (pasada '+pass+')':''}… ${done}/${list.length}`);if(done%25===0){try{render()}catch(e){}}await sleep(400)}};
  await Promise.all([worker(),worker(),worker()]);running=false;persist();try{rerender()}catch(e){}setTimeout(pump,1500);
  const errN=ERR;const left=(data.books||[]).filter(b=>!b.cover&&b.format!=='Audiolibro').length;
  if(found>0&&left>0&&pass<6){stat(`Encontré ${found} · reintentando los ${left} que faltan…`);setTimeout(()=>findMissingCovers(true,pass+1),4000);return}stat((found?`Listo: ${found} portada${found===1?'':'s'} nueva${found===1?'':'s'} ✦`:'No encontré portadas nuevas')+(left?` · faltan ${left}`:'')+(errN?` · ${errN} consultas fallaron`:''),true)};

/* ── 3) después de importar de Goodreads: normalizar y buscar portadas ── */
const imp=$('importer');if(imp&&imp.onchange){const old=imp.onchange;imp.onchange=async function(e){await old.call(this,e);if(normAll())rerender();setTimeout(()=>findMissingCovers(false),600)}}

/* ── 4) render: normalizar, botón en Perfil, espacio de la estantería ── */
function fit2(){const app=$('app'),h=document.querySelector('.immersive .section-gap>section:first-child'),p=document.querySelector('.immersive .shelf-preview');if(!app||!h||!p)return;
  const books=p.querySelectorAll('.shelf-book');if(!books.length)return;
  const hb=h.getBoundingClientRect().bottom;let top=1e9;books.forEach(e=>{const t=e.getBoundingClientRect().top;if(t<top)top=t});
  const cur=parseFloat(getComputedStyle(p).paddingTop)||0,delta=top-(hb+8);if(Math.abs(delta)>3)app.style.setProperty('--hdr',Math.max(40,Math.round(cur-delta))+'px')}
let ft=0;const fitSoon=()=>{clearTimeout(ft);ft=setTimeout(fit2,300)};
document.addEventListener('load',e=>{if(e.target&&e.target.tagName==='IMG'&&document.querySelector('.immersive'))fitSoon()},true);
const _r=render;render=function(){normAll();_r();
  const s=[...document.querySelectorAll('.switch-row strong')].find(x=>/Datos de la biblioteca/.test(x.textContent));
  if(s){const row=s.closest('.switch-row');if(row&&!row.nextElementSibling?.classList.contains('cov-row'))row.insertAdjacentHTML('afterend','<div class="switch-row cov-row"><div><strong>Portadas</strong><div class="muted small">Buscar las que falten</div></div><div style="display:flex;gap:8px"><button class="mini-btn" onclick="findMissingCovers(true)">Buscar</button><button class="mini-btn" onclick="showMissingCovers()">Ver faltantes</button></div></div>')}
  wall();swapImgs(document);setTimeout(fit2,450);setTimeout(fit2,1500)};
function hcRow(){const c=document.querySelector('.cov-row');if(c&&!(c.nextElementSibling&&c.nextElementSibling.classList.contains('hc-row')))c.insertAdjacentHTML('afterend','<div class="switch-row hc-row"><div><strong>Hardcover</strong><div class="muted small">Clave para portadas y datos extra</div></div><button class="mini-btn" onclick="hcConfig()">Configurar</button></div>')}
function perfilBtn(){const s=[...document.querySelectorAll('.switch-row strong')].find(x=>/Datos de la biblioteca/.test(x.textContent));if(!s)return;const row=s.closest('.switch-row');
  if(row&&!(row.nextElementSibling&&row.nextElementSibling.classList.contains('cov-row')))row.insertAdjacentHTML('afterend','<div class="switch-row cov-row"><div><strong>Portadas</strong><div class="muted small">Buscar las que falten</div></div><div style="display:flex;gap:8px"><button class="mini-btn" onclick="findMissingCovers(true)">Buscar</button><button class="mini-btn" onclick="showMissingCovers()">Ver faltantes</button></div></div>')}
let pt=0;new MutationObserver(()=>{clearTimeout(pt);pt=setTimeout(()=>{perfilBtn();hcRow()},150)}).observe(document.body,{childList:true,subtree:true});
addEventListener('resize',fitSoon);
setTimeout(()=>findMissingCovers(false),25000);addEventListener('online',()=>setTimeout(()=>findMissingCovers(false),8000));

/* ── 5) botón/gesto "atrás": cierra hojas y sub-vistas en vez de cerrar la app ── */
/* Qué hace el gesto "atrás": cierra hoja/visor, sale de una sub-vista o vuelve a Inicio.
   En la app nativa lo llama MainActivity (window.__arcBack); en Chrome, el historial de la página. */
let lastBack=0;
function backAction(exitOnSecond){
  const od=[...document.querySelectorAll('dialog[open]')].pop();
  if(od){od===$('dlg')?closeSheet():od.close();return true}
  const vol=[...document.querySelectorAll('button')].find(b=>b.offsetParent&&/^[‹<]?\s*Volver\b/.test(b.textContent.trim()));
  if(vol){vol.click();return true}
  if(typeof tab!=='undefined'&&tab!=='Inicio'){setTab('Inicio');return true}
  if(exitOnSecond&&Date.now()-lastBack<2500)return false;
  lastBack=Date.now();toast('Desliza otra vez para salir');return true}
window.__arcBack=()=>backAction(true);
let armed=false;
const arm=()=>{if(armed)return;try{history.pushState({arc:1},'');armed=true}catch(e){}};
['pointerup','touchend','click'].forEach(ev=>document.addEventListener(ev,arm,true));
addEventListener('popstate',()=>{armed=false;backAction(false)});


/* ── 7) detalle del libro: cambiar/buscar portada (ISBN, enlace o galería) ── */
const gb=id=>getBook(id);
async function byIsbn(isbn){isbn=String(isbn||'').replace(/[^0-9X]/gi,'');if(!isbn)return'';
  for(const f of[()=>olIsbn(isbn),()=>amazon(isbn),()=>gbCover('isbn:'+isbn,'')]){try{const u=await f();if(u)return u}catch(e){}}return''}
const shrink=file=>new Promise((res,rej)=>{const r=new FileReader();r.onerror=rej;r.onload=()=>{const im=new Image();im.onerror=rej;im.onload=()=>{const k=Math.min(1,700/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.85))};im.src=r.result};r.readAsDataURL(file)});
let fromList=false;
const toolsBack=id=>{closeSheet();setTimeout(()=>fromList?window.showMissingCovers():bookDetails(id),60)};
const applyCover=(id,u)=>{const b=gb(id);if(!b||!u)return;b.cover=u;b.coverAuto=0;if(!b.spine&&(b.display==='Lomo'||!b.display))b.display='Portada';closeSheet();rerender();setTimeout(()=>fromList?window.showMissingCovers():bookDetails(id),60);toast('Portada actualizada')};
window.coverTools=(id,fromDetail)=>{const b=gb(id);if(!b)return;if(fromDetail)fromList=false;
  showSheet(`<div class="sheet-header"><div><h2>Portada</h2><div class="muted small">${esc(b.title)}</div></div><button class="sheet-close" onclick="coverToolsBack('${id}')">×</button></div>
  <div class="ss-form" style="display:grid;gap:10px">
   <div id="cvPrev" class="muted small" style="min-height:20px"></div>
   <label>ISBN</label><input id="cvIsbn" inputmode="text" placeholder="978…" value="${esc(b.isbn||'')}">
   <button class="btn-soft" type="button" onclick="coverByIsbn('${id}')">Buscar portada con el ISBN</button>
   <button class="btn-soft" type="button" onclick="coverByTitle('${id}')">Buscar por título y autor</button>
   <label>…o pega el enlace de Goodreads o de una imagen</label><input id="cvUrl" type="url" placeholder="https://…" value="${esc(b.goodreadsUrl||(b.goodreadsId?'https://www.goodreads.com/book/show/'+b.goodreadsId:''))}">
   <button class="mini-btn" type="button" onclick="coverByUrl('${id}')">Usar este enlace</button>
   <label>…o elige una foto de tu galería</label><input id="cvFile" type="file" accept="image/*">
  </div>`);
  const f=document.getElementById('cvFile');if(f)f.onchange=async()=>{if(!f.files[0])return;try{applyCover(id,await shrink(f.files[0]))}catch(e){document.getElementById('cvPrev').textContent='No pude leer esa imagen.'}}};
window.coverToolsBack=toolsBack;
window.showMissingCovers=()=>{const L=(data.books||[]).filter(b=>!b.cover&&b.format!=='Audiolibro').sort((a,b)=>String(a.title).localeCompare(String(b.title)));fromList=true;
  const rows=L.map(b=>`<div class="ss-row"><div><b>${esc(b.title)}</b><span>${esc(b.author||'')}${b.isbn?' · ISBN '+esc(b.isbn):''}</span></div><button class="mini-btn" type="button" onclick="coverTools('${b.id}')">Portada</button></div>`).join('');
  showSheet(`<div class="sheet-header"><div><h2>Sin portada</h2><div class="muted small">${L.length?L.length+' libro'+(L.length===1?'':'s'):'Todos tus libros tienen portada ✦'}</div></div><button class="sheet-close" onclick="fromListOff()">×</button></div><div class="ss-sec">${rows}</div>`)};
window.fromListOff=()=>{fromList=false;closeSheet()};
const prevMsg=t=>{const p=document.getElementById('cvPrev');if(p)p.textContent=t};
window.coverByIsbn=async id=>{const isbn=(document.getElementById('cvIsbn').value||'').trim();if(!isbn)return prevMsg('Escribe un ISBN.');prevMsg('Buscando…');
  const b=gb(id);if(b&&isbn.replace(/[^0-9X]/gi,'')!==String(b.isbn||'').replace(/[^0-9X]/gi,'')){b.isbn=isbn.replace(/[^0-9X]/gi,'')}
  const u=await byIsbn(isbn);u?applyCover(id,u):prevMsg('No encontré portada con ese ISBN. Prueba con otro ISBN, un enlace o una foto.')};
window.coverByTitle=async id=>{const b=gb(id);prevMsg('Buscando…');ERR=0;const u=await coverFor(b);u?applyCover(id,u):prevMsg(ERR?'No la encontré y algunas consultas fallaron (puede ser tu conexión o que los servicios gratuitos están saturados). Prueba con el enlace de Goodreads de abajo o con una foto.':'No encontré portada por título. Prueba con el enlace de Goodreads, el ISBN o una foto.')};
window.coverByUrl=async id=>{const u=(document.getElementById('cvUrl').value||'').trim();if(!/^https?:\/\//i.test(u))return prevMsg('Pega un enlace que empiece con https://');prevMsg('Comprobando…');
  if(/goodreads\.com\/book\/show\//i.test(u)){ERR=0;const g=await grPage({goodreadsUrl:u});return g?applyCover(id,g):prevMsg(ERR?'Goodreads no respondió por ahora. Inténtalo de nuevo en un minuto o usa una foto de tu galería.':'Esa página de Goodreads no tiene portada.')}
  await imgOk(u)?applyCover(id,u):prevMsg('Esa imagen no se pudo cargar.')};
new MutationObserver(()=>{const db=document.querySelector('.dt-body');if(!db||db.querySelector('.cov-sec'))return;
  const btn=document.querySelector('.dt-bar [onclick*="startSession("]'),m=btn&&(btn.getAttribute('onclick')||'').match(/'([^']+)'/);if(!m)return;
  const html=`<section class="cov-sec" style="display:grid;gap:8px;margin:6px 0"><button class="mini-btn" type="button" onclick="coverTools('${m[1]}',true)">Cambiar o buscar portada (ISBN)</button>${gb(m[1])?grBlock(gb(m[1]))+hcBlock(gb(m[1])):''}</section>`;
  const a=db.querySelector('.ss-sec');a?a.insertAdjacentHTML('beforebegin',html):db.insertAdjacentHTML('beforeend',html)}).observe($('dlg'),{childList:true,subtree:true});

/* ── 8) foto de fondo de la estantería: una capa fija del tamaño de la pantalla (sin zoom) ── */
function wall(){const p=document.querySelector('.immersive .shelf-preview');let w=document.getElementById('shelfWall');
  const bi=p&&p.style.backgroundImage;
  if(!p||!bi||bi==='none'){if(w)w.remove();if(p)p.classList.remove('has-wall');return}
  if(!w){w=document.createElement('div');w.id='shelfWall';document.body.appendChild(w)}
  if(w.dataset.bi!==bi){w.style.backgroundImage=bi;w.dataset.bi=bi}
  p.classList.add('has-wall')}

/* ── 9) caché local de portadas: se descargan una vez y se muestran al instante ── */
const objMap=new Map(),queue=new Set(),failedAt=new Map();let cdb=null,pumping=0;
const openCDB=()=>new Promise(res=>{try{const r=indexedDB.open('arcane-covers',1);r.onupgradeneeded=()=>r.result.createObjectStore('c');r.onsuccess=()=>res(r.result);r.onerror=()=>res(null)}catch(e){res(null)}});
function swapImgs(root){(root||document).querySelectorAll('img').forEach(im=>{const u=im.getAttribute('src')||'';if(!/^https?:/i.test(u))return;const o=objMap.get(u);if(o){im.loading='eager';im.src=o}else enqueue(u)})}
function enqueue(u){if(!u||!/^https?:/i.test(u)||objMap.has(u)||queue.has(u)||(failedAt.get(u)||0)>Date.now())return;queue.add(u);pump()}
function pump(){if(running)return;while(queue.size&&pumping<2){const u=queue.values().next().value;queue.delete(u);pumping++;cacheUrl(u).finally(()=>{pumping--;setTimeout(pump,120)})}}
async function cacheUrl(u){try{const c=new AbortController(),tm=setTimeout(()=>c.abort(),12000);const r=await withTO(fetch(u,{mode:'cors',signal:c.signal}),12000);clearTimeout(tm);if(!r.ok)throw 0;const b=await withTO(r.blob(),12000);if(b.size<800||!/^image\//.test(b.type))throw 0;
  const o=URL.createObjectURL(b);if(!(await imgOk(o))){URL.revokeObjectURL(o);throw 0}
  objMap.set(u,o);if(cdb)try{cdb.transaction('c','readwrite').objectStore('c').put(b,u)}catch(e){}swapImgs(document)}catch(e){failedAt.set(u,Date.now()+6*3600e3)}}
(async function(){cdb=await openCDB();if(cdb)await new Promise(res=>{try{const rq=cdb.transaction('c','readonly').objectStore('c').openCursor();rq.onsuccess=()=>{const c=rq.result;if(c){objMap.set(c.key,URL.createObjectURL(c.value));c.continue()}else res()};rq.onerror=()=>res()}catch(e){res()}});
  swapImgs(document);setTimeout(()=>{(data.books||[]).forEach(b=>{enqueue(b.cover);if(b.audio)enqueue(b.audio.cover)})},60000)})();
let sw2=0;new MutationObserver(()=>{clearTimeout(sw2);sw2=setTimeout(()=>swapImgs(document),40)}).observe(document.body,{childList:true,subtree:true});

/* ── 10) personajes, lugares y premios desde la ficha de Goodreads ── */
function parseGrx(html){const out={c:[],p:[],a:[]};let J=null;const m=html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);try{J=m&&JSON.parse(m[1])}catch(e){}
  if(!J)return out;const AS=(J.props&&J.props.pageProps&&J.props.pageProps.apolloState)||{},seen=new Set();
  const nm=a=>(Array.isArray(a)?a:[]).map(x=>{if(x&&x.__ref)x=AS[x.__ref];return typeof x==='string'?x:(x&&(x.name||x.title))||''}).map(s=>String(s).trim()).filter(Boolean);
  (function walk(o,d){if(!o||typeof o!=='object'||d>16||seen.has(o))return;seen.add(o);if(Array.isArray(o)){o.forEach(x=>walk(x,d+1));return}
    for(const k in o){const v=o[k];if(k==='characters')out.c.push(...nm(v));else if(k==='places')out.p.push(...nm(v));else if(k==='awardsWon')out.a.push(...nm(v));if(v&&typeof v==='object')walk(v,d+1)}})(J,0);
  const u=a=>[...new Set(a)].slice(0,40);out.c=u(out.c);out.p=u(out.p);out.a=u(out.a);return out}
window.grExtra=async id=>{const b=gb(id);if(!b)return;const url=b.goodreadsUrl||(b.goodreadsId?'https://www.goodreads.com/book/show/'+b.goodreadsId:'');
  if(!url)return toast('Este libro no tiene enlace de Goodreads. Agrégalo en Editar.');toast('Buscando en Goodreads…');const h=await pageVia(url);
  if(!h)return toast('Goodreads no respondió. Inténtalo de nuevo en un minuto.');const x=parseGrx(h);
  if(!x.c.length&&!x.p.length&&!x.a.length)return toast('No encontré personajes ni datos extra en esa página.');
  b.grx={c:x.c,p:x.p,a:x.a,t:Date.now()};persist();closeSheet();rerender();setTimeout(()=>bookDetails(id),60)};
const grBlock=b=>{const g=b.grx,L=(t,a)=>a&&a.length?`<div class="muted small"><b>${t}:</b> ${a.map(esc).join(', ')}</div>`:'';
  return(g?L('Personajes',g.c)+L('Lugares',g.p)+L('Premios',g.a):'')+`<button class="mini-btn" type="button" onclick="grExtra('${b.id}')">${g?'Actualizar':'Traer'} personajes y datos de Goodreads</button>`};

/* ── 11) Hardcover (clave personal, guardada solo en este teléfono) ── */
const HC_URL='https://api.hardcover.app/v1/graphql';let hcLast=0;
const hcTok=()=>{try{return String(localStorage.arcHC||'').replace(/^Bearer\s+/i,'').trim()}catch(e){return''}};
async function hcQ(query,variables){const tk=hcTok();if(!tk)throw new Error('sin clave');
  const w=Math.max(0,hcLast+1100-Date.now());hcLast=Date.now()+w;if(w)await sleep(w);
  const r=await withTO(fetch(HC_URL,{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+tk},body:JSON.stringify({query,variables})}),12000);
  if(r.status===401||r.status===403)throw new Error('clave no válida');if(r.status===429){ERR++;throw new Error('límite')}
  const j=await withTO(r.json(),8000);if(j.errors&&!j.data){ERR++;throw new Error('error')}return j.data||{}}
async function hcSearch(q){const d=await hcQ('query($q:String!){search(query:$q,query_type:"Book",per_page:6,page:1){results}}',{q});
  let r=d.search&&d.search.results;if(typeof r==='string'){try{r=JSON.parse(r)}catch(e){r=null}}
  return((r&&r.hits)||[]).map(h=>h.document||h).filter(Boolean)}
async function hcFind(b){const t=cleanT(b.title),a=firstAu(b.author),isbn=String(b.isbn||'').replace(/[^0-9X]/gi,'');
  const qs=[];if(isbn)qs.push(isbn);qs.push((t+' '+a).trim());
  for(const q of qs){let ds;try{ds=await hcSearch(q)}catch(e){if(/clave|sin/.test(e.message))throw e;continue}
    const d=ds.find(x=>isbn&&(x.isbns||[]).some(i=>String(i).replace(/[^0-9X]/gi,'')===isbn))||ds.find(x=>good(t,x.title)&&(!a||(x.author_names||[]).some(n=>good(a,n)||good(n,a))))||ds.find(x=>good(t,x.title));
    if(d)return d}return null}
const hcImg=d=>{const i=d&&d.image;return typeof i==='string'?i:(i&&i.url)||''};
async function hcCover(b){if(!hcTok())return'';const d=await hcFind(b),u=hcImg(d);return u&&await imgOk(u)?u:''}
const arr=v=>Array.isArray(v)?v.map(x=>typeof x==='string'?x:(x&&x.name)||'').filter(Boolean):[];
window.hcData=async id=>{const b=gb(id);if(!b)return;if(!hcTok())return toast('Primero pega tu clave de Hardcover en Perfil → Hardcover.');toast('Buscando en Hardcover…');
  let d;try{d=await hcFind(b)}catch(e){return toast('Hardcover: '+e.message)}
  if(!d)return toast('No encontré este libro en Hardcover.');
  const ser=arr(d.series_names)[0];b.hc={g:arr(d.genres).slice(0,8),m:arr(d.moods).slice(0,8),w:arr(d.content_warnings).slice(0,8),s:ser||'',slug:d.slug||'',t:Date.now()};
  if(!b.categories&&b.hc.g.length)b.categories=b.hc.g.join(', ');
  if(!b.saga&&ser)b.saga=ser;
  const u=hcImg(d);if(!b.cover&&u&&await imgOk(u)){b.cover=u;b.coverAuto=1;if(!b.spine&&(b.display==='Lomo'||!b.display))b.display='Portada'}
  persist();closeSheet();rerender();setTimeout(()=>bookDetails(id),60)};
const hcBlock=b=>{const h=b.hc,L=(t,a)=>a&&a.length?`<div class="muted small"><b>${t}:</b> ${a.map(esc).join(', ')}</div>`:'';
  return(h?L('Géneros (Hardcover)',h.g)+L('Estados de ánimo',h.m)+L('Advertencias',h.w)+(h.slug?`<a class="muted small" href="https://hardcover.app/books/${esc(h.slug)}" target="_blank" rel="noopener">Ver en Hardcover ↗</a>`:''):'')+
   `<button class="mini-btn" type="button" onclick="hcData('${b.id}')">${h?'Actualizar':'Traer'} datos de Hardcover</button>`};
window.hcConfig=()=>{showSheet(`<div class="sheet-header"><div><h2>Hardcover</h2><div class="muted small">Tu clave se guarda solo en este teléfono</div></div><button class="sheet-close" onclick="closeSheet()">×</button></div>
  <div class="ss-form" style="display:grid;gap:10px"><div id="hcMsg" class="muted small" style="min-height:20px">${hcTok()?'Ya hay una clave guardada.':'Pega aquí la clave que creaste en hardcover.app/account/api'}</div>
  <label>Clave de la API</label><input id="hcTok" type="password" autocomplete="off" placeholder="Pega tu clave" value="">
  <button class="btn-soft" type="button" onclick="hcSave()">Guardar y probar</button>
  <button class="mini-btn" type="button" onclick="hcClear()">Quitar clave</button></div>`)};
window.hcSave=async()=>{const v=(document.getElementById('hcTok').value||'').trim();const m=document.getElementById('hcMsg');if(!v){m.textContent='Pega la clave primero.';return}
  try{localStorage.arcHC=v}catch(e){}m.textContent='Probando…';
  try{const ds=await hcSearch('Harry Potter');m.textContent=ds.length?'Conectado ✦ (la búsqueda de libros funciona)':'Clave guardada, pero la búsqueda no devolvió resultados.'}catch(e){m.textContent='No funcionó: '+e.message}};
window.hcClear=()=>{try{delete localStorage.arcHC}catch(e){}const m=document.getElementById('hcMsg');if(m)m.textContent='Clave eliminada.'};

/* ── 6) estilos: franja de la barra de estado, X de las hojas, indicador de portadas ── */
const st=document.createElement('style');
st.textContent='html::before{content:"";position:fixed;top:0;left:0;right:0;height:var(--sat,0px);z-index:7;pointer-events:none;background:linear-gradient(color-mix(in srgb,var(--bg,#101528) 75%,transparent),transparent)}'
 +'.dt-x,.edtop,.vw>.vx{top:calc(12px + var(--sat,0px))!important}.edtop~.edstage{inset:calc(64px + var(--sat,0px)) 0 auto 0!important}'
 +'#shelfWall{position:fixed;inset:0;z-index:0;background-size:cover;background-position:center;background-repeat:no-repeat;pointer-events:none}.shelf-preview.has-wall{background:none!important}'
 +'#covStat{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(var(--dock,120px) + 70px);z-index:9999;background:rgba(20,22,40,.93);color:#fff;border:1px solid rgba(255,255,255,.2);padding:8px 14px;border-radius:999px;font-size:12px;display:none;pointer-events:none}#covStat.on{display:block}';
document.head.appendChild(st);
})();
