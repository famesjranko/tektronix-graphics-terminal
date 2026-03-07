/**
 * GraphicPlayer - Player component for gallery demo playback
 *
 * Plays demos with animated rendering, allowing:
 * - play(), pause(), restart() controls
 * - Speed adjustment via setSpeed()
 * - Parameter updates that restart the demo
 * - Emits 'complete' event when demo finishes
 */

import { TekCanvas } from '../canvas/TekCanvas.js';
import { VectorRenderer } from '../canvas/VectorRenderer.js';
import { PlotAnimator } from '../canvas/PlotAnimator.js';

export class GraphicPlayer extends EventTarget {
  /**
   * @param {Object} demo - Demo object with generate() generator and params
   * @param {HTMLElement} container - Container element for the canvas
   */
  constructor(demo, container) {
    super();

    this.demo = demo;
    this.container = container;

    // Current parameter values (start with defaults)
    this.params = this._getDefaultParams(demo);

    // Create canvas system
    this.tekCanvas = new TekCanvas(container);
    this.renderer = new VectorRenderer(this.tekCanvas);
    this.animator = new PlotAnimator(this.tekCanvas, this.renderer);

    // Track playback state
    this.isPlaying = false;
    this.hasStarted = false;

    // Forward 'complete' event from animator
    this.animator.addEventListener('complete', () => {
      this.isPlaying = false;
      this.dispatchEvent(new Event('complete'));
    });
  }

  /**
   * Extract default parameter values from demo
   * @param {Object} demo
   * @returns {Object} Parameter values keyed by name
   */
  _getDefaultParams(demo) {
    const params = {};
    for (const [key, param] of Object.entries(demo.params || {})) {
      params[key] = param.default;
    }
    return params;
  }

  /**
   * Generate commands from the demo and queue them for animation
   */
  _generateAndQueue() {
    // Clear any existing queue and canvas
    this.animator.clear();
    this.tekCanvas.clearAll();

    // Generate commands from demo
    const generator = this.demo.generate(this.params);

    for (const cmd of generator) {
      this.animator.enqueue(cmd);
    }
  }

  /**
   * Start or resume playback
   */
  play() {
    if (!this.hasStarted) {
      // First play - generate and queue commands
      this._generateAndQueue();
      this.hasStarted = true;
      this.isPlaying = true;
    } else if (this.animator.isPaused) {
      // Resume from pause
      this.animator.resume();
      this.isPlaying = true;
    }
    // If already playing, do nothing
  }

  /**
   * Pause playback
   */
  pause() {
    if (this.isPlaying) {
      this.animator.pause();
      this.isPlaying = false;
    }
  }

  /**
   * Restart playback from the beginning
   */
  restart() {
    // Clear and regenerate
    this.animator.clear();
    this.tekCanvas.clearAll();
    this._generateAndQueue();
    this.hasStarted = true;
    this.isPlaying = true;
  }

  /**
   * Set animation speed
   * @param {number} pxPerSec - Pixels per second (100, 300, 800, 2000, or Infinity)
   */
  setSpeed(pxPerSec) {
    this.animator.setSpeed(pxPerSec);
  }

  /**
   * Get current speed
   * @returns {number}
   */
  getSpeed() {
    return this.animator.getSpeed();
  }

  /**
   * Update a parameter value and restart the demo
   * @param {string} name - Parameter name
   * @param {number} value - New value
   */
  setParam(name, value) {
    if (this.params.hasOwnProperty(name)) {
      this.params[name] = value;

      // Restart with new params if already started
      if (this.hasStarted) {
        this.restart();
      }
    }
  }

  /**
   * Update multiple parameters and restart the demo
   * @param {Object} params - Object with parameter name/value pairs
   */
  setParams(params) {
    let changed = false;
    for (const [name, value] of Object.entries(params)) {
      if (this.params.hasOwnProperty(name)) {
        this.params[name] = value;
        changed = true;
      }
    }

    // Restart with new params if already started and something changed
    if (changed && this.hasStarted) {
      this.restart();
    }
  }

  /**
   * Get current parameter values
   * @returns {Object}
   */
  getParams() {
    return { ...this.params };
  }

  /**
   * Get the demo's parameter definitions
   * @returns {Object}
   */
  getParamDefinitions() {
    return this.demo.params || {};
  }

  /**
   * Skip to end (complete all animations instantly)
   */
  skipToEnd() {
    if (!this.hasStarted) {
      this._generateAndQueue();
      this.hasStarted = true;
    }
    this.animator.skipAll();
    this.isPlaying = false;
  }

  /**
   * Load a new demo
   * @param {Object} demo - New demo object
   */
  loadDemo(demo) {
    // Stop current playback
    this.animator.clear();
    this.tekCanvas.clearAll();

    // Load new demo
    this.demo = demo;
    this.params = this._getDefaultParams(demo);
    this.hasStarted = false;
    this.isPlaying = false;
  }

  /**
   * Check if currently playing
   * @returns {boolean}
   */
  getIsPlaying() {
    return this.isPlaying;
  }

  /**
   * Check if animation is paused
   * @returns {boolean}
   */
  getIsPaused() {
    return this.animator.isPaused;
  }

  /**
   * Get the current demo
   * @returns {Object}
   */
  getDemo() {
    return this.demo;
  }

  /**
   * Get the underlying TekCanvas instance
   * @returns {TekCanvas}
   */
  getTekCanvas() {
    return this.tekCanvas;
  }

  /**
   * Get the underlying PlotAnimator instance
   * @returns {PlotAnimator}
   */
  getAnimator() {
    return this.animator;
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.animator.clear();
    this.tekCanvas.destroy();
  }
}

export default GraphicPlayer;
