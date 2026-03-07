/**
 * Geometric Gallery Demos
 *
 * Mathematical curves and patterns for the Tektronix gallery.
 * Each demo is a generator function yielding line commands.
 */

/**
 * Spirograph pattern generator
 * Uses parametric equations for a hypotrochoid curve:
 * x = (R - r) * cos(t) + d * cos((R - r) / r * t)
 * y = (R - r) * sin(t) - d * sin((R - r) / r * t)
 */
export const spirograph = {
  id: 'spirograph',
  name: 'Spirograph',
  category: 'geometric',
  description: 'Classic spirograph hypotrochoid pattern',
  thumbnail: null,
  params: {
    R: { default: 0.35, min: 0.1, max: 0.45, step: 0.01, label: 'Outer radius' },
    r: { default: 0.12, min: 0.03, max: 0.25, step: 0.01, label: 'Inner radius' },
    d: { default: 0.08, min: 0.01, max: 0.2, step: 0.01, label: 'Pen offset' }
  },
  *generate(params) {
    const { R, r, d } = params;
    const cx = 0.5;
    const cy = 0.5;

    // Calculate number of rotations needed for the pattern to complete
    // LCM of r and R determines when pattern repeats
    const gcd = (a, b) => b < 0.0001 ? a : gcd(b, a % b);
    const lcm = (R * r) / gcd(R, r);
    const rotations = lcm / r;
    const maxT = Math.min(rotations, 50) * 2 * Math.PI;

    const step = 0.02;
    let prevX = null;
    let prevY = null;

    for (let t = 0; t <= maxT; t += step) {
      const diff = R - r;
      const ratio = diff / r;

      const x = cx + diff * Math.cos(t) + d * Math.cos(ratio * t);
      const y = cy + diff * Math.sin(t) - d * Math.sin(ratio * t);

      if (prevX !== null) {
        yield { type: 'line', x1: prevX, y1: prevY, x2: x, y2: y };
      }

      prevX = x;
      prevY = y;
    }
  }
};

/**
 * Lissajous curve generator
 * x = A * sin(a * t + delta)
 * y = B * sin(b * t)
 */
export const lissajous = {
  id: 'lissajous',
  name: 'Lissajous Curve',
  category: 'geometric',
  description: 'Harmonic oscillation pattern',
  thumbnail: null,
  params: {
    a: { default: 3, min: 1, max: 7, step: 1, label: 'X frequency' },
    b: { default: 4, min: 1, max: 7, step: 1, label: 'Y frequency' },
    delta: { default: 0.5, min: 0, max: 3.14, step: 0.1, label: 'Phase shift' }
  },
  *generate(params) {
    const { a, b, delta } = params;
    const cx = 0.5;
    const cy = 0.5;
    const amplitude = 0.35;

    // Calculate period - LCM of frequencies
    const gcd = (x, y) => y === 0 ? x : gcd(y, x % y);
    const lcmVal = (a * b) / gcd(a, b);
    const maxT = (lcmVal / Math.min(a, b)) * 2 * Math.PI;

    const step = 0.02;
    let prevX = null;
    let prevY = null;

    for (let t = 0; t <= maxT + step; t += step) {
      const x = cx + amplitude * Math.sin(a * t + delta);
      const y = cy + amplitude * Math.sin(b * t);

      if (prevX !== null) {
        yield { type: 'line', x1: prevX, y1: prevY, x2: x, y2: y };
      }

      prevX = x;
      prevY = y;
    }
  }
};

/**
 * Rose curve (rhodonea) generator
 * In polar coordinates: r = cos(n/d * theta)
 * When n/d is rational, the curve is closed
 */
export const roseCurve = {
  id: 'rose-curve',
  name: 'Rose Curve',
  category: 'geometric',
  description: 'Mathematical rose (rhodonea) pattern',
  thumbnail: null,
  params: {
    n: { default: 5, min: 1, max: 9, step: 1, label: 'Numerator (n)' },
    d: { default: 3, min: 1, max: 9, step: 1, label: 'Denominator (d)' }
  },
  *generate(params) {
    const { n, d } = params;
    const cx = 0.5;
    const cy = 0.5;
    const amplitude = 0.38;

    // For a rose curve r = cos(n/d * theta)
    // The curve completes when theta = d * PI (if d is odd) or 2 * d * PI (if d is even)
    const k = n / d;
    const maxTheta = d % 2 === 0 ? 2 * d * Math.PI : d * Math.PI;

    const step = 0.02;
    let prevX = null;
    let prevY = null;

    for (let theta = 0; theta <= maxTheta; theta += step) {
      const r = amplitude * Math.cos(k * theta);

      // Convert polar to cartesian
      const x = cx + r * Math.cos(theta);
      const y = cy + r * Math.sin(theta);

      if (prevX !== null) {
        yield { type: 'line', x1: prevX, y1: prevY, x2: x, y2: y };
      }

      prevX = x;
      prevY = y;
    }
  }
};

