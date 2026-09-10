'use strict';
(() => {
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Keep numbered clauses and table-like rows separate; join PDF line wrapping only.
const start=s=>/^(?:[（(][0-9０-９アイウエオカキクケコサシスセソイロハニホヘト]+[）)]|[0-9０-９]+[.．、\s]|[アイウエオカキクケコサシスセソイロハニホヘト][\s　]|区分|第[0-9０-９一二三四五六七八九十]+|[問答][\s0-9０-９]|[【●○・■])/.test(s);
function blocks(text){const out=[];let current='';const flush=()=>{if(current){out.push({text:current,table:false});current='';}};for(const raw of String(text??'').replace(/\r\n?/g,'\n').split('\n')){const line=raw.trim();if(!line){flush();continue;}const table=/\S[ \t　]{3,}\S/.test(line)&&!start(line);if(table){flush();out.push({text:raw,table:true});continue;}if(start(line))flush();const space=/[a-zA-Z]$/.test(current)&&/^[a-zA-Z]/.test(line)?' ':'';current+=current?space+line:line;}flush();return out;}
function isTable(text){return (String(text).match(/[○◯×]/g)||[]).length>=8;}
function render(text,source={}){
const combination=source.id==='rule-60'||(/001713883/.test(source.url||'')&&[67,68].includes(source.page));
let visual='';const qa=typeof window!=='undefined'?window.DispensingQA:null;if(qa&&source.doc===qa.doc&&qa.pages.includes(source.page))return `<h4>${escape(qa.title)}</h4><p class="hint">PDF8～9ページをまたぐ問3を、まとめて表示しています。</p>`+render(qa.text)+`<a href="${qa.url}" target="_blank" rel="noopener">問3の原PDFを確認</a><details><summary>このページ全体の抽出文</summary><div class="source-text">${escape(text)}</div></details>`;
if(combination)visual='<p class="notice">併算定表は列見出し・行項目・脚注を含む原本全体で確認してください。画像は横スクロールでき、クリックすると拡大できます。</p>'+[67,68].map(p=>`<figure class="table-original"><figcaption>別表１ ${p===67?'列見出しと本表':'続き・脚注（列の順序は前ページと同じ）'}／PDF ${p}ページ</figcaption><a href="./tables/combination-${p}.webp" target="_blank" rel="noopener"><img loading="lazy" src="./tables/combination-${p}.webp" alt="服薬管理指導料等と他の薬学管理料の併算定表・原本${p}ページ。詳細は原PDFでも確認できます"></a></figure>`).join('');
else if(isTable(text)&&/^https:\/\/www\.mhlw\.go\.jp\//.test(source.url||''))visual=`<p class="notice">このページには表が含まれます。○×の抽出文だけでは列との対応が分からないため、見出し・注記を含む原PDFで確認してください。</p><a class="source-link" href="${escape(source.url)}" target="_blank" rel="noopener">表全体を原PDFで開く（${source.page||''}ページ）</a><object class="source-pdf" data="${escape(source.url)}" type="application/pdf"><p>PDF表示に対応していない環境では、上のリンクで表全体を開いてください。</p></object>`;
if(visual)return visual+`<details class="source-original"><summary>検索用の抽出テキスト（表の対応関係は原本を確認）</summary><div class="source-text">${escape(text)}</div></details>`;
return `<div class="source-text source-readable">${blocks(text).map(b=>b.table?`<div class="source-table-line">${escape(b.text)}</div>`:`<p>${escape(b.text)}</p>`).join('')}</div><details class="source-original"><summary>抽出時の改行で表示</summary><div class="source-text">${escape(text)}</div></details>`;}
if(typeof module!=='undefined'&&module.exports){module.exports={blocks,render,isTable};return;}window.SourceText={blocks,render,isTable};
})();
