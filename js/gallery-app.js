/**
 * Tektronix Graphics Terminal - Gallery Application
 *
 * Wires up the gallery page functionality:
 * - Thumbnail grid rendering
 * - Category filtering
 * - Demo playback with GraphicPlayer
 * - URL-based direct linking
 */

import { GalleryManager } from './gallery/GalleryManager.js';
import { GraphicPlayer } from './gallery/GraphicPlayer.js';

// Speed settings (same as main app)
const SPEED_VALUES = [100, 300, 800, 2000, Infinity];
const SPEED_LABELS = ['Slowest', 'Slow', 'Normal', 'Fast', 'Instant'];

// State
let galleryManager;
let player = null;
let currentCategory = 'all';
let animationFrameId = null;
let isAnimating = false;
let savedSpeed = null;

// DOM elements
let demoGrid;
let playerView;
let galleryMain;
let categoryTabs;
let playerTitle;
let playerCanvasContainer;
let paramSlidersContainer;
let playPauseBtn;
let playIcon;
let pauseIcon;
let restartBtn;
let backBtn;
let speedSlider;
let speedLabel;
let openInEditorBtn;
let animateToggle;
let animateControl;

/**
 * Clear all children from an element
 * @param {HTMLElement} element
 */
function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Initialize the gallery application
 */
function init() {
  // Get DOM elements
  demoGrid = document.getElementById('demo-grid');
  playerView = document.getElementById('player-view');
  galleryMain = document.querySelector('.gallery-main');
  categoryTabs = document.getElementById('category-tabs');
  playerTitle = document.getElementById('player-title');
  playerCanvasContainer = document.getElementById('player-canvas-container');
  paramSlidersContainer = document.getElementById('param-sliders');
  playPauseBtn = document.getElementById('play-pause-btn');
  playIcon = document.getElementById('play-icon');
  pauseIcon = document.getElementById('pause-icon');
  restartBtn = document.getElementById('restart-btn');
  backBtn = document.getElementById('back-btn');
  speedSlider = document.getElementById('player-speed');
  speedLabel = document.getElementById('player-speed-label');
  openInEditorBtn = document.getElementById('open-in-editor-btn');
  animateToggle = document.getElementById('animate-toggle');
  animateControl = document.getElementById('animate-control');

  // Initialize GalleryManager
  galleryManager = new GalleryManager();

  // Render initial thumbnail grid
  renderThumbnailGrid('all');

  // Set up event listeners
  setupCategoryTabs();
  setupPlayerControls();
  setupBackButton();
  setupOpenInEditor();
  setupAnimateToggle();

  // Check URL for direct demo link
  handleUrlHash();

  // Listen for hash changes (browser back/forward)
  window.addEventListener('hashchange', handleUrlHash);
}

/**
 * Render the thumbnail grid for a category
 * @param {string} category - 'all' or a specific category ID
 */
function renderThumbnailGrid(category) {
  // Clear existing grid
  clearElement(demoGrid);

  // Get demos to display
  const demos = category === 'all'
    ? galleryManager.getAllDemos()
    : galleryManager.getDemosByCategory(category);

  if (demos.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'No demos in this category';
    demoGrid.appendChild(emptyState);
    return;
  }

  // Create cards for each demo
  for (const demo of demos) {
    const card = createDemoCard(demo);
    demoGrid.appendChild(card);
  }
}

/**
 * Create a demo card element
 * @param {Object} demo - Demo object
 * @returns {HTMLElement}
 */
function createDemoCard(demo) {
  const card = document.createElement('div');
  card.className = 'demo-card';
  card.dataset.demoId = demo.id;

  // Thumbnail container
  const thumbnailContainer = document.createElement('div');
  thumbnailContainer.className = 'demo-thumbnail';

  // Generate thumbnail canvas
  const thumbnailCanvas = galleryManager.generateThumbnail(demo, {
    width: 200,
    height: 150,
    maxCommands: 500
  });
  thumbnailContainer.appendChild(thumbnailCanvas);

  // Info section
  const info = document.createElement('div');
  info.className = 'demo-info';

  const name = document.createElement('div');
  name.className = 'demo-name';
  name.textContent = demo.name;

  const categoryLabel = document.createElement('div');
  categoryLabel.className = 'demo-category';
  // Get display name for category
  const categories = galleryManager.getCategories();
  const catInfo = categories.find(c => c.id === demo.category);
  categoryLabel.textContent = catInfo ? catInfo.name : demo.category;

  info.appendChild(name);
  info.appendChild(categoryLabel);

  card.appendChild(thumbnailContainer);
  card.appendChild(info);

  // Click to open player
  card.addEventListener('click', () => {
    openDemo(demo.id);
  });

  return card;
}

