import { motion } from "motion/react";
import { Mail, Calendar, Clock, Ban } from "lucide-react";
import { scaleIn, cardHover } from "../lib/animations";
import type { SponsorPass } from "../types";
import Button from "./Button";

interface PassCardProps {
  pass: SponsorPass;
  onRevoke: () => void;
  index: number;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: "active" | "revoked" }) {
  const isActive = status === "active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
        isActive ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? "bg-success" : "bg-danger"
        }`}
      />
      {status}
    </span>
  );
}

export default function PassCard({ pass, onRevoke, index }: PassCardProps) {
  const isActive = pass.status === "active";

  return (
    <motion.div
      layout
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        layout: { duration: 0.2 },
      }}
      whileHover={cardHover}
      className="glass-card rounded-xl p-5 group flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-surface-50 truncate group-hover:text-primary-300 transition-colors">
            {pass.firstName} {pass.lastName}
          </h3>
          <div className="flex items-center gap-2 text-surface-300 mt-1">
            <Mail className="w-4 h-4 shrink-0" />
            <span className="text-sm truncate">{pass.email}</span>
          </div>
        </div>
        <StatusBadge status={pass.status} />
      </div>

      <div className="space-y-2 text-sm text-surface-400 flex-1">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Created: {formatDate(pass.createdAt)}</span>
        </div>
        {pass.expiresAt && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Expires: {formatDate(pass.expiresAt)}</span>
          </div>
        )}
        {pass.revokedAt && (
          <div className="flex items-center gap-2 text-danger">
            <Ban className="w-4 h-4" />
            <span>Revoked: {formatDate(pass.revokedAt)}</span>
          </div>
        )}
      </div>

      {isActive && (
        <Button
          variant="danger"
          onClick={onRevoke}
          icon={<Ban className="w-4 h-4" />}
          className="w-full mt-4"
        >
          Revoke Pass
        </Button>
      )}
    </motion.div>
  );
}
