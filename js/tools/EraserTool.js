/**
 * EraserTool - Eraser tool for Tektronix Graphics Terminal
 *
 * Click on elements to erase them. Highlights elements on hover.
 * Drag to erase multiple elements.
 */

import { BaseTool } from './BaseTool.js';
import { COLORS } from '../utils/colors.js';
import { textToCommands } from '../fonts/hershey.js';

export class EraserTool extends BaseTool {
  constructor(tekCanvas, renderer) {
    super(tekCanvas, renderer);

    this.name = 'eraser';
    this.icon = 'E';
    this.cursor = 'pointer';

    // State
    this.isErasing = false;
    this.hoveredCommandIndex = -1;

    // Hit threshold in normalized coords (about 10px at 1000px canvas)
    this.hitThreshold = 0.01;

    // Callback for getting commands from ToolManager
    this.getCommands = null;
    // Callback for removing a command
    this.onRemoveCommand = null;
  }

  /**
   * Set callback for getting the command list
   * @param {Function} callback - Returns array of commands
   */
  setGetCommandsCallback(callback) {
    this.getCommands = callback;
  }

  /**
   * Set callback for removing a command
   * @param {Function} callback - Called with command index to remove
   */
  setRemoveCommandCallback(callback) {
    this.onRemoveCommand = callback;
  }

  /**
   * Calculate distance from point to line segment
   */
  _distanceToLineSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSq = dx * dx + dy * dy;

    if (lengthSq === 0) {
      // Line segment is a point
      return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    }

    // Project point onto line, clamped to segment
    let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
    t = Math.max(0, Math.min(1, t));

    const projX = x1 + t * dx;
    const projY = y1 + t * dy;