/**
 * Set up category tab click handlers
 */
function setupCategoryTabs() {
  const tabs = categoryTabs.querySelectorAll('.category-tab');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active state
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Filter demos
      currentCategory = tab.dataset.category;
      renderThumbnailGrid(currentCategory);
    });
  });
}

/**
 * Set up player control event handlers
 */
function setupPlayerControls() {
  // Play/Pause button
  playPauseBtn.addEventListener('click', () => {
    if (!player) return;

    if (player.getIsPlaying()) {
      player.pause();
      updatePlayPauseButton(false);
    } else {
      player.play();
      updatePlayPauseButton(true);
    }
  });

  // Restart button
  restartBtn.addEventListener('click', () => {
    if (!player) return;
    player.restart();
    updatePlayPauseButton(true);
  });

  // Speed slider
  speedSlider.addEventListener('input', () => {
    const index = parseInt(speedSlider.value, 10);
    const speed = SPEED_VALUES[index];
    speedLabel.textContent = SPEED_LABELS[index];

    if (player) {
      player.setSpeed(speed);
    }
  });
}

/**
 * Set up back button handler
 */
function setupBackButton() {
  backBtn.addEventListener('click', () => {
    closePlayer();
  });
}

/**
 * Set up "Open in Editor" button - transfers demo to drawing canvas
 */
function setupOpenInEditor() {
  openInEditorBtn.addEventListener('click', () => {
    if (!player) {
      console.warn('No demo loaded to open in editor');
      return;
    }

    // Get current demo and params
    const demo = player.getDemo();
    const params = player.getParams();

    // Generate all commands from the demo (instant, no animation)
    const commands = [];
    const generator = demo.generate(params);
    for (const cmd of generator) {
      commands.push(cmd);
    }

    // Store commands in sessionStorage
    const sessionKey = 'tektronix-gallery-transfer';
    try {
      sessionStorage.setItem(sessionKey, JSON.stringify(commands));

      // Redirect to the editor (index.html)
      window.location.href = 'index.html';
    } catch {
      alert('Failed to open in editor. The demo may be too large.');
    }
  });
}

/**
 * Set up animate toggle handler
 */
function setupAnimateToggle() {
  animateToggle.addEventListener('change', () => {
    if (animateToggle.checked) {
      startContinuousRotation();
    } else {
      stopContinuousRotation();
    }
  });
}

/**
 * Start continuous rotation animation
 */
function startContinuousRotation() {
  if (!player) return;

  const demo = player.getDemo();
  // Only for demos with rotation params
  if (!demo.params?.rotationY) {
    animateToggle.checked = false;
    return;
  }

  isAnimating = true;
  savedSpeed = player.getSpeed();
  player.setSpeed(Infinity);

  const rotationSpeed = 0.02; // ~1.15 deg/frame

  function animate() {
    if (!isAnimating || !player) return;

    const params = player.getParams();
    if (params.rotationY !== undefined) {
      params.rotationY = (params.rotationY + rotationSpeed) % (2 * Math.PI);
    }
    if (params.rotationX !== undefined) {
      params.rotationX = (params.rotationX + rotationSpeed * 0.3) % (2 * Math.PI);
    }

    player.setParams(params);
    updateRotationSliders(params);

    animationFrameId = requestAnimationFrame(animate);
  }

  animationFrameId = requestAnimationFrame(animate);
}

/**
 * Stop continuous rotation animation
 */
function stopContinuousRotation() {
  isAnimating = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (savedSpeed !== null && player) {
    player.setSpeed(savedSpeed);
    savedSpeed = null;
  }
}

/**
 * Update rotation sliders to reflect current values during animation
 */
function updateRotationSliders(params) {
  for (const key of ['rotationX', 'rotationY', 'rotationZ']) {
    if (params[key] !== undefined) {
      const slider = document.getElementById(`param-${key}`);
      if (slider) {
        slider.value = params[key];
        const valueDisplay = slider.parentElement.querySelector('.param-value');
        if (valueDisplay) valueDisplay.textContent = formatParamValue(params[key]);
      }
    }
  }
}

/**
 * Open a demo in the player view
 * @param {string} demoId - Demo ID to open
 */
