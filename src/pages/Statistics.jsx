import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
// --- ADDED IMPORTS FOR THE MAP ---
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';

// --- DUMMY DATA (Original) --- //
const statCardsData = [
  { title: 'Customers', value: '3,781', change: '+11.01%', bgColor: 'bg-[#E3F5FF]' },
  { title: 'Orders', value: '1,219', change: '-0.03%' },
  { title: 'Revenue', value: '$695', change: '+15.03%' },
  { title: 'Growth', value: '30.1%', change: '+6.08%', bgColor: 'bg-[#E5ECF6]' },
];

const projectionsVsActualsData = [
  { name: 'Jan', actuals: 17, projectionGap: 3 }, { name: 'Feb', actuals: 22, projectionGap: 2 },
  { name: 'Mar', actuals: 18, projectionGap: 3 }, { name: 'Apr', actuals: 23, projectionGap: 3 },
  { name: 'May', actuals: 15, projectionGap: 3 }, { name: 'Jun', actuals: 20, projectionGap: 5 },
];

const revenueChartData = [
  { name: 'Jan', previous: 14000000, current: 10000000 }, { name: 'Feb', previous: 12000000, current: 8000000 },
  { name: 'Mar', previous: 10000000, current: 10000000 }, { name: 'Apr', previous: 14000000, current: 18000000 },
  { name: 'May', previous: 20000000, current: 21000000 }, { name: 'Jun', previous: 19000000, current: 23000000 },
];

// --- MODIFIED DATA FOR MAP FUNCTIONALITY (ISO_A3 codes added) ---
const revenueByLocationData = [
  { name: 'New York', value: 72, label: '72K', ISO_A3: 'USA' },
  { name: 'San Francisco', value: 39, label: '39K', ISO_A3: 'USA' }, // Note: Multiple cities can map to one country
  { name: 'Sydney', value: 25, label: '25K', ISO_A3: 'AUS' },
  { name: 'Singapore', value: 61, label: '61K', ISO_A3: 'SGP' },
];

// --- MAP-SPECIFIC CONFIGURATION ---
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const colorScale = scaleLinear().domain([0, 100]).range(["#EBF1F9", "#60A5FA"]);

const topSellingProductsData = [
  { name: 'ASOS Ridley High Waist', price: '$79.49', quantity: 82, amount: '$6,518.18' },
  { name: 'Marco Lightweight Shirt', price: '$128.50', quantity: 37, amount: '$4,754.50' },
  { name: 'Half Sleeve Shirt', price: '$39.99', quantity: 64, amount: '$2,559.36' },
  { name: 'Lightweight Jacket', price: '$20.00', quantity: 184, amount: '$3,680.00' },
  { name: 'Marco Shoes', price: '$79.49', quantity: 64, amount: '$1,965.81' },
];

const totalSalesData = [
  { name: 'Direct', value: 300.56, color: '#1F2937' },
  { name: 'Affiliate', value: 135.18, color: '#BDE9C2' },
  { name: 'Sponsored', value: 154.02, color: '#A5B4FC' },
  { name: 'E-mail', value: 48.96, color: '#B1E3F9' },
];
const PIE_CHART_COLORS = totalSalesData.map(item => item.color);
const totalSalesValue = totalSalesData.reduce((sum, entry) => sum + entry.value, 0);

// --- SVG ICONS (Original) --- //
const TrendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 17L9 11L13 15L21 7" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 7H21V12" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// --- HELPER COMPONENTS (Original) --- //
const Card = ({ children, bgColor, className = '' }) => (
  <div className={`${bgColor || 'bg-[#F7F9FB]'} p-6 rounded-2xl flex flex-col ${className}`}>
    {children}
  </div>
);

// --- CUSTOM TOOLTIP FOR PIE CHART (Original) --- //
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

// --- MAIN COMPONENT --- //
export default function Statistics() {
  const [tooltipContent, setTooltipContent] = useState('');

  return (
    <div className="bg-white flex flex-col gap-6 p-6 min-h-screen font-sans">
      <div className='grid grid-cols-4 gap-6'>
        {/* ROW 1 (Original) */}
        <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2  gap-6">
          {statCardsData.map((stat, index) => (
            <Card key={index} bgColor={stat.bgColor}>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">{stat.title}</h3>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-rubik font-normal text-gray-900">{stat.value}</p>
                <div className="flex items-center font-rubik gap-1 text-lg text-gray-900">
                  <span>{stat.change}</span>
                  <TrendIcon />
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Card className="xl:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900">Projections vs Actuals</h3>
          <div className="flex-grow h-50 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectionsVsActualsData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }} barCategoryGap="35%">
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis unit="M" domain={[0, 30]} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'rgba(239, 246, 255, 0.7)' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }} />
                <Bar dataKey="actuals" stackId="a" fill="#A3BFDB" />
                <Bar dataKey="projectionGap" stackId="a" fill="#E5ECF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* ROW 2 (Original) */}
        <Card className="xl:col-span-3">
          <h3 className="text-lg font-semibold text-gray-900">Revenue</h3>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <span>● Current Week <b className="font-rubik">$58,211</b></span>
            <span className="text-gray-400">● Previous Week <b className="font-rubik">$68,768</b></span>
          </div>
          <div className="flex-grow h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `${value / 1000000}M`} domain={[0, 30000000]} tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }} formatter={(value) => `$${(value / 1000000).toFixed(2)}M`} />
                <Line type="monotone" dataKey="current" stroke="#374151" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="previous" stroke="#9CA3AF" strokeWidth={2.5} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* --- THIS IS THE ONLY SECTION THAT HAS BEEN CHANGED --- */}
        <Card className="xl:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900">Revenue by Location</h3>
          {/* CHANGE 1: Gave the container a fixed height and made it a flex container to center the map */}
          <div className="  flex items-center justify-center">
            <ComposableMap
              projectionConfig={{
                scale: 200,
                center: [10, 180] 
              }}
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
          <div className="space-y-3">
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
        {/* --- END OF THE CHANGED SECTION --- */}

        {/* ROW 3 (Original) */}
        <Card className="xl:col-span-3">
          <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium">Name</th>
                  <th scope="col" className="px-6 py-3 font-medium">Price</th>
                  <th scope="col" className="px-6 py-3 font-medium">Quantity</th>
                  <th scope="col" className="px-6 py-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {topSellingProductsData.map((product, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{product.name}</td>
                    <td className="px-6 py-4 font-rubik">{product.price}</td>
                    <td className="px-6 py-4 font-rubik">{product.quantity}</td>
                    <td className="px-6 py-4 font-rubik">{product.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card className="xl:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900">Total Sales</h3>
          <div className="flex-grow mt-4 relative">
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