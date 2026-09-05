import React from 'react';
import ReactECharts from 'echarts-for-react';

export default function DwellChart({ zoneAnalytics }) {
  const data = zoneAnalytics || [
    { zone_name: 'Entrance Zone', avg_dwell_sec: 7.8 },
    { zone_name: 'Beverage Zone', avg_dwell_sec: 26.2 },
    { zone_name: 'Snack Zone', avg_dwell_sec: 20.9 },
    { zone_name: 'Checkout Zone', avg_dwell_sec: 20.6 }
  ];

  const option = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', formatter: '{b}: {c} seconds' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#3f3f46' } },
      splitLine: { lineStyle: { color: '#27272a' } },
      axisLabel: { color: '#a1a1aa', fontSize: 11 }
    },
    yAxis: {
      type: 'category',
      data: data.map(d => d.zone_name),
      axisLine: { lineStyle: { color: '#3f3f46' } },
      axisLabel: { color: '#a1a1aa', fontSize: 11 }
    },
    series: [
      {
        name: 'Avg Dwell (sec)',
        type: 'bar',
        barWidth: '40%',
        data: data.map(d => d.avg_dwell_sec),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#10b981' },
              { offset: 1, color: '#059669' }
            ]
          },
          borderRadius: [0, 4, 4, 0]
        }
      }
    ]
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-2">
      <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Average Zone Dwell Time (sec)</h4>
      <ReactECharts option={option} style={{ height: '220px' }} />
    </div>
  );
}
