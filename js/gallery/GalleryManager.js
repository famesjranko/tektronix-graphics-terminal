/**
 * GalleryManager - Loads, categorizes, and manages gallery demos
 *
 * Provides methods to:
 * - Get all demos as a flat array
 * - Get list of categories
 * - Filter demos by category
 * - Find demos by ID
 * - Generate thumbnail previews
 */

import { geometricDemos } from './graphics/geometric.js';
import { threedDemos } from './graphics/threed.js';
import { dataDemos } from './graphics/data.js';
import { mapsDemos } from './graphics/maps.js';
import { technicalDemos } from './graphics/technical.js';
import { DEFAULT_COLOR, COLORS } from '../utils/colors.js';

// Category display names and order
const CATEGORY_INFO = {
  geometric: { name: 'Geometric', order: 1 },
  '3d': { name: '3D', order: 2 },
  data: { name: 'Data', order: 3 },
  maps: { name: 'Maps', order: 4 },
  technical: { name: 'Technical', order: 5 }
};

export class GalleryManager {
  constructor() {
    // Combine all demos into a single array
    this.demos = [
      ...geometricDemos,
      ...threedDemos,
      ...dataDemos,
      ...mapsDemos,
      ...technicalDemos
    ];

    // Build ID lookup map for fast access
    this.demoMap = new Map();
    for (const demo of this.demos) {
      this.demoMap.set(demo.id, demo);
    }

    // Extract unique categories
    this.categories = this._extractCategories();
  }

  /**
   * Extract unique categories from demos and sort them
   * @returns {Array<{id: string, name: string}>}
   */
  _extractCategories() {
    const categorySet = new Set();
    for (const demo of this.demos) {
      categorySet.add(demo.category);
    }

    // Convert to array with display names and sort by order
    return Array.from(categorySet)
      .map(id => ({
        id,
        name: CATEGORY_INFO[id]?.name || id,
        order: CATEGORY_INFO[id]?.order || 99
      }))
      .sort((a, b) => a.order - b.order)
      .map(({ id, name }) => ({ id, name }));
  }

  /**
   * Get all demos as a flat array
   * @returns {Array} All demo objects
   */
  getAllDemos() {
    return [...this.demos];
  }

  /**
   * Get list of categories
   * @returns {Array<{id: string, name: string}>} Category objects with id and display name
   */
  getCategories() {
    return [...this.categories];
  }

  /**
   * Get demos filtered by category
   * @param {string} category - Category ID to filter by
   * @returns {Array} Demos in the specified category
   */
  getDemosByCategory(category) {
    return this.demos.filter(demo => demo.category === category);
  }

  /**
   * Get a single demo by ID
   * @param {string} id - Demo ID
   * @returns {Object|null} The demo object or null if not found
   */
  getDemoById(id) {
    return this.demoMap.get(id) || null;
  }

  /**
   * Generate a thumbnail preview for a demo
   * @param {Object} demo - Demo object with generate() generator
   * @param {Object} options - Thumbnail options
   * @param {number} options.width - Thumbnail width in pixels (default: 200)
   * @param {number} options.height - Thumbnail height in pixels (default: 150)
   * @param {number} options.maxCommands - Max commands to render (default: 500)
   * @returns {HTMLCanvasElement} Canvas element with rendered thumbnail
   */
  generateThumbnail(demo, options = {}) {
    const {
      width = 200,
      height = 150,
      maxCommands = 500
    } = options;

    // Create offscreen canvas
    const canvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Fill background
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);

    // Helper for coordinate conversion (normalized 0-1 to pixels)
    const toPixel = (normalized, dimension) => normalized * dimension;

    // Helper for crisp 1px lines
    const crisp = coord => Math.floor(coord) + 0.5;

    // Get default params for the demo
    const params = {};
    for (const [key, param] of Object.entries(demo.params)) {
      params[key] = param.default;
    }

