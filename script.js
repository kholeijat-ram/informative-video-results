// =============================
return rows;
}


function classifyDifficulty(classMeanPct){
if (!Number.isFinite(classMeanPct)) return {label:'-', badge:'warn'};
if (classMeanPct >= 70) return {label:'Content easy → Increase difficulty', badge:'ok'};
if (classMeanPct < 40) return {label:'Content too hard → Reteach in blocks', badge:'bad'};
return {label:'Balanced → Continue pace', badge:'warn'};
}


function classifySpread(sd, meanVal){
if (!Number.isFinite(sd) || !Number.isFinite(meanVal) || meanVal===0) return {label:'-', badge:'warn'};
const pct = (sd/meanVal)*100;
if (pct < 20) return {label:'Low SD → Teach same way', badge:'ok'};
if (pct > 40) return {label:'High SD → Differentiate (pairing, tiered tasks)', badge:'bad'};
return {label:'Moderate SD → Normal variation', badge:'warn'};
}


function classifyStudent(meanVal, sdVal, z, slope){
let cat='', advice='';
const lowSD = Number.isFinite(sdVal) && Number.isFinite(meanVal) && meanVal!==0 && (sdVal/meanVal*100) < 20;
const highSD = Number.isFinite(sdVal) && Number.isFinite(meanVal) && meanVal!==0 && (sdVal/meanVal*100) > 40;
if (Number.isFinite(meanVal) && Number.isFinite(sdVal)){
if (meanVal >= 70 && lowSD){ cat='Strong & steady'; advice='You are reliable — let\'s push to next level.'; }
else if (meanVal < 40 && lowSD){ cat='Weak but steady'; advice='Good consistency — we\'ll build step by step.'; }
else if (meanVal >= 70 && highSD){ cat='Strong but inconsistent'; advice='You can score high — now let\'s make it regular.'; }
else if (meanVal < 40 && highSD){ cat='Weak & unstable'; advice='Every step matters — let\'s work together.'; }
else { cat='Developing'; advice='Keep steady practice and feedback.'; }
}
// Growth overlay
if (Number.isFinite(slope)){
if (slope > 0.5) advice += ' Growth up — great effort!';
else if (slope < -0.5) advice += ' Scores falling — we\'ll investigate and adjust.';
else advice += ' Steady trend — try new methods to nudge up.';
}
// Z-score overlay
if (Number.isFinite(z)){
if (z > 0.5) advice += ' Try advanced tasks/leadership.';
else if (z < -0.5) advice += ' We\'ll scaffold with simpler blocks.';
}
return {cat, advice};
}


// =============================
// Render helpers
// =============================
function renderKPIs({classMean, classSD, classMeanPct, spreadText, distText}){
const grid = byId('classKPIs');
grid.innerHTML = '';
const items = [
{label:'Class Mean', val: fmt(classMean,2)},
{label:'Class SD', val: fmt(classSD,2)},
{label:'Class Mean (%)', val: fmt(classMeanPct,1)+'%'},
{label:'Spread', val: spreadText},
{label:'Distribution', val: distText},
];
items.forEach(it=>{
const el = document.createElement('div');
el.className = 'kpi';
el.innerHTML = `<h4>${it.label}
