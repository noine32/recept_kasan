const assert=require('node:assert/strict');const {sets,evaluate}=require('./dist/conditions');let n=0;
for(const s of sets.filter(s=>s.id.startsWith('info-')||s.id==='support-old')){
const a=Object.fromEntries(s.fields.map(f=>[f.id,f.type==='bool'?f.expected:f.type==='select'?f.accept[0]:f.min]));
for(const [careSetting,extra,state] of [
['hospital',{},'fail'],['roken',{},'fail'],['shortMedical',{shortRoom:'roken'},'fail'],['shortMedical',{shortRoom:'other'},'fail'],['shortMedical',{shortRoom:''},'unknown'],['shortMedical',{shortRoom:'careHospital'},'unknown'],['careHospital',{},'unknown'],['group',{careMonth:'yes'},'fail'],['specified',{careMonth:'yes'},'fail'],['group',{careMonth:'no'},'pass'],['tokuyo',{facilityNotice:''},'unknown'],['shortLife',{facilityNotice:'no'},'unknown'],['tokuyo',{facilityNotice:'yes',careMonth:'yes'},'pass'],['community',{careMonth:'',facilityNotice:'yes'},'unknown']]){assert.equal(evaluate(s,{...a,careSetting,...extra}).state,state,s.id+' '+careSetting);n++;}
const switched=evaluate(s,{...a,careSetting:'hospital',careMonth:'yes',shortRoom:'careHospital'});assert(!switched.results.some(r=>r.id==='careMonth'||r.id==='shortRoom'));n++;
}
console.log('PASS: '+n+' facility branches and hidden-answer isolation checks');
