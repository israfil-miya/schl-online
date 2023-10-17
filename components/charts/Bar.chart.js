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
        top: 50
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
      legend: {
        display: false,
      },
    },
  };

  return (<>
  <div className="p-3 bg-light chart-container shadow-sm border">
    {title &&  <p className="fw-bold text-center">{title}</p>}
    <Bar options={options} data={chartData} />
  </div>
  <style jsx>
    {`
      .chart-container canvas {
        box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.8);
      }
    `}
  </style>
  </>)
}

export default BarChart;