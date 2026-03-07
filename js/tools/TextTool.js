/**
 * TextTool - Text drawing tool for Tektronix Graphics Terminal
 *
 * Click to place text cursor, type to enter text, Enter/Escape to confirm.
 * Uses Hershey Simplex vector font for stroke-based text rendering.
 */

import { BaseTool } from './BaseTool.js';
import { textToCommands, measureText, getCharData } from '../fonts/hershey.js';

export class TextTool extends BaseTool {
  constructor(tekCanvas, renderer) {
    super(tekCanvas, renderer);

    this.name = 'text';
    this.icon = 'T';
    this.cursor = 'text';

    // Text entry state
    this.isEditing = false;
    this.textX = 0;
    this.textY = 0;
    this.text = '';
    this.scale = 1; // Default scale (about 20px tall)

    // Cursor blink state
    this.cursorVisible = true;
    this.cursorBlinkInterval = null;

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
   * Set the text scale
   * @param {number} scale - Scale factor (0.5, 1, 2, 3, etc.)
   */
  setScale(scale) {
    this.scale = scale;
  }

  /**
   * Handle mouse down - place text cursor
   * @param {number} x - Normalized x coordinate (0-1)
   * @param {number} y - Normalized y coordinate (0-1)
   */
  onMouseDown(x, y) {
    // If already editing, confirm the current text first
    if (this.isEditing && this.text.length > 0) {
      this._confirmText();
    }

    // Start new text entry
    this.isEditing = true;
    this.textX = x;
    this.textY = y;
    this.text = '';

    // Start cursor blinking
    this._startCursorBlink();
    this._renderPreview();
  }

  /**
   * Handle mouse move - no action for text tool
   * @param {number} x - Normalized x coordinate (0-1)
   * @param {number} y - Normalized y coordinate (0-1)
   */
  onMouseMove(x, y) {
    // No preview during mouse move for text tool
  }

  /**
   * Handle mouse up - no action for text tool
   * @param {number} x - Normalized x coordinate (0-1)
   * @param {number} y - Normalized y coordinate (0-1)
   */
  onMouseUp(x, y) {
    // Text entry happens via keyboard, not mouse up
  }

  /**
   * Handle key down - type characters, backspace, enter/escape
   * @param {string} key - The key that was pressed
   * @returns {boolean} - True if the key was handled
   */
  onKeyDown(key) {
    if (!this.isEditing) {
      return false;
    }

    // Enter or Escape confirms text placement
    if (key === 'Enter' || key === 'Escape') {
      if (this.text.length > 0) {
        this._confirmText();
      } else {
        // Cancel if no text entered
        this._cancelEditing();
      }
      return true;
    }

    // Backspace removes last character
    if (key === 'Backspace') {
      if (this.text.length > 0) {
        this.text = this.text.slice(0, -1);
        this._renderPreview();
      }
      return true;
    }

    // Only accept printable characters
    if (key.length === 1) {
      this.text += key;
      this._renderPreview();
      return true;
    }

    return false;
  }

  /**
   * Confirm the text and emit command
   */
  _confirmText() {
    this._stopCursorBlink();
    this.clearPreview();

    if (this.text.length > 0 && this.onCommand) {
      const command = {
        type: 'text',
        x: this.textX,
        y: this.textY,
        text: this.text,
        scale: this.scale,
        color: this.color
      };
      this.onCommand(command);
    }

    this.isEditing = false;
    this.text = '';
  }

  /**
   * Cancel text editing without creating a command
   */
  _cancelEditing() {
    this._stopCursorBlink();
    this.clearPreview();
    this.isEditing = false;
    this.text = '';
  }

  /**
   * Start the cursor blinking interval
   */
  _startCursorBlink() {
    this._stopCursorBlink();
    this.cursorVisible = true;
    this.cursorBlinkInterval = setInterval(() => {
      this.cursorVisible = !this.cursorVisible;
      this._renderPreview();
    }, 530); // ~530ms blink rate
  }

  /**
   * Stop the cursor blinking interval
   */
  _stopCursorBlink() {
    if (this.cursorBlinkInterval) {
      clearInterval(this.cursorBlinkInterval);
      this.cursorBlinkInterval = null;
    }
  }

  /**
   * Render preview of current text and cursor
   */
  _renderPreview() {
    this.clearPreview();
    const ctx = this.getPreviewContext();

    const baseHeight = 0.03;
    const actualScale = baseHeight * this.scale;

    // Render the text as vector strokes
    if (this.text.length > 0) {
      const commands = textToCommands(this.text, this.textX, this.textY, this.scale);
      for (const cmd of commands) {
        this.renderer.drawLine(ctx, cmd.x1, cmd.y1, cmd.x2, cmd.y2, this.color);
      }
    }

    // Render blinking cursor
    if (this.cursorVisible) {
      // Calculate cursor position (after the last character)
      const textWidth = this.text.length > 0 ? measureText(this.text) * actualScale : 0;
      const cursorX = this.textX + textWidth;
      const cursorHeight = actualScale;

      // Draw cursor as vertical line
      this.renderer.drawLine(
        ctx,
        cursorX,
        this.textY - cursorHeight * 0.1, // Slightly above baseline
        cursorX,
        this.textY + cursorHeight * 1.1, // Below baseline
        this.color
      );
    }
  }

  /**
   * Deactivate the tool
   */
  deactivate() {
    // Confirm any in-progress text
    if (this.isEditing && this.text.length > 0) {
      this._confirmText();
    } else if (this.isEditing) {
      this._cancelEditing();
    }
    super.deactivate();
  }

  /**
   * Cancel the current operation
   */
  cancel() {
    this._cancelEditing();
  }
}
