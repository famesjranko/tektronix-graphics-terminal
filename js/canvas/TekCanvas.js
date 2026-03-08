/**
 * TekCanvas - Dual-layer canvas system for Tektronix Graphics Terminal
 *
 * Provides:
 * - Persistent layer: finished drawings that don't change
 * - Animation layer: preview/in-progress drawings (cleared each frame)
 * - HiDPI support via devicePixelRatio
 * - Normalized coordinates (0-1 range)
 */

import { COLORS, GRID_COLOR, GRID_OPACITY } from '../utils/colors.js';

export class TekCanvas {
  /**
   * @param {HTMLElement} container - Container element for canvases
   */
  constructor(container) {
    this.container = container;
    this.dpr = window.devicePixelRatio || 1;

    // Create the two canvas layers
    this.persistentCanvas = this._createCanvas('persistent-canvas');
    this.animationCanvas = this._createCanvas('animation-canvas');

    // Animation canvas is on top (higher z-index via DOM order)
    this.container.appendChild(this.persistentCanvas);
    this.container.appendChild(this.animationCanvas);

    // Get contexts
    this.persistentCtx = this.persistentCanvas.getContext('2d');
    this.animationCtx = this.animationCanvas.getContext('2d');

    // Initial sizing
    this._resize();

    // Handle window resize
    this._resizeHandler = () => this._resize();
    window.addEventListener('resize', this._resizeHandler);
  }

  /**
   * Create a canvas element with proper styling
   */
  _createCanvas(id) {
    const canvas = document.createElement('canvas');
    canvas.id = id;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    return canvas;
  }

  /**
   * Handle resize - updates canvas dimensions for HiDPI
   */
  _resize() {
    this.dpr = window.devicePixelRatio || 1;

    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    // Set canvas pixel dimensions (accounting for HiDPI)
    const pixelWidth = Math.floor(this.width * this.dpr);
    const pixelHeight = Math.floor(this.height * this.dpr);

    // Resize both canvases
    [this.persistentCanvas, this.animationCanvas].forEach(canvas => {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    });

    // Scale contexts for HiDPI
    this.persistentCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.animationCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  /**
   * Get the persistent layer context (for finished drawings)
   * @returns {CanvasRenderingContext2D}
   */
  getPersistentContext() {
    return this.persistentCtx;
  }

  /**
   * Get the animation layer context (for previews)
   * @returns {CanvasRenderingContext2D}
   */
  getAnimationContext() {
    return this.animationCtx;
  }

  /**
   * Alias for getPersistentContext (for compatibility)
   * @returns {CanvasRenderingContext2D}
   */
  getContext() {
    return this.getPersistentContext();
  }

  /**
   * Convert pixel coordinates to normalized (0-1) coordinates
   * @param {number} x - Pixel x coordinate
   * @param {number} y - Pixel y coordinate
   * @returns {{x: number, y: number}} Normalized coordinates
   */
  toNormalized(x, y) {
    const scale = this.getScale();
    const offset = this.getOffset();
    return {
      x: (x - offset.x) / scale,
      y: (y - offset.y) / scale
    };
  }

  /**
   * Convert normalized (0-1) coordinates to pixel coordinates
   * @param {number} x - Normalized x coordinate (0-1)
   * @param {number} y - Normalized y coordinate (0-1)
   * @returns {{x: number, y: number}} Pixel coordinates
   */
  fromNormalized(x, y) {
    const scale = this.getScale();
    const offset = this.getOffset();
    return {
      x: x * scale + offset.x,
      y: y * scale + offset.y
    };
  }

  /**
   * Get canvas width in CSS pixels
   * @returns {number}
   */
  getWidth() {
    return this.width;
  }

  /**
   * Get canvas height in CSS pixels
   * @returns {number}
   */
  getHeight() {
    return this.height;
  }

  /**
   * Get uniform scale factor (uses smaller dimension to preserve aspect ratio)
   * @returns {number}
   */
  getScale() {
    return Math.min(this.width, this.height);
  }

  /**
   * Get offset for centering content with uniform scaling
   * @returns {{x: number, y: number}}
   */
  getOffset() {
    const scale = this.getScale();
    return {
      x: (this.width - scale) / 2,
      y: (this.height - scale) / 2
    };
  }

  /**
   * Clear the animation layer
   */
  clearAnimation() {
    this.animationCtx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * Clear the persistent layer
   */
  clearPersistent() {
    this.persistentCtx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * Clear both layers
   */
  clearAll() {
    this.clearPersistent();
    this.clearAnimation();
  }

  /**
   * Draw background grid on persistent layer
   * Grid: 50px spacing, --tek-dim color at 30% opacity
   */
  drawGrid() {
    const ctx = this.persistentCtx;
    const spacing = 50;

    ctx.save();
    ctx.strokeStyle = GRID_COLOR;
    ctx.globalAlpha = GRID_OPACITY;
    ctx.lineWidth = 1;

    // Draw vertical lines
    for (let x = spacing; x < this.width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(Math.floor(x) + 0.5, 0);
      ctx.lineTo(Math.floor(x) + 0.5, this.height);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = spacing; y < this.height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, Math.floor(y) + 0.5);
      ctx.lineTo(this.width, Math.floor(y) + 0.5);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    window.removeEventListener('resize', this._resizeHandler);
  }
}
