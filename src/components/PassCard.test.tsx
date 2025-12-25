import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PassCard from "./PassCard";
import type { SponsorPass } from "../types";

const mockActivePass: SponsorPass = {
  id: 1,
  sponsor: 1,
  sponsorName: "Test Sponsor",
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  status: "active",
  expiresAt: "2025-12-31T23:59:59Z",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
  revokedAt: null,
};

const mockRevokedPass: SponsorPass = {
  ...mockActivePass,
  id: 2,
  status: "revoked",
  revokedAt: "2025-06-15T12:00:00Z",
};

describe("PassCard", () => {
  it("renders pass holder name", () => {
    render(<PassCard pass={mockActivePass} onRevoke={() => {}} index={0} />);

    expect(screen.getByText("John Doe")).toBeTruthy();
  });

  it("renders pass holder email", () => {
    render(<PassCard pass={mockActivePass} onRevoke={() => {}} index={0} />);

    expect(screen.getByText("john@example.com")).toBeTruthy();
  });

  it("renders active status badge for active pass", () => {
    render(<PassCard pass={mockActivePass} onRevoke={() => {}} index={0} />);

    expect(screen.getByText("active")).toBeTruthy();
  });

  it("renders revoked status badge for revoked pass", () => {
    render(<PassCard pass={mockRevokedPass} onRevoke={() => {}} index={0} />);

    expect(screen.getByText("revoked")).toBeTruthy();
  });

  it("shows revoke button for active pass", () => {
    render(<PassCard pass={mockActivePass} onRevoke={() => {}} index={0} />);

    expect(screen.getByText("Revoke Pass")).toBeTruthy();
  });

  it("hides revoke button for revoked pass", () => {
    render(<PassCard pass={mockRevokedPass} onRevoke={() => {}} index={0} />);

    expect(screen.queryByText("Revoke Pass")).toBe(null);
  });

  it("calls onRevoke when revoke button is clicked", () => {
    const handleRevoke = vi.fn();
    render(<PassCard pass={mockActivePass} onRevoke={handleRevoke} index={0} />);

    fireEvent.click(screen.getByText("Revoke Pass"));

    expect(handleRevoke).toHaveBeenCalledTimes(1);
  });

  it("displays expiration date when present", () => {
    render(<PassCard pass={mockActivePass} onRevoke={() => {}} index={0} />);

    expect(screen.getByText(/Expires:/)).toBeTruthy();
  });

  it("displays revoked date for revoked pass", () => {
    render(<PassCard pass={mockRevokedPass} onRevoke={() => {}} index={0} />);

    expect(screen.getByText(/Revoked:/)).toBeTruthy();
  });

  it("displays created date", () => {
    render(<PassCard pass={mockActivePass} onRevoke={() => {}} index={0} />);

    expect(screen.getByText(/Created:/)).toBeTruthy();
  });
});

