/* Arcane Reads v2.9.14 — portadas automáticas, sagas desde el título, colecciones limpias,
   estantería por portada, botón "atrás" del teléfono y ajustes de pantalla completa */
(function(){
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),enc=encodeURIComponent;
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
const good=(want,got)=>{const w=norm(want),g=norm(got);if(!w||!g)return false;const k=w.split(' ').filter(x=>x.length>2).slice(0,3);return k.length?k.every(x=>g.includes(x)):g.includes(w)};
const SER=/\s*\(([^()]+?)(?:,\s*|\s+)#\s*(\d+(?:\.\d+)?)\)\s*$/;
const STD=/^(to-read|currently-reading|read|did-not-finish|dnf|to-read-next)$/i;
const cleanList=v=>typeof v==='string'?v.split(',').map(s=>s.trim()).filter(s=>s&&!STD.test(s)).join(', '):v;
window.__parseSeries=t=>{const m=String(t||'').match(SER);return m?{saga:m[1].trim(),n:+m[2],title:String(t).replace(SER,'').trim()}:null};
const persist=()=>{try{save().catch(()=>{})}catch(e){}};

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
async function getJSON(u,tries){tries=tries||2;for(let i=0;i<tries;i++){try{const c=new AbortController(),t=setTimeout(()=>c.abort(),9000);const r=await fetch(u,{signal:c.signal});clearTimeout(t);if(r.status===429||r.status>=500){await sleep(2500*(i+1));continue}if(!r.ok)return{};return await r.json()}catch(e){await sleep(700)}}ERR++;return{}}
const imgOk=u=>new Promise(r=>{const i=new Image(),t=setTimeout(()=>{i.onload=i.onerror=null;r(false)},9000);i.onload=()=>{clearTimeout(t);r(i.naturalWidth>=90&&i.naturalHeight>=120)};i.onerror=()=>{clearTimeout(t);r(false)};i.src=u});
const cleanT=t=>String(t||'').replace(SER,'').replace(/\s*\([^)]*\)\s*$/,'').replace(/\s*[:–—].*$/,'').trim();
const firstAu=a=>String(a||'').split(/,| y | and |&/)[0].trim();
const to10=i=>{i=String(i||'').replace(/[^0-9X]/gi,'').toUpperCase();if(i.length===10)return i;if(i.length===13&&i.startsWith('978')){const b=i.slice(3,12);let t=0;for(let k=0;k<9;k++)t+=(10-k)*(+b[k]);const c=(11-t%11)%11;return b+(c===10?'X':String(c))}return''};
async function amazon(isbn){const i=to10(isbn);if(!i)return'';for(const u of[`https://images-na.ssl-images-amazon.com/images/P/${i}.01.LZZZZZZZ.jpg`,`https://m.media-amazon.com/images/P/${i}.01.L.jpg`])if(await imgOk(u))return u;return''}
const PROX=[u=>'https://api.allorigins.win/raw?url='+enc(u),u=>'https://corsproxy.io/?url='+enc(u),u=>'https://api.codetabs.com/v1/proxy?quest='+enc(u)],pf=[0,0,0],pok=[0,0,0];
async function viaProxy(u){for(let k=0;k<PROX.length;k++){if(pf[k]>=4&&!pok[k])continue;try{const c=new AbortController(),t=setTimeout(()=>c.abort(),8000);const r=await fetch(PROX[k](u),{signal:c.signal});clearTimeout(t);if(!r.ok){pf[k]++;continue}const x=await r.text();if(x&&x.length>2000){pok[k]++;return x}pf[k]++}catch(e){pf[k]++}}ERR++;return''}
async function grPage(b){const url=b.goodreadsUrl||(b.goodreadsId?'https://www.goodreads.com/book/show/'+b.goodreadsId:'');if(!url)return'';const h=await viaProxy(url);if(!h)return'';
  const m=h.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)||h.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);if(!m)return'';
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
  for(const q of qs){let rs;try{rs=await withTO(searchGoodreads(q),14000)}catch(e){ERR++;continue}
    const ok=x=>x&&x.cover&&!/nophoto|no-cover/i.test(x.cover);
    const pick=rs.find(x=>ok(x)&&b.goodreadsId&&x.extId===String(b.goodreadsId))||(q===isbn?rs.find(ok):null)||rs.find(x=>ok(x)&&good(t,x.title));
    if(pick&&await imgOk(pick.cover))return pick.cover}
  return''}
async function coverFor(b){
  const t=cleanT(b.title),a=firstAu(b.author),isbn=String(b.isbn||'').replace(/[^0-9X]/gi,''),T=[];
  T.push(()=>grCover(b,t,a,isbn),()=>grPage(b));if(isbn)T.push(()=>olIsbn(isbn),()=>amazon(isbn),()=>gbCover('isbn:'+isbn,''));
  T.push(()=>gbCover(`intitle:"${t}"${a?' inauthor:"'+a+'"':''}`,t),()=>olSearch(t,a),()=>gbCover((t+' '+a).trim(),t));
  for(const f of T){try{const u=await f();if(u)return u}catch(e){}}return''}
