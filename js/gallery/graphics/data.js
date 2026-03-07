/**
 * Data Visualization Gallery Demos
 *
 * Charts and graphs for the Tektronix gallery.
 * Each demo is a generator function yielding line commands.
 */

/**
 * Sample data sets embedded in demos
 */
const SAMPLE_BAR_DATA = [
  { label: 'JAN', value: 42 },
  { label: 'FEB', value: 58 },
  { label: 'MAR', value: 35 },
  { label: 'APR', value: 72 },
  { label: 'MAY', value: 65 },
  { label: 'JUN', value: 88 },
  { label: 'JUL', value: 55 }
];

const SAMPLE_LINE_DATA = [
  // Stock-ticker style data points (timestamp, value)
  { t: 0, v: 150 },
  { t: 1, v: 155 },
  { t: 2, v: 148 },
  { t: 3, v: 162 },
  { t: 4, v: 170 },
  { t: 5, v: 165 },
  { t: 6, v: 180 },
  { t: 7, v: 175 },
  { t: 8, v: 190 },
  { t: 9, v: 185 },
  { t: 10, v: 195 },
  { t: 11, v: 205 },
  { t: 12, v: 198 },
  { t: 13, v: 210 },
  { t: 14, v: 225 },
  { t: 15, v: 218 },
  { t: 16, v: 235 },
  { t: 17, v: 240 },
  { t: 18, v: 232 },
  { t: 19, v: 250 }
];

const SAMPLE_PIE_DATA = [
  { label: 'Alpha', value: 35, color: 0 },
  { label: 'Beta', value: 25, color: 1 },
  { label: 'Gamma', value: 20, color: 2 },
  { label: 'Delta', value: 12, color: 3 },
  { label: 'Epsilon', value: 8, color: 4 }
];

const SAMPLE_SCATTER_DATA = [
  // X, Y pairs with some clustering
  { x: 15, y: 20 }, { x: 18, y: 25 }, { x: 22, y: 22 }, { x: 20, y: 28 },
  { x: 35, y: 45 }, { x: 38, y: 50 }, { x: 42, y: 48 }, { x: 40, y: 52 },
  { x: 55, y: 35 }, { x: 58, y: 38 }, { x: 62, y: 32 }, { x: 60, y: 40 },
  { x: 75, y: 70 }, { x: 78, y: 75 }, { x: 82, y: 72 }, { x: 80, y: 78 },
  { x: 25, y: 60 }, { x: 28, y: 65 }, { x: 32, y: 62 },
  { x: 65, y: 15 }, { x: 68, y: 18 }, { x: 72, y: 20 },
  { x: 45, y: 85 }, { x: 48, y: 88 }, { x: 50, y: 82 }
];

/**
 * Helper to draw text using simple line segments
 * Returns an array of line commands for a character
 */
function* drawSimpleChar(char, x, y, scale) {
  const charWidth = 0.012 * scale;
  const charHeight = 0.02 * scale;

  // Simple 7-segment style characters for labels
  const segments = {
    '0': [[0,0,1,0], [1,0,1,1], [1,1,0,1], [0,1,0,0]],
    '1': [[0.5,0,0.5,1]],
    '2': [[0,0,1,0], [1,0,1,0.5], [1,0.5,0,0.5], [0,0.5,0,1], [0,1,1,1]],
    '3': [[0,0,1,0], [1,0,1,1], [1,1,0,1], [0,0.5,1,0.5]],
    '4': [[0,0,0,0.5], [0,0.5,1,0.5], [1,0,1,1]],
    '5': [[1,0,0,0], [0,0,0,0.5], [0,0.5,1,0.5], [1,0.5,1,1], [1,1,0,1]],
    '6': [[1,0,0,0], [0,0,0,1], [0,1,1,1], [1,1,1,0.5], [1,0.5,0,0.5]],
    '7': [[0,0,1,0], [1,0,1,1]],
    '8': [[0,0,1,0], [1,0,1,1], [1,1,0,1], [0,1,0,0], [0,0.5,1,0.5]],
    '9': [[0,0.5,1,0.5], [1,0.5,1,0], [1,0,0,0], [0,0,0,0.5], [1,0.5,1,1]],
  };

  const charSegments = segments[char];
  if (charSegments) {
    for (const [x1, y1, x2, y2] of charSegments) {
      yield {
        type: 'line',
        x1: x + x1 * charWidth,
        y1: y + y1 * charHeight,
        x2: x + x2 * charWidth,
        y2: y + y2 * charHeight
      };
    }
  }
}

