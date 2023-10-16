import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels"
ChartJS.register(ChartDataLabels);

function BarChart({ chartData, title }) {
  const options = {
    clip: false,
    maintainAspectRatio: true,
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => Math.round(value),
        },
      },
    },
    layout: {
      padding: {
        top: 5
      }
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'top',
        formatter: Math.round,
        font: {
          weight: 'bold',
        },
      },
      tooltip: {
        enabled: false
      },
      legend: {
        display: false,
      },
    },
  };

  return <div className="p-3 bg-light shadow-sm border">
    <p className="fw-bold text-center">{title}</p>
    <Bar options={options} data={chartData} />
  </div>
}

export default BarChart;