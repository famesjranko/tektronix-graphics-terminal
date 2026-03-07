/**
 * CircleTool - Circle drawing tool for Tektronix Graphics Terminal
 *
 * Click to set one corner of bounding box, drag to opposite corner.
 * Circle is inscribed in the bounding box (center at box center, radius = min(w,h)/2).
 */

import { BaseTool } from './BaseTool.js';

export class CircleTool extends BaseTool {
  constructor(tekCanvas, renderer) {
    super(tekCanvas, renderer);

    this.name = 'circle';
    this.icon = 'C';
    this.cursor = 'crosshair';

    // Drawing state
    this.isDrawing = false;
    this.startX = 0;
    this.startY = 0;

    // Whether to draw filled circles
    this.filled = false;

    // Callback for when a command is created
    this.onCommand = null;
  }

  /**
   * Set whether circles are filled
   * @param {boolean} filled
   */
  setFilled(filled) {
    this.filled = !!filled;
  }

  /**
   * Get whether circles are filled
   * @returns {boolean}
   */
  getFilled() {
    return this.filled;
  }

  /**
   * Set callback for when a command is created
   * @param {Function} callback - Function that receives the command
   */
  setCommandCallback(callback) {
    this.onCommand = callback;
  }

  /**
   * Handle mouse down - start drawing
   * @param {number} x - Normalized x coordinate (0-1)
   * @param {number} y - Normalized y coordinate (0-1)
   */
  onMouseDown(x, y) {
    this.isDrawing = true;
    this.startX = x;
    this.startY = y;
  }

  /**
   * Handle mouse move - show preview circle
   * @param {number} x - Normalized x coordinate (0-1)
   * @param {number} y - Normalized y coordinate (0-1)
   */
  onMouseMove(x, y) {
    if (!this.isDrawing) {
      return;
    }

    // Clear previous preview and draw new one
    this.clearPreview();
    const ctx = this.getPreviewContext();

    // Calculate circle from bounding box
    const { cx, cy, radius } = this._calculateCircle(this.startX, this.startY, x, y);

    if (radius > 0.001) {
      this.renderer.drawCircle(ctx, cx, cy, radius, this.color, this.filled);
    }
  }

  /**
   * Handle mouse up - finalize circle
   * @param {number} x - Normalized x coordinate (0-1)
   * @param {number} y - Normalized y coordinate (0-1)
   */
  onMouseUp(x, y) {
    if (!this.isDrawing) {
      return;
    }

    this.isDrawing = false;
    this.clearPreview();

    // Calculate circle from bounding box
    const { cx, cy, radius } = this._calculateCircle(this.startX, this.startY, x, y);

    // Only create circle if there's actual size
    if (radius < 0.001) {
      return;
    }

    // Create circle command
    const command = {
      type: 'circle',
      cx: cx,
      cy: cy,
      radius: radius,
      filled: this.filled,
      color: this.color
    };

    // Emit command via callback
    if (this.onCommand) {
      this.onCommand(command);
    }
  }

  /**
   * Calculate circle inscribed in bounding box
   * @param {number} x1 - First corner X
   * @param {number} y1 - First corner Y
   * @param {number} x2 - Second corner X
   * @param {number} y2 - Second corner Y
   * @returns {{cx: number, cy: number, radius: number}}
   */
  _calculateCircle(x1, y1, x2, y2) {
    // Calculate bounding box
    const rectX = Math.min(x1, x2);
    const rectY = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    // Center of the bounding box
    const cx = rectX + width / 2;
    const cy = rectY + height / 2;

    // Radius is half of the smaller dimension
    // Note: radius is relative to canvas width in VectorRenderer
    const radius = Math.min(width, height) / 2;

    return { cx, cy, radius };
  }

  /**
   * Cancel current drawing operation
   */
  cancel() {
    this.isDrawing = false;
    this.clearPreview();
  }
}