/**
 * Bar chart generator
 * Draws vertical bars with values growing from bottom
 */
export const barChart = {
  id: 'bar-chart',
  name: 'Bar Chart',
  category: 'data',
  description: 'Animated bar chart with values growing upward',
  thumbnail: null,
  params: {
    barWidth: { default: 0.6, min: 0.3, max: 0.9, step: 0.1, label: 'Bar width' },
    showGrid: { default: 1, min: 0, max: 1, step: 1, label: 'Show grid (0/1)' },
    showLabels: { default: 1, min: 0, max: 1, step: 1, label: 'Show labels (0/1)' }
  },
  *generate(params) {
    const { barWidth, showGrid, showLabels } = params;
    const data = SAMPLE_BAR_DATA;

    // Chart area bounds (leaving room for axes and labels)
    const left = 0.12;
    const right = 0.92;
    const top = 0.1;
    const bottom = 0.82;
    const chartWidth = right - left;
    const chartHeight = bottom - top;

    // Find max value for scaling
    const maxValue = Math.max(...data.map(d => d.value));
    const niceMax = Math.ceil(maxValue / 10) * 10;

    // Draw axes
    // Y-axis
    yield { type: 'line', x1: left, y1: top, x2: left, y2: bottom };
    // X-axis
    yield { type: 'line', x1: left, y1: bottom, x2: right, y2: bottom };

    // Draw horizontal grid lines and Y-axis labels
    if (showGrid) {
      const gridLines = 5;
      for (let i = 0; i <= gridLines; i++) {
        const yPos = bottom - (i / gridLines) * chartHeight;

        // Grid line (dashed effect using segments)
        const dashCount = 20;
        for (let d = 0; d < dashCount; d += 2) {
          const x1 = left + (d / dashCount) * chartWidth;
          const x2 = left + ((d + 1) / dashCount) * chartWidth;
          yield { type: 'line', x1, y1: yPos, x2, y2: yPos };
        }

        // Tick mark
        yield { type: 'line', x1: left - 0.01, y1: yPos, x2: left, y2: yPos };
      }
    }

    // Calculate bar dimensions
    const numBars = data.length;
    const totalBarSpace = chartWidth / numBars;
    const actualBarWidth = totalBarSpace * barWidth;
    const barGap = (totalBarSpace - actualBarWidth) / 2;

    // Draw bars (animated by drawing from bottom up in segments)
    for (let i = 0; i < numBars; i++) {
      const barValue = data[i].value;
      const barHeight = (barValue / niceMax) * chartHeight;

      const barLeft = left + i * totalBarSpace + barGap;
      const barRight = barLeft + actualBarWidth;
      const barTop = bottom - barHeight;
      const barBottom = bottom;

      // Draw bar outline (4 sides) - animated effect by drawing progressively
      // Left side (bottom to top)
      yield { type: 'line', x1: barLeft, y1: barBottom, x2: barLeft, y2: barTop };
      // Top side (left to right)
      yield { type: 'line', x1: barLeft, y1: barTop, x2: barRight, y2: barTop };
      // Right side (top to bottom)
      yield { type: 'line', x1: barRight, y1: barTop, x2: barRight, y2: barBottom };

      // Add horizontal fill lines for bar texture
      const fillLines = Math.floor(barHeight * 50);
      for (let f = 0; f < fillLines; f += 2) {
        const fillY = barBottom - (f / fillLines) * barHeight;
        if (fillY > barTop) {
          yield { type: 'line', x1: barLeft + 0.003, y1: fillY, x2: barRight - 0.003, y2: fillY };
        }
      }
    }

    // Draw title
    if (showLabels) {
      // Simple underline as title indicator
      yield { type: 'line', x1: 0.35, y1: 0.05, x2: 0.65, y2: 0.05 };
    }
  }
};

/**
 * Line graph generator
 * Stock-ticker style line chart with data points
 */
