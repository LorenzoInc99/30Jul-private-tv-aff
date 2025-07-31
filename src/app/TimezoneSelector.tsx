"use client";

const TIMEZONES = [
  { value: 'auto', label: 'Auto (Local Time)' },
  { value: 'Europe/London', label: 'GMT/BST' },
  { value: 'Europe/Paris', label: 'CET/CEST' },
  { value: 'America/New_York', label: 'ET' },
  { value: 'America/Chicago', label: 'CT' },
  { value: 'America/Denver', label: 'MT' },
  { value: 'America/Los_Angeles', label: 'PT' },
  { value: 'Australia/Sydney', label: 'AET' },
  { value: 'Asia/Tokyo', label: 'JST' },
  { value: 'UTC', label: 'UTC' },
];

export default function TimezoneSelector({ value, onChange }: { value: string; onChange: (tz: string) => void }) {
  return (
    <select
      id="timezone-select"
      className="appearance-none rounded-md py-1.5 pl-2 pr-6 text-xs font-medium bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white max-w-[200px]"
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