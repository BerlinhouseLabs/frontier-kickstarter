import { useState, Fragment, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, X, Ban } from "lucide-react";
import { sdk } from "../main";
import type { SponsorPass } from "../types";
import Button from "./Button";

interface RevokeDialogProps {
  pass: SponsorPass | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RevokeDialog({
  pass,
  open,
  onClose,
  onSuccess,
}: RevokeDialogProps) {
  const [isRevoking, setIsRevoking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setIsRevoking(false);
      setError(null);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!pass) return;

    setIsRevoking(true);
    setError(null);

    try {
      await sdk.getPartnerships().revokeSponsorPass({ id: pass.id });
      setIsRevoking(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke pass");
      setIsRevoking(false);
    }
  };

  const handleClose = () => {
    if (!isRevoking) {
      onClose();
    }
  };

  return (
    <Transition show={open && !!pass} as={Fragment}>
      <Dialog onClose={handleClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95 translate-y-4"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-4"
          >
            <DialogPanel className="w-full max-w-md glass-card rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-danger/20">
                    <AlertTriangle className="w-5 h-5 text-danger" />
                  </div>
                  <DialogTitle className="text-xl font-semibold text-surface-50">
                    Revoke Pass
                  </DialogTitle>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isRevoking}
                  icon={<X className="w-5 h-5" />}
                  className="rounded-lg"
                />
              </div>

              {pass && (
                <div className="mb-6">
                  <p className="text-surface-200 mb-4">
                    Are you sure you want to revoke the sponsor pass for:
                  </p>

                  <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700">
                    <p className="font-semibold text-surface-100 text-lg">
                      {pass.firstName} {pass.lastName}
                    </p>
                    <p className="text-surface-400 text-sm mt-1">
                      {pass.email}
                    </p>
                  </div>

                  <p className="text-surface-400 text-sm mt-4">
                    This action cannot be undone. The pass holder will
                    immediately lose access.
                  </p>
                </div>
              )}

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={handleClose}
                  disabled={isRevoking}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger-solid"
                  type="button"
                  onClick={handleConfirm}
                  loading={isRevoking}
                  icon={!isRevoking ? <Ban className="w-4 h-4" /> : undefined}
                  className="flex-1 whitespace-nowrap"
                >
                  {isRevoking ? "Revoking..." : "Revoke Pass"}
                </Button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
