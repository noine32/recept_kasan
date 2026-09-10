'use strict';
(() => {
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sceneItems={provide1:[80],provide2:[81],joint:[79],transition:[86],before:[84],diabetes:[52],heart:[53]};
function forRule(data,id){return data.items.filter(x=>x.rules.includes(id));}
function forScene(data,id){return data.items.filter(x=>(sceneItems[id]||[]).includes(Number(x.id.replace('item-',''))));}
function render(items){return `<section class="billing-labels" aria-label="元表の略号・制御コード"><p class="hint">元表の略号・制御コード（区分・関連加算を確認）</p>${items.length?items.map(x=>`<div class="billing-label-row"><div class="meta"><span class="badge abbr">${esc(x.abbr||'略号未収録')}</span><span>${x.code?'制御コード '+esc(x.code):'元表の制御コードは空欄'}</span></div><p>${esc(x.name)}</p>${x.division?`<p class="hint">${esc(x.division)}</p>`:''}</div>`).join(''):'<p class="hint">この候補の略号・制御コードは元表に未収録です。</p>'}</section>`;}
const api={forRule,forScene,render};
if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}
window.BillingLabels=api;
})();
