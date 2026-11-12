const nasm=(slug,videoId,changes)=>({provider:'National Academy of Sports Medicine (NASM)',url:`https://www.nasm.org/resource-center/exercise-library/${slug}`,checkedOn:'2026-11-12',changes,video:videoId?{provider:'YouTube',videoId,owner:'National Academy of Sports Medicine (NASM)',permission:'provider-embed',checkedOn:'2026-11-12',verification:'Linked by NASM. YouTube oEmbed returned the matching NASM title, owner and embed player.'}:null});
export const MOVEMENT_SOURCES={
 goblet:nasm('goblet-squat','nfX7IFK9UNI','Keep the dumbbell upright near the chest, heels steady and knee movement aligned with the feet.'),
 hinge:nasm('dumbbell-romanian-deadlift','V8Hdl1FiNt4','Use a hip-led hinge, a consistent trunk and neck line, and a close dumbbell path.'),
 bridge:nasm('floor-bridge','Z3cY3d3BBo4','Keep shoulders and feet supported while the hips rise.'),
 deadbug:nasm('dead-bug','bxn9FBrt4-A','Show opposite arm and leg reaches on both sides while keeping the trunk still.'),
 birddog:nasm('bird-dog','ZdAHe9_HeEw','Show both opposite-limb reaches, supporting hand and knee contact, and a stable trunk.'),
 plank:nasm('plank','mwlp75MS6Rg','Align the trunk and legs with elbows below the shoulders. Keep the hold still.'),
 pushup:nasm('push-up','WDIpL0pjun0','Keep hands and toes supported while the trunk moves with the press.'),
 sideplank:nasm('side-plank','44ND4bOB-T0','Show support through the lower forearm and both side choices.'),
 'ball-squat':{provider:'American Council on Exercise (ACE)',url:'https://www.acefitness.org/resources/everyone/exercise-library/69/stability-ball-wall-squats/',checkedOn:'2026-11-12',changes:'Keep the feet in front of the body and the ball against both the back and wall as it rolls.',video:null},
 'ball-curl':{provider:'American Council on Exercise (ACE)',url:'https://www.acefitness.org/resources/everyone/exercise-library/59/stability-ball-hamstring-curl/',checkedOn:'2026-11-12',changes:'Keep the shoulders supported and the heels on the moving ball.',video:null},
 split:{provider:'Catalyst Athletics',url:'https://www.catalystathletics.com/exercise/174/Split-Squat/',checkedOn:'2026-11-12',changes:'Use the split stance and knee bending as a movement reference. Our bodyweight variation does not reproduce the source’s barbell loading.',video:null},
};
MOVEMENT_SOURCES.goblet.video.equipmentNote='This video uses a kettlebell. Our illustration shows the dumbbell version.';
export const VIDEO_EMBED_POLICY={checkedOn:'2026-11-12',terms:'https://www.youtube.com/t/terms',guidance:'https://support.google.com/youtube/answer/171780?hl=en',scope:'Use the unmodified provider player only. No downloading, rehosting, extraction or offline video caching. Keep provider controls, attribution and an external watch link. Embedding availability can change.'};
export function permittedVideo(exerciseId){const video=MOVEMENT_SOURCES[exerciseId]?.video;return video?.permission==='provider-embed'&&/^[A-Za-z0-9_-]{11}$/.test(video.videoId)?video:null;}
export function videoEmbedURL(exerciseId){const video=permittedVideo(exerciseId);return video?`https://www.youtube-nocookie.com/embed/${video.videoId}?playsinline=1&cc_load_policy=1&rel=0`:null;}
