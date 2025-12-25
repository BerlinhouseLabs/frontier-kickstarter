import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { AnimatePresence, motion } from "motion/react";
import { Calendar, Clock, ChevronLeft, ChevronRight, X } from "lucide-react";

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  minDate?: Date;
  disabled?: boolean;
  error?: boolean;
  placeholder?: string;
}

export default function DateTimePicker({
  value,
  onChange,
  minDate = new Date(),
  disabled = false,
  error = false,
  placeholder = "Select date and time",
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
  const [time, setTime] = useState(value ? format(value, "HH:mm") : "12:00");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setTime(format(value, "HH:mm"));
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    const [hours, minutes] = time.split(":").map(Number);
    date.setHours(hours, minutes);
    onChange(date);
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (selectedDate) {
      const [hours, minutes] = newTime.split(":").map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes);
      onChange(newDate);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(undefined);
    setTime("12:00");
    onChange(undefined);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border ${
          error ? "border-danger" : "border-surface-700"
        } text-left flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Calendar className="w-4 h-4 text-surface-400" />
        <span className={selectedDate ? "text-surface-100" : "text-surface-500"}>
          {selectedDate ? format(selectedDate, "MMM d, yyyy 'at' h:mm a") : placeholder}
        </span>
        {selectedDate && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-auto p-1 hover:bg-surface-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-surface-400" />
          </button>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 p-4 glass-card rounded-2xl shadow-2xl"
          >
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={{ before: minDate }}
              showOutsideDays
              classNames={{
                root: "text-surface-100",
                months: "flex flex-col",
                month: "space-y-3",
                month_caption: "flex justify-center relative items-center h-10",
                caption_label: "text-sm font-semibold text-surface-100",
                nav: "flex items-center justify-between absolute inset-x-0",
                button_previous: "p-1.5 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-surface-200 transition-colors",
                button_next: "p-1.5 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-surface-200 transition-colors",
                month_grid: "w-full border-collapse",
                weekdays: "flex",
                weekday: "text-surface-500 text-xs font-medium w-9 h-9 flex items-center justify-center",
                week: "flex",
                day: "p-0",
                day_button: "w-9 h-9 text-sm rounded-lg transition-all hover:bg-surface-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent",
                selected: "!bg-primary-600 !text-white hover:!bg-primary-500",
                today: "font-bold text-primary-400",
                outside: "text-surface-600",
                disabled: "text-surface-700",
              }}
              components={{
                Chevron: ({ orientation }) =>
                  orientation === "left" ? (
                    <ChevronLeft className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  ),
              }}
            />

            <div className="mt-4 pt-4 border-t border-surface-700/50">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-surface-400" />
                <span className="text-sm text-surface-400">Time</span>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="ml-auto px-3 py-1.5 rounded-lg bg-surface-800/50 border border-surface-700 text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent [color-scheme:dark]"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

