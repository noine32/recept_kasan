const assert=require('node:assert/strict');
const {sets,evaluate,validDate}=require('./dist/conditions');
const data=require('./dist/data.json');
let checks=0;
function check(v){assert.ok(v);checks++;}
function set(id){return sets.find(s=>s.id===id);}
function result(id,a){return evaluate(set(id),a);}
function good(s){return Object.fromEntries(s.fields.map(f=>[f.id,f.type==='bool'?f.expected:f.type==='number'?Math.max(f.min,7):f.type==='date'?(f.after||'2026-09-08'):f.accept[0]]));}
for(const s of sets){check(data.rules.some(r=>r.id==='rule-'+s.rule));check(result(s.id,{}).state==='unknown');check(new Set(s.fields.map(f=>f.id)).size===s.fields.length);for(const f of s.fields.filter(f=>f.type==='bool'&&!f.when&&!f.outside)){const a=good(s);a[f.id]=f.expected==='yes'?'no':'yes';check(result(s.id,a).state==='fail');}}
const pack=good(set('support-pack'));
for(const [d,p] of [[1,34],[7,34],[8,68],[28,136],[42,204],[43,240],[90,240]]){const r=result('support-pack',{...pack,days:d});check(r.state==='pass'&&r.points===p);}
check(result('support-pack',{...pack,kinds:2,timing:'same'}).state==='fail');
check(result('support-pack',{...pack,kinds:2,timing:'different'}).state==='pass');
check(result('support-pack',{...pack,split:'yes'}).state==='unknown');
for(const v of ['',-1,'abc',2.5])check(result('support-pack',{...pack,days:v}).state==='unknown');
const residual=good(set('residual-post'));
check(result('residual-post',{...residual,amount:6}).state==='pass');
check(result('residual-post',{...residual,amount:6,exception:''}).state==='unknown');
check(result('residual-post',{...residual,amount:6,wait:'yes'}).state==='fail');
check(result('residual-post',{...residual,amount:7,wait:'yes'}).state==='pass');
check(result('residual-post',{...residual,zero:'all'}).state==='fail');
check(result('residual-post',{...residual,zero:'some',authority:'instruction'}).state==='fail');
check(result('residual-post',{...residual,zero:'some',authority:'inquiry'}).state==='pass');
const follow={...good(set('follow-k')),dispensed:'2026-08-01',followed:'2026-08-15',received:'2026-09-01'};
check(result('follow-k',follow).state==='pass');
for(const d of ['2026-08-01','2026-09-01','2026-07-31'])check(result('follow-k',{...follow,followed:d}).state==='fail');
check(!validDate('2026-02-30'));
check(result('poly-two',{...good(set('poly-two')),claim:'2027-05-31',capacity:4}).state==='fail');
check(result('poly-two',{...good(set('poly-two')),claim:'2027-06-01',capacity:4}).state==='pass');
check(result('poly-two',{...good(set('poly-two')),claim:'2027-06-01',capacity:5}).state==='fail');
const html=require('fs').readFileSync('dist/index.html','utf8');check(html.indexOf('./conditions.js')<html.indexOf('./workflows.js'));check(html.includes('./conditions.js'));
console.log(`PASS: ${checks} assertions; ${sets.length} pathways; ${sets.reduce((n,s)=>n+s.fields.length,0)} declared questions.`);
