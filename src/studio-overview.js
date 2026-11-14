import {exerciseById,GOALS} from './exercises.js';
import {addDays,dayOf,estimateSession} from './planner.js';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const label=(date,options={weekday:'long',day:'numeric',month:'short'})=>new Intl.DateTimeFormat('en-GB',{...options,timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
const shortNames={hinge:'Romanian deadlift','barbell-rdl':'Barbell RDL','floor-press':'Floor press',row:'Dumbbell row',press:'Shoulder press',bench:'Bench press','ball-curl':'Ball leg curl','band-bridge':'Band bridge'};
export function overviewSelection(session,preferredId,activeIndex=0){
 if(session?.kind!=='strength')return {item:null,exercise:exerciseById('march')};
 const item=session.items.find(i=>i.exerciseId===preferredId)||session.items[activeIndex]||session.items[0];
 return {item,exercise:exerciseById(item?.exerciseId)||null};
}
export function studioOverview({state,session,today,selectedId='',storageOK=true}){
 const profile=state.profile,upcoming=state.sessions.filter(s=>s.status==='planned').sort((a,b)=>a.date.localeCompare(b.date));
 const active=!!(state.active&&session&&state.active.sessionId===session.id),selection=overviewSelection(session,selectedId,active?state.active.index:0),e=selection.exercise;
 const minutes=s=>Math.ceil(s.kind==='run'?s.runMinutes:estimateSession(s)/60);
 const weekStart=addDays(today,-((dayOf(today)+6)%7)),recordedThisWeek=state.history.filter(h=>h.date>=weekStart&&h.date<addDays(weekStart,7)).length;
 const totalSets=state.history.reduce((n,h)=>n+h.sets.length,0),totalMinutes=Math.round(state.history.reduce((n,h)=>n+(h.durationSeconds||0),0)/60);
 const location=session?.kind==='run'?'outdoors':session?.location==='gym'?'at the gym':'at home';
 const movementRows=session?.kind==='strength'?session.items.map(i=>{const ex=exerciseById(i.exerciseId),name=shortNames[ex.id]||ex.name,units=ex.timed?'s':ex.unilateral?' each side':'';return `<li><button type="button" data-action="overview-exercise" data-id="${ex.id}" aria-pressed="${ex.id===e?.id}" aria-label="Preview ${escape(ex.name)}"><span>${escape(name)}</span><small>${i.sets} × ${i.reps}${units}</small></button></li>`;}).join(''):'';
 return `${!storageOK?'<div class="error">Browser saving is unavailable. Export a backup from Your setup before closing.</div>':''}${active?'<div class="welcome-banner"><p>You have a session in progress. Your recorded sets are saved.</p><button class="secondary" data-action="resume">Resume session</button></div>':''}
 <div class="studio-overview">
 <section class="studio-next" aria-labelledby="next-session-title">
 <div class="studio-next-copy"><h1 id="next-session-title">${session?escape(session.title):'Your block is complete.'}</h1>
 <p class="studio-session-context">${session?`${minutes(session)} minutes ${location}.<br>${escape(session.kind==='run'?session.note:label(session.date))}`:'Review your progress and create the next block from your current setup.'}</p>
 <div class="studio-next-actions">${session?`<button class="primary" data-action="open-session" data-id="${session.id}">${active?'Resume session':'Start session'}</button><button class="text-link" data-nav="schedule">View your week</button>`:'<button class="primary" data-nav="settings">Plan the next block</button>'}</div>
 ${movementRows?`<ol class="studio-movements" aria-label="Movements in your next session">${movementRows}</ol>`:session?.kind==='run'?`<div class="studio-running-note"><h2>Run at your pace.</h2><p>Walking and recovery are part of the session. Use a conversational effort.</p>${session.km?`<p>${session.km} km planned at your easy pace.</p>`:''}</div>`:'<p class="studio-complete-note">Your completed sessions remain in your training record.</p>'}
 </div>
 ${session?`<figure class="studio-guide"><canvas id="hero-model" role="img" aria-label="Rotatable movement illustration of ${escape(e?.name||'Brisk march')}. ${escape(e?.cues.join(' ')||'')}"></canvas><figcaption><button class="text-link" data-action="exercise-guide" data-id="${e?.id||'march'}" id="overview-movement-label">${escape(e?.name||'Brisk march')}</button><div class="studio-views"><button class="quiet-button" data-action="overview-front" aria-label="Front view of the session movement">Front</button><button class="quiet-button" data-action="overview-side" aria-label="Side view of the session movement">Side</button></div></figcaption></figure>`:''}
 </section>
 <nav class="studio-week" aria-label="Upcoming sessions">${upcoming.slice(0,3).map(s=>`<button data-action="open-session" data-id="${s.id}"><span>${label(s.date,{weekday:'long'})}<small>${label(s.date,{day:'numeric',month:'short'})}</small></span><span>${escape(s.title)}<small>${minutes(s)} min, ${s.kind==='run'?'outdoors':escape(s.location)}</small></span></button>`).join('')||'<p class="muted">No planned sessions remain.</p>'}</nav>
 <div class="studio-details"><section class="studio-record"><div class="section-head"><h2>Your record</h2><button class="text-link" data-nav="progress">View progress</button></div><p class="small muted">${recordedThisWeek} session${recordedThisWeek===1?'':'s'} recorded this week. ${profile.days.length} available training days.</p><dl class="studio-totals"><div><dt>Sessions</dt><dd>${state.history.length}</dd></div><div><dt>Sets logged</dt><dd>${totalSets}</dd></div><div><dt>Minutes recorded</dt><dd>${totalMinutes}</dd></div></dl></section>
 <section class="studio-plan"><div class="section-head"><h2>${escape(GOALS[profile.goal])}</h2><button class="text-link" data-nav="settings">Your setup</button></div><p class="small muted">${escape(state.planSummary)}</p><p class="small muted">${profile.dumbbellKg} kg per dumbbell. ${profile.days.length} days available.</p>${state.planWarnings.map(w=>`<p class="small muted">${escape(w)}</p>`).join('')}<button class="text-link" data-nav="library">Explore movement guides</button><p class="footer-note">Your records stay in this browser. Export a backup when switching devices.</p></section></div>
 </div>`;
}
