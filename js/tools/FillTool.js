/**
 * FillTool - Pattern fill tool for Tektronix Graphics Terminal
 *
 * Click inside a closed region to fill with a pattern.
 * Uses flood-fill algorithm to find the boundary, then renders
 * the pattern as vector lines within that boundary.
 */

import { BaseTool } from './BaseTool.js';
import { DEFAULT_COLOR } from '../utils/colors.js';

// Available fill patterns
export const FILL_PATTERNS = {
  horizontal: 'horizontal',
  vertical: 'vertical',
  diagonal45: 'diagonal45',
  diagonal135: 'diagonal135',
  crosshatch: 'crosshatch',
  dots: 'dots'
};

export class FillTool extends BaseTool {
  constructor(tekCanvas, renderer) {
    super(tekCanvas, renderer);

    this.name = 'fill';
    this.icon = 'F';
    this.cursor = 'crosshair';

    // Current fill pattern
    this.pattern = FILL_PATTERNS.crosshatch;

    // Pattern spacing in normalized coordinates (relative to canvas width)
    this.spacing = 0.015;

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
   * Set the fill pattern
   * @param {string} pattern - Pattern name from FILL_PATTERNS
   */
  setPattern(pattern) {
    if (FILL_PATTERNS[pattern]) {
      this.pattern = pattern;
    }
  }

  /**
   * Get the current pattern
   * @returns {string}
   */
  getPattern() {
    return this.pattern;
  }

  /**
   * Handle mouse down - perform fill at click location
   * @param {number} x - Normalized x coordinate (0-1)
   * @param {number} y - Normalized y coordinate (0-1)
   */
  onMouseDown(x, y) {
    // Get the persistent canvas context to read pixels
    const ctx = this.tekCanvas.getPersistentContext();
    const width = this.tekCanvas.getWidth();
    const height = this.tekCanvas.getHeight();

    // Convert normalized coords to pixel coords
    const pixelX = Math.floor(x * width);
    const pixelY = Math.floor(y * height);

    // Get image data for flood fill
    const imageData = ctx.getImageData(0, 0, width, height);

    // Perform flood fill to find the region
    const filledPixels = this._floodFill(imageData, pixelX, pixelY, width, height);

    if (filledPixels.size === 0) {
      // Clicked on a boundary or outside valid area
      return;
    }

    // Find bounding box of filled region
    const bounds = this._getBounds(filledPixels, width);

    // Generate pattern lines within the filled region
    const patternLines = this._generatePatternLines(
      filledPixels,
      bounds,
      width,
      height
    );

    if (patternLines.length === 0) {
      return;
    }

    // Create fill command
    const command = {
      type: 'fill',
      x: x,
      y: y,
      pattern: this.pattern,
      color: this.color,
      // Store the generated lines for replay
      lines: patternLines
    };

    // Emit command via callback
    if (this.onCommand) {
      this.onCommand(command);
    }
  }

  /**
   * Handle mouse move - show preview of fill area
   * @param {number} x - Normalized x coordinate (0-1)
   * @param {number} y - Normalized y coordinate (0-1)
   */
  onMouseMove(x, y) {
    // Optional: could show a highlight of the region that would be filled
    // For now, we don't show a preview as flood fill can be expensive
  }

  /**
   * Handle mouse up
   * @param {number} x - Normalized x coordinate (0-1)
   * @param {number} y - Normalized y coordinate (0-1)
   */
  onMouseUp(x, y) {
    // Fill is triggered on mouse down, nothing to do here
  }

  /**
   * Flood fill algorithm to find connected empty pixels
   * @param {ImageData} imageData - Canvas image data
   * @param {number} startX - Starting X pixel
   * @param {number} startY - Starting Y pixel
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   * @returns {Set} Set of filled pixel indices
   */
  _floodFill(imageData, startX, startY, width, height) {
    const data = imageData.data;
    const filled = new Set();

    // Check if starting point is valid
    if (startX < 0 || startX >= width || startY < 0 || startY >= height) {
      return filled;
    }

    // Get the color at starting point
    const startIdx = (startY * width + startX) * 4;
    const startR = data[startIdx];
    const startG = data[startIdx + 1];
    const startB = data[startIdx + 2];
    const startA = data[startIdx + 3];

    // Check if starting on a drawn line (non-background)
    // Background is dark (near black with green tint: #0A0F0D)
    // We consider "empty" as pixels with low alpha or very dark
    if (!this._isEmptyPixel(startR, startG, startB, startA)) {
      return filled;
    }

    // Stack-based flood fill
    const stack = [[startX, startY]];
    const maxPixels = width * height * 0.5; // Limit to prevent infinite loops

    while (stack.length > 0 && filled.size < maxPixels) {
      const [x, y] = stack.pop();

      // Check bounds
      if (x < 0 || x >= width || y < 0 || y >= height) {
        continue;
      }

      const idx = y * width + x;

      // Already filled?
      if (filled.has(idx)) {
        continue;
      }

      // Check if this pixel is empty (fillable)
      const pixelIdx = idx * 4;
      const r = data[pixelIdx];
      const g = data[pixelIdx + 1];
      const b = data[pixelIdx + 2];
      const a = data[pixelIdx + 3];

      if (!this._isEmptyPixel(r, g, b, a)) {
        continue;
      }

      // Mark as filled
      filled.add(idx);

      // Add neighbors (4-connected)
      stack.push([x + 1, y]);
      stack.push([x - 1, y]);
      stack.push([x, y + 1]);
      stack.push([x, y - 1]);
    }

    return filled;
  }

  /**
   * Check if a pixel is "empty" (background/fillable)
   * @param {number} r - Red component
   * @param {number} g - Green component
   * @param {number} b - Blue component
   * @param {number} a - Alpha component
   * @returns {boolean}
   */
  _isEmptyPixel(r, g, b, a) {
    // If alpha is low (transparent), it's empty
    if (a < 50) {
      return true;
    }

    // Background is #0A0F0D (10, 15, 13) - very dark
    // Consider pixels with low brightness as empty
    const brightness = (r + g + b) / 3;
    return brightness < 30;
  }

  /**
   * Get bounding box of filled pixels
   * @param {Set} filledPixels - Set of pixel indices
   * @param {number} width - Canvas width
   * @returns {Object} Bounds {minX, minY, maxX, maxY}
   */
  _getBounds(filledPixels, width) {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const idx of filledPixels) {
      const x = idx % width;
      const y = Math.floor(idx / width);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }

    return { minX, minY, maxX, maxY };
  }

