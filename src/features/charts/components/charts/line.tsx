/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, ReactElement, useEffect, useRef } from 'react';
import { IChartResult } from '../../interfaces/chart.interface';
import { Chart, registerables } from 'chart.js';
import { truncateText } from '../../../../shared/utils/utils';

// Register Chart.js components
Chart.register(...registerables);

const LineChart: FC<{ chartData: IChartResult | null; previewWidth: number }> = ({
  chartData,
  previewWidth
}): ReactElement => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartData || !chartRef.current) return;

    const { data, xAxis, yAxis } = chartData;
    const ctx: CanvasRenderingContext2D = chartRef.current.getContext('2d') as CanvasRenderingContext2D;
    const chartInfoData = data as Record<string, unknown>[];

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartInfoData.map((item) => truncateText(item[xAxis] as string, 10)),
        datasets: [
          {
            label: yAxis,
            data: chartInfoData.map((item) => item[yAxis]),
            backgroundColor: 'rgba(96, 165, 250, 0.2)', // Tailwind blue-400
            borderColor: '#3B82F6', // Tailwind blue-500
            borderWidth: 3,
            fill: false,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {
                family: "'Inter', sans-serif",
                size: 14
              },
              usePointStyle: false,
              boxWidth: 40,
              boxHeight: 3,
              generateLabels: (chart) => {
                const original = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                return original.map((label) => ({
                  ...label,
                  text: truncateText(label.text, 20)
                }));
              }
            }
          },
          tooltip: {
            intersect: false,
            mode: 'index',
            callbacks: {
              title: (tooltipItems: any) => {
                const dataIndex = tooltipItems[0].dataIndex;
                return chartInfoData[dataIndex][xAxis] as any;
              },
              label: (context: any) => {
                return context.raw;
              }
            },
            padding: 12,
            backgroundColor: 'rgba(17, 24, 39, 0.8)', // Tailwind gray-900 with opacity
            bodyFont: {
              size: 14,
              family: "'Inter', sans-serif"
            },
            displayColors: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: yAxis,
              font: {
                family: "'Inter', sans-serif",
                size: 14
              }
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.1)'
            }
          },
          x: {
            title: {
              display: true,
              text: xAxis,
              font: {
                family: "'Inter', sans-serif",
                size: 14
              }
            },
            grid: {
              display: false
            },
            ticks: {
              autoSkip: true
            }
          }
        }
      }
    }) as Chart;

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData]);

  return (
    <div className="min-h-[550px] relative" style={{ width: `${previewWidth}vw` }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default LineChart;
