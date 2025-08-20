// =============================
// Configuration
// =============================
const CONFIG = {
SHEET_CSV_URL: localStorage.getItem('sheetCsvUrl') || '',
MAX_SCORE: 100, // change if your tests are not out of 100
};
// Utilities
// =============================
const byId = (id) => document.getElementById(id);
const fmt = (x, d=2) => Number.isFinite(x) ? x.toFixed(d) : '-';
const mean = (arr) => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : NaN;
const popVar = (arr) => {
if (!arr.length) return NaN;
const m = mean(arr);
return arr.reduce((s,x)=>s+Math.pow(x - m,2),0)/arr.length;
};
const popSD = (arr) => Math.sqrt(popVar(arr));
const skewness = (arr) => {
if (arr.length < 3) return 0;
const m = mean(arr), sd = popSD(arr);
if (sd === 0) return 0;
const n = arr.length;
const m3 = arr.reduce((s,x)=> s + Math.pow(x - m, 3), 0)/n;
return m3 / Math.pow(sd, 3);
};
const linearRegressionSlope = (ys) => {
// x = 1..k for each available y; ignore NaN
const points = ys.map((y,i)=>({x:i+1,y})).filter(p=>Number.isFinite(p.y));
const n = points.length; if (n < 2) return 0;
const xbar = mean(points.map(p=>p.x));
const ybar = mean(points.map(p=>p.y));
const num = points.reduce((s,p)=> s + (p.x - xbar)*(p.y - ybar), 0);
const den = points.reduce((s,p)=> s + Math.pow(p.x - xbar,2), 0);
return den === 0 ? 0 : num/den;
};


function csvToArray(text) {
// simple CSV parser (handles quoted commas)
const rows = [];
let row = [], col = '', inQuotes = false;
for (let i=0;i<text.length;i++){
const ch = text[i], next = text[i+1];
if (ch==='"'){
if (inQuotes && next==='"'){ col+='"'; i++; }
else inQuotes = !inQuotes;
} else if (ch===',' && !inQuotes){ row.push(col); col=''; }
else if (ch==='\n' && !inQuotes){ row.push(col); rows.push(row); row=[]; col=''; }
else { col += ch; }
}
if (col.length || row.length) { row.push(col); rows.push(row); }
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
el.innerHTML = `<h4>${it.label}