  /**
   * Generate pattern lines within the filled region
   * @param {Set} filledPixels - Set of filled pixel indices
   * @param {Object} bounds - Bounding box
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   * @returns {Array} Array of line commands (in normalized coords)
   */
  _generatePatternLines(filledPixels, bounds, width, height) {
    const lines = [];
    const spacingPx = Math.max(3, Math.floor(this.spacing * width));

    switch (this.pattern) {
      case FILL_PATTERNS.horizontal:
        this._addHorizontalLines(lines, filledPixels, bounds, width, height, spacingPx);
        break;
      case FILL_PATTERNS.vertical:
        this._addVerticalLines(lines, filledPixels, bounds, width, height, spacingPx);
        break;
      case FILL_PATTERNS.diagonal45:
        this._addDiagonalLines(lines, filledPixels, bounds, width, height, spacingPx, 1);
        break;
      case FILL_PATTERNS.diagonal135:
        this._addDiagonalLines(lines, filledPixels, bounds, width, height, spacingPx, -1);
        break;
      case FILL_PATTERNS.crosshatch:
        this._addHorizontalLines(lines, filledPixels, bounds, width, height, spacingPx);
        this._addVerticalLines(lines, filledPixels, bounds, width, height, spacingPx);
        break;
      case FILL_PATTERNS.dots:
        this._addDots(lines, filledPixels, bounds, width, height, spacingPx);
        break;
    }

    return lines;
  }

  /**
   * Add horizontal lines to the pattern
   */
  _addHorizontalLines(lines, filledPixels, bounds, width, height, spacing) {
    for (let y = bounds.minY; y <= bounds.maxY; y += spacing) {
      // Find spans of filled pixels at this y
      const spans = this._getFilledSpans(filledPixels, y, bounds.minX, bounds.maxX, width);

      for (const span of spans) {
        lines.push({
          x1: span.start / width,
          y1: y / height,
          x2: span.end / width,
          y2: y / height
        });
      }
    }
  }

  /**
   * Add vertical lines to the pattern
   */
  _addVerticalLines(lines, filledPixels, bounds, width, height, spacing) {
    for (let x = bounds.minX; x <= bounds.maxX; x += spacing) {
      // Find spans of filled pixels at this x
      const spans = this._getFilledSpansVertical(filledPixels, x, bounds.minY, bounds.maxY, width);

      for (const span of spans) {
        lines.push({
          x1: x / width,
          y1: span.start / height,
          x2: x / width,
          y2: span.end / height
        });
      }
    }
  }

