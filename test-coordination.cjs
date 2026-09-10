const assert=require('node:assert/strict'),{sets,evaluate}=require('./dist/conditions'),{assess,candidates}=require('./dist/scenes');
let n=0;
for(const s of sets.filter(s=>s.id.startsWith('info-')||s.id==='support-old')){
const good=Object.fromEntries(s.fields.map(f=>[f.id,f.type==='bool'?f.expected:f.type==='select'?f.accept[0]:f.min]));
for(const [careSetting,careMonth,state]of [['community','yes','fail'],['community','no','pass'],['community','','unknown'],['notCare','','pass'],['facility','no','unknown'],['','no','unknown']]){assert.equal(evaluate(s,{...good,careSetting,careMonth}).state,state,s.id);n++;}}
for(const id of ['provide1','provide2','before']){assert(assess(candidates.find(c=>c.id===id),{home:'care'}).unknown.some(x=>x.includes('給付調整')));n++;}
console.log('PASS: '+n+' benefit-coordination cases');
