'use strict';
(() => {
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sceneItems={provide1:[80],provide2:[81],joint:[79],transition:[86],before:[84],diabetes:[52],heart:[53]};
function forRule(data,id){return data.items.filter(x=>x.rules.includes(id));}
function forScene(data,id){return data.items.filter(x=>(sceneItems[id]||[]).includes(Number(x.id.replace('item-',''))));}
function chip(x){return `<span class="billing-chip"><span class="badge abbr">${esc(x.abbr||'略号未収録')}</span><span>${x.code?'制御コード '+esc(x.code):'元表の制御コードは空欄'}</span></span>`;}
function render(items){return items.map(chip).join('');}
function heading(title,items){return `<div class="billing-heading"><h3>${esc(title)}</h3>${items.length===1?chip(items[0]):items.length?'':'<span class="hint">略号・制御コード未収録</span>'}</div>${items.length>1?`<div class="billing-variants" aria-label="区分別の略号・制御コード">${items.map(x=>`<div class="billing-variant"><span>${esc(x.name)}</span>${chip(x)}${x.division?`<p class="hint">${esc(x.division)}</p>`:''}</div>`).join('')}</div>`:''}`;}
const api={forRule,forScene,render,heading};
if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}
window.BillingLabels=api;
})();
