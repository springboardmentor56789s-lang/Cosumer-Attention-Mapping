import React from 'react';
import ReactECharts from 'echarts-for-react';

export default function AttentionChart({ zoneAnalytics }) {
  const data = zoneAnalytics || [
    { zone_name: 'Entrance Zone', attention_events: 12 },
    { zone_name: 'Beverage Zone', attention_events: 34 },
    { zone_name: 'Snack Zone', attention_events: 21 },
    { zone_name: 'Checkout Zone', attention_events: 18 }
  ];

  const option = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: '{b}: {c} events ({d}%)' },
    series: [
      {
        name: 'Attention Events',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: { show: true, color: '#d4d4d8', fontSize: 11 },
        data: data.map(d => ({ value: d.attention_events, name: d.zone_name })),
        itemStyle: {
          borderRadius: 6,
          borderColor: '#18181b',
          borderWidth: 2
        }
      }
    ]
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-2">
      <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Attention Event Share by Zone</h4>
      <ReactECharts option={option} style={{ height: '220px' }} />
    </div>
  );
}
