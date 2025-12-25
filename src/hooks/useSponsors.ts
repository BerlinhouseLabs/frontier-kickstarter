import { useEffect } from "react";
import { sdk } from "../main";
import { useSponsorContext } from "../context/SponsorContext";
import type { Sponsor, PaginatedResponse } from "../types";

export function useSponsors() {
  const {
    sponsors,
    setSponsors,
    selectedSponsor,
    setSelectedSponsor,
    sponsorsLoading,
    setSponsorsLoading,
  } = useSponsorContext();

  useEffect(() => {
    async function fetchSponsors() {
      try {
        setSponsorsLoading(true);
        const response = (await sdk
          .getPartnerships()
          .listSponsors()) as PaginatedResponse<Sponsor>;
        setSponsors(response.results);

        if (response.results.length > 0) {
          setSelectedSponsor((current) => current ?? response.results[0]);
        }
      } catch (error) {
        console.error("Failed to fetch sponsors:", error);
      } finally {
        setSponsorsLoading(false);
      }
    }

    fetchSponsors();
  }, [setSponsors, setSelectedSponsor, setSponsorsLoading]);

  return {
    sponsors,
    selectedSponsor,
    setSelectedSponsor,
    loading: sponsorsLoading,
  };
}
