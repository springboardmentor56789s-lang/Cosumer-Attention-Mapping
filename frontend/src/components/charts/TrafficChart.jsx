import React from 'react';
import ReactECharts from 'echarts-for-react';

export default function TrafficChart({ zoneAnalytics }) {
  const data = zoneAnalytics || [
    { zone_name: 'Entrance Zone', visitor_count: 18 },
    { zone_name: 'Beverage Zone', visitor_count: 16 },
    { zone_name: 'Snack Zone', visitor_count: 11 },
    { zone_name: 'Checkout Zone', visitor_count: 15 }
  ];

  const option = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(d => d.zone_name),
      axisLine: { lineStyle: { color: '#3f3f46' } },
      axisLabel: { color: '#a1a1aa', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#3f3f46' } },
      splitLine: { lineStyle: { color: '#27272a' } },
      axisLabel: { color: '#a1a1aa', fontSize: 11 }
    },
    series: [
      {
        name: 'Visitors',
        type: 'bar',
        barWidth: '40%',
        data: data.map(d => d.visitor_count),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#1d4ed8' }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-2">
      <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Zone Traffic Distribution</h4>
      <ReactECharts option={option} style={{ height: '220px' }} />
    </div>
  );
}
