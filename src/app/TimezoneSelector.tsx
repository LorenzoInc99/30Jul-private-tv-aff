"use client";

const TIMEZONES = [
  { value: 'Europe/London', label: 'UK Time (BST)' },
  { value: 'Europe/Paris', label: 'Central Europe (CET)' },
  { value: 'America/New_York', label: 'US Eastern (ET)' },
  { value: 'America/Los_Angeles', label: 'US Pacific (PT)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'auto', label: 'Auto (Local)' },
];

export default function TimezoneSelector({ value, onChange }: { value: string; onChange: (tz: string) => void }) {
  return (
    <select
      className="appearance-none rounded-md py-1.5 pl-3 pr-8 text-sm font-medium bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
      value={value || 'auto'}
      onChange={e => {
        onChange(e.target.value);
        if (typeof window !== 'undefined') {
          localStorage.setItem('userTimezone', e.target.value);
        }
      }}
    >
      {TIMEZONES.map(tz => (
        <option key={tz.value} value={tz.value}>{tz.label}</option>
      ))}
    </select>
  );
} 