import test from 'node:test';
import assert from 'node:assert/strict';
import {studioOverview,overviewSelection} from '../src/studio-overview.js';
import {defaultProfile,createPlan} from '../src/planner.js';
const example=()=>{const profile={...defaultProfile(),start:'2026-11-16'},plan=createPlan(profile);return {profile,sessions:plan.sessions,history:[],active:null,planSummary:plan.summary,planWarnings:plan.warnings};};
test('overview preview selection stays within the actual session and falls back to the active movement',()=>{
 const state=example(),session=state.sessions[0];
 assert.equal(overviewSelection(session,'floor-press').exercise.id,'floor-press');
 assert.equal(overviewSelection(session,'leg-press',1).item,session.items[1]);
 assert.equal(overviewSelection(session,'',900).item,session.items[0]);
 assert.equal(overviewSelection({kind:'run'},'goblet').exercise.id,'march');
 assert.equal(overviewSelection(null,'goblet').item,null);
});
test('Forest overview presents real prescriptions and totals without altering training data',()=>{
 const state=example();state.history=[{date:'2026-11-14',durationSeconds:900,sets:[{},{}]}];
 const before=structuredClone(state),html=studioOverview({state,session:state.sessions[0],today:'2026-11-14'});
 assert.equal((html.match(/data-action="overview-exercise"/g)||[]).length,state.sessions[0].items.length);
 assert.match(html,/2 × 10/);assert.match(html,/<dd>1<\/dd>/);assert.match(html,/<dd>2<\/dd>/);assert.match(html,/<dd>15<\/dd>/);
 assert.match(html,/data-action="open-session"/);assert.match(html,/data-nav="progress"/);assert.deepEqual(state,before);
});
test('running and completed plans retain suitable actions without invented strength rows',()=>{
 const state=example();state.profile.goal='running';state.sessions=[{id:'run-1',title:'Easy run',kind:'run',date:'2026-11-16',status:'planned',runMinutes:30,km:3,note:'Run and walk at a conversational effort.',location:'home'}];
 const running=studioOverview({state,session:state.sessions[0],today:'2026-11-14',selectedId:'goblet'});
 assert.match(running,/30 minutes outdoors/);assert.match(running,/data-id="march"/);assert.doesNotMatch(running,/data-action="overview-exercise"/);
 state.sessions=[];const complete=studioOverview({state,session:null,today:'2026-11-14'});
 assert.match(complete,/Your block is complete/);assert.match(complete,/Plan the next block/);assert.doesNotMatch(complete,/id="hero-model"/);
});
test('profile text remains escaped and an active session keeps its resume action',()=>{
 const state=example();state.planSummary='<img src=x onerror=alert(1)>';state.planWarnings=['<script>alert(1)</script>'];state.active={sessionId:state.sessions[0].id,index:1};
 const html=studioOverview({state,session:state.sessions[0],today:'2026-11-14',storageOK:false});
 assert.match(html,/&lt;img/);assert.match(html,/&lt;script/);assert.doesNotMatch(html,/<script>/);assert.match(html,/Resume session/);assert.match(html,/Browser saving is unavailable/);assert.match(html,/Dumbbell Romanian deadlift/);
});
test('the weekly overview excludes records dated in another training week',()=>{
 const state=example();state.history=[{date:'2026-11-08',durationSeconds:60,sets:[]},{date:'2026-11-14',durationSeconds:60,sets:[]},{date:'2026-11-16',durationSeconds:60,sets:[]}];
 const html=studioOverview({state,session:state.sessions[0],today:'2026-11-14'});
 assert.match(html,/1 session recorded this week/);assert.match(html,/<dd>3<\/dd>/);
});
