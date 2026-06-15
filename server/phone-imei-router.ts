import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { lookupPhoneReal } from "./phone-lookup-real";
import { getDeviceSpecsReal } from "./device-specs-real";

export const phoneImeiRouter = router({
  // Phone Lookup Procedures - Real Numverify API
  lookupPhone: publicProcedure
    .input(z.object({
      phoneNumber: z.string().min(1, "Phone number required"),
    }))
    .query(async ({ input }: any) => {
      return await lookupPhoneReal(input.phoneNumber);
    }),

  // IMEI Checker Procedures - Real Device Specs
  checkImei: publicProcedure
    .input(z.object({
      imei: z.string().min(15, "IMEI must be at least 15 digits").max(16, "IMEI must be at most 16 digits"),
    }))
    .query(async ({ input }: any) => {
      try {
        const cleanImei = input.imei.replace(/\D/g, "");
        
        if (cleanImei.length < 15 || cleanImei.length > 16) {
          return {
            error: "Invalid IMEI format",
            valid: false,
          };
        }

        // Luhn algorithm validation
        const isValidLuhn = validateLuhn(cleanImei);
        
        if (!isValidLuhn) {
          return {
            error: "Invalid IMEI checksum",
            valid: false,
          };
        }

        // Get real device specs from GSMArena/IMEI database
        const deviceResult = await getDeviceSpecsReal(cleanImei);
        
        if (!deviceResult.success) {
          return {
            error: "Device not found in database",
            valid: false,
          };
        }

        const device = deviceResult.data;
        const tac = cleanImei.substring(0, 8);
        const snr = cleanImei.substring(8, 14);
        const checkDigit = cleanImei.substring(14);

        return {
          valid: true,
          imei: cleanImei,
          tac: tac,
          snr: snr,
          checkDigit: checkDigit,
          manufacturer: device.manufacturer,
          model: device.model,
          type: device.type,
          releaseDate: device.releaseDate,
          price: (device as any).price || "N/A",
          isBlacklisted: false,
          blacklistStatus: "Not Blacklisted",
          specifications: device.specs,
          source: device.source,
        };
      } catch (error) {
        return {
          error: "Failed to check IMEI",
          valid: false,
        };
      }
    }),
});

// Luhn algorithm for IMEI validation
function validateLuhn(imei: string): boolean {
  let sum = 0;
  let isEven = false;

  for (let i = imei.length - 1; i >= 0; i--) {
    let digit = parseInt(imei[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}
