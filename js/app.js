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
import { ArcTool } from './tools/ArcTool.js';
import { TextTool } from './tools/TextTool.js';
import { FillTool } from './tools/FillTool.js';
import { EraserTool } from './tools/EraserTool.js';

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

  const arcTool = new ArcTool(tekCanvas, renderer);
  arcTool.setCommandCallback((cmd) => {
    toolManager.addCommand(cmd);
  });
  toolManager.registerTool(arcTool);

  const textTool = new TextTool(tekCanvas, renderer);
  textTool.setCommandCallback((cmd) => {
    toolManager.addCommand(cmd);
  });
  toolManager.registerTool(textTool);

  const fillTool = new FillTool(tekCanvas, renderer);
  fillTool.setCommandCallback((cmd) => {
    toolManager.addCommand(cmd);
  });
  toolManager.registerTool(fillTool);

  const eraserTool = new EraserTool(tekCanvas, renderer);
  eraserTool.setGetCommandsCallback(() => toolManager.getCommands());
  eraserTool.setRemoveCommandCallback((index) => toolManager.removeCommand(index));
  toolManager.registerTool(eraserTool);

  // Set line tool as default active tool
  toolManager.setActiveTool('line');
  updateActiveToolButton('line');

  // Helper function to update active tool button highlighting
  function updateActiveToolButton(toolName) {
    // Remove active class from all tool buttons
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
      btn.classList.remove('active');
    });
    // Add active class to the selected tool button
    const activeBtn = document.querySelector(`.tool-btn[data-tool="${toolName}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
  }

  // Helper function to switch tool and update UI
  function switchTool(toolName) {
    toolManager.setActiveTool(toolName);
    updateActiveToolButton(toolName);
  }

  // Wire up tool button click handlers
  document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      const toolName = btn.getAttribute('data-tool');
      switchTool(toolName);
    });
  });

  // Wire up undo/redo button click handlers
  document.getElementById('btn-undo').addEventListener('click', () => {
    toolManager.undo();
  });

  document.getElementById('btn-redo').addEventListener('click', () => {
    toolManager.redo();
  });

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

    // Pass to active tool first (for text input, etc.)
    const tool = toolManager.getActiveTool();
    if (tool && tool.onKeyDown(e.key)) {
      // Tool handled the key, prevent default browser behavior
      e.preventDefault();
      return;
    }

    // Tool switching shortcuts (only if tool didn't handle the key)
    const key = e.key.toLowerCase();
    if (key === 'l') {
      switchTool('line');
      return;
    }
    if (key === 'r') {
      switchTool('rect');
      return;
    }
    if (key === 'c') {
      switchTool('circle');
      return;
    }
    if (key === 'a') {
      switchTool('arc');
      return;
    }
    if (key === 't') {
      switchTool('text');
      return;
    }
    if (key === 'f') {
      switchTool('fill');
      return;
    }
    if (key === 'e') {
      switchTool('eraser');
      return;
    }

    // Grid toggle
    if (key === 'g') {
      const gridToggle = document.getElementById('grid-toggle');
      gridToggle.checked = !gridToggle.checked;
      gridToggle.dispatchEvent(new Event('change'));
      return;
    }

    // Pause/resume animation
    if (e.key === ' ') {
      e.preventDefault();
      if (animator.isPaused) {
        animator.resume();
      } else {
        animator.pause();
      }
      return;
    }
  });

  console.log('Tools registered: LineTool (L), RectTool (R), CircleTool (C), ArcTool (A), TextTool (T), FillTool (F), EraserTool (E) - ready for drawing');
});
