// Build a standalone HTML slideshow from the Slides artifact files.
// usage: node build-deck.js <liveDir> <budgetFile> <outFile>
const fs = require('fs'), path = require('path');
const [liveDir, budgetFile, outFile] = process.argv.slice(2);
const deck = JSON.parse(fs.readFileSync(path.join(liveDir, 'project/deck.json'), 'utf8'));
const css = fs.readFileSync(path.join(liveDir, 'project/deck.css'), 'utf8');
const slides = deck.order.map(id => {
  const f = id === 'budget' ? budgetFile : path.join(liveDir, 'project/slides', id + '.html');
  return fs.readFileSync(f, 'utf8').replace(/<aside>[\s\S]*?<\/aside>/g, '');
}).join('\n');
const fontHref = Object.values(deck.faces)[0].href;
const html = `<!doctype html>
<html lang="vi"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${deck.title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fontHref}">
<style>
html,body{margin:0;height:100%;background:#0B1712;overflow:hidden}
*{box-sizing:border-box}
h1,h2,h3,p,ol,ul{margin:0}
#stage{position:absolute;left:50%;top:50%;width:1920px;height:1080px;transform-origin:0 0}
#stage>section{position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden;display:none}
#stage>section.on{display:flex}
x-shape{display:block;flex:none}
x-shape[kind=ellipse]{border-radius:50%}
x-shape[kind=arrow-right]{clip-path:polygon(0 30%,60% 30%,60% 0,100% 50%,60% 100%,60% 70%,0 70%)}
x-icon{display:block;flex:none}
x-icon svg{width:100%;height:100%;display:block}
table{border-collapse:collapse}
th,td{padding:.35em .6em;text-align:left;border-bottom:1px solid rgba(16,35,28,.15)}
th{font-weight:700}
#bar{position:fixed;left:0;right:0;bottom:0;display:flex;justify-content:center;align-items:center;gap:16px;padding:10px;font:600 15px 'Be Vietnam Pro',Arial,sans-serif;color:#BFD3C6;background:linear-gradient(transparent,rgba(0,0,0,.55));z-index:9}
#bar button{background:#C8F04A;color:#10231C;border:0;border-radius:999px;width:40px;height:40px;font-size:20px;cursor:pointer}
${css}
</style></head><body>
<div id="stage">
${slides}
</div>
<div id="bar"><button id="prev" aria-label="Trang trước">‹</button><span id="num"></span><button id="next" aria-label="Trang sau">›</button></div>
<script>
const ICONS={Warning:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',Chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',Star:'<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2"/></svg>'};
document.querySelectorAll('x-icon').forEach(e=>{e.innerHTML=ICONS[e.getAttribute('name')]||''});
const S=[...document.querySelectorAll('#stage>section')];let i=0;
const h=parseInt(location.hash.replace('#slide-',''));if(h>0&&h<=S.length)i=h-1;
function fit(){const st=document.getElementById('stage');const k=Math.min(innerWidth/1920,innerHeight/1080);st.style.transform='scale('+k+') translate(-50%,-50%)';st.style.transformOrigin='0 0';st.style.left='50%';st.style.top='50%';st.style.transform='translate(-50%,-50%) scale('+k+')';st.style.transformOrigin='center center';}
function show(n){i=Math.max(0,Math.min(S.length-1,n));S.forEach((s,j)=>s.classList.toggle('on',j===i));document.getElementById('num').textContent=(i+1)+' / '+S.length;history.replaceState(null,'','#slide-'+(i+1));}
addEventListener('resize',fit);fit();show(i);
document.getElementById('prev').onclick=()=>show(i-1);document.getElementById('next').onclick=()=>show(i+1);
addEventListener('keydown',e=>{if(['ArrowRight','PageDown',' '].includes(e.key))show(i+1);if(['ArrowLeft','PageUp'].includes(e.key))show(i-1);});
let x0=null;addEventListener('touchstart',e=>x0=e.touches[0].clientX);addEventListener('touchend',e=>{if(x0==null)return;const d=e.changedTouches[0].clientX-x0;if(Math.abs(d)>40)show(i+(d<0?1:-1));x0=null;});
</script>
</body></html>`;
fs.writeFileSync(outFile, html);
console.log('wrote', outFile, html.length, 'bytes,', deck.order.length, 'slides');
