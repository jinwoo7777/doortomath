import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// 차트 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// 클라이언트 사이드에서만 차트 렌더링
const LineChart = typeof window === 'undefined' ? () => null : Line;

const ProgressChart = () => {
  // 차트 데이터
  const chartData = {
    labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
    datasets: [
      {
        label: '학습 진행도',
        data: [30, 45, 60, 70, 80, 95],
        borderColor: 'hsl(221.2 83.2% 53.3%)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: 'hsl(221.2 83.2% 53.3%)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // 차트 옵션
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          stepSize: 20
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 14 },
        padding: 12,
        displayColors: false
      }
    }
  };

  // 통계 데이터
  const stats = [
    { label: '총 강의 수', value: '24개' },
    { label: '완료 강의', value: '18개' },
    { label: '평균 진도율', value: '87%', change: '+5%' },
  ];

  return (
    <div className="w-full">
      {/* Chart */}
      <div className="mb-6">
        <div className="h-[250px] w-full">
          <LineChart data={chartData} options={chartOptions} />
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-6 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">이번 달 목표</span>
          <span className="text-sm font-medium">85%</span>
        </div>
        <Progress value={72} className="h-2" />
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-card">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-base font-medium">
                {stat.value}
                {stat.change && (
                  <Badge variant="outline" className="ml-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs">
                    {stat.change}
                  </Badge>
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProgressChart;