    // Generate and draw commands
    const generator = demo.generate(params);
    let commandCount = 0;

    ctx.strokeStyle = DEFAULT_COLOR;
    ctx.fillStyle = DEFAULT_COLOR;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.lineWidth = 1;

    for (const cmd of generator) {
      if (commandCount >= maxCommands) break;
      commandCount++;

      this._drawCommand(ctx, cmd, width, height, toPixel, crisp);
    }

    return canvas;
  }

  /**
   * Draw a single command to a canvas context
   * @private
   */
  _drawCommand(ctx, cmd, width, height, toPixel, crisp) {
    const color = cmd.color || DEFAULT_COLOR;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    switch (cmd.type) {
      case 'line': {
        const x1 = toPixel(cmd.x1, width);
        const y1 = toPixel(cmd.y1, height);
        const x2 = toPixel(cmd.x2, width);
        const y2 = toPixel(cmd.y2, height);

        // Handle line style
        if (cmd.style === 'dashed') {
          ctx.setLineDash([6, 3]);
        } else if (cmd.style === 'dotted') {
          ctx.setLineDash([2, 3]);
        } else {
          ctx.setLineDash([]);
        }

        ctx.beginPath();
        ctx.moveTo(crisp(x1), crisp(y1));
        ctx.lineTo(crisp(x2), crisp(y2));
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      }

      case 'rect': {
        const x = toPixel(cmd.x, width);
        const y = toPixel(cmd.y, height);
        const w = toPixel(cmd.width, width);
        const h = toPixel(cmd.height, height);

        if (cmd.filled) {
          ctx.fillRect(x, y, w, h);
        } else {
          ctx.strokeRect(crisp(x), crisp(y), Math.floor(w), Math.floor(h));
        }
        break;
      }

      case 'circle': {
        const cx = toPixel(cmd.cx, width);
        const cy = toPixel(cmd.cy, height);
        const r = cmd.radius * width;

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        if (cmd.filled) {
          ctx.fill();
        } else {
          ctx.stroke();
        }
        break;
      }

      case 'arc': {
        const cx = toPixel(cmd.cx, width);
        const cy = toPixel(cmd.cy, height);
        const r = cmd.radius * width;

        ctx.beginPath();
        ctx.arc(cx, cy, r, cmd.startAngle, cmd.endAngle);
        ctx.stroke();
        break;
      }

      case 'text': {
        // For thumbnails, we can skip text or render a placeholder
        // Text commands would need the hershey font to render properly
        // For now, just skip - most demos are visual patterns anyway
        break;
      }

      case 'fill': {
        // Fill commands contain pre-computed lines
        if (cmd.lines && Array.isArray(cmd.lines)) {
          for (const line of cmd.lines) {
            const x1 = toPixel(line.x1, width);
            const y1 = toPixel(line.y1, height);
            const x2 = toPixel(line.x2, width);
            const y2 = toPixel(line.y2, height);

            ctx.beginPath();
            ctx.moveTo(crisp(x1), crisp(y1));
            ctx.lineTo(crisp(x2), crisp(y2));
            ctx.stroke();
          }
        }
        break;
      }
    }
  }

  /**
   * Generate thumbnail and return as data URL
   * @param {Object} demo - Demo object
   * @param {Object} options - Thumbnail options (same as generateThumbnail)
   * @returns {string} Data URL of the thumbnail image
   */
  generateThumbnailDataURL(demo, options = {}) {
    const canvas = this.generateThumbnail(demo, options);
    return canvas.toDataURL('image/png');
  }

  /**
   * Get total count of demos
   * @returns {number}
   */
  getDemoCount() {
    return this.demos.length;
  }

  /**
   * Get count of demos in a category
   * @param {string} category - Category ID
   * @returns {number}
   */
  getCategoryCount(category) {
    return this.getDemosByCategory(category).length;
  }
}

export default GalleryManager;