export const lineGraph = {
  id: 'line-graph',
  name: 'Line Graph',
  category: 'data',
  description: 'Stock-ticker style line chart with trend',
  thumbnail: null,
  params: {
    showPoints: { default: 1, min: 0, max: 1, step: 1, label: 'Show points (0/1)' },
    showGrid: { default: 1, min: 0, max: 1, step: 1, label: 'Show grid (0/1)' },
    smoothing: { default: 0, min: 0, max: 1, step: 1, label: 'Smooth line (0/1)' }
  },
  *generate(params) {
    const { showPoints, showGrid } = params;
    const data = SAMPLE_LINE_DATA;

    // Chart area bounds
    const left = 0.1;
    const right = 0.92;
    const top = 0.1;
    const bottom = 0.85;
    const chartWidth = right - left;
    const chartHeight = bottom - top;

    // Find min/max for scaling
    const minValue = Math.min(...data.map(d => d.v));
    const maxValue = Math.max(...data.map(d => d.v));
    const range = maxValue - minValue;
    const padding = range * 0.1;
    const yMin = minValue - padding;
    const yMax = maxValue + padding;

    // Draw axes
    yield { type: 'line', x1: left, y1: top, x2: left, y2: bottom };
    yield { type: 'line', x1: left, y1: bottom, x2: right, y2: bottom };

    // Draw grid
    if (showGrid) {
      // Horizontal grid lines
      const hLines = 5;
      for (let i = 1; i < hLines; i++) {
        const yPos = bottom - (i / hLines) * chartHeight;
        // Dashed line
        for (let d = 0; d < 15; d += 2) {
          const x1 = left + (d / 15) * chartWidth;
          const x2 = left + ((d + 1) / 15) * chartWidth;
          yield { type: 'line', x1, y1: yPos, x2, y2: yPos };
        }
      }

      // Vertical grid lines
      const vLines = 5;
      for (let i = 1; i < vLines; i++) {
        const xPos = left + (i / vLines) * chartWidth;
        // Dashed line
        for (let d = 0; d < 15; d += 2) {
          const y1 = top + (d / 15) * chartHeight;
          const y2 = top + ((d + 1) / 15) * chartHeight;
          yield { type: 'line', x1: xPos, y1, x2: xPos, y2 };
        }
      }
    }

    // Convert data to chart coordinates
    const maxT = Math.max(...data.map(d => d.t));
    const points = data.map(d => ({
      x: left + (d.t / maxT) * chartWidth,
      y: bottom - ((d.v - yMin) / (yMax - yMin)) * chartHeight
    }));

    // Draw connecting lines
    for (let i = 0; i < points.length - 1; i++) {
      yield {
        type: 'line',
        x1: points[i].x,
        y1: points[i].y,
        x2: points[i + 1].x,
        y2: points[i + 1].y
      };
    }

    // Draw data points as small diamonds
    if (showPoints) {
      const pointSize = 0.008;
      for (const point of points) {
        // Diamond shape (4 lines)
        yield { type: 'line', x1: point.x, y1: point.y - pointSize, x2: point.x + pointSize, y2: point.y };
        yield { type: 'line', x1: point.x + pointSize, y1: point.y, x2: point.x, y2: point.y + pointSize };
        yield { type: 'line', x1: point.x, y1: point.y + pointSize, x2: point.x - pointSize, y2: point.y };
        yield { type: 'line', x1: point.x - pointSize, y1: point.y, x2: point.x, y2: point.y - pointSize };
      }
    }

    // Draw trend indicator (upward arrow at end)
    const lastPoint = points[points.length - 1];
    const arrowSize = 0.015;
    yield { type: 'line', x1: lastPoint.x + 0.02, y1: lastPoint.y + arrowSize, x2: lastPoint.x + 0.02, y2: lastPoint.y - arrowSize };
    yield { type: 'line', x1: lastPoint.x + 0.02, y1: lastPoint.y - arrowSize, x2: lastPoint.x + 0.015, y2: lastPoint.y - arrowSize + 0.008 };
    yield { type: 'line', x1: lastPoint.x + 0.02, y1: lastPoint.y - arrowSize, x2: lastPoint.x + 0.025, y2: lastPoint.y - arrowSize + 0.008 };
  }
};

/**
 * Pie chart generator
 * Draws segments one by one with animated wedges
 */
