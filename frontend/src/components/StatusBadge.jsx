import React from 'react';

const config = {
  'Booked':           { bg: 'bg-slate-500/20',   text: 'text-slate-300',  dot: 'bg-slate-400',   label: 'Booked' },
  'Picked Up':        { bg: 'bg-blue-500/20',     text: 'text-blue-300',   dot: 'bg-blue-400',    label: 'Picked Up' },
  'In Transit':       { bg: 'bg-indigo-500/20',   text: 'text-indigo-300', dot: 'bg-indigo-400',  label: 'In Transit' },
  'Out for Delivery': { bg: 'bg-violet-500/20',   text: 'text-violet-300', dot: 'bg-violet-400',  label: 'Out for Delivery' },
  'Delivered':        { bg: 'bg-emerald-500/20',  text: 'text-emerald-300',dot: 'bg-emerald-400', label: 'Delivered' },
  'Cancelled':        { bg: 'bg-red-500/20',      text: 'text-red-300',    dot: 'bg-red-400',     label: 'Cancelled' },
  'Returned':         { bg: 'bg-rose-500/20',     text: 'text-rose-300',   dot: 'bg-rose-400',    label: 'Returned' },
};

export default function StatusBadge({ status }) {
  const c = config[status] || config['Booked'];
  return (
    <span className={`status-badge ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
