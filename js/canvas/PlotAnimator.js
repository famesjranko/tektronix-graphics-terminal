/**
 * PlotAnimator - Animation queue for Tektronix Graphics Terminal
 *
 * Queues draw commands and animates them progressively.
 * Lines animate from start to end based on speed (px/sec).
 * Emits 'complete' event when queue empties.
 */

import { DEFAULT_COLOR } from '../utils/colors.js';
import { textToCommands } from '../fonts/hershey.js';

export class PlotAnimator extends EventTarget {
  /**
   * @param {TekCanvas} tekCanvas - The TekCanvas instance
   * @param {VectorRenderer} renderer - The VectorRenderer instance
   */
  constructor(tekCanvas, renderer) {
    super();
    this.tekCanvas = tekCanvas;
    this.renderer = renderer;

    // Command queue (FIFO)
    this.commandQueue = [];

    // Animation state
    this.isAnimating = false;
    this.isPaused = false;
    this.currentCommand = null;
    this.animationStartTime = 0;
    this.animationProgress = 0;
    this.animationFrameId = null;

    // Speed in pixels per second (default: 800)
    this.speed = 800;
  }

  /**
   * Set animation speed
   * @param {number} pxPerSec - Pixels per second (100, 300, 800, 2000, or Infinity)
   */
  setSpeed(pxPerSec) {
    this.speed = pxPerSec;
  }

  /**
   * Get current speed
   * @returns {number}
   */
  getSpeed() {
    return this.speed;
  }

  /**
   * Add a command to the queue
   * @param {Object} command - Draw command ({type, ...params})
   */
  enqueue(command) {
    this.commandQueue.push(command);

    // Start processing if not already animating
    if (!this.isAnimating) {
      this._processNext();
    }
  }

  /**
   * Pause animation
   */
  pause() {
    if (this.isAnimating && !this.isPaused) {
      this.isPaused = true;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }
  }

