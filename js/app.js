/**
 * Tektronix Graphics Terminal - Main Application
 *
 * This is the entry point for the drawing canvas page.
 */

import { COLORS } from './utils/colors.js';
import { TekCanvas } from './canvas/TekCanvas.js';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Tektronix Graphics Terminal initializing...');

  // Get container and create TekCanvas
  const container = document.getElementById('canvas-container');
  const tekCanvas = new TekCanvas(container);

  // Store globally for debugging (will be removed in final polish)
  window.tekCanvas = tekCanvas;

  console.log('TekCanvas initialized:', {
    width: tekCanvas.getWidth(),
    height: tekCanvas.getHeight(),
    dpr: tekCanvas.dpr
  });

  // Test: draw a simple line to verify canvas works
  const ctx = tekCanvas.getPersistentContext();
  ctx.strokeStyle = COLORS.primary;
  ctx.lineWidth = 1;
  ctx.beginPath();

  // Draw from normalized (0.1, 0.1) to (0.9, 0.9)
  const start = tekCanvas.fromNormalized(0.1, 0.1);
  const end = tekCanvas.fromNormalized(0.9, 0.9);
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  console.log('Test diagonal line drawn from (0.1, 0.1) to (0.9, 0.9)');
});
