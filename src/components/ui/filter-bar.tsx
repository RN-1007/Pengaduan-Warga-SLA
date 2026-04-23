"use client"

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowDownAZ, ArrowUpZA, Clock, X, SlidersHorizontal } from "lucide-react";
import { SortOption } from "@/hooks/use-filtered-data";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/utils/utils";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  sortOption: SortOption;
  onSortChange: (val: SortOption) => void;
  placeholder?: string;
  totalFiltered?: number;
  totalItems?: number;
  className?: string;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  placeholder = "Ketik untuk mencari sesuatu...",
  totalFiltered,
  totalItems,
  className
}: FilterBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "relative flex flex-col sm:flex-row gap-3 items-center justify-between mb-6",
        "bg-white/70 backdrop-blur-xl p-2.5 rounded-[1.25rem] border transition-all duration-300",
        isFocused 
          ? "border-blue-300 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.15)] ring-4 ring-blue-500/10" 
          : "border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80",
        className
      )}
    >
      <div className="relative flex items-center w-full sm:flex-1 h-11 px-2">
        <motion.div 
          animate={{ scale: isFocused ? 1.08 : 1, color: isFocused ? "#3b82f6" : "#94a3b8" }}
          transition={{ duration: 0.2 }}
        >
          <Search className="w-5 h-5 ml-1 mr-3" />
        </motion.div>
        
        <Input
          placeholder={placeholder}
          className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-slate-700 placeholder:text-slate-400 text-base h-full w-full px-0"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        <AnimatePresence>
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={() => onSearchChange("")}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-700 transition-colors ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto px-1 sm:px-0">
        
        {/* Separator for desktop */}
        <div className="hidden sm:block w-[1px] h-8 bg-slate-200/80 mx-1 flex-shrink-0"></div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          {totalFiltered !== undefined && totalItems !== undefined && (
            <motion.div 
              initial={false}
              animate={{ 
                backgroundColor: searchQuery ? "#eff6ff" : "#f8fafc",
                color: searchQuery ? "#2563eb" : "#64748b" 
              }}
              className="flex items-center gap-1.5 px-3 h-10 rounded-xl text-xs font-semibold border border-transparent whitespace-nowrap transition-colors"
            >
              <div className={`w-2 h-2 rounded-full ${searchQuery ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`}></div>
              {totalFiltered} <span className="opacity-70 font-medium hidden sm:inline">dari {totalItems}</span>
              <span className="sm:hidden font-medium">/{totalItems}</span>
            </motion.div>
          )}
          
          <Select value={sortOption} onValueChange={(val: SortOption) => onSortChange(val)}>
            <SelectTrigger className="h-10 px-4 rounded-xl border-slate-200/60 bg-slate-50/50 hover:bg-slate-100 text-slate-700 font-medium transition-colors shadow-none focus:ring-0 focus:ring-offset-0 min-w-[130px] gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <SelectValue placeholder="Urutan" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 shadow-xl overflow-hidden p-1 min-w-[180px]">
              <SelectItem value="newest" className="rounded-xl cursor-pointer focus:bg-blue-50 focus:text-blue-700 transition-colors">
                <div className="flex items-center gap-3 font-medium py-1">
                  <div className="p-1.5 bg-white shadow-sm border border-slate-100 rounded-lg"><Clock className="w-4 h-4 text-slate-600" /></div> 
                  Terbaru
                </div>
              </SelectItem>
              <SelectItem value="oldest" className="rounded-xl cursor-pointer focus:bg-blue-50 focus:text-blue-700 transition-colors mt-1">
                <div className="flex items-center gap-3 font-medium py-1">
                  <div className="p-1.5 bg-white shadow-sm border border-slate-100 rounded-lg"><Clock className="w-4 h-4 text-slate-400" /></div> 
                  Terlama
                </div>
              </SelectItem>
              <SelectItem value="a-z" className="rounded-xl cursor-pointer focus:bg-blue-50 focus:text-blue-700 transition-colors mt-1">
                <div className="flex items-center gap-3 font-medium py-1">
                  <div className="p-1.5 bg-white shadow-sm border border-slate-100 rounded-lg"><ArrowDownAZ className="w-4 h-4 text-slate-600" /></div> 
                  A - Z
                </div>
              </SelectItem>
              <SelectItem value="z-a" className="rounded-xl cursor-pointer focus:bg-blue-50 focus:text-blue-700 transition-colors mt-1">
                <div className="flex items-center gap-3 font-medium py-1">
                  <div className="p-1.5 bg-white shadow-sm border border-slate-100 rounded-lg"><ArrowUpZA className="w-4 h-4 text-slate-600" /></div> 
                  Z - A
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </motion.div>
  );
}
