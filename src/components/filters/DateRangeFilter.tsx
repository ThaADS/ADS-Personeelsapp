"use client";

import { useState } from "react";

type PresetType = "today" | "week" | "month" | "custom";

interface DateRangeFilterProps {
  onChange: (startDate: Date, endDate: Date) => void;
  initialPreset?: PresetType;
}

export function DateRangeFilter({ onChange, initialPreset = "week" }: DateRangeFilterProps) {
  const [preset, setPreset] = useState<PresetType>(initialPreset);
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() + 1); // Monday
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() + 7); // Sunday
    return date.toISOString().split("T")[0];
  });

  const getPresetDates = (preset: PresetType): [Date, Date] => {
    const now = new Date();
    switch (preset) {
      case "today":
        return [new Date(now.setHours(0, 0, 0, 0)), new Date(now.setHours(23, 59, 59, 999))];
      case "week": {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay() + 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return [start, end];
      }
      case "month": {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        return [start, end];
      }
      case "custom":
        return [new Date(startDate), new Date(endDate)];
    }
  };

  const handlePresetChange = (newPreset: PresetType) => {
    setPreset(newPreset);
    if (newPreset !== "custom") {
      const [start, end] = getPresetDates(newPreset);
      onChange(start, end);
    }
  };

  const handleCustomDateChange = (type: "start" | "end", value: string) => {
    if (type === "start") {
      setStartDate(value);
      onChange(new Date(value), new Date(endDate));
    } else {
      setEndDate(value);
      onChange(new Date(startDate), new Date(value));
    }
  };

  const presets: { value: PresetType; label: string }[] = [
    { value: "today", label: "Vandaag" },
    { value: "week", label: "Deze week" },
    { value: "month", label: "Deze maand" },
    { value: "custom", label: "Aangepast" },
  ];

  return (
    <div className="space-y-3">
      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePresetChange(p.value)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
              preset === p.value
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-white/10"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom Date Inputs */}
      {preset === "custom" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
              Van
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleCustomDateChange("start", e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[44px] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
              Tot
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleCustomDateChange("end", e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[44px] transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  );
}
