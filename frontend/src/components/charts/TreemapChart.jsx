import React from 'react';
import ReactECharts from 'echarts-for-react';

export default function TreemapChart({ height = '350px' }) {
  const option = {
    tooltip: {
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC', fontSize: 12 },
      formatter: (params) => {
        return `<strong>${params.name}</strong><br/>Attention Fixation: <strong style="color:#38BDF8">${params.value} Units</strong>`;
      },
    },
    series: [
      {
        type: 'treemap',
        width: '100%',
        height: '100%',
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        label: {
          show: true,
          formatter: '{b}\n{c} pts',
          color: '#FFFFFF',
          fontSize: 11,
          fontWeight: 'bold',
        },
        itemStyle: {
          borderColor: '#0B0F17',
          borderWidth: 2,
          gapWidth: 2,
        },
        data: [
          { name: 'Organic Cold-Pressed Juice 1L', value: 840, itemStyle: { color: '#4f46e5' } },
          { name: 'Hydrating Face Serum 50ml', value: 680, itemStyle: { color: '#7c3aed' } },
          { name: 'RedBull Energy Drink 250ml', value: 590, itemStyle: { color: '#2563eb' } },
          { name: 'Kettle Cooked Chips 150g', value: 520, itemStyle: { color: '#059669' } },
          { name: 'Sparkling Water 6-Pack', value: 410, itemStyle: { color: '#0284c7' } },
          { name: 'Sunscreen SPF50 Lotion', value: 390, itemStyle: { color: '#d97706' } },
          { name: 'Roasted Almonds 200g', value: 310, itemStyle: { color: '#0d9488' } },
          { name: 'Trail Mix Superfood', value: 240, itemStyle: { color: '#e11d48' } },
        ],
      },
    ],
  };

  return <ReactECharts option={option} style={{ height, width: '100%' }} />;
}
