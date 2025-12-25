import { describe, it, expect } from "vitest";
import { createPassSchema } from "./createPassSchema";

describe("createPassSchema", () => {
  it("validates correct data", () => {
    const result = createPassSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    });

    expect(result.success).toBe(true);
  });

  it("requires firstName", () => {
    const result = createPassSchema.safeParse({
      firstName: "",
      lastName: "Doe",
      email: "john@example.com",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("firstName");
    }
  });

  it("requires lastName", () => {
    const result = createPassSchema.safeParse({
      firstName: "John",
      lastName: "",
      email: "john@example.com",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("lastName");
    }
  });

  it("requires valid email", () => {
    const result = createPassSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("email");
    }
  });

  it("accepts optional expiresAt when empty", () => {
    const result = createPassSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      expiresAt: "",
    });

    expect(result.success).toBe(true);
  });

  it("accepts valid expiresAt date", () => {
    const result = createPassSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      expiresAt: "2025-12-31T23:59",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid expiresAt date", () => {
    const result = createPassSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      expiresAt: "not-a-date",
    });

    expect(result.success).toBe(false);
  });

  it("rejects firstName over 100 characters", () => {
    const result = createPassSchema.safeParse({
      firstName: "a".repeat(101),
      lastName: "Doe",
      email: "john@example.com",
    });

    expect(result.success).toBe(false);
  });
});
