/**
 * Tektronix Graphics Terminal - Main Application
 *
 * This is the entry point for the drawing canvas page.
 */

import { TekCanvas } from './canvas/TekCanvas.js';
import { VectorRenderer } from './canvas/VectorRenderer.js';
import { PlotAnimator } from './canvas/PlotAnimator.js';
import { ToolManager } from './tools/ToolManager.js';
import { LineTool } from './tools/LineTool.js';
import { RectTool } from './tools/RectTool.js';
import { CircleTool } from './tools/CircleTool.js';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Tektronix Graphics Terminal initializing...');

  // Get container and create TekCanvas
  const container = document.getElementById('canvas-container');
  const tekCanvas = new TekCanvas(container);
  const renderer = new VectorRenderer(tekCanvas);
  const animator = new PlotAnimator(tekCanvas, renderer);
  const toolManager = new ToolManager(tekCanvas, renderer, animator);

  // Store globally for debugging (will be removed in final polish)
  window.tekCanvas = tekCanvas;
  window.renderer = renderer;
  window.animator = animator;
  window.toolManager = toolManager;

  console.log('TekCanvas initialized:', {
    width: tekCanvas.getWidth(),
    height: tekCanvas.getHeight(),
    dpr: tekCanvas.dpr
  });

  // Listen for animation complete
  animator.addEventListener('complete', () => {
    console.log('Animation complete');
  });

  // Create and register tools
  const lineTool = new LineTool(tekCanvas, renderer);
  lineTool.setCommandCallback((cmd) => {
    toolManager.addCommand(cmd);
  });
  toolManager.registerTool(lineTool);

  const rectTool = new RectTool(tekCanvas, renderer);
  rectTool.setCommandCallback((cmd) => {
    toolManager.addCommand(cmd);
  });
  toolManager.registerTool(rectTool);

  const circleTool = new CircleTool(tekCanvas, renderer);
  circleTool.setCommandCallback((cmd) => {
    toolManager.addCommand(cmd);
  });
  toolManager.registerTool(circleTool);

  // Set line tool as default active tool
  toolManager.setActiveTool('line');

  // Wire up mouse events on the animation canvas (top layer)
  const canvas = tekCanvas.animationCanvas;

  canvas.addEventListener('mousedown', (e) => {
    const tool = toolManager.getActiveTool();
    if (tool) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const normalized = tekCanvas.toNormalized(x, y);
      tool.onMouseDown(normalized.x, normalized.y);
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    const tool = toolManager.getActiveTool();
    if (tool) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const normalized = tekCanvas.toNormalized(x, y);
      tool.onMouseMove(normalized.x, normalized.y);
    }
  });

  canvas.addEventListener('mouseup', (e) => {
    const tool = toolManager.getActiveTool();
    if (tool) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const normalized = tekCanvas.toNormalized(x, y);
      tool.onMouseUp(normalized.x, normalized.y);
    }
  });

  // Handle mouse leaving the canvas while drawing
  canvas.addEventListener('mouseleave', (e) => {
    const tool = toolManager.getActiveTool();
    if (tool) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const normalized = tekCanvas.toNormalized(x, y);
      tool.onMouseUp(normalized.x, normalized.y);
    }
  });

  // Handle keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Undo: Ctrl+Z
    if (e.ctrlKey && !e.shiftKey && e.key === 'z') {
      e.preventDefault();
      toolManager.undo();
      return;
    }

    // Redo: Ctrl+Shift+Z
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      toolManager.redo();
      return;
    }

    // Tool switching shortcuts
    const key = e.key.toLowerCase();
    if (key === 'l') {
      toolManager.setActiveTool('line');
      return;
    }
    if (key === 'r') {
      toolManager.setActiveTool('rect');
      return;
    }
    if (key === 'c') {
      toolManager.setActiveTool('circle');
      return;
    }

    // Pass to active tool
    const tool = toolManager.getActiveTool();
    if (tool) {
      tool.onKeyDown(e.key);
    }
  });

  console.log('Tools registered: LineTool (L), RectTool (R), CircleTool (C) - ready for drawing');
});
