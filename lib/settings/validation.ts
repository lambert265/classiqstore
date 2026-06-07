import { z } from "zod";

export const SettingTypeSchema = z.enum(["text","number","email","boolean","select","color","textarea"]);

export function validateSettingValue(value: string, type: z.infer<typeof SettingTypeSchema>, options?: string[]): string | null {
  switch (type) {
    case "number":
      return isNaN(Number(value)) ? "Must be a valid number" : null;
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value === "" ? null : "Must be a valid email";
    case "boolean":
      return ["true","false"].includes(value) ? null : "Must be true or false";
    case "color":
      return /^#[0-9a-fA-F]{6}$/.test(value) || value === "" ? null : "Must be a valid hex (#rrggbb)";
    case "select":
      return !options || options.includes(value) ? null : `Must be one of: ${options.join(", ")}`;
    default:
      return null;
  }
}

export const BulkImportSchema = z.record(z.string(), z.string());

export type SettingType = z.infer<typeof SettingTypeSchema>;
