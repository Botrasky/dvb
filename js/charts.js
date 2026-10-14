// ========== CHARTS ==========
let radarChart, donutChart;
const darkColors = {
  gridColor: 'rgba(0,229,255,0.1)',
  tickColor: 'rgba(0,229,255,0.5)',
  textColor: '#90cad4',
  cyan: '#00e5ff',
  green: '#00ff88',
  magenta: '#ff0080',
  yellow: '#ffcc00',
  bg: 'rgba(0,229,255,0.06)',
};
const lightColors = {
  gridColor: 'rgba(10,102,194,0.15)',
  tickColor: 'rgba(10,102,194,0.5)',
  textColor: '#1a3550',
  cyan: '#0a66c2',
  green: '#057642',
  magenta: '#c0392b',
  yellow: '#b7860b',
  bg: 'rgba(10,102,194,0.05)',
};

function getColors() { return isDark ? darkColors : lightColors; }

// ===== Skill measurement =====================================================
// Each skill starts from a prior baseline, then gains evidence from the CTF
// labs actually solved (see /writeups/). A lab adds a difficulty-weighted bonus
// to every skill it exercised: Easy +2, Medium +4, Hard +6. Python counts at
// half weight (it supports most solves rather than being the point each time).
// Scores are capped at 90 to stay honest. Change a lab here and the chart moves.
const LAB_WEIGHT = { easy: 2, medium: 4, hard: 6 };
const HALF_WEIGHT = new Set(['Python']);
const SKILL_BASE = [
  ['Pentesting', 88], ['Reverse Eng', 60], ['Cryptography', 58], ['Python', 85],
  ['Web Exploit', 62], ['Network Sec', 82], ['Forensics', 78], ['SIEM', 75],
  ['Cloud (AWS)', 70], ['Backend Dev', 80],
];
const SOLVED_LABS = [
  { name: 'Moneybox',            diff: 'easy',   skills: ['Pentesting', 'Network Sec', 'Web Exploit', 'Forensics'] },
  { name: 'VEN RSA',             diff: 'medium', skills: ['Cryptography', 'Python'] },
  { name: 'Pizza Router',        diff: 'hard',   skills: ['Pentesting', 'Reverse Eng', 'Python'] },
  { name: 'Printer Shares 3',    diff: 'hard',   skills: ['Pentesting', 'Network Sec'] },
  { name: 'Secure Password DB',  diff: 'medium', skills: ['Reverse Eng', 'Pentesting'] },
  { name: 'Credential Stuffing', diff: 'medium', skills: ['Web Exploit', 'Pentesting', 'Python'] },
  { name: 'Hidden Cipher 2',     diff: 'medium', skills: ['Reverse Eng', 'Python'] },
  { name: 'Trust But Verify',    diff: 'easy',   skills: ['Python'] },
  { name: 'Bypass Me',           diff: 'medium', skills: ['Reverse Eng', 'Pentesting'] },
  { name: 'Amaterasu',           diff: 'medium', skills: ['Web Exploit', 'Pentesting', 'Python'] },
];
const SKILL_CAP = 90;
function computeSkillScores() {
  const score = Object.fromEntries(SKILL_BASE);
  for (const lab of SOLVED_LABS) {
    for (const s of lab.skills) {
      let w = LAB_WEIGHT[lab.diff];
      if (HALF_WEIGHT.has(s)) w /= 2;
      score[s] = Math.min(SKILL_CAP, (score[s] ?? 55) + w);
    }
  }
  return {
    labels: SKILL_BASE.map(([name]) => name),
    data: SKILL_BASE.map(([name]) => Math.round(score[name])),
  };
}
const SKILLS = computeSkillScores();

function initCharts() {
  const c = getColors();
  const radarCtx = document.getElementById('radarChart').getContext('2d');
  radarChart = new Chart(radarCtx, {
    type: 'radar',
    data: {
      labels: SKILLS.labels,
      datasets: [{
        label: 'Skill Level',
        data: SKILLS.data,
        borderColor: c.cyan,
        backgroundColor: c.bg,
        pointBackgroundColor: c.cyan,
        pointBorderColor: c.cyan,
        borderWidth: 2,
        pointRadius: 4,
      }]
    },
    options: {
      responsive:true, maintainAspectRatio:true,
      plugins:{ legend:{ display:false } },
      scales:{
        r:{
          beginAtZero:true, max:100,
          grid:{ color: c.gridColor },
          ticks:{ display:false, stepSize:20 },
          pointLabels:{ color: c.textColor, font:{ size:10, family:"'IBM Plex Mono', monospace" } },
          angleLines:{ color: c.gridColor }
        }
      }
    }
  });

  const donutCtx = document.getElementById('donutChart').getContext('2d');
  donutChart = new Chart(donutCtx, {
    type: 'doughnut',
    data: {
      labels: ['Offensive Security','Reverse Engineering','Dev & Automation','Blue Team / SOC','Cloud & Infra'],
      datasets: [{
        data: [35,20,20,15,10],
        backgroundColor: [c.cyan+'cc', c.green+'cc', c.yellow+'cc', c.magenta+'cc', '#a78bfa'+'cc'],
        borderColor: isDark ? '#0a0f1a' : '#f3f6fb',
        borderWidth: 3,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive:true, maintainAspectRatio:true,
      plugins:{
        legend:{
          position:'bottom',
          labels:{ color: c.textColor, font:{ size:10, family:"'IBM Plex Mono', monospace" }, padding:12 }
        }
      },
      cutout:'65%',
    }
  });
}

function updateCharts() {
  const c = getColors();
  if(radarChart) {
    radarChart.data.datasets[0].borderColor = c.cyan;
    radarChart.data.datasets[0].backgroundColor = c.bg;
    radarChart.data.datasets[0].pointBackgroundColor = c.cyan;
    radarChart.options.scales.r.grid.color = c.gridColor;
    radarChart.options.scales.r.pointLabels.color = c.textColor;
    radarChart.options.scales.r.angleLines.color = c.gridColor;
    radarChart.update();
  }
  if(donutChart) {
    donutChart.data.datasets[0].backgroundColor = [c.cyan+'cc', c.green+'cc', c.yellow+'cc', c.magenta+'cc', '#a78bfa'+'cc'];
    donutChart.data.datasets[0].borderColor = isDark ? '#0a0f1a' : '#f3f6fb';
    donutChart.options.plugins.legend.labels.color = c.textColor;
    donutChart.update();
  }
}
initCharts();

