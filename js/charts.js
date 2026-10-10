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

function initCharts() {
  const c = getColors();
  const radarCtx = document.getElementById('radarChart').getContext('2d');
  radarChart = new Chart(radarCtx, {
    type: 'radar',
    data: {
      labels: ['Pentesting','Python','Forensics','SIEM','Network Sec','Cloud (AWS)','Malware','Backend Dev'],
      datasets: [{
        label: 'Skill Level',
        data: [88,85,78,75,82,70,68,80],
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
      labels: ['Offensive Sec','Blue Team/SOC','Dev & Automation','Forensics','Cloud & Infra'],
      datasets: [{
        data: [30,25,20,15,10],
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

