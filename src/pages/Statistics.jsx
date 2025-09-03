import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { useStatsStore } from '../store/statsStore';

// --- STATIC DATA (AS PER INSTRUCTIONS) --- //
const revenueByLocationData = [
  { name: 'New York', value: 72, label: '72K', ISO_A3: 'USA' },
  { name: 'San Francisco', value: 39, label: '39K', ISO_A3: 'USA' },
  { name: 'Sydney', value: 25, label: '25K', ISO_A3: 'AUS' },
  { name: 'Singapore', value: 61, label: '61K', ISO_A3: 'SGP' },
];
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const colorScale = scaleLinear().domain([0, 100]).range(["#EBF1F9", "#60A5FA"]);
const totalSalesData = [
  { name: 'Direct', value: 300.56, color: '#1F2937' },
  { name: 'Affiliate', value: 135.18, color: '#BDE9C2' },
  { name: 'Sponsored', value: 154.02, color: '#A5B4FC' },
  { name: 'E-mail', value: 48.96, color: '#B1E3F9' },
];
const PIE_CHART_COLORS = totalSalesData.map(item => item.color);
const totalSalesValue = totalSalesData.reduce((sum, entry) => sum + entry.value, 0);


// --- FORMATTING HELPERS --- //
const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
const formatLargeNumber = (value) => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
        return new Intl.NumberFormat('en-US').format(value);
    }
    return value;
};
const formatPercentage = (value) => {
    const num = parseFloat(value);
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
};

// --- SVG & HELPER COMPONENTS --- //
const TrendIcon = ({ change }) => {
    const isPositive = parseFloat(change) >= 0;
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {isPositive ? (
                <>
                    <path d="M3 17L9 11L13 15L21 7" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 7H21V12" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </>
            ) : (
                <>
                    <path d="M3 7L9 13L13 9L21 17" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 17H21V12" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </>
            )}
        </svg>
    );
};
const Card = ({ children, bgColor, className = '' }) => (
  <div className={`${bgColor || 'bg-[#F7F9FB]'} p-6 rounded-2xl flex flex-col ${className}`}>
    {children}
  </div>
);
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percentage = ((data.value / totalSalesValue) * 100).toFixed(1);
    return (
      <div className="bg-[#4A5568] text-white font-semibold font-rubik text-sm px-3 py-1.5 rounded-lg shadow-lg">
        {`${percentage}%`}
      </div>
    );
  }
  return null;
};
const LoadingSkeleton = ({ className }) => <div className={`bg-gray-200 animate-pulse rounded-lg ${className}`}></div>;