  /**
   * Resume animation
   */
  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      // Adjust start time to account for pause
      this.animationStartTime = performance.now() - (this.animationProgress * this._getCommandDuration(this.currentCommand));
      this._animate();
    }
  }

  /**
   * Skip current animation and complete immediately
   */
  skip() {
    if (this.currentCommand) {
      // Cancel current animation
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      // Complete current command immediately
      this._completeCommand(this.currentCommand);
      this.currentCommand = null;
      this.isPaused = false;

      // Process next
      this._processNext();
    }
  }

  /**
   * Skip all queued commands (complete them instantly)
   */
  skipAll() {
    // Complete current command
    if (this.currentCommand) {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      this._completeCommand(this.currentCommand);
      this.currentCommand = null;
    }

    // Complete all queued commands
    while (this.commandQueue.length > 0) {
      const cmd = this.commandQueue.shift();
      this._completeCommand(cmd);
    }

    this.isAnimating = false;
    this.isPaused = false;
    this._emitComplete();
  }

  /**
   * Clear the queue without drawing
   */
  clear() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.commandQueue = [];
    this.currentCommand = null;
    this.isAnimating = false;
    this.isPaused = false;
    this.tekCanvas.clearAnimation();
  }

  /**
   * Process the next command in queue
   */
  _processNext() {
    if (this.commandQueue.length === 0) {
      this.isAnimating = false;
      this._emitComplete();
      return;
    }

    this.isAnimating = true;
    this.currentCommand = this.commandQueue.shift();
    this.animationProgress = 0;
    this.animationStartTime = performance.now();

    // If speed is Infinity, complete immediately
    if (this.speed === Infinity) {
      this._completeCommand(this.currentCommand);
      this.currentCommand = null;
      this._processNext();
      return;
    }

    // Start animation
    this._animate();
  }

  /**
   * Animation loop
   */
  _animate() {
    if (this.isPaused) return;

    const now = performance.now();
    const duration = this._getCommandDuration(this.currentCommand);
    const elapsed = now - this.animationStartTime;

    this.animationProgress = Math.min(elapsed / duration, 1);

    // Clear animation layer and draw progress
    this.tekCanvas.clearAnimation();
    this._drawCommandProgress(this.currentCommand, this.animationProgress);

    if (this.animationProgress >= 1) {
      // Animation complete - commit to persistent layer
      this.tekCanvas.clearAnimation();
      this._completeCommand(this.currentCommand);
      this.currentCommand = null;
      this._processNext();
    } else {
      // Continue animation
      this.animationFrameId = requestAnimationFrame(() => this._animate());
    }
  }

  /**
   * Calculate animation duration for a command in milliseconds
   * @param {Object} command
   * @returns {number}
   */
  _getCommandDuration(command) {
    if (this.speed === Infinity) return 0;

    const length = this._getCommandLength(command);
    return (length / this.speed) * 1000;
  }

  /**
   * Calculate the "length" of a command in pixels (for timing)
   * @param {Object} command
   * @returns {number}
   */
  _getCommandLength(command) {
    const width = this.tekCanvas.getWidth();
    const height = this.tekCanvas.getHeight();

    switch (command.type) {
      case 'line': {
        const dx = (command.x2 - command.x1) * width;
        const dy = (command.y2 - command.y1) * height;
        return Math.sqrt(dx * dx + dy * dy);
      }
      case 'circle': {
        // Circumference
        const radius = command.radius * width;
        return 2 * Math.PI * radius;
      }
      case 'rect': {
        // Perimeter
        const w = command.width * width;
        const h = command.height * height;
        return 2 * (w + h);
      }
      case 'arc': {
        const radius = command.radius * width;
        const angle = Math.abs(command.endAngle - command.startAngle);
        return radius * angle;
      }
      case 'text': {
        // Get all the line commands for the text and sum their lengths
        const lineCommands = textToCommands(command.text, command.x, command.y, command.scale || 1);
        let totalLength = 0;
        for (const lineCmd of lineCommands) {
          const dx = (lineCmd.x2 - lineCmd.x1) * width;
          const dy = (lineCmd.y2 - lineCmd.y1) * height;
          totalLength += Math.sqrt(dx * dx + dy * dy);
        }
        return totalLength || 100;
      }
      case 'fill': {
        // Sum of all pattern lines
        const lines = command.lines || [];
        let totalLength = 0;
        for (const line of lines) {
          const dx = (line.x2 - line.x1) * width;
          const dy = (line.y2 - line.y1) * height;
          totalLength += Math.sqrt(dx * dx + dy * dy);
        }
        return totalLength || 100;
      }
      default:
        // Default to some reasonable length
        return 100;
    }
  }

  /**
   * Draw a command with progress (0-1)
   * @param {Object} command
   * @param {number} progress
   */
  _drawCommandProgress(command, progress) {
    const ctx = this.tekCanvas.getAnimationContext();
    const color = command.color || DEFAULT_COLOR;

    switch (command.type) {
      case 'line':
        this._drawLineProgress(ctx, command, progress, color);
        break;
      case 'circle':
        this._drawCircleProgress(ctx, command, progress, color);
        break;
      case 'rect':
        this._drawRectProgress(ctx, command, progress, color);
        break;
      case 'arc':
        this._drawArcProgress(ctx, command, progress, color);
        break;
      case 'text':
        this._drawTextProgress(ctx, command, progress, color);
        break;
      case 'fill':
        this._drawFillProgress(ctx, command, progress, color);
        break;
      default:
        // Unknown command type - just complete it
        this._completeCommand(command);
    }
  }

  /**
   * Draw a line with progress
   */
  _drawLineProgress(ctx, command, progress, color) {
    const x2 = command.x1 + (command.x2 - command.x1) * progress;
    const y2 = command.y1 + (command.y2 - command.y1) * progress;
    this.renderer.drawLine(ctx, command.x1, command.y1, x2, y2, color, command.style || 'solid');
  }

  /**
   * Draw a circle with progress (arc growing)
   */
  _drawCircleProgress(ctx, command, progress, color) {
    const endAngle = progress * Math.PI * 2;
    this.renderer.drawArc(ctx, command.cx, command.cy, command.radius, 0, endAngle, color);
  }

  /**
   * Draw a rectangle with progress (drawing perimeter)
   */
  _drawRectProgress(ctx, command, progress, color) {
    const { x, y, width, height } = command;
    const perimeter = 2 * (width + height);
    const drawn = progress * perimeter;

    // Draw as much of the perimeter as progress allows
    let remaining = drawn;
    const segments = [
      { x1: x, y1: y, x2: x + width, y2: y },          // top
      { x1: x + width, y1: y, x2: x + width, y2: y + height }, // right
      { x1: x + width, y1: y + height, x2: x, y2: y + height }, // bottom
      { x1: x, y1: y + height, x2: x, y2: y }          // left
    ];
    const lengths = [width, height, width, height];

    for (let i = 0; i < segments.length && remaining > 0; i++) {
      const seg = segments[i];
      const len = lengths[i];

      if (remaining >= len) {
        this.renderer.drawLine(ctx, seg.x1, seg.y1, seg.x2, seg.y2, color);
        remaining -= len;
      } else {
        const t = remaining / len;
        const x2 = seg.x1 + (seg.x2 - seg.x1) * t;
        const y2 = seg.y1 + (seg.y2 - seg.y1) * t;
        this.renderer.drawLine(ctx, seg.x1, seg.y1, x2, y2, color);
        remaining = 0;
      }
    }
  }

  /**
   * Draw an arc with progress
   */
  _drawArcProgress(ctx, command, progress, color) {
    const { cx, cy, radius, startAngle, endAngle } = command;
    const currentEnd = startAngle + (endAngle - startAngle) * progress;
    this.renderer.drawArc(ctx, cx, cy, radius, startAngle, currentEnd, color);
  }

  /**
   * Draw text with progress (stroke by stroke)
   */
  _drawTextProgress(ctx, command, progress, color) {
    const lineCommands = textToCommands(command.text, command.x, command.y, command.scale || 1);

    // Calculate total length for proportional progress
    const width = this.tekCanvas.getWidth();
    const height = this.tekCanvas.getHeight();
    let totalLength = 0;
    const lengths = [];

    for (const lineCmd of lineCommands) {
      const dx = (lineCmd.x2 - lineCmd.x1) * width;
      const dy = (lineCmd.y2 - lineCmd.y1) * height;
      const len = Math.sqrt(dx * dx + dy * dy);
      lengths.push(len);
      totalLength += len;
    }

    // Draw strokes up to progress
    let drawnLength = 0;
    const targetLength = progress * totalLength;

    for (let i = 0; i < lineCommands.length; i++) {
      const lineCmd = lineCommands[i];
      const len = lengths[i];

      if (drawnLength + len <= targetLength) {
        // Draw complete stroke
        this.renderer.drawLine(ctx, lineCmd.x1, lineCmd.y1, lineCmd.x2, lineCmd.y2, color);
        drawnLength += len;
      } else {
        // Draw partial stroke
        const remaining = targetLength - drawnLength;
        const t = remaining / len;
        const x2 = lineCmd.x1 + (lineCmd.x2 - lineCmd.x1) * t;
        const y2 = lineCmd.y1 + (lineCmd.y2 - lineCmd.y1) * t;
        this.renderer.drawLine(ctx, lineCmd.x1, lineCmd.y1, x2, y2, color);
        break;
      }
    }
  }

  /**
   * Draw fill pattern with progress (line by line)
   */
  _drawFillProgress(ctx, command, progress, color) {
    const lines = command.lines || [];
    if (lines.length === 0) return;

    // Calculate total length for proportional progress
    const width = this.tekCanvas.getWidth();
    const height = this.tekCanvas.getHeight();
    let totalLength = 0;
    const lengths = [];

    for (const line of lines) {
      const dx = (line.x2 - line.x1) * width;
      const dy = (line.y2 - line.y1) * height;
      const len = Math.sqrt(dx * dx + dy * dy);
      lengths.push(len);
      totalLength += len;
    }

    // Draw lines up to progress
    let drawnLength = 0;
    const targetLength = progress * totalLength;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const len = lengths[i];

      if (drawnLength + len <= targetLength) {
        // Draw complete line
        this.renderer.drawLine(ctx, line.x1, line.y1, line.x2, line.y2, color);
        drawnLength += len;
      } else {
        // Draw partial line
        const remaining = targetLength - drawnLength;
        const t = remaining / len;
        const x2 = line.x1 + (line.x2 - line.x1) * t;
        const y2 = line.y1 + (line.y2 - line.y1) * t;
        this.renderer.drawLine(ctx, line.x1, line.y1, x2, y2, color);
        break;
      }
    }
  }

  /**
   * Complete a command (draw to persistent layer)
   * @param {Object} command
   */
  _completeCommand(command) {
    const ctx = this.tekCanvas.getPersistentContext();
    const color = command.color || DEFAULT_COLOR;

    switch (command.type) {
      case 'line':
        this.renderer.drawLine(ctx, command.x1, command.y1, command.x2, command.y2, color, command.style || 'solid');
        break;
      case 'circle':
        this.renderer.drawCircle(ctx, command.cx, command.cy, command.radius, color, command.filled || false);
        break;
      case 'rect':
        this.renderer.drawRect(ctx, command.x, command.y, command.width, command.height, color, command.filled || false);
        break;
      case 'arc':
        this.renderer.drawArc(ctx, command.cx, command.cy, command.radius, command.startAngle, command.endAngle, color);
        break;
      case 'text': {
        const lineCommands = textToCommands(command.text, command.x, command.y, command.scale || 1);
        for (const lineCmd of lineCommands) {
          this.renderer.drawLine(ctx, lineCmd.x1, lineCmd.y1, lineCmd.x2, lineCmd.y2, color);
        }
        break;
      }
      case 'fill': {
        const lines = command.lines || [];
        for (const line of lines) {
          this.renderer.drawLine(ctx, line.x1, line.y1, line.x2, line.y2, color);
        }
        break;
      }
    }
  }

  /**
   * Emit the 'complete' event
   */
  _emitComplete() {
    this.dispatchEvent(new Event('complete'));
  }
}
