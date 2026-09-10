const assert=require('node:assert/strict');const {buildingCategory,sets,evaluate}=require('./dist/conditions.js');let n=0;
for(const [patients,homes,want] of [[1,1,1],[2,19,1],[2,20,1],[3,20,2],[3,29,2],[3,30,1],[9,30,2],[10,30,3],[10,100,1],[2,1,1],[0,20,null]]){assert.equal(buildingCategory({method:'building',patients,homes}),want);n++;}
for(const [units,unitPatients,want] of [[1,1,1],[3,9,2],[3,10,3],[4,1,null]]){assert.equal(buildingCategory({method:'unit',units,unitPatients}),want);n++;}
assert.equal(buildingCategory({method:'household'}),1);n++;
const s=sets.find(s=>s.id==='home-building');const a={medical:'yes',countScope:'yes',method:'building',patients:3,homes:30};
for(const [over,want] of [[{},'pass'],[{homes:''},'unknown'],[{medical:'no'},'fail'],[{method:'household',sameHousehold:''},'unknown'],[{method:'household',sameHousehold:'yes'},'pass'],[{method:'unit',units:4,unitPatients:1},'unknown']]){assert.equal(evaluate(s,{...a,...over}).state,want);n++;}
console.log('PASS: '+n+' building count and exception cases');
