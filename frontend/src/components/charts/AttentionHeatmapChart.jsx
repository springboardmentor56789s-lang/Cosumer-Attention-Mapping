import React from 'react';
import ReactECharts from 'echarts-for-react';

export default function AttentionHeatmapChart({ height = '380px' }) {
  const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#09090B',
      borderColor: '#27272A',
      textStyle: { color: '#F4F4F5', fontSize: 12, fontFamily: 'Plus Jakarta Sans' },
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: ['Eye Level (Shelf 3)', 'Endcap Promo A', 'Top Shelf (Shelf 4)', 'Mid Shelf (Shelf 2)', 'Bottom Shelf (Shelf 1)'],
      textStyle: { color: '#A1A1AA', fontSize: 11, fontFamily: 'Plus Jakarta Sans' },
      top: '0%',
    },
    grid: {
      top: '14%',
      bottom: '12%',
      left: '5%',
      right: '4%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: hours,
      axisLabel: { color: '#A1A1AA', fontSize: 11, fontFamily: 'Plus Jakarta Sans' },
      axisLine: { lineStyle: { color: '#27272A' } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      name: 'Gaze Score (0-100)',
      nameTextStyle: { color: '#71717A', fontSize: 11 },
      axisLabel: { color: '#A1A1AA', fontSize: 11, fontFamily: 'Plus Jakarta Sans' },
      axisLine: { lineStyle: { color: '#27272A' } },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.08)' } },
      max: 100,
    },
    series: [
      {
        name: 'Eye Level (Shelf 3)',
        type: 'bar',
        barGap: '15%',
        barCategoryGap: '35%',
        data: [45, 62, 85, 98, 75, 88, 95, 91, 84, 79, 65, 40],
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#C084FC' },
              { offset: 1, color: '#7E22CE' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        name: 'Endcap Promo A',
        type: 'bar',
        data: [50, 70, 92, 100, 82, 94, 99, 95, 89, 83, 71, 48],
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#FB7185' },
              { offset: 1, color: '#BE123C' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        name: 'Top Shelf (Shelf 4)',
        type: 'bar',
        data: [30, 45, 60, 72, 55, 68, 74, 70, 62, 58, 42, 25],
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#60A5FA' },
              { offset: 1, color: '#1D4ED8' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        name: 'Mid Shelf (Shelf 2)',
        type: 'bar',
        data: [25, 38, 52, 65, 48, 59, 68, 64, 55, 50, 36, 20],
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#34D399' },
              { offset: 1, color: '#047857' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        name: 'Bottom Shelf (Shelf 1)',
        type: 'bar',
        data: [10, 15, 22, 35, 25, 30, 38, 34, 28, 24, 18, 12],
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#FBBF24' },
              { offset: 1, color: '#B45309' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height, width: '100%' }} />;
}
