import { Fragment } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { motion } from "motion/react";
import { ChevronDown, Building2, Check, Loader2 } from "lucide-react";
import type { Sponsor } from "../types";

interface SponsorSelectProps {
  sponsors: Sponsor[];
  selected: Sponsor | null;
  onChange: (sponsor: Sponsor) => void;
  loading?: boolean;
  className?: string;
}

export default function SponsorSelect({
  sponsors,
  selected,
  onChange,
  loading,
  className = "",
}: SponsorSelectProps) {
  if (loading) {
    return (
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-700/50 text-surface-200 ${className}`}
      >
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Loading sponsors...</span>
      </div>
    );
  }

  if (sponsors.length === 0) {
    return (
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-700/50 text-surface-400 ${className}`}
      >
        <Building2 className="w-5 h-5" />
        <span>No sponsors available</span>
      </div>
    );
  }

  return (
    <Listbox value={selected ?? undefined} onChange={onChange}>
      {({ open }) => (
        <div className={`relative ${className}`}>
          <ListboxButton className="relative w-full cursor-pointer rounded-xl bg-surface-700/50 hover:bg-surface-700 py-3 pl-4 pr-10 text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900 transition-colors">
            <span className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-primary-400" />
              <span className="block truncate font-medium">
                {selected?.name || "Select a sponsor"}
              </span>
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <motion.div
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-surface-400" />
              </motion.div>
            </span>
          </ListboxButton>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl bg-surface-800 py-2 shadow-xl ring-1 ring-white/10 focus:outline-none">
              {sponsors.map((sponsor) => (
                <ListboxOption
                  key={sponsor.id}
                  value={sponsor}
                  className={({ focus, selected }) =>
                    `relative cursor-pointer select-none py-3 pl-10 pr-4 transition-colors ${
                      focus
                        ? "bg-primary-600/20 text-white"
                        : "text-surface-100"
                    } ${selected ? "bg-primary-600/10" : ""}`
                  }
                >
                  {({ selected }) => (
                    <>
                      <div className="flex flex-col">
                        <span
                          className={`block truncate ${
                            selected ? "font-semibold" : "font-normal"
                          }`}
                        >
                          {sponsor.name}
                        </span>
                        <span className="text-sm text-surface-400">
                          ${sponsor.dailyRate}/day
                        </span>
                      </div>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-400">
                          <Check className="w-5 h-5" />
                        </span>
                      )}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      )}
    </Listbox>
  );
}
