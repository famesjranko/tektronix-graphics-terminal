/**
 * ToolManager - Manages drawing tools, command history, and undo/redo
 *
 * Handles tool registration, switching, and maintains the command history
 * for undo/redo functionality.
 */

import { DEFAULT_COLOR } from '../utils/colors.js';
import { textToCommands } from '../fonts/hershey.js';

export class ToolManager {
  /**
   * @param {TekCanvas} tekCanvas - The TekCanvas instance
   * @param {VectorRenderer} renderer - The VectorRenderer instance
   * @param {PlotAnimator} animator - The PlotAnimator instance
   */
  constructor(tekCanvas, renderer, animator) {
    this.tekCanvas = tekCanvas;
    this.renderer = renderer;
    this.animator = animator;

    // Registered tools by name
    this.tools = new Map();

    // Currently active tool
    this.activeTool = null;

    // Command history for undo/redo
    this.commandHistory = [];
    this.undoStack = [];
  }

  /**
   * Register a tool
   * @param {BaseTool} tool - Tool instance to register
   */
  registerTool(tool) {
    this.tools.set(tool.name, tool);
  }

  /**
   * Set the active tool by name
   * @param {string} name - Tool name
   * @returns {boolean} - True if tool was found and activated
   */
  setActiveTool(name) {
    const tool = this.tools.get(name);
    if (!tool) {
      console.warn(`Tool "${name}" not found`);
      return false;
    }

    // Deactivate current tool
    if (this.activeTool) {
      this.activeTool.deactivate();
    }

    // Activate new tool
    this.activeTool = tool;
    this.activeTool.activate();
    return true;
  }

  /**
   * Get the currently active tool
   * @returns {BaseTool|null}
   */
  getActiveTool() {
    return this.activeTool;
  }

  /**
   * Get a tool by name
   * @param {string} name - Tool name
   * @returns {BaseTool|undefined}
   */
  getTool(name) {
    return this.tools.get(name);
  }

  /**
   * Get all registered tool names
   * @returns {string[]}
   */
  getToolNames() {
    return Array.from(this.tools.keys());
  }

  /**
   * Add a command to history and queue for animation
   * @param {Object} cmd - Draw command
   */
  addCommand(cmd) {
    this.commandHistory.push(cmd);
    // Clear undo stack when new command is added
    this.undoStack = [];
    // Queue for animation
    this.animator.enqueue(cmd);
  }

  /**
   * Undo the last command
   * @returns {boolean} - True if undo was performed
   */
  undo() {
    if (this.commandHistory.length === 0) {
      return false;
    }

    // Remove last command and add to undo stack
    const cmd = this.commandHistory.pop();
    this.undoStack.push(cmd);

    // Redraw canvas with remaining commands
    this._redrawAll();
    return true;
  }

  /**
   * Redo the last undone command
   * @returns {boolean} - True if redo was performed
   */
  redo() {
    if (this.undoStack.length === 0) {
      return false;
    }

    // Pop from undo stack and add back to history
    const cmd = this.undoStack.pop();
    this.commandHistory.push(cmd);

    // Redraw canvas with all commands
    this._redrawAll();
    return true;
  }

  /**
   * Get all commands (for save/export)
   * @returns {Object[]}
   */
  getCommands() {
    return [...this.commandHistory];
  }

  /**
   * Load commands (for restore from file/localStorage)
   * @param {Object[]} commands - Array of commands to load
   * @param {boolean} animate - Whether to animate (default: false)
   */
  loadCommands(commands, animate = false) {
    this.commandHistory = [...commands];
    this.undoStack = [];

    if (animate) {
      // Queue all commands for animation
      this.tekCanvas.clearPersistent();
      commands.forEach(cmd => this.animator.enqueue(cmd));
    } else {
      // Draw all commands instantly
      this._redrawAll();
    }
  }

  /**
   * Clear all commands and canvas
   */
  clearAll() {
    this.commandHistory = [];
    this.undoStack = [];
    this.animator.clear();
    this.tekCanvas.clearAll();
  }

  /**
   * Redraw all commands to the persistent canvas (instantly)
   * @private
   */
  _redrawAll() {
    // Clear any pending animations
    this.animator.clear();

    // Clear the persistent canvas
    this.tekCanvas.clearPersistent();

    // Get the persistent context
    const ctx = this.tekCanvas.getPersistentContext();

    // Draw all commands instantly
    for (const cmd of this.commandHistory) {
      this._drawCommand(ctx, cmd);
    }
  }

  /**
   * Draw a single command to a context
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} cmd
   * @private
   */
  _drawCommand(ctx, cmd) {
    const color = cmd.color || DEFAULT_COLOR;

    switch (cmd.type) {
      case 'line':
        this.renderer.drawLine(ctx, cmd.x1, cmd.y1, cmd.x2, cmd.y2, color);
        break;
      case 'circle':
        this.renderer.drawCircle(ctx, cmd.cx, cmd.cy, cmd.radius, color, cmd.filled || false);
        break;
      case 'rect':
        this.renderer.drawRect(ctx, cmd.x, cmd.y, cmd.width, cmd.height, color, cmd.filled || false);
        break;
      case 'arc':
        this.renderer.drawArc(ctx, cmd.cx, cmd.cy, cmd.radius, cmd.startAngle, cmd.endAngle, color);
        break;
      case 'text': {
        const lineCommands = textToCommands(cmd.text, cmd.x, cmd.y, cmd.scale || 1);
        for (const lineCmd of lineCommands) {
          this.renderer.drawLine(ctx, lineCmd.x1, lineCmd.y1, lineCmd.x2, lineCmd.y2, color);
        }
        break;
      }
      case 'fill': {
        const lines = cmd.lines || [];
        for (const line of lines) {
          this.renderer.drawLine(ctx, line.x1, line.y1, line.x2, line.y2, color);
        }
        break;
      }
    }
  }

  /**
   * Check if undo is available
   * @returns {boolean}
   */
  canUndo() {
    return this.commandHistory.length > 0;
  }

  /**
   * Check if redo is available
   * @returns {boolean}
   */
  canRedo() {
    return this.undoStack.length > 0;
  }
}
