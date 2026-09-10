const assert=require('node:assert/strict'),{sets,evaluate}=require('./dist/conditions');let n=0;
for(const id of ['narcotic-out','child-out','special-child-out','k-visit','facility-support','specific3-rmp','specific3-selection','specific3-shortage','specific3-bio','narcotic-home','continuous-home','infant-home','special-home','tpn-home']){
const s=sets.find(s=>s.id===id);assert(s);const a=Object.fromEntries(s.fields.map(f=>[f.id,f.type==='bool'?f.expected:f.accept[0]]));assert.equal(evaluate(s,a).state,'pass');n++;
for(const f of s.fields.filter(f=>f.type==='bool'&&!f.outside)){assert.equal(evaluate(s,{...a,[f.id]:f.expected==='yes'?'no':'yes'}).state,'fail',id+':'+f.id);n++;}
}
const {restrictions}=require('./dist/coverage');for(const [a,b]of [[28,29],[44,45],[42,43]])assert(restrictions.some(r=>r[0]===a&&r[1]===b));
console.log('PASS: '+n+' pharmacy pathway checks; pediatric / narcotic conflicts present');
