/**
 * BaseTool - Abstract base class for all drawing tools
 *
 * Tools extend this class and implement the mouse/keyboard handlers.
 * Preview rendering happens on the animation canvas layer.
 */

import { DEFAULT_COLOR } from '../utils/colors.js';

export class BaseTool {
  /**
   * @param {TekCanvas} tekCanvas - The canvas system
   * @param {VectorRenderer} renderer - The vector renderer for drawing
   */
  constructor(tekCanvas, renderer) {
    if (new.target === BaseTool) {
      throw new Error('BaseTool is abstract and cannot be instantiated directly');
    }

    this.tekCanvas = tekCanvas;
    this.renderer = renderer;
    this.active = false;
    this.color = DEFAULT_COLOR;

    // Subclasses should override these properties
    this.name = 'base';
    this.icon = '?';
    this.cursor = 'crosshair';
  }

  /**
   * Activate the tool - called when tool is selected
   */
  activate() {
    this.active = true;
    this._setCursor(this.cursor);
  }

  /**
   * Deactivate the tool - called when switching to another tool
   */
  deactivate() {
    this.active = false;
    this.clearPreview();
    this._setCursor('default');
  }

  /**
   * Set the cursor style on the animation canvas
   * @param {string} cursor - CSS cursor value
   */
  _setCursor(cursor) {
    if (this.tekCanvas && this.tekCanvas.animationCanvas) {
      this.tekCanvas.animationCanvas.style.cursor = cursor;
    }
  }

  /**
   * Clear the preview layer
   */
  clearPreview() {
    this.tekCanvas.clearAnimation();
  }

  /**
   * Get the animation context for preview rendering
   * @returns {CanvasRenderingContext2D}
   */
  getPreviewContext() {
    return this.tekCanvas.getAnimationContext();
  }

  /**
   * Set the drawing color
   * @param {string} color - CSS color value
   */
  setColor(color) {
    this.color = color;
  }

  // =========================================
  // Abstract methods - must be implemented by subclasses
  // =========================================

  /**
   * Handle mouse down event
   * @param {number} x - Normalized x coordinate (0-1)
   * @param {number} y - Normalized y coordinate (0-1)
   */
  onMouseDown(x, y) {
    throw new Error('onMouseDown must be implemented by subclass');
  }

  /**
   * Handle mouse move event
   * @param {number} x - Normalized x coordinate (0-1)
   * @param {number} y - Normalized y coordinate (0-1)
   */
  onMouseMove(x, y) {
    throw new Error('onMouseMove must be implemented by subclass');
  }

  /**
   * Handle mouse up event
   * @param {number} x - Normalized x coordinate (0-1)
   * @param {number} y - Normalized y coordinate (0-1)
   */
  onMouseUp(x, y) {
    throw new Error('onMouseUp must be implemented by subclass');
  }

  /**
   * Handle key down event
   * @param {string} key - The key that was pressed
   * @returns {boolean} - True if the key was handled
   */
  onKeyDown(key) {
    // Default: Escape cancels current operation
    if (key === 'Escape') {
      this.cancel();
      return true;
    }
    return false;
  }

  /**
   * Cancel the current drawing operation
   * Override in subclasses if additional cleanup is needed
   */
  cancel() {
    this.clearPreview();
  }
}
