export type BrandShape = "rounded" | "pill" | "circle" | "square";

export type StudioBranding = {
  logoData: string;
  brandColor: string;
  brandTextColor: string;
  brandShape: BrandShape;
};

export const DEFAULT_STUDIO_BRANDING: StudioBranding = {
  logoData: "",
  brandColor: "#2563eb",
  brandTextColor: "#ffffff",
  brandShape: "rounded",
};

export const BRAND_SHAPES: BrandShape[] = ["rounded", "pill", "circle", "square"];

const MAX_LOGO_BYTES = 450_000;

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function normalizeBrandShape(value: string | undefined): BrandShape {
  if (value === "pill" || value === "circle" || value === "square" || value === "rounded") {
    return value;
  }
  return "rounded";
}

export function normalizeHexColor(value: string | undefined, fallback: string): string {
  const trimmed = String(value || "").trim();
  if (!HEX_COLOR.test(trimmed)) return fallback;
  if (trimmed.length === 4) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return trimmed.toLowerCase();
}

export function normalizeStudioBranding(input: Partial<StudioBranding> | undefined): StudioBranding {
  return {
    logoData: String(input?.logoData ?? "").trim(),
    brandColor: normalizeHexColor(input?.brandColor, DEFAULT_STUDIO_BRANDING.brandColor),
    brandTextColor: normalizeHexColor(input?.brandTextColor, DEFAULT_STUDIO_BRANDING.brandTextColor),
    brandShape: normalizeBrandShape(input?.brandShape),
  };
}

export function brandingFromWorkspace(workspace: {
  logoData?: string | null;
  brandColor?: string | null;
  brandTextColor?: string | null;
  brandShape?: string | null;
}): StudioBranding {
  return normalizeStudioBranding({
    logoData: workspace.logoData ?? "",
    brandColor: workspace.brandColor ?? DEFAULT_STUDIO_BRANDING.brandColor,
    brandTextColor: workspace.brandTextColor ?? DEFAULT_STUDIO_BRANDING.brandTextColor,
    brandShape: normalizeBrandShape(workspace.brandShape ?? undefined),
  });
}

export function brandMarkRadius(shape: BrandShape): string {
  switch (shape) {
    case "circle":
      return "999px";
    case "pill":
      return "999px";
    case "square":
      return "8px";
    default:
      return "12px";
  }
}

export function validateLogoData(logoData: string): string | null {
  if (!logoData) return null;
  if (!logoData.startsWith("data:image/")) {
    return "Logo must be a PNG, JPG, or WebP image.";
  }
  if (logoData.length > MAX_LOGO_BYTES) {
    return "Logo is too large. Use an image under 350 KB.";
  }
  return null;
}

export async function readImageFileAsDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose a PNG, JPG, or WebP image.");
  }
  if (file.size > 350_000) {
    throw new Error("Image must be under 350 KB.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const err = validateLogoData(result);
      if (err) reject(new Error(err));
      else resolve(result);
    };
    reader.onerror = () => reject(new Error("Could not read the image file."));
    reader.readAsDataURL(file);
  });
}
