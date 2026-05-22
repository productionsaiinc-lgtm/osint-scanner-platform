/**
 * Reverse Image Search Service
 * Uses live image fetch metadata. Similar-image search, OCR, and object
 * detection require dedicated providers, so this service returns empty
 * provider-required results instead of fabricated detections.
 */

import axios from "axios";
import crypto from "node:crypto";

export interface ImageAnalysis {
  url: string;
  size: number;
  format: string;
  dimensions?: {
    width: number;
    height: number;
  };
  hash: string;
  similarImages: SimilarImage[];
  metadata: ImageMetadata;
}

export interface SimilarImage {
  url: string;
  title: string;
  source: string;
  similarity: number;
  size: number;
}

export interface ImageMetadata {
  format: string;
  colorSpace: string;
  hasAlpha: boolean;
  dominantColors: string[];
  textContent?: string;
  providerRequired?: string;
}

export async function analyzeImage(imageUrl: string): Promise<ImageAnalysis> {
  try {
    const response = await axios.get<ArrayBuffer>(imageUrl, {
      responseType: "arraybuffer",
      timeout: 15000,
      maxContentLength: 10 * 1024 * 1024,
      headers: { "User-Agent": "OSINT-Scanner-Platform/1.0" },
    });
    const buffer = Buffer.from(response.data);
    const contentType = String(response.headers["content-type"] || "");
    const format = getImageFormatFromContentType(contentType) || getImageFormat(imageUrl);

    return {
      url: imageUrl,
      size: buffer.length,
      format,
      hash: crypto.createHash("sha256").update(buffer).digest("hex"),
      similarImages: [],
      metadata: {
        format,
        colorSpace: "Unknown",
        hasAlpha: format === "PNG" || format === "WEBP",
        dominantColors: [],
        providerRequired: "Reverse image matching, OCR, and object detection require an image-intelligence provider.",
      },
    };
  } catch (error) {
    throw new Error(`Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function generateImageHash(imageUrl: string): string {
  return crypto.createHash("sha256").update(imageUrl).digest("hex").slice(0, 16);
}

export function getImageFormat(imageUrl: string): string {
  const extension = imageUrl.split("?")[0].split(".").pop()?.toUpperCase() || "UNKNOWN";
  return ["JPEG", "JPG", "PNG", "WEBP", "GIF", "BMP", "AVIF"].includes(extension)
    ? extension.replace("JPG", "JPEG")
    : "UNKNOWN";
}

function getImageFormatFromContentType(contentType: string): string | null {
  if (contentType.includes("jpeg")) return "JPEG";
  if (contentType.includes("png")) return "PNG";
  if (contentType.includes("webp")) return "WEBP";
  if (contentType.includes("gif")) return "GIF";
  if (contentType.includes("bmp")) return "BMP";
  if (contentType.includes("avif")) return "AVIF";
  return null;
}

export function generateSimilarImages(_imageUrl: string): SimilarImage[] {
  return [];
}

export function generateImageMetadata(): ImageMetadata {
  return {
    format: "UNKNOWN",
    colorSpace: "Unknown",
    hasAlpha: false,
    dominantColors: [],
    providerRequired: "Image metadata requires a fetched image or image-analysis provider.",
  };
}

export async function findImagesByColor(_color: string): Promise<SimilarImage[]> {
  return [];
}

export async function detectObjects(_imageUrl: string): Promise<string[]> {
  return [];
}

export async function extractTextFromImage(_imageUrl: string): Promise<string> {
  return "OCR provider not configured. No mock text returned.";
}
