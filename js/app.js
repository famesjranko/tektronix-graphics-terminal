/**
 * Tektronix Graphics Terminal - Main Application
 *
 * This is the entry point for the drawing canvas page.
 */

import { COLORS } from './utils/colors.js';
import { TekCanvas } from './canvas/TekCanvas.js';
import { VectorRenderer } from './canvas/VectorRenderer.js';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Tektronix Graphics Terminal initializing...');

  // Get container and create TekCanvas
  const container = document.getElementById('canvas-container');
  const tekCanvas = new TekCanvas(container);
  const renderer = new VectorRenderer(tekCanvas);

  // Store globally for debugging (will be removed in final polish)
  window.tekCanvas = tekCanvas;
  window.renderer = renderer;

  console.log('TekCanvas initialized:', {
    width: tekCanvas.getWidth(),
    height: tekCanvas.getHeight(),
    dpr: tekCanvas.dpr
  });

  // Test VectorRenderer primitives
  const ctx = tekCanvas.getPersistentContext();

  // Draw diagonal line
  renderer.drawLine(ctx, 0.1, 0.1, 0.4, 0.4);

  // Draw rectangle (outline)
  renderer.drawRect(ctx, 0.5, 0.1, 0.2, 0.15);

  // Draw filled rectangle
  renderer.drawRect(ctx, 0.75, 0.1, 0.15, 0.15, COLORS.dim, true);

  // Draw circle (outline)
  renderer.drawCircle(ctx, 0.2, 0.6, 0.08);

  // Draw filled circle
  renderer.drawCircle(ctx, 0.4, 0.6, 0.06, COLORS.dim, true);

  // Draw arc (quarter circle)
  renderer.drawArc(ctx, 0.7, 0.6, 0.1, 0, Math.PI / 2);

  console.log('VectorRenderer test shapes drawn');
});
