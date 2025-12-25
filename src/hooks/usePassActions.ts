import { useState, useCallback } from "react";
import { sdk } from "../main";
import type { CreateSponsorPassRequest, SponsorPass } from "../types";

export function usePassActions(onSuccess?: () => void) {
  const [isCreating, setIsCreating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPass = useCallback(
    async (data: CreateSponsorPassRequest) => {
      setIsCreating(true);
      setError(null);

      try {
        await sdk.getPartnerships().createSponsorPass(data);
        onSuccess?.();
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create pass";
        setError(message);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [onSuccess]
  );

  const revokePass = useCallback(
    async (pass: SponsorPass) => {
      setIsRevoking(true);
      setError(null);

      try {
        await sdk.getPartnerships().revokeSponsorPass({ id: pass.id });
        onSuccess?.();
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to revoke pass";
        setError(message);
        throw err;
      } finally {
        setIsRevoking(false);
      }
    },
    [onSuccess]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createPass,
    revokePass,
    isCreating,
    isRevoking,
    error,
    clearError,
  };
}
