import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import StatusToggle from "./StatusToggle";

describe("StatusToggle", () => {
  it("renders with default label", () => {
    render(<StatusToggle checked={false} onChange={() => {}} />);

    expect(screen.getByText("Show Revoked")).toBeTruthy();
  });

  it("renders with custom label", () => {
    render(
      <StatusToggle checked={false} onChange={() => {}} label="Custom Label" />
    );

    expect(screen.getByText("Custom Label")).toBeTruthy();
  });

  it("calls onChange with true when unchecked toggle is clicked", () => {
    const handleChange = vi.fn();
    render(<StatusToggle checked={false} onChange={handleChange} />);

    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange with false when checked toggle is clicked", () => {
    const handleChange = vi.fn();
    render(<StatusToggle checked={true} onChange={handleChange} />);

    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);

    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it("has correct aria-checked attribute when unchecked", () => {
    render(<StatusToggle checked={false} onChange={() => {}} />);

    const toggle = screen.getByRole("switch");
    expect(toggle.getAttribute("aria-checked")).toBe("false");
  });

  it("has correct aria-checked attribute when checked", () => {
    render(<StatusToggle checked={true} onChange={() => {}} />);

    const toggle = screen.getByRole("switch");
    expect(toggle.getAttribute("aria-checked")).toBe("true");
  });
});
