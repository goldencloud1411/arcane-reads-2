/* Arcane Reads v2.9.13 — "Lo próximo" pasa al final de la pestaña Libros */
(function(){
const _rb=renderBooks;
renderBooks=function(){
  const w=_rb();
  const s=[...w.querySelectorAll('section')].find(x=>{const h=x.querySelector('h2');return h&&h.textContent.trim().startsWith('Lo próximo')});
  if(s)w.appendChild(s);
  return w};
})();
