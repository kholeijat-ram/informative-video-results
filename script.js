function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function sd(arr) {
  let m = mean(arr);
  let variance = arr.reduce((a, b) => a + Math.pow(b - m, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

function skewness(arr) {
  let m = mean(arr);
  let s = sd(arr);
  let n = arr.length;
  return (n / ((n - 1) * (n - 2))) *
    arr.reduce((a, b) => a + Math.pow((b - m) / s, 3), 0);
}

function getGrowth(scores) {
  if (scores.length < 2) return 0;
  return scores[scores.length - 1] - scores[0];
}

function zScore(studentMean, classMean, classSD) {
  return classSD === 0 ? 0 : (studentMean - classMean) / classSD;
}
function categorize(meanVal, sdVal, z, growth) {
  if (meanVal >= 70 && sdVal < 10) {
    return { cat: "Strong & Steady", badge: "green", advice: "You are reliable — let’s push to next level." };
  } else if (meanVal < 40 && sdVal < 10) {
    return { cat: "Steady but Weak", badge: "blue", advice: "Good consistency — we’ll build step by step." };
  } else if (meanVal >= 70 && sdVal >= 10) {
    return { cat: "Strong but Inconsistent", badge: "yellow", advice: "You can score high — now let’s make it regular." };
  } else if (meanVal < 40 && sdVal >= 10) {
    return { cat: "Weak & Unstable", badge: "red", advice: "Every step matters — let’s work together." };
  }

  if (growth > 0) {
    return { cat: "Improving", badge: "green", advice: "Your line is going up — proof that effort works!" };
  } else if (growth < 0) {
    return { cat: "Falling", badge: "red", advice: "Don’t worry, we’ll try a new way, and you’ll rise again." };
  }

  return { cat: "Average", badge: "blue", advice: "Keep practicing, aim higher!" };
}

async function loadCSV() {
  const response = await fetch("data.csv");
  const text = await response.text();
  const rows = text.trim().split("\n").map(r => r.split(","));
  
  let headers = rows[0].slice(1); // test names
  let students = rows.slice(1).map(r => ({
    name: r[0],
    scores: r.slice(1).map(Number)
  }));

  processData(headers, students);
}

function processData(headers, students) {
  let allScores = students.flatMap(s => s.scores);
  let classMean = mean(allScores);
  let classSD = sd(allScores);
  let classSkew = skewness(allScores);
  let classSummary = `
    <p><b>Mean:</b> ${classMean.toFixed(2)}%</p>
    <p><b>SD:</b> ${classSD.toFixed(2)}</p>
    <p><b>Skewness:</b> ${classSkew.toFixed(2)}</p>
  `;
  if (classMean >= 70) classSummary += "<p>Content was easy → Increase difficulty.</p>";
  else if (classMean >= 40) classSummary += "<p>Content was balanced → Continue pace.</p>";
  else classSummary += "<p>Content was too hard → Break into smaller blocks & reteach.</p>";

  document.getElementById("class-stats").innerHTML = classSummary;

  let perTestHTML = "<ul>";
  headers.forEach((test, i) => {
    let scores = students.map(s => s.scores[i]);
    let m = mean(scores), sdev = sd(scores);
    perTestHTML += `<li>${test}: Mean = ${m.toFixed(2)}, SD = ${sdev.toFixed(2)}</li>`;
  });
  perTestHTML += "</ul>";
  document.getElementById("per-test-stats").innerHTML = perTestHTML;

  let tbody = document.querySelector("#student-table tbody");
  tbody.innerHTML = "";
  students.forEach(stu => {
    let m = mean(stu.scores);
    let sdev = sd(stu.scores);
    let growth = getGrowth(stu.scores);
    let z = zScore(m, classMean, classSD);
    let { cat, badge, advice } = categorize(m, sdev, z, growth);

    let row = `
      <tr>
        <td>${stu.name}</td>
        <td>${m.toFixed(2)}</td>
        <td>${sdev.toFixed(2)}</td>
        <td>${z.toFixed(2)}</td>
        <td>${growth > 0 ? "📈" : (growth < 0 ? "📉" : "➖")}</td>
        <td><span class="badge ${badge}">${cat}</span></td>
        <td>${advice}</td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}
loadCSV();
