import { useState, useEffect, useCallback, useMemo } from "react";
import { sdk } from "../main";
import { useSponsorContext } from "../context/SponsorContext";
import type { SponsorPass, PaginatedResponse } from "../types";

const PAGE_SIZE = 10;
const FETCH_LIMIT = 1000;

interface UsePassesOptions {
  showRevoked?: boolean;
}

export function usePasses(options: UsePassesOptions = {}) {
  const { showRevoked = false } = options;
  const { selectedSponsor } = useSponsorContext();

  const [allPasses, setAllPasses] = useState<SponsorPass[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const filteredPasses = useMemo(() => {
    if (!selectedSponsor) return [];
    return allPasses.filter((p) => p.sponsor === selectedSponsor.id);
  }, [allPasses, selectedSponsor]);

  const totalPages = Math.ceil(filteredPasses.length / PAGE_SIZE);

  const paginatedPasses = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredPasses.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredPasses, page]);

  const fetchPasses = useCallback(async () => {
    if (!selectedSponsor) {
      setAllPasses([]);
      return;
    }

    try {
      setLoading(true);

      const response = (await sdk.getPartnerships().listAllSponsorPasses({
        limit: FETCH_LIMIT,
        offset: 0,
        includeRevoked: showRevoked,
      })) as PaginatedResponse<SponsorPass>;

      setAllPasses(response.results);
    } catch (error) {
      console.error("Failed to fetch passes:", error);
      setAllPasses([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSponsor, showRevoked]);

  useEffect(() => {
    fetchPasses();
  }, [fetchPasses]);

  useEffect(() => {
    setPage(1);
  }, [selectedSponsor?.id, showRevoked]);

  return {
    passes: paginatedPasses,
    loading,
    page,
    totalPages,
    setPage,
    refetch: fetchPasses,
  };
}
