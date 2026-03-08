/**
 * VectorRenderer - Drawing primitives for Tektronix Graphics Terminal
 *
 * Renders crisp vector graphics with normalized coordinates.
 * All coordinates are in 0-1 space and converted to pixels at draw time.
 */

import { DEFAULT_COLOR } from '../utils/colors.js';

export class VectorRenderer {
  /**
   * @param {TekCanvas} tekCanvas - The TekCanvas instance for coordinate conversion
   */
  constructor(tekCanvas) {
    this.tekCanvas = tekCanvas;
  }

  /**
   * Prepare context for crisp 1px lines
   * @param {CanvasRenderingContext2D} ctx
   */
  _prepareContext(ctx) {
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.lineWidth = 1;
  }

  /**
   * Offset coordinate for crisp 1px lines (avoids anti-aliasing blur)
   * @param {number} coord
   * @returns {number}
   */
  _crisp(coord) {
    return Math.floor(coord) + 0.5;
  }

  /**
   * Draw a line from (x1, y1) to (x2, y2)
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x1 - Start X (normalized 0-1)
   * @param {number} y1 - Start Y (normalized 0-1)
   * @param {number} x2 - End X (normalized 0-1)
   * @param {number} y2 - End Y (normalized 0-1)
   * @param {string} color - Stroke color (default: primary green)
   * @param {string} style - Line style: 'solid', 'dashed', 'dotted' (default: 'solid')
   */
  drawLine(ctx, x1, y1, x2, y2, color = DEFAULT_COLOR, style = 'solid') {
    const start = this.tekCanvas.fromNormalized(x1, y1);
    const end = this.tekCanvas.fromNormalized(x2, y2);

    this._prepareContext(ctx);
    ctx.strokeStyle = color;

    // Set line dash pattern based on style
    if (style === 'dashed') {
      ctx.setLineDash([8, 4]);
    } else if (style === 'dotted') {
      ctx.setLineDash([2, 4]);
    } else {
      ctx.setLineDash([]);
    }

    ctx.beginPath();
    ctx.moveTo(this._crisp(start.x), this._crisp(start.y));
    ctx.lineTo(this._crisp(end.x), this._crisp(end.y));
    ctx.stroke();

    // Reset line dash
    ctx.setLineDash([]);
  }

  /**
   * Draw a circle
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} cx - Center X (normalized 0-1)
   * @param {number} cy - Center Y (normalized 0-1)
   * @param {number} r - Radius (normalized, relative to canvas width)
   * @param {string} color - Stroke/fill color
   * @param {boolean} filled - Whether to fill the circle
   */
  drawCircle(ctx, cx, cy, r, color = DEFAULT_COLOR, filled = false) {
    const center = this.tekCanvas.fromNormalized(cx, cy);
    const radius = r * this.tekCanvas.getScale();

    this._prepareContext(ctx);
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);

    if (filled) {
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  }

  /**
   * Draw a rectangle
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - Top-left X (normalized 0-1)
   * @param {number} y - Top-left Y (normalized 0-1)
   * @param {number} w - Width (normalized 0-1)
   * @param {number} h - Height (normalized 0-1)
   * @param {string} color - Stroke/fill color
   * @param {boolean} filled - Whether to fill the rectangle
   */
  drawRect(ctx, x, y, w, h, color = DEFAULT_COLOR, filled = false) {
    const topLeft = this.tekCanvas.fromNormalized(x, y);
    const bottomRight = this.tekCanvas.fromNormalized(x + w, y + h);
    const width = bottomRight.x - topLeft.x;
    const height = bottomRight.y - topLeft.y;

    this._prepareContext(ctx);

    if (filled) {
      ctx.fillStyle = color;
      ctx.fillRect(topLeft.x, topLeft.y, width, height);
    } else {
      ctx.strokeStyle = color;
      ctx.strokeRect(
        this._crisp(topLeft.x),
        this._crisp(topLeft.y),
        Math.floor(width),
        Math.floor(height)
      );
    }
  }

  /**
   * Draw an arc
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} cx - Center X (normalized 0-1)
   * @param {number} cy - Center Y (normalized 0-1)
   * @param {number} r - Radius (normalized, relative to canvas width)
   * @param {number} startAngle - Start angle in radians
   * @param {number} endAngle - End angle in radians
   * @param {string} color - Stroke color
   */
  drawArc(ctx, cx, cy, r, startAngle, endAngle, color = DEFAULT_COLOR) {
    const center = this.tekCanvas.fromNormalized(cx, cy);
    const radius = r * this.tekCanvas.getScale();

    this._prepareContext(ctx);
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, startAngle, endAngle);
    ctx.stroke();
  }
}
