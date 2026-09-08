const assert=require('node:assert/strict'),fs=require('node:fs');
const {topics,matchTopics,selection}=require('./dist/workflows.js');
const {recognizes,assess,candidates}=require('./dist/scenes.js');
const d=JSON.parse(fs.readFileSync('./dist/data.json','utf8'));
assert.equal(topics.length,15);
for(const t of topics)for(let i=-1;i<(t.options?.length||0);i++){
  const s=selection(t,i);
  for(const id of s.rules)assert(d.rules.some(r=>r.id==='rule-'+id),`${t.id}:rule-${id}`);
  for(const id of s.cases)assert(d.cases.some(c=>c.id==='case-'+id),`${t.id}:case-${id}`);
}
const examples=[['残薬を6日分調整した','residual'],['疑義照会したが処方は変わらなかった','inquiry'],['持参薬を一包化した','support'],['吸入方法を教えた','inhalation'],['電話で副作用を確認した','follow'],['ハイリスク薬の用量変更','highrisk'],['ＲＭＰ資材を使って説明した','selection'],['子どもの体重を確認した','children'],['急変で緊急訪問した','home'],['6種類から減薬を提案した','poly'],['錠剤を粉砕した','compound'],['胃ろうの簡易懸濁を指導した','tube'],['日曜に調剤した','time'],['リフィル処方を受け付けた','split'],['オンラインで指導した','facility']];
for(const [query,id] of examples)assert.equal(matchTopics(query)[0]?.id,id,query);
const multiple=matchTopics('残薬を調整して一包化した').map(t=>t.id);
assert(multiple.includes('residual')&&multiple.includes('support'));
assert.equal(matchTopics('退院時サマリを使って病院へ情報提供した').length,0);
assert(recognizes('退院時サマリを使って病院へ情報提供した'));
assert.equal(matchTopics('zzzz').length,0);
assert.equal(matchTopics('').length,0);
assert.deepEqual(selection(topics.find(t=>t.id==='inquiry'),1).cases,[13,20]);
assert.equal(d.cases.find(c=>c.id==='case-13').result,'対象外');
assert.equal(assess(candidates.find(c=>c.id==='joint'),{timing:'after',action:'report'}).mismatch.length,2);
const html=fs.readFileSync('dist/index.html','utf8');
for(const m of html.matchAll(/(?:src|href)="\.\/([^"]+)"/g))assert(fs.existsSync('dist/'+m[1]));
console.log('PASS: 15 routes; every rule/case reference; mixed tasks; excluded cases; discharge regression; asset paths.');
