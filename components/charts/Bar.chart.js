import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
ChartJS.register(ChartDataLabels);

function BarChart({ chartData, title }) {
  const options = {
    clip: false,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => Math.round(value),
        },
      },
    },
    layout: {
      padding: {
        top: 50,
      },
    },
    plugins: {
      datalabels: {
        anchor: "end",
        align: "top",
        formatter: Math.round,
        font: {
          weight: "bold",
        },
      },
      legend: {
        display: false,
      },
    },
  };

  return (
    <>
      <div className="pb-5 chart-container  p-3 bg-light shadow-sm rounded border justify-content-center">
        {title && <p className="fw-bold text-center">{title}</p>}
        <Bar options={options} data={chartData} />
      </div>
      <style jsx>
        {`
          .chart-container canvas {
            box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.8);
          }
          .chart-container {
            height: 600px !important;
          }
        `}
      </style>
    </>
  );
}

export default BarChart;