/**
 * Fibonacci spiral generator
 * Draws quarter-circle arcs based on Fibonacci sequence
 */
export const fibonacciSpiral = {
  id: 'fibonacci-spiral',
  name: 'Fibonacci Spiral',
  category: 'geometric',
  description: 'Golden ratio spiral with Fibonacci squares',
  thumbnail: null,
  params: {
    iterations: { default: 10, min: 4, max: 14, step: 1, label: 'Iterations' },
    showSquares: { default: 1, min: 0, max: 1, step: 1, label: 'Show squares (0/1)' }
  },
  *generate(params) {
    const { iterations, showSquares } = params;

    // Generate Fibonacci sequence
    const fib = [1, 1];
    for (let i = 2; i < iterations; i++) {
      fib.push(fib[i - 1] + fib[i - 2]);
    }

    // Scale to fit canvas with padding
    const totalSize = fib[fib.length - 1] + fib[fib.length - 2];
    const scale = 0.8 / totalSize;
    const offsetX = 0.1;
    const offsetY = 0.1;

    // Track current position and direction
    // Directions: 0 = right, 1 = up, 2 = left, 3 = down
    let x = 0;
    let y = 0;
    let direction = 0;

    // Draw each Fibonacci square and arc
    for (let i = 0; i < iterations; i++) {
      const size = fib[i] * scale;

      // Calculate square corners based on current direction
      let sx, sy; // Square top-left corner in normalized coords
      let arcCx, arcCy; // Arc center
      let startAngle, endAngle;

      switch (direction) {
        case 0: // Going right
          sx = x;
          sy = y;
          arcCx = x + size;
          arcCy = y + size;
          startAngle = -Math.PI / 2;
          endAngle = -Math.PI;
          x += size;
          break;
        case 1: // Going up
          sx = x - size;
          sy = y - size;
          arcCx = x - size;
          arcCy = y;
          startAngle = 0;
          endAngle = -Math.PI / 2;
          y -= size;
          break;
        case 2: // Going left
          sx = x - size;
          sy = y;
          arcCx = x - size;
          arcCy = y;
          startAngle = Math.PI / 2;
          endAngle = 0;
          x -= size;
          break;
        case 3: // Going down
          sx = x;
          sy = y;
          arcCx = x + size;
          arcCy = y + size;
          startAngle = Math.PI;
          endAngle = Math.PI / 2;
          y += size;
          break;
      }

      // Draw square if enabled
      if (showSquares) {
        const x1 = offsetX + sx;
        const y1 = offsetY + sy;
        const x2 = offsetX + sx + size;
        const y2 = offsetY + sy + size;

        yield { type: 'line', x1: x1, y1: y1, x2: x2, y2: y1 };
        yield { type: 'line', x1: x2, y1: y1, x2: x2, y2: y2 };
        yield { type: 'line', x1: x2, y1: y2, x2: x1, y2: y2 };
        yield { type: 'line', x1: x1, y1: y2, x2: x1, y2: y1 };
      }

      // Draw arc (quarter circle) using line segments
      const arcSteps = Math.max(8, Math.floor(size * 200));
      const radius = size;

      for (let j = 0; j < arcSteps; j++) {
        const t1 = startAngle + (endAngle - startAngle) * (j / arcSteps);
        const t2 = startAngle + (endAngle - startAngle) * ((j + 1) / arcSteps);

        const ax1 = offsetX + arcCx + radius * Math.cos(t1);
        const ay1 = offsetY + arcCy + radius * Math.sin(t1);
        const ax2 = offsetX + arcCx + radius * Math.cos(t2);
        const ay2 = offsetY + arcCy + radius * Math.sin(t2);

        yield { type: 'line', x1: ax1, y1: ay1, x2: ax2, y2: ay2 };
      }

      // Rotate direction 90 degrees counter-clockwise
      direction = (direction + 1) % 4;
    }
  }
};

/**
 * All geometric demos exported as an array
 */
export const geometricDemos = [
  spirograph,
  lissajous,
  roseCurve,
  fibonacciSpiral
];

export default geometricDemos;
