const DATA_FILE = "data.csv";  // <== just edit this file in GitHub

// Utils
const byId = id => document.getElementById(id);
const mean = arr => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : NaN;
const sd = arr => {
  if (!arr.length) return NaN;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s,x)=>s+(x-m)**2,0)/arr.length);
};
const fmt = (x,d=2)=>Number.isFinite(x)?x.toFixed(d):"-";

// CSV parser (simple)
function csvToArray(str) {
  return str.trim().split("\n").map(r => r.split(","));
}

async function load() {
  const res = await fetch(DATA_FILE);
  const text = await res.text();
  const rows = csvToArray(text);
  const headers = rows[0].slice(1);
  const students = rows.slice(1).map(r => ({
    name: r[0],
    scores: r.slice(1).map(v => parseFloat(v))
  }));

  // Class stats
  const allScores = students.flatMap(s => s.scores);
  const classMean = mean(allScores);
  const classSD = sd(allScores);

  byId("classSummary").innerHTML = `
    <h2>Class Summary</h2>
    <p>Mean: ${fmt(classMean)} | SD: ${fmt(classSD)}</p>
  `;

  // Student table
  let html = "<h2>Student Details</h2><table><tr><th>Name</th><th>Mean</th><th>SD</th></tr>";
  students.forEach(s=>{
    const m = mean(s.scores);
    const sdev = sd(s.scores);
    html += `<tr><td>${s.name}</td><td>${fmt(m)}</td><td>${fmt(sdev)}</td></tr>`;
  });
  html += "</table>";
  byId("studentSection").innerHTML = html;
}

window.onload = load;
