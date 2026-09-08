'use strict';
(()=>{
const norm=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/\s+/g,'').replace(/頓/g,'屯');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function mapped(text){let normalized='',map=[];let offset=0;for(const c of text){const n=norm(c);normalized+=n;for(let i=0;i<n.length;i++)map.push([offset,offset+c.length]);offset+=c.length;}return {normalized,map};}
function ranges(text,query){const {normalized,map}=mapped(text),found=[];for(const term of query.trim().split(/\s+/).map(norm).filter(Boolean)){let start=0;while((start=normalized.indexOf(term,start))!==-1){found.push([map[start][0],map[start+term.length-1][1]]);start+=term.length;}}return found.sort((a,b)=>a[0]-b[0]);}
function highlight(text,query){const merged=[];for(const r of ranges(text,query)){const last=merged.at(-1);if(last&&r[0]<=last[1])last[1]=Math.max(last[1],r[1]);else merged.push([...r]);}let html='',pos=0;for(const [a,b]of merged){html+=esc(text.slice(pos,a))+'<mark>'+esc(text.slice(a,b))+'</mark>';pos=b;}return html+esc(text.slice(pos));}
function excerpt(text,query){const rs=ranges(text,query);if(query.trim()&&!rs.length)return {text:'',matched:false};const hit=rs[0]?.[0]??0;let begin=text.lastIndexOf('。',hit-1)+1;let end=text.indexOf('。',rs[0]?.[1]??hit);end=end<0?text.length:end+1;let clippedStart=false,clippedEnd=false;if(hit-begin>350){begin=hit-150;clippedStart=true;}if(end-begin>900){end=Math.max(begin+900,rs[0]?.[1]??0);clippedEnd=true;}return {text:text.slice(begin,end).trim(),matched:rs.length>0,clippedStart,clippedEnd,pageStart:begin===0};}
function title(page,doc){return `${doc?.title||'公式資料'} ／ PDF ${page.page}ページ`;}
const api={ranges,highlight,excerpt,title};if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}window.SearchDisplay=api;
})();