  /**
   * Add diagonal lines to the pattern
   * @param {number} direction - 1 for 45°, -1 for 135°
   */
  _addDiagonalLines(lines, filledPixels, bounds, width, height, spacing, direction) {
    const diagSpacing = Math.floor(spacing * 1.414); // Adjust for diagonal

    // Calculate range of diagonal intercepts
    const minIntercept = direction === 1
      ? bounds.minX - bounds.maxY
      : bounds.minX + bounds.minY;
    const maxIntercept = direction === 1
      ? bounds.maxX - bounds.minY
      : bounds.maxX + bounds.maxY;

    for (let intercept = minIntercept; intercept <= maxIntercept; intercept += diagSpacing) {
      // Find segments along this diagonal
      const segments = [];
      let inSegment = false;
      let segStart = null;

      // Walk along the diagonal
      for (let x = bounds.minX; x <= bounds.maxX; x++) {
        const y = direction === 1 ? x - intercept : intercept - x;

        if (y < bounds.minY || y > bounds.maxY) {
          if (inSegment) {
            segments.push({ startX: segStart.x, startY: segStart.y, endX: x - 1, endY: direction === 1 ? (x - 1 - intercept) : (intercept - (x - 1)) });
            inSegment = false;
          }
          continue;
        }

        const idx = Math.floor(y) * width + x;
        const isFilled = filledPixels.has(idx);

        if (isFilled && !inSegment) {
          inSegment = true;
          segStart = { x, y };
        } else if (!isFilled && inSegment) {
          segments.push({ startX: segStart.x, startY: segStart.y, endX: x - 1, endY: direction === 1 ? (x - 1 - intercept) : (intercept - (x - 1)) });
          inSegment = false;
        }
      }

      // Close any open segment
      if (inSegment) {
        const endX = bounds.maxX;
        const endY = direction === 1 ? endX - intercept : intercept - endX;
        segments.push({ startX: segStart.x, startY: segStart.y, endX, endY });
      }

      // Add segments as lines
      for (const seg of segments) {
        if (seg.startX !== seg.endX || seg.startY !== seg.endY) {
          lines.push({
            x1: seg.startX / width,
            y1: seg.startY / height,
            x2: seg.endX / width,
            y2: seg.endY / height
          });
        }
      }
    }
  }

  /**
   * Add dots to the pattern
   */
  _addDots(lines, filledPixels, bounds, width, height, spacing) {
    for (let y = bounds.minY; y <= bounds.maxY; y += spacing) {
      for (let x = bounds.minX; x <= bounds.maxX; x += spacing) {
        const idx = y * width + x;
        if (filledPixels.has(idx)) {
          // Draw a tiny cross for each dot (more visible than a single pixel)
          const dotSize = 0.002;
          const nx = x / width;
          const ny = y / height;
          lines.push({
            x1: nx - dotSize,
            y1: ny,
            x2: nx + dotSize,
            y2: ny
          });
        }
      }
    }
  }

  /**
   * Get horizontal spans of filled pixels at a given y
   */
  _getFilledSpans(filledPixels, y, minX, maxX, width) {
    const spans = [];
    let inSpan = false;
    let spanStart = 0;

    for (let x = minX; x <= maxX; x++) {
      const idx = y * width + x;
      const isFilled = filledPixels.has(idx);

      if (isFilled && !inSpan) {
        inSpan = true;
        spanStart = x;
      } else if (!isFilled && inSpan) {
        spans.push({ start: spanStart, end: x - 1 });
        inSpan = false;
      }
    }

    if (inSpan) {
      spans.push({ start: spanStart, end: maxX });
    }

    return spans;
  }

  /**
   * Get vertical spans of filled pixels at a given x
   */
  _getFilledSpansVertical(filledPixels, x, minY, maxY, width) {
    const spans = [];
    let inSpan = false;
    let spanStart = 0;

    for (let y = minY; y <= maxY; y++) {
      const idx = y * width + x;
      const isFilled = filledPixels.has(idx);

      if (isFilled && !inSpan) {
        inSpan = true;
        spanStart = y;
      } else if (!isFilled && inSpan) {
        spans.push({ start: spanStart, end: y - 1 });
        inSpan = false;
      }
    }

    if (inSpan) {
      spans.push({ start: spanStart, end: maxY });
    }

    return spans;
  }

  /**
   * Cancel current operation
   */
  cancel() {
    this.clearPreview();
  }
}
