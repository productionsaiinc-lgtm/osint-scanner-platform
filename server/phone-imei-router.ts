import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";

export const phoneImeiRouter = router({
  // Phone Lookup Procedures
  lookupPhone: publicProcedure
    .input(z.object({
      phoneNumber: z.string().min(1, "Phone number required"),
    }))
    .query(async ({ input }: any) => {
      try {
        // Validate phone number format
        const cleanNumber = input.phoneNumber.replace(/\D/g, "");
        
        if (cleanNumber.length < 10) {
          return {
            error: "Invalid phone number format",
            valid: false,
          };
        }

        // Simulate phone lookup
        const carriers = ["Verizon", "AT&T", "T-Mobile", "Sprint", "US Cellular"];
        const types = ["Mobile", "Landline", "VoIP"];
        const countries = ["United States", "Canada", "Mexico"];

        return {
          valid: true,
          phoneNumber: input.phoneNumber,
          carrier: carriers[Math.floor(Math.random() * carriers.length)],
          type: types[Math.floor(Math.random() * types.length)],
          country: countries[Math.floor(Math.random() * countries.length)],
          countryCode: "+1",
          areaCode: cleanNumber.substring(0, 3),
          exchangeCode: cleanNumber.substring(3, 6),
          lineNumber: cleanNumber.substring(6),
          isPortable: Math.random() > 0.5,
          timezone: "Eastern Time",
          operatorName: carriers[Math.floor(Math.random() * carriers.length)],
          networkType: ["2G", "3G", "4G", "5G"][Math.floor(Math.random() * 4)],
        };
      } catch (error) {
        return {
          error: "Failed to lookup phone number",
          valid: false,
        };
      }
    }),

  // IMEI Checker Procedures
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

        // Extract TAC (Type Allocation Code)
        const tac = cleanImei.substring(0, 8);
        const snr = cleanImei.substring(8, 14);
        const checkDigit = cleanImei.substring(14);

        // Mock device data
        const manufacturers = ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Motorola"];
        const models = ["iPhone 14", "Galaxy S23", "Pixel 7", "OnePlus 11", "Mi 13", "Moto G52"];
        const bands = ["2G (GSM)", "3G (UMTS)", "4G (LTE)", "5G (NR)"];

        return {
          valid: true,
          imei: cleanImei,
          tac: tac,
          snr: snr,
          checkDigit: checkDigit,
          manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
          model: models[Math.floor(Math.random() * models.length)],
          releaseYear: 2020 + Math.floor(Math.random() * 4),
          isBlacklisted: Math.random() > 0.9,
          blacklistStatus: Math.random() > 0.9 ? "Reported Lost/Stolen" : "Not Blacklisted",
          supportedBands: bands,
          networkTechnology: "4G LTE / 5G",
          specifications: {
            displaySize: "6.1 inches",
            processor: "Latest Chipset",
            ram: "8GB",
            storage: "256GB",
            battery: "3500mAh",
            camera: "48MP",
          },
        };
      } catch (error) {
        return {
          error: "Failed to check IMEI",
          valid: false,
        };
      }
    }),

  // Get IMEI information
  getImeiInfo: publicProcedure
    .input(z.object({
      imei: z.string(),
    }))
    .query(async ({ input }: any) => {
      try {
        const cleanImei = input.imei.replace(/\D/g, "");
        
        if (cleanImei.length < 15) {
          return null;
        }

        return {
          imei: cleanImei,
          tac: cleanImei.substring(0, 8),
          snr: cleanImei.substring(8, 14),
          checkDigit: cleanImei.substring(14),
          isValid: validateLuhn(cleanImei),
          deviceInfo: {
            manufacturer: "Device Manufacturer",
            model: "Device Model",
            year: 2023,
          },
        };
      } catch (error) {
        return null;
      }
    }),
});

// Luhn Algorithm for IMEI validation
function validateLuhn(imei: string): boolean {
  let sum = 0;
  let isEven = false;

  for (let i = imei.length - 1; i >= 0; i--) {
    let digit = parseInt(imei.charAt(i), 10);

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