function stat(msg,end){let e=document.getElementById('covStat');if(!e){e=document.createElement('div');e.id='covStat';document.body.appendChild(e)}e.textContent=msg;e.classList.add('on');if(end)setTimeout(()=>e.classList.remove('on'),3800)}
let running=false;
window.findMissingCovers=async function(force){
  if(running){if(force)toast('Ya estoy buscando portadas…');return}
  if(!navigator.onLine){if(force)toast('Sin conexión a internet');return}
  const list=(data.books||[]).filter(b=>!b.cover&&b.format!=='Audiolibro'&&(force||!b.coverTried||Date.now()-b.coverTried>3*864e5));
  if(!list.length){if(force)toast('Todos tus libros ya tienen portada ✦');return}
  ERR=0;running=true;let done=0,found=0,i=0;stat(`Buscando portadas… 0/${list.length}`);
  const worker=async()=>{while(i<list.length){const b=list[i++];
    try{const e0=ERR,u=await coverFor(b);if(ERR===e0)b.coverTried=Date.now();if(u){b.cover=u;b.coverAuto=1;if(!b.spine&&(b.display==='Lomo'||!b.display))b.display='Portada';found++}}catch(e){}
    done++;stat(`Buscando portadas… ${done}/${list.length}`);if(done%25===0){persist();try{render()}catch(e){}}await sleep(250)}};
  await Promise.all([worker(),worker(),worker()]);running=false;persist();try{rerender()}catch(e){}
  const errN=ERR;const left=(data.books||[]).filter(b=>!b.cover&&b.format!=='Audiolibro').length;stat((found?`Listo: ${found} portada${found===1?'':'s'} nueva${found===1?'':'s'} ✦`:'No encontré portadas nuevas')+(left?` · faltan ${left}`:'')+(errN?` · ${errN} consultas fallaron`:''),true)};

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
  if(s){const row=s.closest('.switch-row');if(row&&!row.nextElementSibling?.classList.contains('cov-row'))row.insertAdjacentHTML('afterend','<div class="switch-row cov-row"><div><strong>Portadas</strong><div class="muted small">Buscar las que falten</div></div><button class="mini-btn" onclick="findMissingCovers(true)">Buscar</button></div>')}
  wall();setTimeout(fit2,450);setTimeout(fit2,1500)};
addEventListener('resize',fitSoon);
setTimeout(()=>findMissingCovers(false),6000);addEventListener('online',()=>setTimeout(()=>findMissingCovers(false),2000));

/* ── 5) botón/gesto "atrás": cierra hojas y sub-vistas en vez de cerrar la app ── */
/* Android ignora las entradas de historial creadas sin que el usuario toque la pantalla,
   así que la entrada "centinela" se agrega durante un toque real (y se repone en el siguiente toque). */
let armed=false;
const arm=()=>{if(armed)return;try{history.pushState({arc:1},'');armed=true}catch(e){}};
['pointerup','touchend','click'].forEach(ev=>document.addEventListener(ev,arm,true));
addEventListener('popstate',()=>{
  armed=false;
  const d=$('dlg');
  if(d&&d.open){closeSheet();return}
  const vol=[...document.querySelectorAll('button')].find(b=>b.offsetParent&&/^[‹<]?\s*Volver\b/.test(b.textContent.trim()));
  if(vol){vol.click();return}
  if(typeof tab!=='undefined'&&tab!=='Inicio'){setTab('Inicio');return}
  toast('Desliza otra vez para salir')});


/* ── 7) detalle del libro: cambiar/buscar portada (ISBN, enlace o galería) ── */
const gb=id=>getBook(id);
async function byIsbn(isbn){isbn=String(isbn||'').replace(/[^0-9X]/gi,'');if(!isbn)return'';
  for(const f of[()=>olIsbn(isbn),()=>amazon(isbn),()=>gbCover('isbn:'+isbn,'')]){try{const u=await f();if(u)return u}catch(e){}}return''}
