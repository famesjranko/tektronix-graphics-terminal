/**
 * ArcTool - Arc drawing tool for Tektronix Graphics Terminal
 *
 * Multi-step interaction:
 * Step 1: Click and drag to set center and radius
 * Step 2: Move to set start angle, click to confirm
 * Step 3: Move to set end angle, click to complete
 */

import { BaseTool } from './BaseTool.js';

export class ArcTool extends BaseTool {
  constructor(tekCanvas, renderer) {
    super(tekCanvas, renderer);

    this.name = 'arc';
    this.icon = 'A';
    this.cursor = 'crosshair';

    // Drawing state
    this.step = 0; // 0=idle, 1=dragging radius, 2=setting start angle, 3=setting end angle
    this.cx = 0;
    this.cy = 0;
    this.radius = 0;
    this.startAngle = 0;
    this.endAngle = 0;

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
   * Calculate angle from center to point
   * @param {number} cx - Center X
   * @param {number} cy - Center Y
   * @param {number} px - Point X
   * @param {number} py - Point Y
   * @returns {number} Angle in radians
   */
  _getAngle(cx, cy, px, py) {
    return Math.atan2(py - cy, px - cx);
  }

  /**
   * Calculate distance between two points
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @returns {number}
   */
  _getDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Handle mouse down
   * @param {number} x - Normalized x coordinate (0-1)
   * @param {number} y - Normalized y coordinate (0-1)
   */
  onMouseDown(x, y) {
    if (this.step === 0) {
      // Step 1: Start setting center and radius
      this.step = 1;
      this.cx = x;
      this.cy = y;
      this.radius = 0;
    } else if (this.step === 2) {
      // Step 2: Confirm start angle
      this.startAngle = this._getAngle(this.cx, this.cy, x, y);
      this.endAngle = this.startAngle;
      this.step = 3;
      this._drawPreview(x, y);
    } else if (this.step === 3) {
      // Step 3: Confirm end angle and complete
      this.endAngle = this._getAngle(this.cx, this.cy, x, y);
      this._complete();
    }
  }

  /**
   * Handle mouse move
   * @param {number} x - Normalized x coordinate (0-1)
   * @param {number} y - Normalized y coordinate (0-1)
   */
  onMouseMove(x, y) {
    if (this.step === 1) {
      // Dragging to set radius
      this.radius = this._getDistance(this.cx, this.cy, x, y);
      this._drawPreview(x, y);
    } else if (this.step === 2) {
      // Moving to set start angle - show preview with current angle
      this._drawPreview(x, y);
    } else if (this.step === 3) {
      // Moving to set end angle
      this._drawPreview(x, y);
    }
  }

  /**
   * Handle mouse up
   * @param {number} x - Normalized x coordinate (0-1)
   * @param {number} y - Normalized y coordinate (0-1)
   */
  onMouseUp(x, y) {
    if (this.step === 1) {
      // Finished dragging radius
      this.radius = this._getDistance(this.cx, this.cy, x, y);

      // Only proceed if radius is meaningful
      if (this.radius < 0.005) {
        this.cancel();
        return;
      }

      // Move to step 2: setting start angle
      this.step = 2;
      this._drawPreview(x, y);
    }
  }

  /**
   * Draw preview based on current step
   * @param {number} mouseX - Current mouse X
   * @param {number} mouseY - Current mouse Y
   */
  _drawPreview(mouseX, mouseY) {
    this.clearPreview();
    const ctx = this.getPreviewContext();

    if (this.step === 1) {
      // Show circle outline representing radius
      if (this.radius > 0.001) {
        this.renderer.drawCircle(ctx, this.cx, this.cy, this.radius, this.color, false);
        // Draw line from center to cursor showing radius
        this.renderer.drawLine(ctx, this.cx, this.cy, mouseX, mouseY, this.color);
      }
    } else if (this.step === 2) {
      // Show circle and line to start angle position
      this.renderer.drawCircle(ctx, this.cx, this.cy, this.radius, this.color, false);
      const angle = this._getAngle(this.cx, this.cy, mouseX, mouseY);
      const endX = this.cx + Math.cos(angle) * this.radius;
      const endY = this.cy + Math.sin(angle) * this.radius;
      this.renderer.drawLine(ctx, this.cx, this.cy, endX, endY, this.color);
    } else if (this.step === 3) {
      // Show the arc preview
      const currentEnd = this._getAngle(this.cx, this.cy, mouseX, mouseY);
      this.renderer.drawArc(ctx, this.cx, this.cy, this.radius, this.startAngle, currentEnd, this.color);
      // Draw lines showing start and end angles
      const startX = this.cx + Math.cos(this.startAngle) * this.radius;
      const startY = this.cy + Math.sin(this.startAngle) * this.radius;
      const endX = this.cx + Math.cos(currentEnd) * this.radius;
      const endY = this.cy + Math.sin(currentEnd) * this.radius;
      this.renderer.drawLine(ctx, this.cx, this.cy, startX, startY, this.color);
      this.renderer.drawLine(ctx, this.cx, this.cy, endX, endY, this.color);
    }
  }

  /**
   * Complete the arc and emit command
   */
  _complete() {
    this.clearPreview();

    // Only create arc if there's meaningful size
    if (this.radius < 0.005) {
      this.cancel();
      return;
    }

    // Create arc command
    const command = {
      type: 'arc',
      cx: this.cx,
      cy: this.cy,
      radius: this.radius,
      startAngle: this.startAngle,
      endAngle: this.endAngle,
      color: this.color
    };

    // Reset state
    this.step = 0;

    // Emit command via callback
    if (this.onCommand) {
      this.onCommand(command);
    }
  }

  /**
   * Cancel current drawing operation
   */
  cancel() {
    this.step = 0;
    this.radius = 0;
    this.clearPreview();
  }

  /**
   * Handle key down
   * @param {string} key
   * @returns {boolean}
   */
  onKeyDown(key) {
    if (key === 'Escape') {
      this.cancel();
      return true;
    }
    return false;
  }
}
