"use client";

import {
  MoreVertical,
  Download,
  SlidersHorizontal,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const revenueData = [
  { name: "Jan", sales1: 12000, sales2: 0, sales3: 6000 },
  { name: "Feb", sales1: 9000, sales2: 0, sales3: 7000 },
  { name: "March", sales1: 15000, sales2: 0, sales3: 8000 },
  { name: "April", sales1: 13000, sales2: 0, sales3: 8000 },
  { name: "May", sales1: 14995.2, sales2: 18824.32, sales3: 23480.5 },
  { name: "Jun", sales1: 10000, sales2: 0, sales3: 5000 },
  { name: "July", sales1: 11000, sales2: 0, sales3: 5000 },
  { name: "Aug", sales1: 13000, sales2: 0, sales3: 5000 },
  { name: "Sep", sales1: 15000, sales2: 0, sales3: 6000 },
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    fill: string;
    value: number;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100">
        <p className="font-semibold text-gray-900 mb-3">{label}, 2025</p>
        <div className="space-y-2">
          {payload.map((entry, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: entry.fill }}
                />
                <span className="font-medium text-gray-700">
                  ${entry.value.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <span className="text-blue-600 font-medium text-xs">
                +{index === 0 ? "12.0" : index === 1 ? "6.0" : "8.5"}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const DotGroup = ({ activeIndex }: { activeIndex: number }) => (
  <div className="flex gap-1 items-end h-8">
    {[1, 2, 3, 5, 8, 4, 2, 1].map((val, i) => (
      <div className="flex flex-col gap-0.5 justify-end" key={i}>
        {Array.from({ length: val }).map((_, j) => (
          <div
            key={j}
            className={`w-1.5 h-1.5 rounded-full ${
              i === activeIndex ? "bg-blue-600" : "bg-blue-100"
            }`}
          />
        ))}
      </div>
    ))}
  </div>
);

const DotGroupRed = ({ activeIndex }: { activeIndex: number }) => (
  <div className="flex gap-1 items-end h-8">
    {[1, 2, 3, 5, 8, 4, 3, 2, 1].map((val, i) => (
      <div className="flex flex-col gap-0.5 justify-end" key={i}>
        {Array.from({ length: val }).map((_, j) => (
          <div
            key={j}
            className={`w-1.5 h-1.5 rounded-full ${
              i === activeIndex ? "bg-red-500" : "bg-red-100"
            }`}
          />
        ))}
      </div>
    ))}
  </div>
);

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#fcfcfd] font-sans">
      <div className="w-full space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="bg-white p-1 rounded-2xl flex items-center shadow-sm border border-gray-100">
            {["Overview", "Sales", "Order", "Report"].map((tab, i) => (
              <button
                key={tab}
                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  i === 0
                    ? "bg-gray-50 text-gray-900 shadow-sm border border-gray-100"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              <SlidersHorizontal className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* 3 KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Total sales",
              value: "$18.200",
              percent: "10.2%",
              up: true,
              dots: <DotGroup activeIndex={4} />,
            },
            {
              title: "Operating expenses",
              value: "$18.200",
              percent: "5.75%",
              up: false,
              dots: <DotGroupRed activeIndex={4} />,
            },
            {
              title: "Gross profit",
              value: "$18.200",
              percent: "8.55%",
              up: true,
              dots: <DotGroup activeIndex={5} />,
            },
          ].map((kpi, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="text-gray-900 font-semibold text-lg">
                  {kpi.title}
                </span>
                <button className="p-1 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {kpi.value}
                </span>

                {kpi.dots}

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`flex items-center gap-1 text-sm font-medium ${
                      kpi.up ? "text-blue-600" : "text-red-500"
                    }`}
                  >
                    {kpi.up ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {kpi.percent}
                  </span>
                  <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                    vs last month
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Forecast */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-semibold text-gray-900">
                Revenue Forecast
              </h2>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  Monthly
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-2 border border-gray-200 rounded-xl shadow-sm">
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData}
                  margin={{ top: 0, right: 0, left: -20, bottom: 40 }}
                  barSize={40}
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="#F3F4F6"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 13, fontWeight: 500 }}
                    dy={16}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 13, fontWeight: 500 }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                    dx={-10}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "transparent" }}
                  />
                  <Bar
                    dataKey="sales3"
                    stackId="a"
                    fill="#e0e7ff"
                    radius={[8, 8, 8, 8]}
                    stroke="#ffffff"
                    strokeWidth={3}
                  />
                  <Bar
                    dataKey="sales2"
                    stackId="a"
                    fill="#1f2937"
                    radius={[8, 8, 8, 8]}
                    stroke="#ffffff"
                    strokeWidth={3}
                  />
                  <Bar
                    dataKey="sales1"
                    stackId="a"
                    fill="#3b82f6"
                    radius={[8, 8, 8, 8]}
                    stroke="#ffffff"
                    strokeWidth={3}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center gap-8 mt-6">
              {[
                { color: "bg-gray-500", label: "Sales revenue" },
                { color: "bg-gray-900", label: "Sales revenue" },
                { color: "bg-blue-600", label: "Sales revenue" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded-md ${item.color}`} />
                  <span className="text-sm font-medium text-gray-600">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Source Card */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Source</h2>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
                    Contacts
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-1.5 border border-gray-200 rounded-lg">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-8">
                <span className="text-4xl font-bold text-gray-900">
                  12.450
                </span>
                <div className="flex flex-col text-sm text-gray-500 font-medium">
                  <span>Total</span>
                  <span>source</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex gap-1.5 mb-8">
                <div className="h-8 rounded-full bg-blue-600 w-[55%]" />
                <div className="h-8 rounded-full bg-gray-900 w-[20%]" />
                <div className="h-8 rounded-full bg-gray-600 w-[15%]" />
                <div className="h-8 rounded-full bg-gray-300 w-[10%]" />
              </div>

              {/* List */}
              <div className="space-y-4">
                {[
                  { name: "Website", color: "bg-blue-600", value: "6,848", percent: "55%" },
                  { name: "Social Media", color: "bg-gray-900", value: "2,490", percent: "20%" },
                  { name: "Email", color: "bg-gray-600", value: "1,867", percent: "15%" },
                  { name: "Referral", color: "bg-gray-300", value: "1,245", percent: "10%" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-5 rounded-full ${item.color}`} />
                      <span className="text-gray-600 font-medium text-sm">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-gray-900 text-sm">
                        {item.value}
                      </span>
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md font-medium text-xs w-10 text-center">
                        {item.percent}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full mt-8 py-3.5 border border-gray-200 text-gray-900 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
