import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultProfile,createPlan,estimateSession,progressionFor} from '../src/planner.js';
import {lighterSession,restoreLighterSession} from '../src/adaptation.js';
import {trainingReview,exerciseTimeline} from '../src/training-insights.js';
import {validState} from '../src/storage.js';
import {movementRecordHTML} from '../src/insights-view.js';
const fixture=()=>{const profile={...defaultProfile(),start:'2026-11-16'},plan=createPlan(profile);return {version:1,profile,sessions:plan.sessions,history:[],active:null,planSummary:plan.summary,planWarnings:plan.warnings};};
const history=(id,date,patch={})=>({id,date,sessionId:id,title:'Full body A',kind:'strength',status:'completed',discomfort:false,tooHard:false,feeling:'right',sets:[{id:id+'-set',exerciseId:'goblet',reps:12,kg:5,targetMax:12,effort:'more',band:null}],prescription:[{exerciseId:'goblet',sets:1}],...patch});
test('a lighter session reduces work without changing equipment, targets, rest, dates or the source',()=>{
 const source=fixture().sessions[0],before=structuredClone(source),result=lighterSession(source);
 assert.ok(result.removedSets>0);assert.deepEqual(source,before);assert.ok(estimateSession(result.session)<estimateSession(source));
 assert.equal(result.session.date,source.date);assert.equal(result.session.budget,source.budget);
 for(const [n,item] of result.session.items.entries()){assert.ok(item.sets>=1);assert.deepEqual({...item,sets:source.items[n].sets},source.items[n]);}
 assert.ok(lighterSession(result.session).error);
 assert.deepEqual(restoreLighterSession(result.session).session.items,source.items);
});
test('completed sessions, runs and sessions at minimum work cannot be reduced',()=>{
 const session=fixture().sessions[0];assert.ok(lighterSession({...session,status:'completed'}).error);assert.ok(lighterSession({...session,kind:'run'}).error);
 assert.ok(lighterSession({...session,items:session.items.map(item=>({...item,sets:1}))}).error);
});
test('restoration refuses to overwrite later edits or exceed the time budget',()=>{
 const lighter=lighterSession(fixture().sessions[0]).session;
 const changed=structuredClone(lighter);changed.items[0].reps++;assert.ok(restoreLighterSession(changed).error);
 const shorter=structuredClone(lighter);shorter.budget=Math.floor(estimateSession(lighter)/60);assert.ok(restoreLighterSession(shorter).error);
 assert.ok(restoreLighterSession({...lighter,status:'partial'}).error);
});
test('lighter plans survive backups, preserve history, and reject malformed restore data',()=>{
 const state=fixture(),past=history('past','2026-11-10',{durationSeconds:1500,note:'',actualKm:null,prescription:state.sessions[0].items});state.history.push(past);
 const before=structuredClone(state.history);state.sessions[0]=lighterSession(state.sessions[0]).session;
 assert.equal(validState(JSON.parse(JSON.stringify(state))),true);assert.deepEqual(state.history,before);
 const corrupt=structuredClone(state);corrupt.sessions[0].adjustment.originalItems[0].exerciseId='unknown';assert.equal(validState(corrupt),false);
 const missing=structuredClone(state);missing.sessions[0].adjustment.adjustedItems=[];assert.equal(validState(missing),false);
});
test('the review uses a bounded 14 day window and does not interpret partial work as hard effort',()=>{
 const records=[history('old','2026-10-29'),history('edge','2026-10-30'),history('partial','2026-11-12',{status:'partial'}),history('future','2026-11-13')];
 const review=trainingReview(records,fixture().sessions,'2026-11-12');assert.equal(review.recent,2);assert.equal(review.completed,1);assert.equal(review.partial,1);assert.equal(review.hard,0);assert.equal(review.discomfort,0);assert.equal(review.next.date,'2026-11-16');
});
test('recent discomfort takes priority over offering fewer sets as a recovery answer',()=>{
 const review=trainingReview([history('pain','2026-11-12',{discomfort:true,tooHard:true})],fixture().sessions,'2026-11-12');
 assert.match(review.title,/discomfort/);assert.match(review.message,/does not assess or treat/);
});
test('review feedback uses the latest strength session even when a backup is out of order',()=>{
 const earlier=history('hard','2026-11-10',{tooHard:true}),later=history('right','2026-11-12');
 const review=trainingReview([later,earlier],fixture().sessions,'2026-11-12');assert.equal(review.latestStrength.id,'right');assert.equal(review.hard,1);assert.doesNotMatch(review.title,/second look/);
 const running=trainingReview([history('hard','2026-11-10',{tooHard:true}),history('run','2026-11-12',{kind:'run'})],[],'2026-11-12');assert.match(running.title,/second look/);assert.equal(running.next,null);
});
test('a prescribed movement with no recorded sets blocks progression from older successes',()=>{
 const first=history('one','2026-11-08'),second=history('two','2026-11-10');assert.equal(progressionFor('goblet',[first,second]).ready,true);
 assert.equal(progressionFor('goblet',[first,second,history('stopped','2026-11-12',{status:'partial',discomfort:true,sets:[]})]).ready,false);
 assert.equal(progressionFor('goblet',[first,second,history('missed','2026-11-12',{status:'partial',sets:[]})]).ready,false);
});
test('movement timelines keep actual loads, efforts and partial records, without combining exercises',()=>{
 const first=history('one','2026-11-08'),second=history('two','2026-11-10',{status:'partial'});second.sets.push({...second.sets[0],exerciseId:'hinge'});
 const before=structuredClone([second,first]),timeline=exerciseTimeline([second,first],'goblet');assert.deepEqual(timeline.map(row=>row.id),['two','one']);assert.equal(timeline[0].sets.length,1);assert.equal(timeline[0].status,'partial');assert.equal(timeline[0].sets[0].kg,5);assert.deepEqual([second,first],before);
});
test('movement records escape imported band labels and distinguish timed and single side units',()=>{
 const records=[history('band','2026-11-12')];records[0].sets[0].band='<script>bad</script>';
 const html=movementRecordHTML(records,'goblet');assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));
 const timed=[history('hold','2026-11-12',{sets:[{exerciseId:'sideplank',reps:20,kg:0,effort:'unsure'}],prescription:[]})];const hold=movementRecordHTML(timed,'sideplank');assert.ok(hold.includes('20 seconds per side'));assert.ok(hold.includes('Bodyweight'));assert.ok(hold.includes('Effort not sure'));
});
