/**
 * Export utilities for Tektronix Graphics Terminal
 * Handles PNG (and future SVG) export functionality
 */

import { COLORS } from './colors.js';

/**
 * Export the canvas as a PNG image
 * @param {TekCanvas} tekCanvas - The TekCanvas instance
 * @param {Object} options - Export options
 * @param {number} options.scale - Scale factor (1 or 2 for retina)
 * @param {boolean} options.transparent - If true, background is transparent; otherwise uses --tek-background
 * @returns {Promise<void>} - Triggers download
 */
export async function exportPNG(tekCanvas, options = {}) {
  const scale = options.scale || 1;
  const transparent = options.transparent || false;

  // Get CSS dimensions of the canvas
  const cssWidth = tekCanvas.getWidth();
  const cssHeight = tekCanvas.getHeight();

  // Create export canvas at desired scale
  const exportCanvas = document.createElement('canvas');
  const exportWidth = Math.floor(cssWidth * scale);
  const exportHeight = Math.floor(cssHeight * scale);
  exportCanvas.width = exportWidth;
  exportCanvas.height = exportHeight;

  const ctx = exportCanvas.getContext('2d');

  // Fill background if not transparent
  if (!transparent) {
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, exportWidth, exportHeight);
  }

  // Get the persistent canvas (contains the drawing)
  const sourceCanvas = tekCanvas.persistentCanvas;

  // Draw the source canvas onto the export canvas
  // Source is at physical pixels (CSS size * devicePixelRatio)
  // We need to draw it scaled to our export size
  ctx.drawImage(
    sourceCanvas,
    0, 0, sourceCanvas.width, sourceCanvas.height,  // source rect (full physical size)
    0, 0, exportWidth, exportHeight                  // dest rect (export size)
  );

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `tektronix-${timestamp}.png`;

  // Convert to blob and trigger download
  return new Promise((resolve, reject) => {
    exportCanvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create PNG blob'));
        return;
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up
      URL.revokeObjectURL(url);
      resolve();
    }, 'image/png');
  });
}
