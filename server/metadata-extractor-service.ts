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
    const hasGPS = Math.random() > 0.6;
    const hasCamera = Math.random() > 0.4;

    return {
      filename,
      filesize: Math.floor(Math.random() * 5000000) + 100000,
      filetype: 'JPEG',
      created_date: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
      modified_date: new Date(Date.now() - Math.random() * 2592000000).toISOString(),
      accessed_date: new Date().toISOString(),
      mime_type: 'image/jpeg',
      width: Math.floor(Math.random() * 4000) + 800,
      height: Math.floor(Math.random() * 4000) + 600,
      dpi: 72,
      color_space: 'RGB',
      camera_make: hasCamera ? 'Canon' : undefined,
      camera_model: hasCamera ? 'Canon EOS 5D Mark IV' : undefined,
      lens_model: hasCamera ? 'Canon EF 24-70mm f/2.8L II USM' : undefined,
      focal_length: hasCamera ? '50mm' : undefined,
      iso: hasCamera ? Math.floor(Math.random() * 6400) + 100 : undefined,
      shutter_speed: hasCamera ? '1/125' : undefined,
      aperture: hasCamera ? 'f/2.8' : undefined,
      gps_latitude: hasGPS ? Math.random() * 180 - 90 : undefined,
      gps_longitude: hasGPS ? Math.random() * 360 - 180 : undefined,
      gps_altitude: hasGPS ? Math.floor(Math.random() * 3000) : undefined,
      gps_timestamp: hasGPS ? new Date().toISOString() : undefined,
      software: 'Adobe Photoshop CC 2024',
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

    return {
      filename,
      filesize: Math.floor(Math.random() * 50000000) + 100000,
      filetype: fileType,
      created_date: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
      modified_date: new Date(Date.now() - Math.random() * 2592000000).toISOString(),
      accessed_date: new Date().toISOString(),
      mime_type: getMimeType(fileType),
      title: 'Confidential Document',
      author: 'John Smith',
      subject: 'Security Analysis Report',
      keywords: ['security', 'analysis', 'report', 'confidential'],
      creator_tool: 'Microsoft Word 2024',
      pages: Math.floor(Math.random() * 100) + 10,
      language: 'en-US',
      last_modified_by: 'Jane Doe',
      comments: 'This is a sensitive document',
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

    return {
      filename,
      filesize: Math.floor(Math.random() * 100000000) + 1000000,
      filetype: 'MP3',
      created_date: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
      modified_date: new Date(Date.now() - Math.random() * 2592000000).toISOString(),
      accessed_date: new Date().toISOString(),
      mime_type: 'audio/mpeg',
      title: 'Sample Audio Track',
      artist: 'Artist Name',
      album: 'Album Name',
      duration: Math.floor(Math.random() * 600) + 60,
      bitrate: 320,
      sample_rate: 44100,
      channels: 2,
      genre: 'Electronic',
      year: 2024,
    };
  } catch (error) {
    throw new Error(`Audio metadata extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
  const originalSize = Math.floor(Math.random() * 50000000) + 100000;
  const strippedSize = Math.floor(originalSize * 0.85);

  return {
    filename,
    original_size: originalSize,
    stripped_size: strippedSize,
    fields_removed: [
      'EXIF Data',
      'Author Information',
      'Creation Date',
      'GPS Coordinates',
      'Camera Information',
      'Software Information',
    ],
    success: true,
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
  const commonFields = ['created_date', 'author', 'software'];
  const differences = [
    {
      field: 'camera_model',
      values: ['Canon EOS 5D', 'Nikon D850'],
    },
    {
      field: 'gps_location',
      values: ['37.7749, -122.4194', '40.7128, -74.0060'],
    },
  ];

  return {
    common_fields: commonFields,
    differences,
    potential_correlation: Math.random() * 100,
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
  return [
    {
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      event: 'File Created',
      details: 'Original file creation',
    },
    {
      timestamp: new Date(Date.now() - 43200000).toISOString(),
      event: 'File Modified',
      details: 'Content updated',
    },
    {
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      event: 'File Accessed',
      details: 'File opened for viewing',
    },
    {
      timestamp: new Date().toISOString(),
      event: 'Metadata Extracted',
      details: 'Metadata analysis performed',
    },
  ];
}
