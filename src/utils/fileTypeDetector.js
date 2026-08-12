/**
 * Universal File & Document Type Detector
 * Reliably identifies PDF documents vs Images vs DWG CAD files.
 */
export function detectFileType(fileOrUrl, metadata = {}) {
  // 1. Check explicit type / mimeType / format in metadata
  const typeField = metadata.fileType || metadata.type || metadata.mimeType || metadata.format || metadata.category || '';
  if (typeof typeField === 'string' && typeField.trim()) {
    const lowerType = typeField.toLowerCase();
    if (lowerType.includes('pdf') || lowerType === 'application/pdf') return 'pdf';
    if (lowerType.includes('dwg') || lowerType.includes('cad')) return 'dwg';
    if (lowerType.includes('png') || lowerType.includes('jpg') || lowerType.includes('jpeg') || lowerType.includes('webp') || lowerType.includes('svg') || lowerType.includes('image')) return 'image';
  }

  if (!fileOrUrl) return 'image';

  // 2. File or Blob object
  if (typeof File !== 'undefined' && fileOrUrl instanceof File) {
    if (fileOrUrl.type === 'application/pdf' || (fileOrUrl.name && fileOrUrl.name.toLowerCase().endsWith('.pdf'))) return 'pdf';
    if (fileOrUrl.name && fileOrUrl.name.toLowerCase().endsWith('.dwg')) return 'dwg';
    if (fileOrUrl.type.startsWith('image/') || /\.(png|jpe?g|webp|svg|gif|bmp)$/i.test(fileOrUrl.name || '')) return 'image';
  }
  if (typeof Blob !== 'undefined' && fileOrUrl instanceof Blob) {
    if (fileOrUrl.type === 'application/pdf') return 'pdf';
    if (fileOrUrl.type.startsWith('image/')) return 'image';
  }

  // 3. String URL or Data URL
  if (typeof fileOrUrl === 'string') {
    const clean = fileOrUrl.trim();
    const lower = clean.toLowerCase();

    if (lower.startsWith('data:application/pdf')) return 'pdf';
    if (lower.startsWith('data:image/')) return 'image';

    // Strip query strings & hash tags
    const pathOnly = lower.split('?')[0].split('#')[0];
    if (pathOnly.endsWith('.pdf')) return 'pdf';
    if (pathOnly.endsWith('.dwg')) return 'dwg';
    if (/\.(png|jpe?g|webp|svg|gif|bmp|avif)$/i.test(pathOnly)) return 'image';

    // Cloudinary & S3 format check
    if (lower.includes('format=pdf') || lower.includes('/pdf/upload/') || lower.includes('.pdf?')) return 'pdf';
    if (lower.includes('format=png') || lower.includes('format=jpg') || lower.includes('format=jpeg') || lower.includes('format=webp') || lower.includes('/image/upload/')) return 'image';

    // General fallback
    if (lower.includes('.pdf')) return 'pdf';
    if (lower.includes('.dwg')) return 'dwg';
  }

  return 'image';
}

export function getCleanFileUrl(targetUrl) {
  if (!targetUrl) return '';
  if (targetUrl instanceof File || targetUrl instanceof Blob) {
    return URL.createObjectURL(targetUrl);
  }
  if (typeof targetUrl === 'string') {
    const clean = targetUrl.trim();
    if (!clean) return '';
    if (clean.startsWith('http') || clean.startsWith('data:') || clean.startsWith('blob:')) return clean;
    if (clean.startsWith('/')) return `https://nirman-architects.onrender.com${clean}`;
    return `https://nirman-architects.onrender.com/${clean}`;
  }
  return '';
}
