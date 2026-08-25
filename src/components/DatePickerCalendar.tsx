import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  RotateCcw
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  parseISO, 
  isValid,
  setYear,
  setMonth
} from 'date-fns';

interface DatePickerCalendarProps {
  selectedDate: string | null; // YYYY-MM-DD
  onSelectDate: (date: string | null) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const AVAILABLE_YEARS = [2024, 2025, 2026, 2027];

export const DatePickerCalendar: React.FC<DatePickerCalendarProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  // Current viewing month in the calendar (defaults to selectedDate or 2026-03-01 / now)
  const initialViewDate = () => {
    if (selectedDate) {
      const parsed = parseISO(selectedDate);
      if (isValid(parsed)) return parsed;
    }
    // Default to 2026 if today is in another year, or current date
    return new Date(2026, 4, 15); // May 2026 default for dataset
  };

  const [currentMonth, setCurrentMonth] = useState<Date>(initialViewDate);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync viewing month when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const parsed = parseISO(selectedDate);
      if (isValid(parsed)) {
        setCurrentMonth(parsed);
      }
    }
  }, [selectedDate]);

  // Click outside & Escape key listeners
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedDateObj = selectedDate && isValid(parseISO(selectedDate)) ? parseISO(selectedDate) : null;

  // Calendar Grid Generator
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const handleDateClick = (day: Date) => {
    const formatted = format(day, 'yyyy-MM-dd');
    onSelectDate(formatted);
    setIsOpen(false);
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handleTodayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const formatted = format(today, 'yyyy-MM-dd');
    setCurrentMonth(today);
    onSelectDate(formatted);
    setIsOpen(false);
  };

  const handleClearClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectDate(null);
    setIsOpen(false);
  };

  const formattedSelectedText = selectedDateObj 
    ? format(selectedDateObj, 'd MMM yyyy')
    : 'Select Date';

  return (
    <div className="relative inline-block w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-1.5 text-xs py-1.5 px-2.5 rounded-lg border transition-all ${
          selectedDate
            ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-700 text-sky-800 dark:text-sky-200 font-semibold shadow-2xs'
            : 'bg-slate-50/50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
        } focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-hidden`}
      >
        <div className="flex items-center gap-1.5 truncate">
          <CalendarIcon className={`w-3.5 h-3.5 shrink-0 ${selectedDate ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
          <span className="truncate">{formattedSelectedText}</span>
        </div>

        {selectedDate ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onSelectDate(null);
            }}
            className="p-0.5 rounded hover:bg-sky-200 dark:hover:bg-sky-900 text-sky-600 dark:text-sky-300 transition-colors"
            title="Clear selected date"
          >
            <X className="w-3 h-3" />
          </span>
        ) : null}
      </button>

      {/* Calendar Popup */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto right-0 sm:right-auto z-50 mt-1.5 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-dropdown p-3.5 animate-in fade-in zoom-in-95 duration-150 select-none">
          {/* Header Navigation */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Month & Year Jump Selectors */}
            <div className="flex items-center gap-1">
              <select
                value={currentMonth.getMonth()}
                onChange={(e) => {
                  setCurrentMonth(setMonth(currentMonth, Number(e.target.value)));
                }}
                className="text-xs font-bold text-slate-800 dark:text-slate-100 bg-transparent border-none py-0.5 px-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-hidden cursor-pointer"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={currentMonth.getFullYear()}
                onChange={(e) => {
                  setCurrentMonth(setYear(currentMonth, Number(e.target.value)));
                }}
                className="text-xs font-bold text-slate-800 dark:text-slate-100 bg-transparent border-none py-0.5 px-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-hidden cursor-pointer"
              >
                {AVAILABLE_YEARS.map((y) => (
                  <option key={y} value={y} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d} className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const isSelected = selectedDateObj && isSameDay(day, selectedDateObj);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDay = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className={`h-7 w-full rounded-md text-xs font-medium flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-sky-600 text-white font-bold shadow-xs'
                      : isTodayDay
                      ? 'border border-sky-500 text-sky-600 dark:text-sky-400 font-semibold hover:bg-sky-50 dark:hover:bg-sky-950/40'
                      : isCurrentMonth
                      ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      : 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Actions */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleTodayClick}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-colors"
              >
                Today
              </button>
              {selectedDate && (
                <button
                  type="button"
                  onClick={handleClearClick}
                  className="px-2 py-1 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-[11px] font-medium transition-colors flex items-center gap-0.5"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  Clear
                </button>
              )}
            </div>

            {selectedDateObj && (
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {format(selectedDateObj, 'd MMM yyyy')}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
