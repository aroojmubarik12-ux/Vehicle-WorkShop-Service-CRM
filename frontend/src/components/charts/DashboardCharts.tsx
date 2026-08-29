"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#06b6d4", "#ec4899"];

interface StatusPieChartProps {
  data: Array<{ status: string; count: number }>;
}

export const StatusPieChart: React.FC<StatusPieChartProps> = ({ data }) => {
  const formattedData = data.map((d) => ({
    name: d.status.replace(/_/g, " ").toUpperCase(),
    value: d.count
  }));

  if (!formattedData.length) {
    return <div className="h-64 flex items-center justify-center text-xs text-slate-500">No status data</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {formattedData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "0.75rem", fontSize: "12px" }}
            itemStyle={{ color: "#f8fafc" }}
          />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

interface ServiceTypeBarChartProps {
  data: Array<{ serviceType: string; count: number }>;
}

export const ServiceTypeBarChart: React.FC<ServiceTypeBarChartProps> = ({ data }) => {
  if (!data.length) {
    return <div className="h-64 flex items-center justify-center text-xs text-slate-500">No service category data</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
          <XAxis
            dataKey="serviceType"
            stroke="#64748b"
            fontSize={10}
            angle={-20}
            textAnchor="end"
            interval={0}
          />
          <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "0.75rem", fontSize: "12px" }}
            itemStyle={{ color: "#f8fafc" }}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
