import { createContext, useContext, useState, useMemo, type ReactNode, type Dispatch, type SetStateAction } from "react";
import type { Sponsor } from "../types";

interface SponsorContextValue {
  sponsors: Sponsor[];
  setSponsors: Dispatch<SetStateAction<Sponsor[]>>;
  selectedSponsor: Sponsor | null;
  setSelectedSponsor: Dispatch<SetStateAction<Sponsor | null>>;
  sponsorsLoading: boolean;
  setSponsorsLoading: Dispatch<SetStateAction<boolean>>;
}

const SponsorContext = createContext<SponsorContextValue | null>(null);

export function SponsorProvider({ children }: { children: ReactNode }) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [sponsorsLoading, setSponsorsLoading] = useState(true);

  const value = useMemo<SponsorContextValue>(
    () => ({
      sponsors,
      setSponsors,
      selectedSponsor,
      setSelectedSponsor,
      sponsorsLoading,
      setSponsorsLoading,
    }),
    [sponsors, selectedSponsor, sponsorsLoading]
  );

  return (
    <SponsorContext.Provider value={value}>{children}</SponsorContext.Provider>
  );
}

export function useSponsorContext() {
  const context = useContext(SponsorContext);
  if (!context) {
    throw new Error("useSponsorContext must be used within a SponsorProvider");
  }
  return context;
}
