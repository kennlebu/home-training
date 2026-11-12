import {estimateSession,addDays,uid} from './planner.js';
export function shortenSession(session,budget,logged=[]){if(session.kind!=='strength')return {error:'A running session has a planned interval sequence. You can finish early and save it as partial.'};if(budget<15||budget>session.budget)return {error:'Choose a shorter time between 15 minutes and the current session length.'};const copy=structuredClone(session);copy.budget=budget;copy.originalItems??=structuredClone(session.items);const counts=copy.items.map((_,n)=>logged.filter(s=>s.itemIndex===n).length);
 while(estimateSession(copy)>budget*60){let changed=false;for(let n=copy.items.length-1;n>=0;n--){if(copy.items[n].sets>Math.max(1,counts[n])){copy.items[n].sets--;changed=true;break;}}if(!changed)return {error:'The remaining movements and suitable rest do not fit that slot. Choose more time, or save a partial session.'};}
 return {session:copy};
}
export function repeatRunningWeek(sessions,source,raceDate){const sameWeek=sessions.filter(x=>x.kind==='run'&&x.goal===source.goal&&x.week===source.week);if(!sameWeek.length)return {error:'This running week could not be found.'};const end=sameWeek.map(x=>x.date).sort().at(-1);const following=sessions.filter(x=>x.kind==='run'&&x.status==='planned'&&x.date>end);const dates=following.map(x=>addDays(x.date,7)).concat(sameWeek.map(x=>addDays(x.date,7)));if(source.goal==='marathon'&&dates.some(d=>d>=raceDate))return {error:'A repeat would move training into your race week. Revise the race plan or race date instead.'};if(new Set(dates).size!==dates.length)return {error:'A repeat would overlap sessions. Review your schedule first.'};const result=structuredClone(sessions);for(const x of result)if(following.some(f=>f.id===x.id))x.date=addDays(x.date,7);for(const x of sameWeek){const copy=structuredClone(x);copy.id=uid();copy.date=addDays(x.date,7);copy.week=`${source.week} repeat`;copy.status='planned';result.push(copy);}return {sessions:result};}

export function lighterSession(session){
 if(session.kind!=='strength'||session.status!=='planned')return {error:'Only a planned strength session can be made lighter.'};
 if(session.adjustment)return {error:'This session already has a lighter plan. Restore it before making another change.'};
 const copy=structuredClone(session),originalItems=structuredClone(session.items);
 copy.items=copy.items.map(item=>({...item,sets:Math.max(1,item.sets-1)}));
 if(copy.items.every((item,n)=>item.sets===originalItems[n].sets))return {error:'Every movement already has one set. Keep this plan, move it to another day, or save a partial session if you finish early.'};
 copy.adjustment={kind:'lighter',originalItems,adjustedItems:structuredClone(copy.items),appliedAt:new Date().toISOString()};
 copy.seconds=estimateSession(copy);copy.fits=copy.seconds<=copy.budget*60;
 return {session:copy,removedSets:originalItems.reduce((n,item,i)=>n+item.sets-copy.items[i].sets,0)};
}
export function restoreLighterSession(session){
 if(session.kind!=='strength'||session.status!=='planned'||session.adjustment?.kind!=='lighter')return {error:'There is no lighter plan to restore for this session.'};
 if(JSON.stringify(session.items)!==JSON.stringify(session.adjustment.adjustedItems))return {error:'This session changed after it was made lighter. Review its current movements rather than replacing those changes.'};
 const copy=structuredClone(session);copy.items=structuredClone(copy.adjustment.originalItems);delete copy.adjustment;
 copy.seconds=estimateSession(copy);copy.fits=copy.seconds<=copy.budget*60;
 if(!copy.fits)return {error:'The previous sets no longer fit this time slot. Allow more time before restoring them.'};
 return {session:copy};
}
