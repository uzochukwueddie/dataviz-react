/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, ReactElement, useEffect, useRef } from 'react';
import { IChartResult } from '../../interfaces/chart.interface';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const PieChart: FC<{ chartData: IChartResult | null; previewWidth: number }> = ({
  chartData,
  previewWidth
}): ReactElement => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  const calculateTotal = (data: Record<string, unknown>[]): number => {
    return data.reduce((sum, info: any) => sum + info.value, 0);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  useEffect(() => {
    if (!chartData || !chartRef.current) return;

    const { data } = chartData;
    const ctx: CanvasRenderingContext2D = chartRef.current.getContext('2d') as CanvasRenderingContext2D;
    const chartInfoData = data as Record<string, unknown>[];
    const totalCount = calculateTotal(chartInfoData);

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: chartInfoData.map((item) => item.segment),
        datasets: [
          {
            data: chartInfoData.map((item) => item.value),
            backgroundColor: chartInfoData.map((item: any) => item.color),
            borderColor: '#3B82F6',
            borderWidth: 2,
            hoverBorderColor: '#ffffff',
            hoverBorderWidth: 3,
            hoverOffset: 10,
            hoverBackgroundColor: chartInfoData.map((item: any) => item.color.replace('0.8', '1'))
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 2,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: {
                family: "'Inter', sans-serif",
                size: 14
              },
              generateLabels: (chart) => {
                const data = chart.data;
                if (data.labels && data.datasets) {
                  return data.labels.map((label, i) => {
                    const chartInfo = chartInfoData[i] as any;
                    const value = data.datasets[0].data[i] as number;
                    const percentage = ((value / totalCount) * 100).toFixed(1);
                    return {
                      text: `${label} (${value} - ${percentage}%)`,
                      fillStyle: chartInfo.color,
                      strokeStyle: chartInfo.color,
                      lineWidth: 0,
                      hidden: false,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          },
          tooltip: {
            intersect: false,
            mode: 'index',
            callbacks: {
              title: (tooltipItems: any) => {
                const chartInfo = chartInfoData as any;
                return chartInfo[tooltipItems[0].dataIndex]['segment'];
              },
              label: (context: any) => {
                const value = context.raw;
                const percentage = ((value / totalCount) * 100).toFixed(1);
                return [`Count: ${formatNumber(value)}`, `Percentage: ${percentage}%`];
              }
            },
            padding: 12,
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            titleFont: {
              size: 14,
              weight: 'bold',
              family: "'Inter', sans-serif"
            },
            bodyFont: {
              size: 13,
              family: "'Inter', sans-serif"
            },
            displayColors: false
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 1500,
          easing: 'easeInOutQuart'
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

export default PieChart;
