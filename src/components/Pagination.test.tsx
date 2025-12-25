import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Pagination from "./Pagination";

describe("Pagination", () => {
  it("renders nothing when totalPages is 1", () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPageChange={() => {}} />
    );

    expect(container.firstChild).toBe(null);
  });

  it("renders nothing when totalPages is 0", () => {
    const { container } = render(
      <Pagination page={1} totalPages={0} onPageChange={() => {}} />
    );

    expect(container.firstChild).toBe(null);
  });

  it("renders pagination when totalPages > 1", () => {
    render(<Pagination page={1} totalPages={3} onPageChange={() => {}} />);

    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("disables Previous button on first page", () => {
    render(<Pagination page={1} totalPages={3} onPageChange={() => {}} />);

    const prevButton = screen.getByRole("button", { name: /previous/i });
    expect(prevButton.hasAttribute("disabled")).toBe(true);
  });

  it("disables Next button on last page", () => {
    render(<Pagination page={3} totalPages={3} onPageChange={() => {}} />);

    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton.hasAttribute("disabled")).toBe(true);
  });

  it("enables both buttons on middle page", () => {
    render(<Pagination page={2} totalPages={3} onPageChange={() => {}} />);

    const prevButton = screen.getByRole("button", { name: /previous/i });
    const nextButton = screen.getByRole("button", { name: /next/i });

    expect(prevButton.hasAttribute("disabled")).toBe(false);
    expect(nextButton.hasAttribute("disabled")).toBe(false);
  });

  it("calls onPageChange with previous page when Previous clicked", () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination page={2} totalPages={3} onPageChange={handlePageChange} />
    );

    fireEvent.click(screen.getByRole("button", { name: /previous/i }));

    expect(handlePageChange).toHaveBeenCalledWith(1);
  });

  it("calls onPageChange with next page when Next clicked", () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination page={2} totalPages={3} onPageChange={handlePageChange} />
    );

    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  it("calls onPageChange with clicked page number", () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination page={1} totalPages={3} onPageChange={handlePageChange} />
    );

    fireEvent.click(screen.getByText("2"));

    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it("shows ellipsis for many pages", () => {
    render(<Pagination page={5} totalPages={10} onPageChange={() => {}} />);

    const ellipses = screen.getAllByText("...");
    expect(ellipses.length).toBeGreaterThan(0);
  });
});

