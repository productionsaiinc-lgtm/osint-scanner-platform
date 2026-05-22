import { afterEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { osintToolsRouter } from "./osint-tools-router";
import type { TrpcContext } from "./_core/context";

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "sample-user",
      email: "sample@example.com",
      name: "Sample User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("osintTools.licensePlateLookup", () => {
  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.LICENSE_PLATE_LOOKUP_API_URL;
    delete process.env.LICENSE_PLATE_LOOKUP_API_KEY;
    delete process.env.LICENSE_PLATE_LOOKUP_API_KEY_HEADER;
  });

  it("returns Ontario plate format validation when no authorized provider is configured", async () => {
    const caller = osintToolsRouter.createCaller(createAuthContext());

    const result = await caller.licensePlateLookup({
      plate: "ABCD 123",
      region: "Ontario",
    });

    expect(result.success).toBe(true);
    expect(result.needsProvider).toBe(true);
    expect(result.data).toMatchObject({
      licensePlate: "ABCD123",
      province: "Ontario",
      plateType: "Ontario passenger",
      providerConfigured: false,
      realDataAvailable: false,
      source: "Local Ontario plate format validation",
    });
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("normalizes vehicle-only data from a configured provider", async () => {
    process.env.LICENSE_PLATE_LOOKUP_API_URL = "https://provider.example/plate";
    process.env.LICENSE_PLATE_LOOKUP_API_KEY = "provider-key";
    vi.mocked(axios.post).mockResolvedValueOnce({
      status: 200,
      data: {
        source: "Authorized provider",
        vehicle: {
          make: "Toyota",
          model: "Corolla",
          year: "2022",
          color: "Blue",
          status: "Active",
          ownerName: "Should Not Be Returned",
        },
      },
    });

    const caller = osintToolsRouter.createCaller(createAuthContext());
    const result = await caller.licensePlateLookup({
      plate: "ABCD123",
      region: "Ontario",
    });

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      licensePlate: "ABCD123",
      providerConfigured: true,
      make: "Toyota",
      model: "Corolla",
      year: "2022",
      color: "Blue",
      registrationStatus: "Active",
      source: "Authorized provider",
    });
    expect(JSON.stringify(result.data)).not.toContain("Should Not Be Returned");
    expect(axios.post).toHaveBeenCalledWith(
      "https://provider.example/plate",
      { plate: "ABCD123", region: "Ontario", country: "CA" },
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer provider-key",
          "x-api-key": "provider-key",
        }),
      })
    );
  });
});
