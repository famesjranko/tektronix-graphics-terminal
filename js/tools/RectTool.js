/**
 * RectTool - Rectangle drawing tool for Tektronix Graphics Terminal
 *
 * Click to set one corner, drag to opposite corner, release to create rectangle.
 */

import { BaseTool } from './BaseTool.js';

export class RectTool extends BaseTool {
  constructor(tekCanvas, renderer) {
    super(tekCanvas, renderer);

    this.name = 'rect';
    this.icon = 'R';
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
   * Handle mouse move - show preview rectangle
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

    // Calculate rectangle bounds (normalize so x,y is always top-left)
    const { rectX, rectY, width, height } = this._normalizeRect(this.startX, this.startY, x, y);

    this.renderer.drawRect(ctx, rectX, rectY, width, height, this.color, false);
  }

  /**
   * Handle mouse up - finalize rectangle
   * @param {number} x - Normalized x coordinate (0-1)
   * @param {number} y - Normalized y coordinate (0-1)
   */
  onMouseUp(x, y) {
    if (!this.isDrawing) {
      return;
    }

    this.isDrawing = false;
    this.clearPreview();

    // Calculate rectangle bounds
    const { rectX, rectY, width, height } = this._normalizeRect(this.startX, this.startY, x, y);

    // Only create rectangle if there's actual size
    if (width < 0.001 && height < 0.001) {
      return;
    }

    // Create rect command
    const command = {
      type: 'rect',
      x: rectX,
      y: rectY,
      width: width,
      height: height,
      filled: false,
      color: this.color
    };

    // Emit command via callback
    if (this.onCommand) {
      this.onCommand(command);
    }
  }

  /**
   * Normalize rectangle coordinates so x,y is always top-left
   * @param {number} x1 - First corner X
   * @param {number} y1 - First corner Y
   * @param {number} x2 - Second corner X
   * @param {number} y2 - Second corner Y
   * @returns {{rectX: number, rectY: number, width: number, height: number}}
   */
  _normalizeRect(x1, y1, x2, y2) {
    const rectX = Math.min(x1, x2);
    const rectY = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    return { rectX, rectY, width, height };
  }

  /**
   * Cancel current drawing operation
   */
  cancel() {
    this.isDrawing = false;
    this.clearPreview();
  }
}
