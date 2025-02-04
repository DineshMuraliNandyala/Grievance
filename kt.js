import { db } from './firebaseConfig.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', async () => {
  const complaintsRef = collection(db, 'complaints');
  const complaintsSnapshot = await getDocs(complaintsRef);

  const departmentCounts = {};
  let totalFiled = 0;
  let totalResolved = 0;

  const weeklyData = {};
  const getWeek = (date) => {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDay) / (1000 * 60 * 60 * 24);
    return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
  };

  complaintsSnapshot.forEach((doc) => {
    const data = doc.data();

    // Count by department
    const department = data.domain || 'Unknown';
    departmentCounts[department] = (departmentCounts[department] || 0) + 1;

    // Count filed and resolved
    totalFiled += 1;
    if (data.status === 'Resolved') {
      totalResolved += 1;
    }

    // Weekly data
    const createdDate = data.createdTimestamp?.toDate();
    if (createdDate) {
      const week = getWeek(createdDate);
      if (!weeklyData[week]) {
        weeklyData[week] = { filed: 0, resolved: 0 };
      }
      weeklyData[week].filed += 1;

      if (data.status === 'Resolved') {
        const resolvedDate = data.resolvedTimestamp?.toDate();
        const resolvedWeek = getWeek(resolvedDate);
        if (resolvedWeek === week) {
          weeklyData[week].resolved += 1;
        }
      }
    }
  });

  // Data for Department Pie Chart
  const departmentLabels = Object.keys(departmentCounts);
  const departmentValues = Object.values(departmentCounts);

  const departmentPieChart = new Chart(document.getElementById('departmentPieChart'), {
    type: 'pie',
    data: {
      labels: departmentLabels,
      datasets: [
        {
          label: 'Complaints by Department',
          data: departmentValues,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#FF9F40'],
        },
      ],
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              const percentage = ((context.raw / totalFiled) * 100).toFixed(2);
              return `${context.label}: ${context.raw} (${percentage}%)`;
            },
          },
        },
        datalabels: {
          formatter: (value, context) => {
            const percentage = ((value / totalFiled) * 100).toFixed(2);
            return `${percentage}%`;
          },
          color: '#000', // Setting label color to black
        font: {
          weight: 'bold', // Optional: makes the label text bold
        },
        },
      },
    },
  });

  // Data for Status Pie Chart
  const statusPieChart = new Chart(document.getElementById('statusPieChart'), {
    type: 'pie',
    data: {
      labels: ['Filed', 'Resolved'],
      datasets: [
        {
          label: 'Filed vs Resolved',
          data: [totalFiled, totalResolved],
          backgroundColor: ['#FF6384', '#36A2EB'],
        },
      ],
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              const percentage = ((context.raw / totalFiled) * 100).toFixed(2);
              return `${context.label}: ${context.raw} (${percentage}%)`;
            },
          },
        },
        datalabels: {
          formatter: (value, context) => {
            const percentage = ((value / totalFiled) * 100).toFixed(2);
            return `${percentage}%`;
          },
          color: '#0000',
        },
      },
    },
  });

  // Data for Weekly Bar Chart
  const weeks = Object.keys(weeklyData);
  const filedData = weeks.map((week) => weeklyData[week].filed);
  const resolvedData = weeks.map((week) => weeklyData[week].resolved);

  const weeklyBarChart = new Chart(document.getElementById('weeklyBarChart'), {
    type: 'bar',
    data: {
      labels: weeks,
      datasets: [
        {
          label: 'Filed Complaints',
          data: filedData,
          backgroundColor: '#FF6384',
        },
        {
          label: 'Resolved Complaints',
          data: resolvedData,
          backgroundColor: '#36A2EB',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: ${context.raw}`,
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Weeks',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Number of Complaints',
          },
        },
      },
    },
  });
});
