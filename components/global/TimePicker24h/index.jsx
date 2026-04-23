"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";

export default function TimePicker24h({ value, onChange }) {
  // value is "HH:mm"
  const [hours, minutes] = value.split(":");

  const hoursArray = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, "0")
  );
  
  const minutesArray = Array.from({ length: 60 }, (_, i) => 
    i.toString().padStart(2, "0")
  );

  return (
    <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all shadow-sm group w-fit">
      <div className="px-2">
        <Clock className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
      </div>
      
      <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-inner">
        <Select
          value={hours}
          onValueChange={(h) => onChange(`${h}:${minutes}`)}
        >
          <SelectTrigger 
            hideIcon 
            className="w-[45px] border-none bg-transparent focus:ring-0 h-8 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-l-lg transition-colors px-0 justify-center"
          >
            <SelectValue placeholder="HH" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px] rounded-xl border-slate-200 dark:border-slate-800">
            {hoursArray.map((h) => (
              <SelectItem key={h} value={h} className="rounded-lg">
                {h}h
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-slate-300 dark:text-slate-600 font-bold px-0.5">:</span>

        <Select
          value={minutes}
          onValueChange={(m) => onChange(`${hours}:${m}`)}
        >
          <SelectTrigger 
            hideIcon 
            className="w-[45px] border-none bg-transparent focus:ring-0 h-8 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-r-lg transition-colors px-0 justify-center"
          >
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px] rounded-xl border-slate-200 dark:border-slate-800">
            {minutesArray.map((m) => (
              <SelectItem key={m} value={m} className="rounded-lg">
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
