'use strict';
(() => {
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Keep numbered clauses and table-like rows separate; join PDF line wrapping only.
const start=s=>/^(?:[（(][0-9０-９アイウエオカキクケコサシスセソイロハニホヘト]+[）)]|[0-9０-９]+[.．、\s]|[アイウエオカキクケコサシスセソイロハニホヘト][\s　]|区分|第[0-9０-９一二三四五六七八九十]+|[問答][\s0-9０-９]|[【●○・■])/.test(s);
function blocks(text){const out=[];let current='';const flush=()=>{if(current){out.push({text:current,table:false});current='';}};for(const raw of String(text??'').replace(/\r\n?/g,'\n').split('\n')){const line=raw.trim();if(!line){flush();continue;}const table=/\S[ \t　]{3,}\S/.test(line)&&!start(line);if(table){flush();out.push({text:raw,table:true});continue;}if(start(line))flush();const space=/[a-zA-Z]$/.test(current)&&/^[a-zA-Z]/.test(line)?' ':'';current+=current?space+line:line;}flush();return out;}
function render(text){return `<div class="source-text source-readable">${blocks(text).map(b=>b.table?`<div class="source-table-line">${escape(b.text)}</div>`:`<p>${escape(b.text)}</p>`).join('')}</div><details class="source-original"><summary>抽出時の改行で表示</summary><div class="source-text">${escape(text)}</div></details>`;}
if(typeof module!=='undefined'&&module.exports){module.exports={blocks,render};return;}window.SourceText={blocks,render};
})();