function openDemo(demoId) {
  const demo = galleryManager.getDemoById(demoId);
  if (!demo) {
    console.error(`Demo not found: ${demoId}`);
    return;
  }

  // Reset animate toggle when switching demos
  if (animateToggle) {
    animateToggle.checked = false;
    stopContinuousRotation();
  }

  // Update URL hash
  updateUrlHash(demoId);

  // Update title
  playerTitle.textContent = demo.name;

  // Destroy existing player if any
  if (player) {
    player.destroy();
    player = null;
  }

  // Clear canvas container
  clearElement(playerCanvasContainer);

  // Render parameter sliders
  renderParamSliders(demo);

  // Enable/disable animate toggle based on rotation params
  if (animateToggle && animateControl) {
    const hasRotation = demo.params?.rotationY !== undefined;
    animateToggle.disabled = !hasRotation;
    animateControl.style.opacity = hasRotation ? '1' : '0.5';
  }

  // Show player view FIRST so container has dimensions
  galleryMain.classList.add('player-active');

  // Wait for layout to settle before creating player (setTimeout ensures layout is complete)
  setTimeout(() => {
    // Create new player (now container has proper dimensions)
    player = new GraphicPlayer(demo, playerCanvasContainer);

    // Listen for complete event
    player.addEventListener('complete', () => {
      updatePlayPauseButton(false);
    });

    // Set initial speed from slider
    const speedIndex = parseInt(speedSlider.value, 10);
    player.setSpeed(SPEED_VALUES[speedIndex]);

    // Start playback
    player.play();
    updatePlayPauseButton(true);
  }, 50);
}

/**
 * Close the player view and return to grid
 */
function closePlayer() {
  // Stop any running animation
  stopContinuousRotation();
  if (animateToggle) {
    animateToggle.checked = false;
  }

  // Clear URL hash
  history.pushState(null, '', window.location.pathname);

  // Hide player view
  galleryMain.classList.remove('player-active');

  // Destroy player
  if (player) {
    player.destroy();
    player = null;
  }

  // Clear param sliders
  clearElement(paramSlidersContainer);
}

/**
 * Render parameter sliders for a demo
 * @param {Object} demo - Demo object
 */
function renderParamSliders(demo) {
  clearElement(paramSlidersContainer);

  const paramDefs = demo.params || {};
  const paramEntries = Object.entries(paramDefs);

  if (paramEntries.length === 0) {
    return; // No parameters for this demo
  }

  for (const [name, param] of paramEntries) {
    const slider = createParamSlider(name, param);
    paramSlidersContainer.appendChild(slider);
  }
}

/**
 * Create a parameter slider element
 * @param {string} name - Parameter name
 * @param {Object} param - Parameter definition
 * @returns {HTMLElement}
 */
function createParamSlider(name, param) {
  const container = document.createElement('div');
  container.className = 'param-slider';

  const label = document.createElement('label');
  label.htmlFor = `param-${name}`;
  label.textContent = param.label || name;

  const input = document.createElement('input');
  input.type = 'range';
  input.id = `param-${name}`;
  input.min = param.min;
  input.max = param.max;
  input.value = param.default;
  input.step = param.step || 0.01;

  const valueDisplay = document.createElement('span');
  valueDisplay.className = 'param-value';
  valueDisplay.textContent = formatParamValue(param.default);

  // Update on input
  input.addEventListener('input', () => {
    // Stop animation if user manually adjusts a slider
    if (isAnimating) {
      animateToggle.checked = false;
      stopContinuousRotation();
    }

    const value = parseFloat(input.value);
    valueDisplay.textContent = formatParamValue(value);

    if (player) {
      player.setParam(name, value);
      updatePlayPauseButton(true); // restart sets playing to true
    }
  });

  container.appendChild(label);
  container.appendChild(input);
  container.appendChild(valueDisplay);

  return container;
}

/**
 * Format a parameter value for display
 * @param {number} value
 * @returns {string}
 */
function formatParamValue(value) {
  // Display up to 2 decimal places, but remove trailing zeros
  return parseFloat(value.toFixed(2)).toString();
}

/**
 * Update the play/pause button icon
 * @param {boolean} isPlaying
 */
function updatePlayPauseButton(isPlaying) {
  if (isPlaying) {
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
  } else {
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
  }
}

/**
 * Update the URL hash with the demo ID
 * @param {string} demoId
 */
function updateUrlHash(demoId) {
  history.pushState(null, '', `#demo=${demoId}`);
}

/**
 * Handle URL hash for direct linking
 */
function handleUrlHash() {
  const hash = window.location.hash;

  if (hash.startsWith('#demo=')) {
    const demoId = hash.substring(6); // Remove '#demo='
    const demo = galleryManager.getDemoById(demoId);

    if (demo) {
      // Open the demo
      openDemo(demoId);
    } else {
      console.warn(`Demo not found in URL: ${demoId}`);
      // Clear invalid hash
      history.replaceState(null, '', window.location.pathname);
    }
  } else if (galleryMain && galleryMain.classList.contains('player-active')) {
    // Hash cleared but player still showing - close it
    closePlayer();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
