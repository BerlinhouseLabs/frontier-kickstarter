import { useState, Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { AnimatePresence, motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, UserPlus, AlertCircle } from "lucide-react";
import { sdk } from "../main";
import {
  createPassSchema,
  type CreatePassFormData,
} from "../forms/createPassSchema";
import Button from "./Button";

interface CreatePassModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sponsorId: number;
}

export default function CreatePassModal({
  open,
  onClose,
  onSuccess,
  sponsorId,
}: CreatePassModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePassFormData>({
    resolver: zodResolver(createPassSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      expiresAt: "",
    },
  });

  const onSubmit = async (data: CreatePassFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await sdk.getPartnerships().createSponsorPass({
        sponsor: sponsorId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        expiresAt: data.expiresAt || undefined,
      });
      reset();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create pass");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setError(null);
      onClose();
    }
  };

  return (
    <Transition show={open} as={Fragment}>
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary-600/20">
                    <UserPlus className="w-5 h-5 text-primary-400" />
                  </div>
                  <DialogTitle className="text-xl font-semibold text-surface-50">
                    Create Sponsor Pass
                  </DialogTitle>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  icon={<X className="w-5 h-5" />}
                  className="rounded-lg"
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 flex items-center gap-2 text-danger"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-200 mb-1.5">
                    First Name <span className="text-danger">*</span>
                  </label>
                  <input
                    {...register("firstName")}
                    type="text"
                    placeholder="John"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border ${
                      errors.firstName ? "border-danger" : "border-surface-700"
                    } text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-danger">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-200 mb-1.5">
                    Last Name <span className="text-danger">*</span>
                  </label>
                  <input
                    {...register("lastName")}
                    type="text"
                    placeholder="Doe"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border ${
                      errors.lastName ? "border-danger" : "border-surface-700"
                    } text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-danger">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-200 mb-1.5">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    {...register("email")}
                    type="text"
                    placeholder="john.doe@example.com"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border ${
                      errors.email ? "border-danger" : "border-surface-700"
                    } text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-danger">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-200 mb-1.5">
                    Expires At{" "}
                    <span className="text-surface-500">(optional)</span>
                  </label>
                  <input
                    {...register("expiresAt")}
                    type="datetime-local"
                    disabled={isSubmitting}
                    min={new Date().toISOString().slice(0, 16)}
                    className={`w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border ${
                      errors.expiresAt ? "border-danger" : "border-surface-700"
                    } text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 [color-scheme:dark]`}
                  />
                  {errors.expiresAt && (
                    <p className="mt-1 text-sm text-danger">
                      {errors.expiresAt.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    loading={isSubmitting}
                    icon={!isSubmitting ? <UserPlus className="w-4 h-4" /> : undefined}
                    className="flex-1 whitespace-nowrap"
                  >
                    {isSubmitting ? "Creating..." : "Create Pass"}
                  </Button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
