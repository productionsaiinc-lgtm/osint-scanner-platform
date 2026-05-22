import axios from "axios";

/**
 * Metadata Extractor Service
 * Extracts metadata from images, documents, and other files
 */

export interface FileMetadata {
  filename: string;
  filesize: number;
  filetype: string;
  created_date: string;
  modified_date: string;
  accessed_date: string;
  mime_type: string;
}

export interface ImageMetadata extends FileMetadata {
  width: number;
  height: number;
  dpi: number;
  color_space: string;
  camera_make?: string;
  camera_model?: string;
  lens_model?: string;
  focal_length?: string;
  iso?: number;
  shutter_speed?: string;
  aperture?: string;
  gps_latitude?: number;
  gps_longitude?: number;
  gps_altitude?: number;
  gps_timestamp?: string;
  software?: string;
}

export interface DocumentMetadata extends FileMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator_tool?: string;
  pages?: number;
  language?: string;
  last_modified_by?: string;
  comments?: string;
}

export interface AudioMetadata extends FileMetadata {
  title?: string;
  artist?: string;
  album?: string;
  duration: number;
  bitrate: number;
  sample_rate: number;
  channels: number;
  genre?: string;
  year?: number;
}

/**
 * Extract metadata from image
 */
export async function extractImageMetadata(imageUrl: string): Promise<ImageMetadata> {
  try {
    const filename = imageUrl.split('/').pop() || 'image.jpg';
    const head = await fetchHead(imageUrl);

    return {
      filename,
      filesize: head.size,
      filetype: filename.split('.').pop()?.toUpperCase() || 'IMAGE',
      created_date: head.lastModified,
      modified_date: head.lastModified,
      accessed_date: new Date().toISOString(),
      mime_type: head.mimeType,
      width: 0,
      height: 0,
      dpi: 0,
      color_space: 'Unknown',
    };
  } catch (error) {
    throw new Error(`Image metadata extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract metadata from document
 */
export async function extractDocumentMetadata(documentUrl: string): Promise<DocumentMetadata> {
  try {
    const filename = documentUrl.split('/').pop() || 'document.pdf';
    const fileType = filename.split('.').pop()?.toUpperCase() || 'PDF';
    const head = await fetchHead(documentUrl);

    return {
      filename,
      filesize: head.size,
      filetype: fileType,
      created_date: head.lastModified,
      modified_date: head.lastModified,
      accessed_date: new Date().toISOString(),
      mime_type: head.mimeType || getMimeType(fileType),
    };
  } catch (error) {
    throw new Error(`Document metadata extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract metadata from audio file
 */
export async function extractAudioMetadata(audioUrl: string): Promise<AudioMetadata> {
  try {
    const filename = audioUrl.split('/').pop() || 'audio.mp3';
    const head = await fetchHead(audioUrl);

    return {
      filename,
      filesize: head.size,
      filetype: filename.split('.').pop()?.toUpperCase() || 'AUDIO',
      created_date: head.lastModified,
      modified_date: head.lastModified,
      accessed_date: new Date().toISOString(),
      mime_type: head.mimeType,
      duration: 0,
      bitrate: 0,
      sample_rate: 0,
      channels: 0,
    };
  } catch (error) {
    throw new Error(`Audio metadata extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function fetchHead(url: string) {
  const response = await axios.head(url, {
    timeout: 10000,
    maxRedirects: 5,
    validateStatus: () => true,
    headers: { "User-Agent": "OSINT-Scanner-Platform/1.0" },
  });
  return {
    size: Number(response.headers["content-length"] || 0),
    mimeType: String(response.headers["content-type"] || "application/octet-stream").split(";")[0],
    lastModified: response.headers["last-modified"] ? new Date(String(response.headers["last-modified"])).toISOString() : new Date().toISOString(),
  };
}

/**
 * Get MIME type for file extension
 */
export function getMimeType(fileType: string): string {
  const mimeTypes: { [key: string]: string } = {
    PDF: 'application/pdf',
    DOC: 'application/msword',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    XLS: 'application/vnd.ms-excel',
    XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    PPT: 'application/vnd.ms-powerpoint',
    PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    TXT: 'text/plain',
    CSV: 'text/csv',
    JSON: 'application/json',
    XML: 'application/xml',
  };

  return mimeTypes[fileType] || 'application/octet-stream';
}

/**
 * Detect sensitive information in metadata
 */
export async function detectSensitiveMetadata(metadata: ImageMetadata | DocumentMetadata | AudioMetadata): Promise<{
  sensitive_fields: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}> {
  const sensitiveFields: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

  // Check for GPS data
  if ('gps_latitude' in metadata && metadata.gps_latitude) {
    sensitiveFields.push('GPS Location');
    riskLevel = 'high';
  }

  // Check for camera information
  if ('camera_make' in metadata && metadata.camera_make) {
    sensitiveFields.push('Camera Information');
  }

  // Check for author information
  if ('author' in metadata && metadata.author) {
    sensitiveFields.push('Author Information');
  }

  // Check for creation date
  if (metadata.created_date) {
    sensitiveFields.push('Creation Date');
  }

  const recommendations = [];
  if (sensitiveFields.includes('GPS Location')) {
    recommendations.push('Remove GPS data before sharing');
  }
  if (sensitiveFields.includes('Author Information')) {
    recommendations.push('Sanitize author and creator information');
  }
  if (sensitiveFields.includes('Camera Information')) {
    recommendations.push('Remove camera EXIF data');
  }

  recommendations.push('Use metadata stripping tools before sharing files');

  return {
    sensitive_fields: sensitiveFields,
    risk_level: riskLevel,
    recommendations,
  };
}

/**
 * Strip metadata from file
 */
export async function stripMetadata(fileUrl: string): Promise<{
  filename: string;
  original_size: number;
  stripped_size: number;
  fields_removed: string[];
  success: boolean;
}> {
  const filename = fileUrl.split('/').pop() || 'file';
  const head = await fetchHead(fileUrl);

  return {
    filename,
    original_size: head.size,
    stripped_size: head.size,
    fields_removed: [],
    success: false,
  };
}

/**
 * Compare metadata from multiple files
 */
export async function compareMetadata(
  files: string[]
): Promise<{
  common_fields: string[];
  differences: Array<{
    field: string;
    values: string[];
  }>;
  potential_correlation: number;
}> {
  return {
    common_fields: [],
    differences: files.map((file) => ({ field: 'source_url', values: [file] })),
    potential_correlation: 0,
  };
}

/**
 * Get metadata timeline
 */
export async function getMetadataTimeline(fileUrl: string): Promise<Array<{
  timestamp: string;
  event: string;
  details: string;
}>> {
  const head = await fetchHead(fileUrl);
  return [
    {
      timestamp: head.lastModified,
      event: 'Last Modified',
      details: 'Last-Modified response header when provided by source server',
    },
    {
      timestamp: new Date().toISOString(),
      event: 'Metadata Extracted',
      details: 'Metadata analysis performed',
    },
  ];
}
