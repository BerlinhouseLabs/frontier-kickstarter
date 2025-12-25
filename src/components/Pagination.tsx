import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-2"
    >
      <Button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        icon={<ChevronLeft className="w-4 h-4" />}
        className="rounded-lg py-2"
        aria-label="Previous"
      />

      <div className="flex items-center gap-1">
        {[...Array(totalPages)].map((_, i) => {
          const pageNum = i + 1;
          const isActive = pageNum === page;
          const isNearCurrent = Math.abs(pageNum - page) <= 1;
          const isEndpoint = pageNum === 1 || pageNum === totalPages;

          if (!isNearCurrent && !isEndpoint) {
            if (pageNum === 2 || pageNum === totalPages - 1) {
              return (
                <span key={i} className="px-2 text-surface-400">
                  ...
                </span>
              );
            }
            return null;
          }

          return (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(pageNum)}
              className={`w-10 h-10 rounded-lg font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-primary-600 text-white shadow-lg shadow-primary-500/25"
                  : "bg-surface-800/50 hover:bg-surface-700 text-surface-200"
              }`}
            >
              {pageNum}
            </motion.button>
          );
        })}
      </div>

      <Button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="rounded-lg py-2"
        icon={<ChevronRight className="w-4 h-4" />}
        aria-label="Next"
      />
    </motion.div>
  );
}