// --- MAIN COMPONENT --- //
export default function Statistics() {
  const [tooltipContent, setTooltipContent] = useState('');
  const { kpis, revenueTimeSeries, topSellingProducts, isLoading, fetchStatistics } = useStatsStore();

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const statCardsData = useMemo(() => {
    if (!kpis) return [];
    return [
      { title: 'Customers', value: formatLargeNumber(kpis.customers.value), change: kpis.customers.change, bgColor: 'bg-[#E3F5FF]' },
      { title: 'Orders', value: formatLargeNumber(kpis.orders.value), change: kpis.orders.change },
      { title: 'Revenue', value: `$${formatLargeNumber(kpis.revenue.value)}`, change: kpis.revenue.change },
      { title: 'Growth', value: formatPercentage(kpis.growth.value), change: null, bgColor: 'bg-[#E5ECF6]' },
    ];
  }, [kpis]);

  const expensesVsRevenueData = useMemo(() => {
    return revenueTimeSeries.map(item => ({
      name: item.name,
      revenue: item.revenueThisYear,
      expenses: item.expenses,
    }));
  }, [revenueTimeSeries]);

  return (
    <div className="bg-white flex flex-col gap-6 p-4 md:p-6 min-h-screen font-sans">
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => <LoadingSkeleton key={index} className="h-28" />)
          ) : (
            statCardsData.map((stat, index) => (
              <Card key={index} bgColor={stat.bgColor}>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{stat.title}</h3>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-rubik font-normal text-gray-900">{stat.value}</p>
                  {stat.change !== null && (
                    <div className="flex items-center font-rubik gap-1 text-lg text-gray-900">
                      <span>{formatPercentage(stat.change)}</span>
                      <TrendIcon change={stat.change} />
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
        <Card>
          <h3 className="text-lg font-semibold text-gray-900">Expenses vs Revenue</h3>
          <div className="flex-grow h-50 mt-4">
             {isLoading ? <LoadingSkeleton className="h-full" /> : (
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={expensesVsRevenueData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }} barCategoryGap="35%">
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => `${value / 1000}K`} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'rgba(239, 246, 255, 0.7)' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }} formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="expenses" stackId="a" fill="#E5ECF6" />
                    <Bar dataKey="revenue" stackId="a" fill="#A3BFDB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <Card className="xl:col-span-3">
          <h3 className="text-lg font-semibold text-gray-900">Revenue (Last 12 Months vs Previous Year)</h3>
          <div className="flex-grow h-80 mt-4">
             {isLoading ? <LoadingSkeleton className="h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTimeSeries} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => `${value / 1000}K`} tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }} formatter={(value) => formatCurrency(value)} />
                    <Line type="monotone" name="This Year" dataKey="revenueThisYear" stroke="#374151" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" name="Last Year" dataKey="revenueLastYear" stroke="#9CA3AF" strokeWidth={2.5} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
             )}
          </div>
        </Card>

        <Card className="xl:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900">Revenue by Location</h3>
          <div className="h-48 flex items-center justify-center -mt-4 -mb-4">
            <ComposableMap
              projectionConfig={{ scale: 200, center: [10, 180] }}
              onMouseLeave={() => setTooltipContent('')}
            >
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                    geographies.map((geo) => {
                        const d = revenueByLocationData.find((s) => s.ISO_A3 === geo.properties.ISO_A3);
                        return (
                        <Geography
                            key={geo.rsmKey} geography={geo}
                            fill={d ? colorScale(d.value) : '#999999'}
                        stroke="#FFFFFF" strokeWidth={0.5}
                            onMouseEnter={() => {
                                const { name } = geo.properties;
                                setTooltipContent(d ? `${name} - ${d.label}` : name);
                            }}
                            style={{ default: { outline: 'none' }, hover: { fill: '#2563EB', outline: 'none' }, pressed: { outline: 'none' } }}
                        />);
                    })}
                </Geographies>
            </ComposableMap>
          </div>
          <div className="space-y-3 mt-2">
            {revenueByLocationData.map(location => (
              <div key={location.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{location.name}</span>
                  <span className="text-gray-500 font-rubik">{location.label}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${location.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="xl:col-span-3">
          <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
          <div className="mt-4 overflow-x-auto">
             {isLoading ? <LoadingSkeleton className="h-64" /> : (
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-3 font-medium">Name</th>
                      <th scope="col" className="px-6 py-3 font-medium">Quantity Sold</th>
                      <th scope="col" className="px-6 py-3 font-medium">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSellingProducts.map((product, index) => (
                      <tr key={index} className="border-b border-gray-200 last:border-b-0">
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{product.name}</td>
                        <td className="px-6 py-4 font-rubik">{product.quantity}</td>
                        <td className="px-6 py-4 font-rubik">{formatCurrency(product.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             )}
          </div>
        </Card>

        <Card className="xl:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900">Total Sales</h3>
          <div className="flex-grow mt-4 relative h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomPieTooltip />} cursor={false} />
                <Pie data={totalSalesData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" cornerRadius={8} startAngle={90} endAngle={-270} >
                  {totalSalesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {totalSalesData.map(item => (
              <div key={item.name} className="flex justify-between items-center text-base">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium font-rubik text-gray-800">${item.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}