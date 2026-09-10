const assert=require('node:assert/strict'),{sets,evaluate}=require('./dist/conditions.js');let n=0;
for(const id of ['home-planned','home-urgent1','home-urgent2']){
 const s=sets.find(x=>x.id===id);const base=Object.fromEntries(s.fields.map(f=>[f.id,f.type==='bool'?f.expected:f.type==='select'?f.accept[0]:'1']));base.performer='cooperator';
 const check=(over,want)=>{assert.equal(evaluate(s,{...base,...over}).state,want,id+JSON.stringify(over));n++;};
 check({},'pass');check({rxPharmacy:'cooperator'},'pass');
 for(const f of ['sharedPlan','priorConsent','unavoidable','sharedRecord','mainReport','summaryVisit','agreement','mainClaim'])check({[f]:'no'},'fail');
 check({rxPharmacy:'cooperator',dispensingClaim:'no'},'fail');check({rxPharmacy:'main',dispensingClaim:'no'},'pass');check({rxPharmacy:'other'},'unknown');check({performer:''},'unknown');check({performer:'main',priorConsent:'no',sharedPlan:'no',rxPharmacy:'other'},'pass');check({month:5},'fail');
}
console.log('PASS: '+n+' cooperative visit cases');
