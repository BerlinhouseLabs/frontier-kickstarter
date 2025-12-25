import { motion, AnimatePresence } from "motion/react";
import { Inbox } from "lucide-react";
import { fadeIn, fadeInUp } from "../lib/animations";
import type { SponsorPass } from "../types";
import PassCard from "./PassCard";
import Pagination from "./Pagination";

interface PassGridProps {
  passes: SponsorPass[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRevoke: (pass: SponsorPass) => void;
  showRevoked: boolean;
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: i * 0.05 }}
          className="glass-card rounded-xl p-5 animate-pulse"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <div className="h-5 w-32 bg-surface-700 rounded" />
              <div className="h-4 w-48 bg-surface-700 rounded" />
            </div>
            <div className="h-6 w-16 bg-surface-700 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-24 bg-surface-700 rounded" />
            <div className="h-3 w-20 bg-surface-700 rounded" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function EmptyState({ showRevoked }: { showRevoked: boolean }) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="glass-card rounded-2xl p-12 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface-800/50 mb-6"
      >
        <Inbox className="w-10 h-10 text-surface-400" />
      </motion.div>
      <h3 className="text-xl font-semibold text-surface-100 mb-2">
        No passes found
      </h3>
      <p className="text-surface-400 max-w-md mx-auto">
        {showRevoked
          ? "There are no sponsor passes to display. Create a new pass to get started."
          : "There are no active sponsor passes. Create a new pass or toggle 'Show Revoked' to see revoked passes."}
      </p>
    </motion.div>
  );
}

export default function PassGrid({
  passes,
  loading,
  page,
  totalPages,
  onPageChange,
  onRevoke,
  showRevoked,
}: PassGridProps) {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (passes.length === 0) {
    return <EmptyState showRevoked={showRevoked} />;
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20"
        >
          {passes.map((pass, index) => (
            <PassCard
              key={pass.id}
              pass={pass}
              onRevoke={() => onRevoke(pass)}
              index={index}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {totalPages > 1 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 flex justify-center pointer-events-none">
          <div className="glass-card rounded-2xl px-4 py-3 pointer-events-auto">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        </div>
      )}
    </>
  );
}
