"use client";

import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

/**
 * 매출 추이 차트 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.data - 차트 데이터 (월별 매출 데이터)
 * @param {boolean} props.loading - 로딩 상태
 * @returns {React.ReactElement} 매출 추이 차트
 */
const SalesTrendChart = ({ data = [], loading = false }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // 로딩 중이거나 데이터가 없으면 차트를 그리지 않음
    if (loading || data.length === 0) return;

    // 이전 차트 인스턴스 제거
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    // 차트 데이터 준비
    const labels = data.map(item => item.month);
    const revenueData = data.map(item => item.revenue);
    const collectedData = data.map(item => item.collected);
    
    // 차트 생성
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '예상 매출',
            data: revenueData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          },
          {
            label: '실제 수금',
            data: collectedData,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('ko-KR', {
                    style: 'currency',
                    currency: 'KRW'
                  }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat('ko-KR', {
                  style: 'currency',
                  currency: 'KRW',
                  notation: 'compact',
                  compactDisplay: 'short'
                }).format(value);
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">표시할 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <canvas ref={chartRef} />
    </div>
  );
};

export default SalesTrendChart;