const shrink=file=>new Promise((res,rej)=>{const r=new FileReader();r.onerror=rej;r.onload=()=>{const im=new Image();im.onerror=rej;im.onload=()=>{const k=Math.min(1,700/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.85))};im.src=r.result};r.readAsDataURL(file)});
const toolsBack=id=>{closeSheet();setTimeout(()=>bookDetails(id),60)};
const applyCover=(id,u)=>{const b=gb(id);if(!b||!u)return;b.cover=u;b.coverAuto=0;if(!b.spine&&(b.display==='Lomo'||!b.display))b.display='Portada';closeSheet();rerender();setTimeout(()=>bookDetails(id),60);toast('Portada actualizada')};
window.coverTools=id=>{const b=gb(id);if(!b)return;
  showSheet(`<div class="sheet-header"><div><h2>Portada</h2><div class="muted small">${esc(b.title)}</div></div><button class="sheet-close" onclick="coverToolsBack('${id}')">×</button></div>
  <div class="ss-form" style="display:grid;gap:10px">
   <div id="cvPrev" class="muted small" style="min-height:20px"></div>
   <label>ISBN</label><input id="cvIsbn" inputmode="text" placeholder="978…" value="${esc(b.isbn||'')}">
   <button class="btn-soft" type="button" onclick="coverByIsbn('${id}')">Buscar portada con el ISBN</button>
   <button class="btn-soft" type="button" onclick="coverByTitle('${id}')">Buscar por título y autor</button>
   <label>…o pega el enlace de una imagen</label><input id="cvUrl" type="url" placeholder="https://…">
   <button class="mini-btn" type="button" onclick="coverByUrl('${id}')">Usar este enlace</button>
   <label>…o elige una foto de tu galería</label><input id="cvFile" type="file" accept="image/*">
  </div>`);
  const f=document.getElementById('cvFile');if(f)f.onchange=async()=>{if(!f.files[0])return;try{applyCover(id,await shrink(f.files[0]))}catch(e){document.getElementById('cvPrev').textContent='No pude leer esa imagen.'}}};
window.coverToolsBack=toolsBack;
const prevMsg=t=>{const p=document.getElementById('cvPrev');if(p)p.textContent=t};
window.coverByIsbn=async id=>{const isbn=(document.getElementById('cvIsbn').value||'').trim();if(!isbn)return prevMsg('Escribe un ISBN.');prevMsg('Buscando…');
  const b=gb(id);if(b&&isbn.replace(/[^0-9X]/gi,'')!==String(b.isbn||'').replace(/[^0-9X]/gi,'')){b.isbn=isbn.replace(/[^0-9X]/gi,'')}
  const u=await byIsbn(isbn);u?applyCover(id,u):prevMsg('No encontré portada con ese ISBN. Prueba con otro ISBN, un enlace o una foto.')};
window.coverByTitle=async id=>{const b=gb(id);prevMsg('Buscando…');ERR=0;const u=await coverFor(b);u?applyCover(id,u):prevMsg(ERR?'Fallaron algunas consultas de red. Revisa tu conexión e inténtalo de nuevo.':'No encontré portada por título. Prueba con el ISBN, un enlace o una foto.')};
window.coverByUrl=async id=>{const u=(document.getElementById('cvUrl').value||'').trim();if(!/^https?:\/\//i.test(u))return prevMsg('Pega un enlace que empiece con https://');prevMsg('Comprobando…');await imgOk(u)?applyCover(id,u):prevMsg('Esa imagen no se pudo cargar.')};
new MutationObserver(()=>{const db=document.querySelector('.dt-body');if(!db||db.querySelector('.cov-sec'))return;
  const btn=document.querySelector('.dt-bar [onclick*="startSession("]'),m=btn&&(btn.getAttribute('onclick')||'').match(/'([^']+)'/);if(!m)return;
  const html=`<section class="cov-sec" style="display:grid;gap:8px;margin:6px 0"><button class="mini-btn" type="button" onclick="coverTools('${m[1]}')">Cambiar o buscar portada (ISBN)</button></section>`;
  const a=db.querySelector('.ss-sec');a?a.insertAdjacentHTML('beforebegin',html):db.insertAdjacentHTML('beforeend',html)}).observe($('dlg'),{childList:true,subtree:true});

/* ── 8) foto de fondo de la estantería: una capa fija del tamaño de la pantalla (sin zoom) ── */
function wall(){const p=document.querySelector('.immersive .shelf-preview');let w=document.getElementById('shelfWall');
  const bi=p&&p.style.backgroundImage;
  if(!p||!bi||bi==='none'){if(w)w.remove();if(p)p.classList.remove('has-wall');return}
  if(!w){w=document.createElement('div');w.id='shelfWall';document.body.appendChild(w)}
  if(w.dataset.bi!==bi){w.style.backgroundImage=bi;w.dataset.bi=bi}
  p.classList.add('has-wall')}

/* ── 6) estilos: franja de la barra de estado, X de las hojas, indicador de portadas ── */
const st=document.createElement('style');
st.textContent='html::before{content:"";position:fixed;top:0;left:0;right:0;height:var(--sat,0px);z-index:7;pointer-events:none;background:linear-gradient(color-mix(in srgb,var(--bg,#101528) 75%,transparent),transparent)}'
 +'.dt-x,.edtop,.vw>.vx{top:calc(12px + var(--sat,0px))!important}.edtop~.edstage{inset:calc(64px + var(--sat,0px)) 0 auto 0!important}'
 +'#shelfWall{position:fixed;inset:0;z-index:0;background-size:cover;background-position:center;background-repeat:no-repeat;pointer-events:none}.shelf-preview.has-wall{background:none!important}'
 +'#covStat{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(var(--dock,120px) + 70px);z-index:9999;background:rgba(20,22,40,.93);color:#fff;border:1px solid rgba(255,255,255,.2);padding:8px 14px;border-radius:999px;font-size:12px;display:none;pointer-events:none}#covStat.on{display:block}';
document.head.appendChild(st);
})();
