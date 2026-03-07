/**
 * Tektronix Graphics Terminal - Color Palette
 */

export const COLORS = {
  primary: '#00FF88',    // Bright modern green - lines, active elements
  dim: '#00AA55',        // Dimmed green - grid, inactive elements
  background: '#0A0F0D', // Near-black with green tint
  panel: '#0D1410',      // Slightly lighter for UI panels
  border: '#1A3328',     // Subtle green borders
  text: '#88FFBB',       // Readable text on dark backgrounds
  highlight: '#AAFFDD',  // Hover/focus states
};

// Default drawing color
export const DEFAULT_COLOR = COLORS.primary;

// Grid color with opacity
export const GRID_COLOR = COLORS.dim;
export const GRID_OPACITY = 0.3;
