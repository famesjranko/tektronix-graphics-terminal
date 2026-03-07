/**
 * LineTool - Line drawing tool for Tektronix Graphics Terminal
 *
 * Click to set start point, drag to preview, release to create line.
 */

import { BaseTool } from './BaseTool.js';

export class LineTool extends BaseTool {
  constructor(tekCanvas, renderer) {
    super(tekCanvas, renderer);

    this.name = 'line';
    this.icon = 'L';
    this.cursor = 'crosshair';

    // Drawing state
    this.isDrawing = false;
    this.startX = 0;
    this.startY = 0;

    // Callback for when a command is created
    this.onCommand = null;
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
   * Handle mouse move - show preview line
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
    this.renderer.drawLine(ctx, this.startX, this.startY, x, y, this.color);
  }

  /**
   * Handle mouse up - finalize line
   * @param {number} x - Normalized x coordinate (0-1)
   * @param {number} y - Normalized y coordinate (0-1)
   */
  onMouseUp(x, y) {
    if (!this.isDrawing) {
      return;
    }

    this.isDrawing = false;
    this.clearPreview();

    // Only create line if there's actual movement
    const dx = Math.abs(x - this.startX);
    const dy = Math.abs(y - this.startY);
    if (dx < 0.001 && dy < 0.001) {
      return;
    }

    // Create line command
    const command = {
      type: 'line',
      x1: this.startX,
      y1: this.startY,
      x2: x,
      y2: y,
      color: this.color
    };

    // Emit command via callback
    if (this.onCommand) {
      this.onCommand(command);
    }
  }

  /**
   * Cancel current drawing operation
   */
  cancel() {
    this.isDrawing = false;
    this.clearPreview();
  }
}
