/**
 * Export utilities for Tektronix Graphics Terminal
 * Handles PNG and SVG export functionality
 */

import { COLORS } from './colors.js';
import { textToCommands } from '../fonts/hershey.js';

/**
 * Export the canvas as a PNG image
 * @param {TekCanvas} tekCanvas - The TekCanvas instance
 * @param {Object} options - Export options
 * @param {number} options.scale - Scale factor (1 or 2 for retina)
 * @param {boolean} options.transparent - If true, background is transparent; otherwise uses --tek-background
 * @returns {Promise<void>} - Triggers download
 */
export async function exportPNG(tekCanvas, options = {}) {
  const scale = options.scale || 1;
  const transparent = options.transparent || false;

  // Get CSS dimensions of the canvas
  const cssWidth = tekCanvas.getWidth();
  const cssHeight = tekCanvas.getHeight();

  // Create export canvas at desired scale
  const exportCanvas = document.createElement('canvas');
  const exportWidth = Math.floor(cssWidth * scale);
  const exportHeight = Math.floor(cssHeight * scale);
  exportCanvas.width = exportWidth;
  exportCanvas.height = exportHeight;

  const ctx = exportCanvas.getContext('2d');

  // Fill background if not transparent
  if (!transparent) {
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, exportWidth, exportHeight);
  }

  // Get the persistent canvas (contains the drawing)
  const sourceCanvas = tekCanvas.persistentCanvas;

  // Draw the source canvas onto the export canvas
  // Source is at physical pixels (CSS size * devicePixelRatio)
  // We need to draw it scaled to our export size
  ctx.drawImage(
    sourceCanvas,
    0, 0, sourceCanvas.width, sourceCanvas.height,  // source rect (full physical size)
    0, 0, exportWidth, exportHeight                  // dest rect (export size)
  );

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `tektronix-${timestamp}.png`;

  // Convert to blob and trigger download
  return new Promise((resolve, reject) => {
    exportCanvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create PNG blob'));
        return;
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up
      URL.revokeObjectURL(url);
      resolve();
    }, 'image/png');
  });
}

/**
 * Convert a command to SVG element(s)
 * @param {Object} cmd - Drawing command
 * @param {number} width - SVG width
 * @param {number} height - SVG height
 * @returns {string} SVG element string
 */
function commandToSVG(cmd, width, height) {
  const color = cmd.color || COLORS.primary;
  const strokeAttrs = `stroke="${color}" stroke-width="1" fill="none"`;
  const fillAttrs = `fill="${color}" stroke="none"`;

  switch (cmd.type) {
    case 'line': {
      const x1 = cmd.x1 * width;
      const y1 = cmd.y1 * height;
      const x2 = cmd.x2 * width;
      const y2 = cmd.y2 * height;

      let dashArray = '';
      if (cmd.style === 'dashed') {
        dashArray = ' stroke-dasharray="8,4"';
      } else if (cmd.style === 'dotted') {
        dashArray = ' stroke-dasharray="2,4"';
      }

      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${strokeAttrs}${dashArray}/>`;
    }

    case 'rect': {
      const x = cmd.x * width;
      const y = cmd.y * height;
      const w = cmd.width * width;
      const h = cmd.height * height;
      const attrs = cmd.filled ? fillAttrs : strokeAttrs;
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${attrs}/>`;
    }

    case 'circle': {
      const cx = cmd.cx * width;
      const cy = cmd.cy * height;
      // Radius is relative to width in normalized coords
      const r = cmd.radius * width;
      const attrs = cmd.filled ? fillAttrs : strokeAttrs;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" ${attrs}/>`;
    }

    case 'arc': {
      const cx = cmd.cx * width;
      const cy = cmd.cy * height;
      const r = cmd.radius * width;
      const startAngle = cmd.startAngle;
      const endAngle = cmd.endAngle;

      // Calculate start and end points
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);

      // Determine if arc is large (> 180 degrees)
      let angleDiff = endAngle - startAngle;
      if (angleDiff < 0) angleDiff += Math.PI * 2;
      const largeArc = angleDiff > Math.PI ? 1 : 0;

      // SVG arc path: M x1,y1 A rx ry x-axis-rotation large-arc-flag sweep-flag x2,y2
      const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
      return `<path d="${d}" ${strokeAttrs}/>`;
    }

    case 'text': {
      // Convert text to line commands using hershey font
      const lineCommands = textToCommands(cmd.text, cmd.x, cmd.y, cmd.scale || 1);
      return lineCommands.map(lineCmd => commandToSVG(lineCmd, width, height)).join('\n    ');
    }

    case 'fill': {
      // Fill patterns are stored as line arrays
      if (cmd.lines && cmd.lines.length > 0) {
        return cmd.lines.map(lineCmd => {
          const lineWithColor = { ...lineCmd, color: cmd.color || color };
          return commandToSVG(lineWithColor, width, height);
        }).join('\n    ');
      }
      return '';
    }

    default:
      return '';
  }
}

/**
 * Export commands as an SVG file
 * @param {Array} commands - Array of drawing commands
 * @param {number} width - Canvas width in pixels
 * @param {number} height - Canvas height in pixels
 * @param {Object} options - Export options
 * @param {boolean} options.transparent - If true, no background rect
 * @returns {void} - Triggers download
 */
export function exportSVG(commands, width, height, options = {}) {
  const transparent = options.transparent || false;

  // Build SVG content
  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 ${width} ${height}"
     width="${width}"
     height="${height}">
  <style>
    /* Tektronix Graphics Terminal Colors */
    .tek-primary { stroke: ${COLORS.primary}; fill: none; }
    .tek-background { fill: ${COLORS.background}; }
  </style>
`;

  // Add background if not transparent
  if (!transparent) {
    svgContent += `  <rect width="100%" height="100%" class="tek-background"/>
`;
  }

  // Add a group for all drawing elements
  svgContent += `  <g stroke-linecap="round" stroke-linejoin="round">
`;

  // Convert each command to SVG
  for (const cmd of commands) {
    const svgElement = commandToSVG(cmd, width, height);
    if (svgElement) {
      svgContent += `    ${svgElement}
`;
    }
  }

  svgContent += `  </g>
</svg>`;

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `tektronix-${timestamp}.svg`;

  // Create blob and trigger download
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Clean up
  URL.revokeObjectURL(url);
}
