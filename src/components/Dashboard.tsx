import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, RefreshCw, Sparkles } from "lucide-react";
import { useSponsors } from "../hooks/useSponsors";
import { usePasses } from "../hooks/usePasses";
import { fadeInUp, slideInLeft, fadeIn } from "../lib/animations";
import type { SponsorPass } from "../types";
import SponsorSelect from "./SponsorSelect";
import StatusToggle from "./StatusToggle";
import PassGrid from "./PassGrid";
import CreatePassModal from "./CreatePassModal";
import RevokeDialog from "./RevokeDialog";
import Button from "./Button";

export default function Dashboard() {
  const {
    sponsors,
    selectedSponsor,
    setSelectedSponsor,
    loading: sponsorsLoading,
  } = useSponsors();
  const [showRevoked, setShowRevoked] = useState(false);
  const {
    passes,
    loading: passesLoading,
    page,
    totalPages,
    setPage,
    refetch,
  } = usePasses({ showRevoked });

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [revokePass, setRevokePass] = useState<SponsorPass | null>(null);

  const handleCreateSuccess = () => {
    setCreateModalOpen(false);
    refetch();
  };

  const handleRevokeSuccess = () => {
    setRevokePass(null);
    refetch();
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto"
      >
        <header className="mb-8">
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-600/10 border border-primary-500/20 mb-4"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary-400" />
            <span className="text-xs font-medium text-primary-300 uppercase tracking-wider">
              Frontier OS
            </span>
          </motion.div>
          <motion.h1
            className="text-3xl md:text-4xl font-display font-bold text-surface-50 mb-3"
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            Sponsor Pass{" "}
            <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Manager
            </span>
          </motion.h1>
          <motion.p
            className="text-surface-300 text-lg max-w-xl"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            Create, manage, and revoke membership passes for your sponsors
          </motion.p>
        </header>

        <motion.div
          className="glass-card rounded-2xl p-4 md:p-6 mb-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative z-10"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center w-full md:w-auto">
            <SponsorSelect
              sponsors={sponsors}
              selected={selectedSponsor}
              onChange={setSelectedSponsor}
              loading={sponsorsLoading}
              className="w-full sm:w-auto sm:min-w-[240px]"
            />
            <StatusToggle checked={showRevoked} onChange={setShowRevoked} />
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <Button
              onClick={() => refetch()}
              disabled={passesLoading}
              className="flex-1 md:flex-none"
              icon={
                <RefreshCw
                  className={`w-4 h-4 ${passesLoading ? "animate-spin" : ""}`}
                />
              }
            >
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button
              variant="primary"
              onClick={() => setCreateModalOpen(true)}
              disabled={!selectedSponsor}
              className="flex-1 md:flex-none whitespace-nowrap"
              icon={<Plus className="w-5 h-5" />}
            >
              Create Pass
            </Button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <PassGrid
            passes={passes}
            loading={passesLoading}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onRevoke={setRevokePass}
            showRevoked={showRevoked}
          />
        </AnimatePresence>

        <CreatePassModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
          sponsorId={selectedSponsor?.id ?? 0}
        />

        <RevokeDialog
          pass={revokePass}
          open={!!revokePass}
          onClose={() => setRevokePass(null)}
          onSuccess={handleRevokeSuccess}
        />
      </motion.div>
    </div>
  );
}
