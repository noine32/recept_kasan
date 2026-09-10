const assert=require('node:assert/strict'),{restrictions,pairs,assessPair}=require('./dist/coverage'),{sets,evaluate}=require('./dist/conditions'),d=require('./dist/data.json');
let n=0;
for(const r of restrictions){for(const id of [r[0],r[1],r[3]])assert(d.rules.some(s=>s.id==='rule-'+id));for(const ids of [[r[0],r[1]],[r[1],r[0]]]){const p=pairs(ids)[0];assert.equal(assessPair(p,'same').state,'fail');assert.equal(assessPair(p,'different').state,'unknown');assert.equal(assessPair(p,'').state,'unknown');n+=3;}}
assert.equal(assessPair(pairs([17,18])[0],'same').state,'unknown');n++;
for(const id of ['home-doctor','home-multiple']){const s=sets.find(s=>s.id===id),a=Object.fromEntries(s.fields.map(f=>[f.id,f.type==='bool'?f.expected:f.accept[0]]));assert.equal(evaluate(s,a).state,'pass');assert.equal(evaluate(s,{...a,basis:'other'}).state,'fail');assert.equal(evaluate(s,{...a,joint:'yes'}).state,'fail');assert.equal(evaluate(s,{...a,transition:'yes'}).state,'fail');assert.equal(evaluate(s,{...a,basis:'care'}).state,'pass');n+=5;}
console.log('PASS: '+n+' cross-billing and home-visit cases');
