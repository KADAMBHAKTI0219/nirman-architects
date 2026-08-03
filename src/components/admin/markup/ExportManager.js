/**
 * Export & Import Utility Manager for Markup Editor
 * Supports High-Res PNG, Downloadable PDF, and Fabric JSON Persistence
 */

export const exportAsPng = (fabricCanvas, fileName = 'markup_export.png') => {
  if (!fabricCanvas) return;
  const dataUrl = fabricCanvas.toDataURL({
    format: 'png',
    quality: 1,
    multiplier: 2 // High Resolution output
  });

  const link = document.createElement('a');
  link.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportAsJson = (fabricCanvas, pins = [], fileName = 'markup_data.json') => {
  if (!fabricCanvas) return;
  const canvasJson = fabricCanvas.toJSON([
    'id', 'toolType', 'author', 'timestamp', 'commentId', 'isMarkupObject', 'lockMovementX', 'lockMovementY'
  ]);

  const payload = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    canvas: canvasJson,
    pins: pins || []
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.download = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportAsPdf = (fabricCanvas, fileName = 'document_markup.pdf') => {
  if (!fabricCanvas) return;

  // Render high-res image data
  const dataUrl = fabricCanvas.toDataURL({
    format: 'jpeg',
    quality: 0.95,
    multiplier: 2
  });

  // Create an iframe to trigger silent browser PDF print dialog / window download
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${fileName}</title>
          <style>
            @page { size: landscape; margin: 0; }
            body { margin: 0; padding: 0; background: #ffffff; display: flex; align-items: center; justify-content: center; height: 100vh; }
            img { max-width: 100%; max-height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  } else {
    // Fallback if popup blocked
    exportAsPng(fabricCanvas, fileName.replace('.pdf', '.png'));
  }
};