export const pieChart = {
  id: 'pie-chart',
  name: 'Pie Chart',
  category: 'data',
  description: 'Animated pie chart with segments drawing in',
  thumbnail: null,
  params: {
    radius: { default: 0.3, min: 0.2, max: 0.4, step: 0.02, label: 'Radius' },
    showLabels: { default: 1, min: 0, max: 1, step: 1, label: 'Show lines (0/1)' },
    explode: { default: 0, min: 0, max: 1, step: 1, label: 'Explode (0/1)' }
  },
  *generate(params) {
    const { radius, showLabels, explode } = params;
    const data = SAMPLE_PIE_DATA;

    const cx = 0.5;
    const cy = 0.5;

    // Calculate total for percentages
    const total = data.reduce((sum, d) => sum + d.value, 0);

    // Draw each segment
    let currentAngle = -Math.PI / 2; // Start at top
    const segments = 32; // Line segments per arc

    for (let i = 0; i < data.length; i++) {
      const slice = data[i];
      const sliceAngle = (slice.value / total) * 2 * Math.PI;
      const endAngle = currentAngle + sliceAngle;

      // Calculate explode offset
      let offsetX = 0;
      let offsetY = 0;
      if (explode) {
        const midAngle = currentAngle + sliceAngle / 2;
        const explodeDistance = 0.03;
        offsetX = Math.cos(midAngle) * explodeDistance;
        offsetY = Math.sin(midAngle) * explodeDistance;
      }

      const sliceCx = cx + offsetX;
      const sliceCy = cy + offsetY;

      // Draw radial line from center to start of arc
      const startX = sliceCx + radius * Math.cos(currentAngle);
      const startY = sliceCy + radius * Math.sin(currentAngle);
      yield { type: 'line', x1: sliceCx, y1: sliceCy, x2: startX, y2: startY };

      // Draw arc (as line segments)
      let prevX = startX;
      let prevY = startY;

      for (let s = 1; s <= segments; s++) {
        const t = currentAngle + (s / segments) * sliceAngle;
        const x = sliceCx + radius * Math.cos(t);
        const y = sliceCy + radius * Math.sin(t);

        yield { type: 'line', x1: prevX, y1: prevY, x2: x, y2: y };

        prevX = x;
        prevY = y;
      }

      // Draw radial line from end of arc back to center
      yield { type: 'line', x1: prevX, y1: prevY, x2: sliceCx, y2: sliceCy };

      // Draw label line extending outward
      if (showLabels) {
        const midAngle = currentAngle + sliceAngle / 2;
        const labelInnerRadius = radius * 1.1;
        const labelOuterRadius = radius * 1.3;

        const innerX = sliceCx + labelInnerRadius * Math.cos(midAngle);
        const innerY = sliceCy + labelInnerRadius * Math.sin(midAngle);
        const outerX = sliceCx + labelOuterRadius * Math.cos(midAngle);
        const outerY = sliceCy + labelOuterRadius * Math.sin(midAngle);

        yield { type: 'line', x1: innerX, y1: innerY, x2: outerX, y2: outerY };

        // Horizontal extension
        const extendDir = Math.cos(midAngle) > 0 ? 1 : -1;
        yield { type: 'line', x1: outerX, y1: outerY, x2: outerX + extendDir * 0.04, y2: outerY };
      }

      // Add pattern fill lines for visual distinction
      const fillSegments = Math.floor(sliceAngle * 15);
      for (let f = 0; f < fillSegments; f++) {
        const fillAngle = currentAngle + (f / fillSegments) * sliceAngle;
        const innerR = radius * 0.3;
        const outerR = radius * 0.85;

        const fx1 = sliceCx + innerR * Math.cos(fillAngle);
        const fy1 = sliceCy + innerR * Math.sin(fillAngle);
        const fx2 = sliceCx + outerR * Math.cos(fillAngle);
        const fy2 = sliceCy + outerR * Math.sin(fillAngle);

        yield { type: 'line', x1: fx1, y1: fy1, x2: fx2, y2: fy2 };
      }

      currentAngle = endAngle;
    }
  }
};

/**
 * Scatter plot generator
 * Draws points as small shapes with optional trend line
 */
