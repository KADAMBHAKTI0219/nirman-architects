import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker matching installed pdfjsLib version
try {
  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '3.11.174'}/build/pdf.worker.min.mjs`;
  }
} catch (e) {
  console.warn("PDF worker initialization warning:", e);
}

/**
 * Render a PDF page (e.g. /architecture.pdf) into a High-Res Image Data URL for Fabric Canvas
 */
export const renderPdfPageToDataUrl = async (pdfUrl = '/architecture.pdf', pageNum = 1, scale = 2.5) => {
  try {
    let pdfData = pdfUrl;
    if (typeof pdfUrl === 'string' && (pdfUrl.startsWith('/') || pdfUrl.startsWith('http'))) {
      try {
        const resp = await fetch(pdfUrl);
        if (resp.ok) {
          pdfData = await resp.arrayBuffer();
        }
      } catch (fetchErr) {
        console.warn("PDF fetch fallback to URL string:", fetchErr);
      }
    }

    const loadingTask = pdfjsLib.getDocument(
      typeof pdfData === 'string'
        ? { url: pdfData, cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/', cMapPacked: true }
        : { data: pdfData, cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/', cMapPacked: true }
    );

    const pdf = await loadingTask.promise;
    const targetPage = Math.min(Math.max(1, pageNum), pdf.numPages);
    const page = await pdf.getPage(targetPage);

    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    await page.render(renderContext).promise;
    const dataUrl = canvas.toDataURL('image/png');
    return { dataUrl, numPages: pdf.numPages, pageNum: targetPage };
  } catch (err) {
    console.warn("pdfjs-dist failed to render PDF, using CAD Blueprint fallback:", err);
    return { dataUrl: getBlueprintSvgDataUrl("GROUND FLOOR WALL LAYOUT BLUEPRINT", "REV 3.2"), numPages: 1, pageNum: 1 };
  }
};

/**
 * Render a PDF ArrayBuffer into a High-Res Image Data URL for Fabric Canvas
 */
export const renderPdfBufferToDataUrl = async (arrayBuffer, pageNum = 1, scale = 2.5) => {
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: 'https://unpkg.com/pdfjs-dist@4.0.379/cmaps/',
      cMapPacked: true
    });
    const pdf = await loadingTask.promise;
    const targetPage = Math.min(Math.max(1, pageNum), pdf.numPages);
    const page = await pdf.getPage(targetPage);

    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    await page.render(renderContext).promise;
    return { dataUrl: canvas.toDataURL('image/png'), numPages: pdf.numPages, pageNum: targetPage };
  } catch (err) {
    console.warn("pdfjs-dist failed to render PDF buffer:", err);
    return null;
  }
};

/**
 * Universal File Converter: Converts ANY user-uploaded File (PDF or Image) or URL
 * into a High-Res Data URL for Fabric Canvas Background
 */
import { detectFileType } from '../../../utils/fileTypeDetector';

export const convertFileToDataUrl = async (fileOrUrl, pageNum = 1, scale = 2.5) => {
  if (!fileOrUrl) return null;

  const type = detectFileType(fileOrUrl);

  // 1. User selected File or Blob object
  if (fileOrUrl instanceof File || fileOrUrl instanceof Blob) {
    if (type === 'pdf') {
      const buffer = await fileOrUrl.arrayBuffer();
      const pdfRes = await renderPdfBufferToDataUrl(buffer, pageNum, scale);
      if (pdfRes) return pdfRes;
    }
    // Standard Image file (.png, .jpg, .jpeg, .webp, .svg)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ dataUrl: e.target.result, numPages: 1, pageNum: 1 });
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(fileOrUrl);
    });
  }

  // 2. URL String
  if (typeof fileOrUrl === 'string') {
    if (type === 'dwg') {
      return { dataUrl: getBlueprintSvgDataUrl("ARCHITECTURAL CAD BLUEPRINT", "DWG RELEASE"), numPages: 1, pageNum: 1 };
    }
    if (type === 'pdf') {
      const pdfRes = await renderPdfPageToDataUrl(fileOrUrl, pageNum, scale);
      if (pdfRes) return pdfRes;
    }
    return { dataUrl: fileOrUrl, numPages: 1, pageNum: 1 };
  }

  return null;
};

// Generate an SVG data URL for Architectural CAD Blueprint
export const getBlueprintSvgDataUrl = (title = "GROUND FLOOR PLAN - GFC RELEASE", rev = "REV 3.2", scale = "1:50 @ A1") => {
  const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1100" width="1600" height="1100">
  <defs>
    <!-- Grid Pattern -->
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" stroke-width="0.75" opacity="0.6"/>
    </pattern>
    <pattern id="majorGrid" width="200" height="200" patternUnits="userSpaceOnUse">
      <rect width="200" height="200" fill="url(#grid)"/>
      <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#CBD5E1" stroke-width="1.5" opacity="0.8"/>
    </pattern>
    <!-- Concrete Hatching -->
    <pattern id="concreteHatch" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="5" cy="5" r="1" fill="#94A3B8" />
      <circle cx="15" cy="12" r="0.8" fill="#94A3B8" />
      <path d="M 0 15 L 5 20 M 15 0 L 20 5" stroke="#94A3B8" stroke-width="0.5" />
    </pattern>
  </defs>

  <!-- Background Paper -->
  <rect width="1600" height="1100" fill="#F8FAFC" />
  <rect width="1540" height="1040" x="30" y="30" fill="#FFFFFF" rx="8" stroke="#CBD5E1" stroke-width="2" />
  <rect width="1500" height="1000" x="50" y="50" fill="url(#majorGrid)" />

  <!-- Outer Structural Border -->
  <rect width="1480" height="980" x="60" y="60" fill="none" stroke="#1E293B" stroke-width="3" />

  <!-- Grid Axis Lines & Bubble Markers (A-F, 1-6) -->
  <!-- Horizontal Axis -->
  <g stroke="#94A3B8" stroke-width="1" stroke-dasharray="8 4">
    <line x1="120" y1="120" x2="1480" y2="120" />
    <line x1="120" y1="360" x2="1480" y2="360" />
    <line x1="120" y1="600" x2="1480" y2="600" />
    <line x1="120" y1="840" x2="1480" y2="840" />
  </g>
  <!-- Vertical Axis -->
  <g stroke="#94A3B8" stroke-width="1" stroke-dasharray="8 4">
    <line x1="180" y1="80" x2="180" y2="920" />
    <line x1="500" y1="80" x2="500" y2="920" />
    <line x1="820" y1="80" x2="820" y2="920" />
    <line x1="1140" y1="80" x2="1140" y2="920" />
    <line x1="1400" y1="80" x2="1400" y2="920" />
  </g>

  <!-- Axis Bubbles -->
  <g font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#0F172A" text-anchor="middle">
    <!-- Top Bubbles -->
    <circle cx="180" cy="80" r="18" fill="#F1F5F9" stroke="#0F172A" stroke-width="2" />
    <text x="180" y="85">A</text>
    <circle cx="500" cy="80" r="18" fill="#F1F5F9" stroke="#0F172A" stroke-width="2" />
    <text x="500" y="85">B</text>
    <circle cx="820" cy="80" r="18" fill="#F1F5F9" stroke="#0F172A" stroke-width="2" />
    <text x="820" y="85">C</text>
    <circle cx="1140" cy="80" r="18" fill="#F1F5F9" stroke="#0F172A" stroke-width="2" />
    <text x="1140" y="85">D</text>
    <circle cx="1400" cy="80" r="18" fill="#F1F5F9" stroke="#0F172A" stroke-width="2" />
    <text x="1400" y="85">E</text>

    <!-- Left Bubbles -->
    <circle cx="95" cy="120" r="18" fill="#F1F5F9" stroke="#0F172A" stroke-width="2" />
    <text x="95" y="125">1</text>
    <circle cx="95" cy="360" r="18" fill="#F1F5F9" stroke="#0F172A" stroke-width="2" />
    <text x="95" y="365">2</text>
    <circle cx="95" cy="600" r="18" fill="#F1F5F9" stroke="#0F172A" stroke-width="2" />
    <text x="95" y="605">3</text>
    <circle cx="95" cy="840" r="18" fill="#F1F5F9" stroke="#0F172A" stroke-width="2" />
    <text x="95" y="845">4</text>
  </g>

  <!-- Architectural Walls (Thick Lines) -->
  <g fill="#334155" stroke="#0F172A" stroke-width="3">
    <!-- Outer perimeter wall -->
    <rect x="180" y="120" width="1220" height="720" fill="none" stroke="#0F172A" stroke-width="8" />
    
    <!-- Interior Rooms Wall Layout -->
    <!-- Living Room & Lobby Wall -->
    <line x1="500" y1="120" x2="500" y2="600" stroke-width="6" />
    <line x1="820" y1="120" x2="820" y2="840" stroke-width="6" />
    <line x1="1140" y1="360" x2="1140" y2="840" stroke-width="6" />
    
    <line x1="180" y1="360" x2="500" y2="360" stroke-width="6" />
    <line x1="500" y1="600" x2="1400" y2="600" stroke-width="6" />
    <line x1="820" y1="360" x2="1400" y2="360" stroke-width="6" />
  </g>

  <!-- Columns (RCC Pillars) -->
  <g fill="#0F172A" stroke="#1E293B">
    <rect x="170" y="110" width="20" height="20" />
    <rect x="490" y="110" width="20" height="20" />
    <rect x="810" y="110" width="20" height="20" />
    <rect x="1130" y="110" width="20" height="20" />
    <rect x="1390" y="110" width="20" height="20" />

    <rect x="170" y="350" width="20" height="20" />
    <rect x="490" y="350" width="20" height="20" />
    <rect x="810" y="350" width="20" height="20" />
    <rect x="1130" y="350" width="20" height="20" />
    <rect x="1390" y="350" width="20" height="20" />

    <rect x="170" y="590" width="20" height="20" />
    <rect x="490" y="590" width="20" height="20" />
    <rect x="810" y="590" width="20" height="20" />
    <rect x="1130" y="590" width="20" height="20" />
    <rect x="1390" y="590" width="20" height="20" />

    <rect x="170" y="830" width="20" height="20" />
    <rect x="490" y="830" width="20" height="20" />
    <rect x="810" y="830" width="20" height="20" />
    <rect x="1130" y="830" width="20" height="20" />
    <rect x="1390" y="830" width="20" height="20" />
  </g>

  <!-- Door Swings & Openings -->
  <g stroke="#0284C7" stroke-width="2" fill="none">
    <!-- Door 1 -->
    <path d="M 280 120 A 70 70 0 0 1 350 190" stroke-dasharray="4 3"/>
    <line x1="280" y1="120" x2="280" y2="190" />
    <!-- Door 2 -->
    <path d="M 500 240 A 70 70 0 0 1 570 310" stroke-dasharray="4 3"/>
    <line x1="500" y1="240" x2="570" y2="240" />
    <!-- Door 3 -->
    <path d="M 820 450 A 70 70 0 0 1 890 520" stroke-dasharray="4 3"/>
    <line x1="820" y1="450" x2="890" y2="450" />
  </g>

  <!-- Staircase Layout -->
  <g stroke="#64748B" stroke-width="1.5" fill="none">
    <rect x="530" y="140" width="260" height="200" stroke="#334155" stroke-width="2" />
    <line x1="660" y1="140" x2="660" y2="340" stroke="#334155" stroke-width="2" />
    <path d="M 530 160 L 660 160 M 530 180 L 660 180 M 530 200 L 660 200 M 530 220 L 660 220 M 530 240 L 660 240 M 530 260 L 660 260 M 530 280 L 660 280 M 530 300 L 660 300 M 530 320 L 660 320" />
    <path d="M 660 160 L 790 160 M 660 180 L 790 180 M 660 200 L 790 200 M 660 220 L 790 220 M 660 240 L 790 240 M 660 260 L 790 260 M 660 280 L 790 280 M 660 300 L 790 300 M 660 320 L 790 320" />
    <!-- Staircase Direction Arrow -->
    <line x1="595" y1="320" x2="595" y2="160" stroke="#0284C7" stroke-width="2" marker-end="url(#arrow)" />
    <text x="575" y="335" font-family="Arial" font-size="12" font-weight="bold" fill="#0284C7">UP</text>
  </g>

  <!-- Room Label Text & Dimensions -->
  <g font-family="Arial, sans-serif" fill="#1E293B" text-anchor="middle">
    <!-- Living Room -->
    <text x="340" y="240" font-size="18" font-weight="bold" fill="#0369A1">MASTER LIVING SUITE</text>
    <text x="340" y="265" font-size="13" fill="#64748B">16'-0" x 24'-0" (FFL +0.15m)</text>
    <text x="340" y="285" font-size="11" fill="#0EA5E9" font-weight="bold">TILE: ITALIAN MARBLE 800x800</text>

    <!-- Kitchen / Dining -->
    <text x="1010" y="220" font-size="18" font-weight="bold" fill="#0369A1">KITCHEN & DINING</text>
    <text x="1010" y="245" font-size="13" fill="#64748B">21'-4" x 16'-0"</text>

    <!-- Master Bedroom 1 -->
    <text x="340" y="700" font-size="18" font-weight="bold" fill="#0369A1">BEDROOM 01</text>
    <text x="340" y="725" font-size="13" fill="#64748B">16'-0" x 16'-0"</text>

    <!-- Bedroom 2 -->
    <text x="1010" y="700" font-size="18" font-weight="bold" fill="#0369A1">BEDROOM 02</text>
    <text x="1010" y="725" font-size="13" fill="#64748B">21'-4" x 16'-0"</text>

    <!-- Courtyard -->
    <text x="1270" y="480" font-size="16" font-weight="bold" fill="#0369A1">OPEN PATIO</text>
    <text x="1270" y="505" font-size="12" fill="#64748B">13'-0" x 16'-0"</text>
  </g>

  <!-- Architectural Dimension Lines (Ticks & Labels) -->
  <g stroke="#0284C7" stroke-width="1.5">
    <!-- Dimension Line 1 Top -->
    <line x1="180" y1="95" x2="500" y2="95" />
    <line x1="180" y1="90" x2="180" y2="100" />
    <line x1="500" y1="90" x2="500" y2="100" />
    <text x="340" y="91" font-family="Arial" font-size="11" font-weight="bold" fill="#0284C7" text-anchor="middle">16'-0" (4.88m)</text>

    <!-- Dimension Line 2 Top -->
    <line x1="500" y1="95" x2="820" y2="95" />
    <line x1="820" y1="90" x2="820" y2="100" />
    <text x="660" y="91" font-family="Arial" font-size="11" font-weight="bold" fill="#0284C7" text-anchor="middle">16'-0" (4.88m)</text>

    <!-- Dimension Line 3 Top -->
    <line x1="820" y1="95" x2="1400" y2="95" />
    <line x1="1400" y1="90" x2="1400" y2="100" />
    <text x="1110" y="91" font-family="Arial" font-size="11" font-weight="bold" fill="#0284C7" text-anchor="middle">29'-0" (8.84m)</text>
  </g>

  <!-- Official Title Block (Bottom Right CAD Standard) -->
  <g transform="translate(1080, 850)">
    <rect width="440" height="190" fill="#FFFFFF" stroke="#0F172A" stroke-width="3" rx="4" />
    <line x1="0" y1="45" x2="440" y2="45" stroke="#0F172A" stroke-width="2" />
    <line x1="0" y1="90" x2="440" y2="90" stroke="#0F172A" stroke-width="1.5" />
    <line x1="0" y1="140" x2="440" y2="140" stroke="#0F172A" stroke-width="1.5" />
    <line x1="220" y1="90" x2="220" y2="190" stroke="#0F172A" stroke-width="1.5" />

    <!-- Firm Logo & Title -->
    <text x="15" y="28" font-family="Arial" font-size="18" font-weight="900" fill="#0284C7">NIRMAN ARCHITECTS</text>
    <text x="425" y="28" font-family="Arial" font-size="11" font-weight="bold" fill="#64748B" text-anchor="end">NEXALLIANCE CRM</text>

    <!-- Drawing Name -->
    <text x="15" y="65" font-family="Arial" font-size="11" font-weight="bold" fill="#64748B">DRAWING TITLE:</text>
    <text x="15" y="82" font-family="Arial" font-size="14" font-weight="bold" fill="#0F172A">${title}</text>

    <!-- Details Column 1 -->
    <text x="15" y="110" font-family="Arial" font-size="10" fill="#64748B">PROJECT CODE:</text>
    <text x="15" y="125" font-family="Arial" font-size="12" font-weight="bold" fill="#0F172A">NIR-PRJ-2026-88</text>

    <text x="15" y="160" font-family="Arial" font-size="10" fill="#64748B">CHECKED BY:</text>
    <text x="15" y="175" font-family="Arial" font-size="12" font-weight="bold" fill="#0F172A">ENG. ROHIT MEHTA</text>

    <!-- Details Column 2 -->
    <text x="235" y="110" font-family="Arial" font-size="10" fill="#64748B">REVISION / SCALE:</text>
    <text x="235" y="125" font-family="Arial" font-size="12" font-weight="bold" fill="#0284C7">${rev} | ${scale}</text>

    <text x="235" y="160" font-family="Arial" font-size="10" fill="#64748B">RELEASE DATE:</text>
    <text x="235" y="175" font-family="Arial" font-size="12" font-weight="bold" fill="#0F172A">AUG 03, 2026</text>
  </g>
</svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
};
