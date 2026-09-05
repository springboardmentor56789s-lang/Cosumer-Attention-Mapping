import React from 'react';
import ReactECharts from 'echarts-for-react';

export default function SunburstChart({ height = '420px' }) {
  const data = [
    {
      name: 'Aisle 1: Beverages',
      itemStyle: { color: '#4f46e5' },
      children: [
        {
          name: 'Energy Drinks',
          itemStyle: { color: '#6366f1' },
          children: [
            { name: 'RedBull 250ml', value: 42, itemStyle: { color: '#818cf8' } },
            { name: 'Monster Energy', value: 38, itemStyle: { color: '#a5b4fc' } },
          ],
        },
        {
          name: 'Juices & Waters',
          itemStyle: { color: '#4338ca' },
          children: [
            { name: 'Organic Cold-Pressed', value: 55, itemStyle: { color: '#6366f1' } },
            { name: 'Sparkling Lemonade', value: 29, itemStyle: { color: '#818cf8' } },
          ],
        },
      ],
    },
    {
      name: 'Aisle 2: Snacks',
      itemStyle: { color: '#059669' },
      children: [
        {
          name: 'Chips & Dips',
          itemStyle: { color: '#10b981' },
          children: [
            { name: 'Kettle Cooked Chips', value: 48, itemStyle: { color: '#34d399' } },
            { name: 'Salsa Verde', value: 31, itemStyle: { color: '#6ee7b7' } },
          ],
        },
        {
          name: 'Nuts & Seeds',
          itemStyle: { color: '#047857' },
          children: [
            { name: 'Roasted Almonds 200g', value: 36, itemStyle: { color: '#10b981' } },
            { name: 'Trail Mix Premium', value: 24, itemStyle: { color: '#34d399' } },
          ],
        },
      ],
    },
    {
      name: 'Aisle 3: Personal Care',
      itemStyle: { color: '#d97706' },
      children: [
        {
          name: 'Skincare',
          itemStyle: { color: '#f59e0b' },
          children: [
            { name: 'Hydrating Serum 50ml', value: 64, itemStyle: { color: '#fbbf24' } },
            { name: 'Sunscreen SPF50', value: 40, itemStyle: { color: '#fde68a' } },
          ],
        },
      ],
    },
  ];

  const option = {
    tooltip: {
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC', fontSize: 12 },
      formatter: (params) => `${params.name}: <strong style="color:#38BDF8">${params.value || ''} Gaze Index</strong>`,
    },
    series: {
      type: 'sunburst',
      data: data,
      radius: ['12%', '85%'],
      center: ['50%', '50%'],
      label: {
        rotate: 'radial',
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 10,
      },
      itemStyle: {
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#0B0F17',
      },
      levels: [
        {},
        {
          r0: '0%',
          r: '28%',
          label: { rotate: 0, fontSize: 11, color: '#FFFFFF', fontWeight: 'bold' },
        },
        {
          r0: '28%',
          r: '60%',
          label: { fontSize: 10, color: '#FFFFFF' },
        },
        {
          r0: '60%',
          r: '88%',
          label: { position: 'outside', padding: 3, silent: false, color: '#CBD5E1', fontSize: 10 },
          itemStyle: { borderWidth: 1 },
        },
      ],
    },
  };

  return <ReactECharts option={option} style={{ height, width: '100%' }} />;
}