    return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
  }

  /**
   * Calculate distance from point to circle edge
   */
  _distanceToCircle(px, py, cx, cy, radius) {
    const distToCenter = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
    return Math.abs(distToCenter - radius);
  }

  /**
   * Calculate distance from point to arc
   */
  _distanceToArc(px, py, cx, cy, radius, startAngle, endAngle) {
    const distToCenter = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
    const angle = Math.atan2(py - cy, px - cx);

    // Normalize angles
    let normStart = startAngle;
    let normEnd = endAngle;
    let normAngle = angle;

    // Handle angle wrapping
    while (normEnd < normStart) normEnd += Math.PI * 2;
    while (normAngle < normStart) normAngle += Math.PI * 2;

    if (normAngle >= normStart && normAngle <= normEnd) {
      // Point is within arc angle range
      return Math.abs(distToCenter - radius);
    }

    // Point is outside arc range, find distance to endpoints
    const startX = cx + radius * Math.cos(startAngle);
    const startY = cy + radius * Math.sin(startAngle);
    const endX = cx + radius * Math.cos(endAngle);
    const endY = cy + radius * Math.sin(endAngle);

    const distToStart = Math.sqrt((px - startX) ** 2 + (py - startY) ** 2);
    const distToEnd = Math.sqrt((px - endX) ** 2 + (py - endY) ** 2);

    return Math.min(distToStart, distToEnd);
  }

  /**
   * Calculate distance from point to rectangle edges
   */
  _distanceToRect(px, py, x, y, width, height) {
    // Check distance to each of the 4 edges
    const edges = [
      [x, y, x + width, y],           // top
      [x + width, y, x + width, y + height], // right
      [x, y + height, x + width, y + height], // bottom
      [x, y, x, y + height]           // left
    ];

    let minDist = Infinity;
    for (const [x1, y1, x2, y2] of edges) {
      const dist = this._distanceToLineSegment(px, py, x1, y1, x2, y2);
      minDist = Math.min(minDist, dist);
    }
    return minDist;
  }

  /**
   * Calculate distance from point to a command
   * @returns {number} Distance in normalized coords
   */
  _distanceToCommand(px, py, cmd) {
    switch (cmd.type) {
      case 'line':
        return this._distanceToLineSegment(px, py, cmd.x1, cmd.y1, cmd.x2, cmd.y2);

      case 'rect':
        if (cmd.filled) {
          // For filled rect, check if point is inside
          if (px >= cmd.x && px <= cmd.x + cmd.width &&
              py >= cmd.y && py <= cmd.y + cmd.height) {
            return 0;
          }
        }
        return this._distanceToRect(px, py, cmd.x, cmd.y, cmd.width, cmd.height);

      case 'circle':
        if (cmd.filled) {
          // For filled circle, check if point is inside
          const distToCenter = Math.sqrt((px - cmd.cx) ** 2 + (py - cmd.cy) ** 2);
          if (distToCenter <= cmd.radius) {
            return 0;
          }
        }
        return this._distanceToCircle(px, py, cmd.cx, cmd.cy, cmd.radius);

      case 'arc':
        return this._distanceToArc(px, py, cmd.cx, cmd.cy, cmd.radius, cmd.startAngle, cmd.endAngle);

      case 'text': {
        // Convert text to line commands and check each
        const lineCommands = textToCommands(cmd.text, cmd.x, cmd.y, cmd.scale || 1);
        let minDist = Infinity;
        for (const lineCmd of lineCommands) {
          const dist = this._distanceToLineSegment(px, py, lineCmd.x1, lineCmd.y1, lineCmd.x2, lineCmd.y2);
          minDist = Math.min(minDist, dist);
        }
        return minDist;
      }

      case 'fill': {
        // Check distance to fill pattern lines
        const lines = cmd.lines || [];
        let minDist = Infinity;
        for (const line of lines) {
          const dist = this._distanceToLineSegment(px, py, line.x1, line.y1, line.x2, line.y2);
          minDist = Math.min(minDist, dist);
        }
        return minDist;
      }

      default:
        return Infinity;
    }
  }

  /**
   * Find the command closest to the given point
   * @returns {number} Index of closest command, or -1 if none within threshold
   */
  _findCommandAtPoint(x, y) {
    if (!this.getCommands) return -1;

    const commands = this.getCommands();
    let closestIndex = -1;
    let closestDist = this.hitThreshold;

    for (let i = 0; i < commands.length; i++) {
      const dist = this._distanceToCommand(x, y, commands[i]);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = i;
      }
    }

    return closestIndex;
  }

  /**
   * Draw a highlight around a command
   */
  _highlightCommand(cmd) {
    this.clearPreview();
    const ctx = this.getPreviewContext();
    const highlightColor = COLORS.highlight;

    // Set up highlight style
    ctx.lineWidth = 3;
    ctx.strokeStyle = highlightColor;

    switch (cmd.type) {
      case 'line':
        this.renderer.drawLine(ctx, cmd.x1, cmd.y1, cmd.x2, cmd.y2, highlightColor);
        break;

      case 'rect':
        this.renderer.drawRect(ctx, cmd.x, cmd.y, cmd.width, cmd.height, highlightColor, false);
        break;

      case 'circle':
        this.renderer.drawCircle(ctx, cmd.cx, cmd.cy, cmd.radius, highlightColor, false);
        break;

      case 'arc':
        this.renderer.drawArc(ctx, cmd.cx, cmd.cy, cmd.radius, cmd.startAngle, cmd.endAngle, highlightColor);
        break;

      case 'text': {
        const lineCommands = textToCommands(cmd.text, cmd.x, cmd.y, cmd.scale || 1);
        for (const lineCmd of lineCommands) {
          this.renderer.drawLine(ctx, lineCmd.x1, lineCmd.y1, lineCmd.x2, lineCmd.y2, highlightColor);
        }
        break;
      }

      case 'fill': {
        const lines = cmd.lines || [];
        for (const line of lines) {
          this.renderer.drawLine(ctx, line.x1, line.y1, line.x2, line.y2, highlightColor);
        }
        break;
      }
    }
  }

  /**
   * Handle mouse down - start erasing
   */
  onMouseDown(x, y) {
    this.isErasing = true;

    const index = this._findCommandAtPoint(x, y);
    if (index >= 0) {
      if (this.onRemoveCommand) {
        this.onRemoveCommand(index);
      }
      this.hoveredCommandIndex = -1;
      this.clearPreview();
    }
  }

  /**
   * Handle mouse move - highlight or erase
   */
  onMouseMove(x, y) {
    if (this.isErasing) {
      // Drag erasing - erase elements as we pass over them
      // Each call to getCommands() returns current state, so indices are always valid
      const index = this._findCommandAtPoint(x, y);
      if (index >= 0) {
        if (this.onRemoveCommand) {
          this.onRemoveCommand(index);
        }
      }
    } else {
      // Just hovering - highlight nearest command
      const index = this._findCommandAtPoint(x, y);
      if (index !== this.hoveredCommandIndex) {
        this.hoveredCommandIndex = index;
        if (index >= 0) {
          const commands = this.getCommands();
          this._highlightCommand(commands[index]);
        } else {
          this.clearPreview();
        }
      }
    }
  }

  /**
   * Handle mouse up - stop erasing
   */
  onMouseUp(x, y) {
    this.isErasing = false;

    // Check if there's something to highlight at current position
    const index = this._findCommandAtPoint(x, y);
    if (index >= 0) {
      this.hoveredCommandIndex = index;
      const commands = this.getCommands();
      this._highlightCommand(commands[index]);
    }
  }

  /**
   * Cancel erasing operation
   */
  cancel() {
    this.isErasing = false;
    this.hoveredCommandIndex = -1;
    this.clearPreview();
  }

  /**
   * Deactivate the tool
   */
  deactivate() {
    this.cancel();
    super.deactivate();
  }
}
