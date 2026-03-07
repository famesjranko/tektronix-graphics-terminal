/**
 * Tektronix Graphics Terminal - Main Application
 *
 * This is the entry point for the drawing canvas page.
 */

import { TekCanvas } from './canvas/TekCanvas.js';
import { VectorRenderer } from './canvas/VectorRenderer.js';
import { PlotAnimator } from './canvas/PlotAnimator.js';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Tektronix Graphics Terminal initializing...');

  // Get container and create TekCanvas
  const container = document.getElementById('canvas-container');
  const tekCanvas = new TekCanvas(container);
  const renderer = new VectorRenderer(tekCanvas);
  const animator = new PlotAnimator(tekCanvas, renderer);

  // Store globally for debugging (will be removed in final polish)
  window.tekCanvas = tekCanvas;
  window.renderer = renderer;
  window.animator = animator;

  console.log('TekCanvas initialized:', {
    width: tekCanvas.getWidth(),
    height: tekCanvas.getHeight(),
    dpr: tekCanvas.dpr
  });

  // Listen for animation complete
  animator.addEventListener('complete', () => {
    console.log('Animation complete');
  });

  // Queue test commands to draw a square
  // Square centered at (0.5, 0.5) with side 0.3
  const cx = 0.5, cy = 0.5, size = 0.3;
  const half = size / 2;

  // Four lines forming a square
  animator.enqueue({ type: 'line', x1: cx - half, y1: cy - half, x2: cx + half, y2: cy - half }); // top
  animator.enqueue({ type: 'line', x1: cx + half, y1: cy - half, x2: cx + half, y2: cy + half }); // right
  animator.enqueue({ type: 'line', x1: cx + half, y1: cy + half, x2: cx - half, y2: cy + half }); // bottom
  animator.enqueue({ type: 'line', x1: cx - half, y1: cy + half, x2: cx - half, y2: cy - half }); // left

  // Add diagonal lines for extra visual
  animator.enqueue({ type: 'line', x1: cx - half, y1: cy - half, x2: cx + half, y2: cy + half }); // diagonal 1
  animator.enqueue({ type: 'line', x1: cx + half, y1: cy - half, x2: cx - half, y2: cy + half }); // diagonal 2
});
