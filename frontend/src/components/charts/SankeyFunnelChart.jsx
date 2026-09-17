import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';

export default function SankeyFunnelChart({ height = '380px' }) {
  const [viewMode, setViewMode] = useState('funnel'); // 'funnel' | 'sankey'

  const funnelOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#09090B',
      borderColor: '#27272A',
      textStyle: { color: '#F4F4F5', fontSize: 12, fontFamily: 'Plus Jakarta Sans' },
      formatter: '{b} : <strong>{c} Shoppers</strong> ({d}%)',
    },
    series: [
      {
        name: 'Shopper Attention Funnel',
        type: 'funnel',
        left: '10%',
        top: 20,
        bottom: 20,
        width: '80%',
        min: 0,
        max: 5000,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 4,
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}: {c}',
          color: '#FFFFFF',
          fontWeight: 'bold',
          fontSize: 11,
          fontFamily: 'Plus Jakarta Sans',
        },
        itemStyle: {
          borderColor: '#000000',
          borderWidth: 2,
        },
        data: [
          { value: 4892, name: '1. Store Entrance Traffic', itemStyle: { color: '#18181b' } },
          { value: 3410, name: '2. Aisle Entry & Gaze Focus', itemStyle: { color: '#27272a' } },
          { value: 2150, name: '3. Shelf Dwell (>3.0s)', itemStyle: { color: '#3f3f46' } },
          { value: 1240, name: '4. Physical Touch / Pick-up', itemStyle: { color: '#10b981' } },
          { value: 890, name: '5. Cart Addition & Checkout', itemStyle: { color: '#f59e0b' } },
        ],
      },
    ],
  };

  const sankeyOption = {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      backgroundColor: '#09090B',
      borderColor: '#27272A',
      textStyle: { color: '#F4F4F5', fontSize: 12, fontFamily: 'Plus Jakarta Sans' },
    },
    series: [
      {
        type: 'sankey',
        left: '5%',
        top: '10%',
        right: '5%',
        bottom: '10%',
        data: [
          { name: 'Entrance (4,892)' },
          { name: 'Beverages Aisle' },
          { name: 'Snacks Aisle' },
          { name: 'Personal Care' },
          { name: 'Eye-Level Shelf Dwell' },
          { name: 'Mid-Shelf Dwell' },
          { name: 'Product Purchased' },
          { name: 'Walked Away' },
        ],
        links: [
          { source: 'Entrance (4,892)', target: 'Beverages Aisle', value: 2100 },
          { source: 'Entrance (4,892)', target: 'Snacks Aisle', value: 1600 },
          { source: 'Entrance (4,892)', target: 'Personal Care', value: 1192 },
          { source: 'Beverages Aisle', target: 'Eye-Level Shelf Dwell', value: 1400 },
          { source: 'Beverages Aisle', target: 'Walked Away', value: 700 },
          { source: 'Snacks Aisle', target: 'Eye-Level Shelf Dwell', value: 1000 },
          { source: 'Snacks Aisle', target: 'Mid-Shelf Dwell', value: 600 },
          { source: 'Eye-Level Shelf Dwell', target: 'Product Purchased', value: 1650 },
          { source: 'Eye-Level Shelf Dwell', target: 'Walked Away', value: 750 },
          { source: 'Mid-Shelf Dwell', target: 'Product Purchased', value: 240 },
          { source: 'Mid-Shelf Dwell', target: 'Walked Away', value: 360 },
        ],
        lineStyle: {
          color: 'gradient',
          curveness: 0.5,
        },
        label: {
          color: '#A1A1AA',
          fontSize: 10,
          fontFamily: 'Plus Jakarta Sans',
        },
        itemStyle: {
          borderWidth: 1,
          borderColor: '#27272A',
        },
      },
    ],
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-end gap-2 mb-2 font-sans">
        <button
          onClick={() => setViewMode('funnel')}
          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${viewMode === 'funnel' ? 'bg-zinc-800 text-white border border-zinc-700' : 'bg-black text-zinc-400 hover:text-zinc-200 border border-zinc-800'}`}
        >
          Funnel View
        </button>
        <button
          onClick={() => setViewMode('sankey')}
          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${viewMode === 'sankey' ? 'bg-zinc-800 text-white border border-zinc-700' : 'bg-black text-zinc-400 hover:text-zinc-200 border border-zinc-800'}`}
        >
          Sankey Flow View
        </button>
      </div>

      <ReactECharts
        option={viewMode === 'funnel' ? funnelOption : sankeyOption}
        style={{ height, width: '100%' }}
      />
    </div>
  );
}
