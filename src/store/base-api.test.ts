import { describe, expect, it } from "vitest";
import { normalizeError } from "@/store/base-api";

describe("normalizeError", () => {
  it("normalizes RTK error with data.message", () => {
    const err = { status: 400, data: { message: "Bad request" } };
    const res = normalizeError(err);
    expect(res.status).toBe(400);
    expect(res.message).toBe("Bad request");
  });

  it("normalizes error envelope", () => {
    const err = { status: 422, data: { error: { code: "VALIDATION", message: "Invalid" } } };
    const res = normalizeError(err);
    expect(res.code).toBe("VALIDATION");
    expect(res.message).toBe("Invalid");
  });

  it("normalizes network error", () => {
    const res = normalizeError(new Error("Network"));
    expect(res.code).toBe("NETWORK_ERROR");
  });
});
