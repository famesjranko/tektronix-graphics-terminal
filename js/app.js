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

// Storage keys
const TOOL_OPTIONS_KEY = 'tektronix-tool-options';
const GRID_STATE_KEY = 'tektronix-grid-enabled';
const SPEED_KEY = 'tektronix-speed';

// Speed slider settings (5 stops)
const SPEED_VALUES = [100, 300, 800, 2000, Infinity];
const SPEED_LABELS = ['Slowest', 'Slow', 'Normal', 'Fast', 'Instant'];
const DEFAULT_SPEED_INDEX = 2; // Normal (800 px/sec)

// Load saved tool options from localStorage
function loadToolOptions() {
  try {
    const saved = localStorage.getItem(TOOL_OPTIONS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
}

// Save tool options to localStorage
function saveToolOptions(options) {
  try {
    localStorage.setItem(TOOL_OPTIONS_KEY, JSON.stringify(options));
  } catch (e) {
    // Ignore storage errors
  }
}

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

  // Tool options panel elements
  const optionsPanel = document.getElementById('options-panel');
  const optionsTitle = document.getElementById('options-title');
  const optionsContent = document.getElementById('options-content');

  // Load saved options
  const savedOptions = loadToolOptions();

  // Apply saved options to tools
  if (savedOptions.line?.style) {
    lineTool.setLineStyle(savedOptions.line.style);
  }
  if (savedOptions.rect?.filled !== undefined) {
    rectTool.setFilled(savedOptions.rect.filled);
  }
  if (savedOptions.circle?.filled !== undefined) {
    circleTool.setFilled(savedOptions.circle.filled);
  }
  if (savedOptions.text?.scale !== undefined) {
    textTool.setScale(savedOptions.text.scale);
  }
  if (savedOptions.fill?.pattern) {
    fillTool.setPattern(savedOptions.fill.pattern);
  }

  // Save a single tool option to localStorage
  function saveToolOption(tool, key, value) {
    const options = loadToolOptions();
    if (!options[tool]) options[tool] = {};
    options[tool][key] = value;
    saveToolOptions(options);
  }

  // Create a select element with options
  function createSelect(id, options, selectedValue) {
    const select = document.createElement('select');
    select.id = id;
    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      if (opt.value === selectedValue || opt.value === String(selectedValue)) {
        option.selected = true;
      }
      select.appendChild(option);
    });
    return select;
  }

  // Create a checkbox element
  function createCheckbox(id, label, checked) {
    const container = document.createElement('label');
    container.className = 'checkbox-container';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    input.checked = checked;

    const checkmark = document.createElement('span');
    checkmark.className = 'checkmark';

    const labelSpan = document.createElement('span');
    labelSpan.className = 'checkbox-label';
    labelSpan.textContent = label;

    container.appendChild(input);
    container.appendChild(checkmark);
    container.appendChild(labelSpan);

    return container;
  }

  // Create an option group
  function createOptionGroup(labelText, control) {
    const group = document.createElement('div');
    group.className = 'option-group';

    if (labelText && control.tagName === 'SELECT') {
      const label = document.createElement('label');
      label.setAttribute('for', control.id);
      label.textContent = labelText;
      group.appendChild(label);
    }

    group.appendChild(control);
    return group;
  }

  // Show options panel for a tool
  function showOptionsPanel(toolName) {
    // Clear existing content
    while (optionsContent.firstChild) {
      optionsContent.removeChild(optionsContent.firstChild);
    }

    switch (toolName) {
      case 'line': {
        optionsTitle.textContent = 'Line Options';
        const select = createSelect('line-style', [
          { value: 'solid', label: 'Solid' },
          { value: 'dashed', label: 'Dashed' },
          { value: 'dotted', label: 'Dotted' }
        ], lineTool.getLineStyle());
        select.addEventListener('change', () => {
          lineTool.setLineStyle(select.value);
          saveToolOption('line', 'style', select.value);
        });
        optionsContent.appendChild(createOptionGroup('Style', select));
        optionsPanel.classList.add('open');
        break;
      }
      case 'rect': {
        optionsTitle.textContent = 'Rectangle Options';
        const checkbox = createCheckbox('rect-filled', 'Filled', rectTool.getFilled());
        checkbox.querySelector('input').addEventListener('change', (e) => {
          rectTool.setFilled(e.target.checked);
          saveToolOption('rect', 'filled', e.target.checked);
        });
        optionsContent.appendChild(createOptionGroup(null, checkbox));
        optionsPanel.classList.add('open');
        break;
      }
      case 'circle': {
        optionsTitle.textContent = 'Circle Options';
        const checkbox = createCheckbox('circle-filled', 'Filled', circleTool.getFilled());
        checkbox.querySelector('input').addEventListener('change', (e) => {
          circleTool.setFilled(e.target.checked);
          saveToolOption('circle', 'filled', e.target.checked);
        });
        optionsContent.appendChild(createOptionGroup(null, checkbox));
        optionsPanel.classList.add('open');
        break;
      }
      case 'text': {
        optionsTitle.textContent = 'Text Options';
        const select = createSelect('text-scale', [
          { value: '0.5', label: '0.5x' },
          { value: '1', label: '1x' },
          { value: '2', label: '2x' },
          { value: '3', label: '3x' }
        ], String(textTool.scale));
        select.addEventListener('change', () => {
          const scale = parseFloat(select.value);
          textTool.setScale(scale);
          saveToolOption('text', 'scale', scale);
        });
        optionsContent.appendChild(createOptionGroup('Scale', select));
        optionsPanel.classList.add('open');
        break;
      }
      case 'fill': {
        optionsTitle.textContent = 'Fill Options';
        const select = createSelect('fill-pattern', [
          { value: 'crosshatch', label: 'Crosshatch' },
          { value: 'horizontal', label: 'Horizontal' },
          { value: 'vertical', label: 'Vertical' },
          { value: 'diagonal45', label: 'Diagonal 45°' },
          { value: 'diagonal135', label: 'Diagonal 135°' },
          { value: 'dots', label: 'Dots' }
        ], fillTool.getPattern());
        select.addEventListener('change', () => {
          fillTool.setPattern(select.value);
          saveToolOption('fill', 'pattern', select.value);
        });
        optionsContent.appendChild(createOptionGroup('Pattern', select));
        optionsPanel.classList.add('open');
        break;
      }
      default:
        // No options for this tool - hide panel
        optionsPanel.classList.remove('open');
    }
  }

  // Set line tool as default active tool (after options loaded)
  toolManager.setActiveTool('line');
  updateActiveToolButton('line');
  showOptionsPanel('line');

  // Helper function to switch tool and update UI
  function switchTool(toolName) {
    toolManager.setActiveTool(toolName);
    updateActiveToolButton(toolName);
    showOptionsPanel(toolName);
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

  // Position display element
  const positionDisplay = document.getElementById('position-display');

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
    // Clear position display when mouse leaves
    positionDisplay.textContent = 'X: --- Y: ---';
  });

  // Update position display on mousemove
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    positionDisplay.textContent = `X: ${x} Y: ${y}`;
  });

  // Grid toggle functionality
  const gridToggle = document.getElementById('grid-toggle');

  // Function to draw grid if enabled (called by ToolManager before drawing commands)
  function drawGridIfEnabled() {
    if (gridToggle.checked) {
      tekCanvas.drawGrid();
    }
  }

  // Set callback so grid is redrawn on undo/redo/load
  toolManager.setOnBeforeDraw(drawGridIfEnabled);

  // Load saved grid state
  const savedGridState = localStorage.getItem(GRID_STATE_KEY);
  if (savedGridState === 'true') {
    gridToggle.checked = true;
    tekCanvas.drawGrid();
  }

  // Handle grid toggle change
  gridToggle.addEventListener('change', () => {
    const showGrid = gridToggle.checked;
    // Save state to localStorage
    localStorage.setItem(GRID_STATE_KEY, showGrid);
    // Redraw all commands (callback handles grid)
    const commands = toolManager.getCommands();
    toolManager.loadCommands(commands, false);
  });

  // Speed slider functionality
  const speedSlider = document.getElementById('speed-slider');
  const speedLabel = document.getElementById('speed-label');

  // Update speed label and animator
  function updateSpeed(index) {
    const speed = SPEED_VALUES[index];
    const label = SPEED_LABELS[index];
    speedLabel.textContent = label;
    animator.setSpeed(speed);
  }

  // Load saved speed state
  const savedSpeedIndex = localStorage.getItem(SPEED_KEY);
  if (savedSpeedIndex !== null) {
    const index = parseInt(savedSpeedIndex, 10);
    if (index >= 0 && index < SPEED_VALUES.length) {
      speedSlider.value = index;
      updateSpeed(index);
    }
  } else {
    // Apply default
    updateSpeed(DEFAULT_SPEED_INDEX);
  }

  // Handle speed slider change
  speedSlider.addEventListener('input', () => {
    const index = parseInt(speedSlider.value, 10);
    updateSpeed(index);
    // Save to localStorage
    localStorage.setItem(SPEED_KEY, index);
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
