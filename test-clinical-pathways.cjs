const assert=require('node:assert/strict');
const {sets,evaluate}=require('./dist/conditions');
function setup(id){const s=sets.find(s=>s.id===id);const a=Object.fromEntries(s.fields.map(f=>[f.id,f.type==='bool'?f.expected:f.type==='select'?f.accept[0]:f.type==='date'?'2026-09-08':f.min]));return {s,a};}
let n=0;
function check(id,changes,state){const {s,a}=setup(id);assert.equal(evaluate(s,{...a,...changes}).state,state,id+JSON.stringify(changes));n++;}
for(const id of ['follow-diabetes','follow-heart']){
 const dates={dispensed:'2026-09-01',followed:'2026-09-08'};
 check(id,dates,'pass');
 check(id,{...dates,followed:'2026-09-01'},'fail');
 check(id,{...dates,followed:'2026-08-31'},'fail');
 check(id,{...dates,followed:''},'unknown');
 check(id,{...dates,nextRx:'same'},'fail');
 for(const nextRx of ['advised','other'])check(id,{...dates,nextRx},'pass');
 check(id,{...dates,month:'yes'},'fail');
 check(id,{...dates,facility:'no'},'fail');
}
check('follow-diabetes',{dispensed:'2026-09-01',followed:'2026-09-08',target:'unchanged'},'fail');
for(const id of ['inhalation-chronic','inhalation-flu']){
 check(id,{},'pass');check(id,{interval:'same'},'fail');check(id,{interval:'other'},'pass');check(id,{request:'none'},'fail');check(id,{sameReport:'yes'},'fail');check(id,{action:'no'},'fail');
}
check('highrisk-changed',{reason:'status'},'pass');check('highrisk-changed',{reason:'none'},'fail');check('highrisk-new',{reason:'no'},'fail');
check('follow-cancer',{method:'visit'},'pass');check('follow-cancer',{method:'none'},'fail');check('follow-cancer',{institution:'no'},'fail');
check('poly-one',{month:'yes'},'fail');check('poly-one',{written:'no'},'fail');
for(const id of ['subjective','objective','life','effects','problems','plan'])check('poly-two',{claim:'2027-06-01',[id]:'no'},'fail');
console.log(`PASS: ${n} clinical branch cases.`);