export const scatterPlot = {
  id: 'scatter-plot',
  name: 'Scatter Plot',
  category: 'data',
  description: 'Data points with clustering patterns',
  thumbnail: null,
  params: {
    pointStyle: { default: 0, min: 0, max: 2, step: 1, label: 'Style (0=X, 1=+, 2=O)' },
    showTrend: { default: 1, min: 0, max: 1, step: 1, label: 'Trend line (0/1)' },
    pointSize: { default: 0.012, min: 0.006, max: 0.02, step: 0.002, label: 'Point size' }
  },
  *generate(params) {
    const { pointStyle, showTrend, pointSize } = params;
    const data = SAMPLE_SCATTER_DATA;

    // Chart area bounds
    const left = 0.1;
    const right = 0.92;
    const top = 0.1;
    const bottom = 0.88;
    const chartWidth = right - left;
    const chartHeight = bottom - top;

    // Draw axes
    yield { type: 'line', x1: left, y1: top, x2: left, y2: bottom };
    yield { type: 'line', x1: left, y1: bottom, x2: right, y2: bottom };

    // Add tick marks
    const ticks = 5;
    for (let i = 0; i <= ticks; i++) {
      // X-axis ticks
      const xPos = left + (i / ticks) * chartWidth;
      yield { type: 'line', x1: xPos, y1: bottom, x2: xPos, y2: bottom + 0.01 };

      // Y-axis ticks
      const yPos = bottom - (i / ticks) * chartHeight;
      yield { type: 'line', x1: left - 0.01, y1: yPos, x2: left, y2: yPos };
    }

    // Find data bounds
    const xMin = 0;
    const xMax = 100;
    const yMin = 0;
    const yMax = 100;

    // Convert data to chart coordinates
    const points = data.map(d => ({
      x: left + ((d.x - xMin) / (xMax - xMin)) * chartWidth,
      y: bottom - ((d.y - yMin) / (yMax - yMin)) * chartHeight
    }));

    // Draw data points
    for (const point of points) {
      if (pointStyle === 0) {
        // X shape
        yield { type: 'line', x1: point.x - pointSize, y1: point.y - pointSize, x2: point.x + pointSize, y2: point.y + pointSize };
        yield { type: 'line', x1: point.x - pointSize, y1: point.y + pointSize, x2: point.x + pointSize, y2: point.y - pointSize };
      } else if (pointStyle === 1) {
        // + shape
        yield { type: 'line', x1: point.x - pointSize, y1: point.y, x2: point.x + pointSize, y2: point.y };
        yield { type: 'line', x1: point.x, y1: point.y - pointSize, x2: point.x, y2: point.y + pointSize };
      } else {
        // Circle (octagon approximation)
        const segments = 8;
        for (let i = 0; i < segments; i++) {
          const a1 = (i / segments) * 2 * Math.PI;
          const a2 = ((i + 1) / segments) * 2 * Math.PI;
          yield {
            type: 'line',
            x1: point.x + pointSize * Math.cos(a1),
            y1: point.y + pointSize * Math.sin(a1),
            x2: point.x + pointSize * Math.cos(a2),
            y2: point.y + pointSize * Math.sin(a2)
          };
        }
      }
    }

    // Calculate and draw trend line (linear regression)
    if (showTrend) {
      const n = data.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

      for (const d of data) {
        sumX += d.x;
        sumY += d.y;
        sumXY += d.x * d.y;
        sumX2 += d.x * d.x;
      }

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      // Calculate line endpoints
      const trendY1 = intercept;
      const trendY2 = slope * 100 + intercept;

      // Convert to chart coordinates
      const tx1 = left;
      const ty1 = bottom - ((trendY1 - yMin) / (yMax - yMin)) * chartHeight;
      const tx2 = right;
      const ty2 = bottom - ((trendY2 - yMin) / (yMax - yMin)) * chartHeight;

      // Clip to chart bounds
      const clipTy1 = Math.max(top, Math.min(bottom, ty1));
      const clipTy2 = Math.max(top, Math.min(bottom, ty2));

      // Draw dashed trend line
      const dashCount = 20;
      for (let d = 0; d < dashCount; d += 2) {
        const t1 = d / dashCount;
        const t2 = (d + 1) / dashCount;

        yield {
          type: 'line',
          x1: tx1 + t1 * (tx2 - tx1),
          y1: clipTy1 + t1 * (clipTy2 - clipTy1),
          x2: tx1 + t2 * (tx2 - tx1),
          y2: clipTy1 + t2 * (clipTy2 - clipTy1)
        };
      }
    }
  }
};

/**
 * All data visualization demos exported as an array
 */
export const dataDemos = [
  barChart,
  lineGraph,
  pieChart,
  scatterPlot
];

export default dataDemos;
