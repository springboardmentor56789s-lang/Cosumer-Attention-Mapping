import React from 'react';
import ReactECharts from 'echarts-for-react';

export default function RadarChart({ height = '350px' }) {
  const option = {
    tooltip: {
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC', fontSize: 12 },
    },
    legend: {
      data: ['Store #101 (Flagship)', 'Store #102 (Downtown)', 'Regional Benchmark'],
      textStyle: { color: '#94A3B8', fontSize: 11 },
      bottom: 0,
    },
    radar: {
      indicator: [
        { name: 'Footfall Traffic', max: 100 },
        { name: 'Gaze Fixation', max: 100 },
        { name: 'Avg Dwell Duration', max: 100 },
        { name: 'Product Touch Rate', max: 100 },
        { name: 'Sales Conversion', max: 100 },
        { name: 'Shelf Utilization', max: 100 },
      ],
      axisName: {
        color: '#CBD5E1',
        fontSize: 10,
        fontWeight: 'bold',
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(15,23,42,0.8)', 'rgba(30,41,59,0.8)'],
        },
      },
      splitLine: {
        lineStyle: {
          color: '#334155',
        },
      },
    },
    series: [
      {
        name: 'Store Performance Metrics',
        type: 'radar',
        data: [
          {
            value: [92, 88, 79, 85, 90, 94],
            name: 'Store #101 (Flagship)',
            itemStyle: { color: '#6366f1' },
            areaStyle: { color: 'rgba(99, 102, 241, 0.25)' },
          },
          {
            value: [75, 68, 85, 72, 64, 80],
            name: 'Store #102 (Downtown)',
            itemStyle: { color: '#10b981' },
            areaStyle: { color: 'rgba(16, 185, 129, 0.25)' },
          },
          {
            value: [65, 60, 60, 65, 60, 70],
            name: 'Regional Benchmark',
            itemStyle: { color: '#94a3b8' },
            lineStyle: { type: 'dashed' },
          },
        ],
      },
    ],
  };

  return <ReactECharts option={option} style={{ height, width: '100%' }} />;
}
