const assert=require('node:assert/strict');
const {sets,evaluate}=require('./dist/conditions.js');
let count=0;
function check(id,over,state){const s=sets.find(s=>s.id===id),a=Object.fromEntries(s.fields.map(f=>[f.id,f.type==='bool'?f.expected:f.type==='select'?f.accept[0]:'0']));Object.assign(a,over);assert.equal(evaluate(s,a).state,state,id+JSON.stringify(over));count++;}
for(const [day,hour,minute,state] of [['weekday',18,59,'fail'],['weekday',19,0,'pass'],['saturday',12,59,'fail'],['saturday',13,0,'pass'],['weekday',7,59,'pass'],['weekday',8,0,'fail'],['holiday',12,0,'pass'],['holiday',24,0,'unknown']])check('time-night',{day,hour,minute},state);
for(const [hour,minute,state] of [[21,59,'fail'],[22,0,'pass'],[5,59,'pass'],[6,0,'fail'],[22,60,'unknown']])check('time-midnight',{hour,minute},state);
check('time-midnight',{hour:23,route:'ordinary'},'fail');check('time-holiday',{hour:12},'pass');check('time-holiday',{hour:22},'fail');check('time-holiday',{hour:12,route:'ordinary'},'fail');check('time-outside',{routine:'yes'},'fail');check('time-special',{hour:20},'pass');check('time-special',{hour:22},'fail');check('time-night',{day:'holiday',higher:'yes'},'fail');check('time-midnight',{hour:23,specialCharge:'yes'},'fail');check('time-night',{day:'',hour:19},'unknown');
console.log('PASS: '+count+' time boundaries and eligibility cases');
