import {addDays} from './planner.js';
export function orderedHistory(history){return history.map((entry,index)=>({entry,index})).sort((a,b)=>a.entry.date.localeCompare(b.entry.date)||(typeof a.entry.savedAt==='string'?a.entry.savedAt:'').localeCompare(typeof b.entry.savedAt==='string'?b.entry.savedAt:'')||a.index-b.index).map(({entry})=>entry);}
export function trainingReview(history,sessions,today){
 const since=addDays(today,-13),recent=orderedHistory(history).filter(h=>h.date>=since&&h.date<=today);
 const latestStrength=recent.filter(h=>h.kind==='strength').at(-1);
 const next=sessions.filter(s=>s.kind==='strength'&&s.status==='planned'&&s.date>=today).sort((a,b)=>a.date.localeCompare(b.date))[0]||null;
 const discomfort=recent.filter(h=>h.discomfort).length,hard=recent.filter(h=>h.tooHard||h.feeling==='hard').length;
 let title='Let your record build.',message='Your last 14 days will appear here as you save sessions. No change is made without your review.',tone='neutral';
 if(recent.length){title='Your recent training';message='These totals include completed and partial sessions. A partial session records what happened without assuming why you stopped.';}
 if(latestStrength?.discomfort){title='You reported discomfort.';message='Your latest strength session included discomfort. An increase is paused. Review the movements in your setup before training again. A lighter plan does not assess or treat discomfort.';tone='attention';}
 else if(latestStrength?.tooHard||latestStrength?.feeling==='hard'){title='Give the next session a second look.';message='You marked your latest strength session as too hard. You can preview fewer sets for the next planned strength session. Exercises, repetition targets and rest stay the same.';tone='attention';}
 else if(latestStrength){title='Use your feedback for the next step.';message='Your latest strength session is recorded. Check the movement suggestions below, or preview a lighter session when you want less work. No increase happens automatically.';}
 return {since,recent:recent.length,completed:recent.filter(h=>h.status==='completed').length,partial:recent.filter(h=>h.status==='partial').length,hard,discomfort,latestStrength,next,title,message,tone};
}
export function exerciseTimeline(history,exerciseId){
 return orderedHistory(history).filter(h=>h.sets.some(s=>s.exerciseId===exerciseId)).reverse().map(h=>({id:h.id,date:h.date,title:h.title,status:h.status,discomfort:!!h.discomfort,tooHard:!!h.tooHard,sets:h.sets.filter(s=>s.exerciseId===exerciseId),target:h.prescription?.find(i=>i.exerciseId===exerciseId)||null}));
}
