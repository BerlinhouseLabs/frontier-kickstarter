import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const mockCreateSponsorPass = vi.fn();
const mockRevokeSponsorPass = vi.fn();

vi.mock("../main", () => ({
  sdk: {
    getPartnerships: () => ({
      createSponsorPass: mockCreateSponsorPass,
      revokeSponsorPass: mockRevokeSponsorPass,
    }),
  },
}));

import { usePassActions } from "./usePassActions";

describe("usePassActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSponsorPass.mockReset();
    mockRevokeSponsorPass.mockReset();
  });

  it("initializes with correct default state", () => {
    const { result } = renderHook(() => usePassActions());

    expect(result.current.isCreating).toBe(false);
    expect(result.current.isRevoking).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("sets isCreating to true during createPass", async () => {
    mockCreateSponsorPass.mockResolvedValue({});

    const { result } = renderHook(() => usePassActions());

    let createPromise: Promise<boolean>;
    act(() => {
      createPromise = result.current.createPass({
        sponsor: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      });
    });

    expect(result.current.isCreating).toBe(true);

    await act(async () => {
      await createPromise;
    });

    expect(result.current.isCreating).toBe(false);
  });

  it("sets isRevoking to true during revokePass", async () => {
    mockRevokeSponsorPass.mockResolvedValue({});

    const { result } = renderHook(() => usePassActions());

    const mockPass = {
      id: 1,
      sponsor: 1,
      sponsorName: "Test",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      status: "active" as const,
      expiresAt: null,
      createdAt: "2025-01-01",
      updatedAt: "2025-01-01",
      revokedAt: null,
    };

    let revokePromise: Promise<boolean>;
    act(() => {
      revokePromise = result.current.revokePass(mockPass);
    });

    expect(result.current.isRevoking).toBe(true);

    await act(async () => {
      await revokePromise;
    });

    expect(result.current.isRevoking).toBe(false);
  });

  it("sets error on createPass failure", async () => {
    mockCreateSponsorPass.mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => usePassActions());

    await act(async () => {
      try {
        await result.current.createPass({
          sponsor: 1,
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
        });
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe("API Error");
  });

  it("clears error when clearError is called", async () => {
    mockCreateSponsorPass.mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => usePassActions());

    await act(async () => {
      try {
        await result.current.createPass({
          sponsor: 1,
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
        });
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe("API Error");

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });

  it("calls onSuccess callback after successful createPass", async () => {
    mockCreateSponsorPass.mockResolvedValue({});

    const onSuccess = vi.fn();
    const { result } = renderHook(() => usePassActions(onSuccess));

    await act(async () => {
      await result.current.createPass({
        sponsor: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      });
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});
