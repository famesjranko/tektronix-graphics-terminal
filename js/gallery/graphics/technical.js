/**
 * Technical Gallery Demos
 *
 * Engineering and technical diagrams for the Tektronix gallery.
 * Each demo is a generator function yielding line commands.
 */

/**
 * Helper to draw a basic logic gate symbol
 * Returns generator of line commands
 */
function* drawAndGate(x, y, width, height) {
  const halfH = height / 2;

  // Left side (straight)
  yield { type: 'line', x1: x, y1: y, x2: x, y2: y + height };

  // Top and bottom horizontals to curve start
  yield { type: 'line', x1: x, y1: y, x2: x + width * 0.5, y2: y };
  yield { type: 'line', x1: x, y1: y + height, x2: x + width * 0.5, y2: y + height };

  // Right side curve (semicircle approximation)
  const curveSegments = 12;
  const curveCenter = { x: x + width * 0.5, y: y + halfH };
  const curveRadius = halfH;

  for (let i = 0; i < curveSegments; i++) {
    const a1 = -Math.PI / 2 + (i / curveSegments) * Math.PI;
    const a2 = -Math.PI / 2 + ((i + 1) / curveSegments) * Math.PI;
    yield {
      type: 'line',
      x1: curveCenter.x + curveRadius * Math.cos(a1),
      y1: curveCenter.y + curveRadius * Math.sin(a1),
      x2: curveCenter.x + curveRadius * Math.cos(a2),
      y2: curveCenter.y + curveRadius * Math.sin(a2)
    };
  }
}

function* drawOrGate(x, y, width, height) {
  const halfH = height / 2;

  // Back curve (concave)
  const backSegments = 8;
  for (let i = 0; i < backSegments; i++) {
    const t1 = i / backSegments;
    const t2 = (i + 1) / backSegments;
    const curveDepth = width * 0.15;

    yield {
      type: 'line',
      x1: x + curveDepth * Math.sin(t1 * Math.PI),
      y1: y + t1 * height,
      x2: x + curveDepth * Math.sin(t2 * Math.PI),
      y2: y + t2 * height
    };
  }

  // Top curve to point
  const topSegments = 10;
  for (let i = 0; i < topSegments; i++) {
    const t1 = i / topSegments;
    const t2 = (i + 1) / topSegments;

    const x1 = x + t1 * width;
    const y1 = y + (1 - Math.pow(1 - t1, 2)) * halfH * 0.3;
    const x2 = x + t2 * width;
    const y2 = y + (1 - Math.pow(1 - t2, 2)) * halfH * 0.3;

    yield { type: 'line', x1, y1, x2, y2 };
  }

  // Bottom curve to point
  for (let i = 0; i < topSegments; i++) {
    const t1 = i / topSegments;
    const t2 = (i + 1) / topSegments;

    const x1 = x + t1 * width;
    const y1 = y + height - (1 - Math.pow(1 - t1, 2)) * halfH * 0.3;
    const x2 = x + t2 * width;
    const y2 = y + height - (1 - Math.pow(1 - t2, 2)) * halfH * 0.3;

    yield { type: 'line', x1, y1, x2, y2 };
  }
}

function* drawNotGate(x, y, width, height) {
  const halfH = height / 2;

  // Triangle
  yield { type: 'line', x1: x, y1: y, x2: x + width * 0.8, y2: y + halfH };
  yield { type: 'line', x1: x + width * 0.8, y1: y + halfH, x2: x, y2: y + height };
  yield { type: 'line', x1: x, y1: y + height, x2: x, y2: y };

  // Bubble (small circle at output)
  const bubbleRadius = width * 0.08;
  const bubbleCx = x + width * 0.8 + bubbleRadius;
  const bubbleCy = y + halfH;
  const bubbleSegments = 8;

  for (let i = 0; i < bubbleSegments; i++) {
    const a1 = (i / bubbleSegments) * 2 * Math.PI;
    const a2 = ((i + 1) / bubbleSegments) * 2 * Math.PI;
    yield {
      type: 'line',
      x1: bubbleCx + bubbleRadius * Math.cos(a1),
      y1: bubbleCy + bubbleRadius * Math.sin(a1),
      x2: bubbleCx + bubbleRadius * Math.cos(a2),
      y2: bubbleCy + bubbleRadius * Math.sin(a2)
    };
  }
}

function* drawNandGate(x, y, width, height) {
  // AND gate body
  yield* drawAndGate(x, y, width * 0.85, height);

  // Bubble at output
  const bubbleRadius = width * 0.06;
  const bubbleCx = x + width * 0.85 + bubbleRadius;
  const bubbleCy = y + height / 2;
  const bubbleSegments = 8;

  for (let i = 0; i < bubbleSegments; i++) {
    const a1 = (i / bubbleSegments) * 2 * Math.PI;
    const a2 = ((i + 1) / bubbleSegments) * 2 * Math.PI;
    yield {
      type: 'line',
      x1: bubbleCx + bubbleRadius * Math.cos(a1),
      y1: bubbleCy + bubbleRadius * Math.sin(a1),
      x2: bubbleCx + bubbleRadius * Math.cos(a2),
      y2: bubbleCy + bubbleRadius * Math.sin(a2)
    };
  }
}

/**
 * Circuit schematic generator
 * Draws a simple logic circuit with gates
 */
export const circuitSchematic = {
  id: 'circuit-schematic',
  name: 'Circuit Schematic',
  category: 'technical',
  description: 'Simple logic gate circuit diagram',
  thumbnail: null,
  params: {
    gateSize: { default: 0.08, min: 0.05, max: 0.12, step: 0.01, label: 'Gate size' },
    showLabels: { default: 1, min: 0, max: 1, step: 1, label: 'Show labels (0/1)' }
  },
  *generate(params) {
    const { gateSize, showLabels } = params;
    const gateWidth = gateSize * 1.2;
    const gateHeight = gateSize;

    // Draw frame
    yield { type: 'line', x1: 0.05, y1: 0.05, x2: 0.95, y2: 0.05 };
    yield { type: 'line', x1: 0.95, y1: 0.05, x2: 0.95, y2: 0.95 };
    yield { type: 'line', x1: 0.95, y1: 0.95, x2: 0.05, y2: 0.95 };
    yield { type: 'line', x1: 0.05, y1: 0.95, x2: 0.05, y2: 0.05 };

    // Input lines on left
    const inputY1 = 0.25;
    const inputY2 = 0.45;
    const inputY3 = 0.65;
    const inputY4 = 0.85;

    // Draw input terminals
    for (const y of [inputY1, inputY2, inputY3, inputY4]) {
      yield { type: 'line', x1: 0.08, y1: y, x2: 0.15, y2: y };
      // Input terminal marker
      yield { type: 'line', x1: 0.08, y1: y - 0.01, x2: 0.08, y2: y + 0.01 };
    }

    // First column: two AND gates
    const and1X = 0.18;
    const and1Y = inputY1 - gateHeight / 4;
    yield* drawAndGate(and1X, and1Y, gateWidth, gateHeight);

    // Input wires to first AND
    yield { type: 'line', x1: 0.15, y1: inputY1, x2: and1X, y2: and1Y + gateHeight * 0.25 };
    yield { type: 'line', x1: 0.15, y1: inputY2, x2: and1X, y2: and1Y + gateHeight * 0.75 };

    const and2X = 0.18;
    const and2Y = inputY3 - gateHeight / 4;
    yield* drawAndGate(and2X, and2Y, gateWidth, gateHeight);

    // Input wires to second AND
    yield { type: 'line', x1: 0.15, y1: inputY3, x2: and2X, y2: and2Y + gateHeight * 0.25 };
    yield { type: 'line', x1: 0.15, y1: inputY4, x2: and2X, y2: and2Y + gateHeight * 0.75 };

    // Second column: OR gate combining the ANDs
    const orX = 0.42;
    const orY = 0.40;
    yield* drawOrGate(orX, orY, gateWidth, gateHeight);

    // Wires from AND gates to OR gate
    const and1OutX = and1X + gateWidth * 0.5 + gateHeight / 2;
    const and1OutY = and1Y + gateHeight / 2;
    yield { type: 'line', x1: and1OutX, y1: and1OutY, x2: and1OutX + 0.08, y2: and1OutY };
    yield { type: 'line', x1: and1OutX + 0.08, y1: and1OutY, x2: and1OutX + 0.08, y2: orY + gateHeight * 0.25 };
    yield { type: 'line', x1: and1OutX + 0.08, y1: orY + gateHeight * 0.25, x2: orX, y2: orY + gateHeight * 0.25 };

    const and2OutX = and2X + gateWidth * 0.5 + gateHeight / 2;
    const and2OutY = and2Y + gateHeight / 2;
    yield { type: 'line', x1: and2OutX, y1: and2OutY, x2: and2OutX + 0.08, y2: and2OutY };
    yield { type: 'line', x1: and2OutX + 0.08, y1: and2OutY, x2: and2OutX + 0.08, y2: orY + gateHeight * 0.75 };
    yield { type: 'line', x1: and2OutX + 0.08, y1: orY + gateHeight * 0.75, x2: orX, y2: orY + gateHeight * 0.75 };

    // Third column: NOT gate (inverter)
    const notX = 0.62;
    const notY = orY + gateHeight * 0.1;
    const notHeight = gateHeight * 0.8;
    yield* drawNotGate(notX, notY, gateWidth * 0.8, notHeight);

    // Wire from OR to NOT
    const orOutX = orX + gateWidth;
    yield { type: 'line', x1: orOutX, y1: orY + gateHeight / 2, x2: notX, y2: notY + notHeight / 2 };

    // Output wire
    const notOutX = notX + gateWidth * 0.8 + gateWidth * 0.16;
    yield { type: 'line', x1: notOutX, y1: notY + notHeight / 2, x2: 0.88, y2: notY + notHeight / 2 };

    // Output terminal
    yield { type: 'line', x1: 0.88, y1: notY + notHeight / 2 - 0.015, x2: 0.88, y2: notY + notHeight / 2 + 0.015 };
    yield { type: 'line', x1: 0.88, y1: notY + notHeight / 2 - 0.015, x2: 0.92, y2: notY + notHeight / 2 };
    yield { type: 'line', x1: 0.88, y1: notY + notHeight / 2 + 0.015, x2: 0.92, y2: notY + notHeight / 2 };

    // Ground symbol at bottom
    const groundX = 0.5;
    const groundY = 0.88;
    yield { type: 'line', x1: groundX, y1: groundY - 0.03, x2: groundX, y2: groundY };
    yield { type: 'line', x1: groundX - 0.03, y1: groundY, x2: groundX + 0.03, y2: groundY };
    yield { type: 'line', x1: groundX - 0.02, y1: groundY + 0.01, x2: groundX + 0.02, y2: groundY + 0.01 };
    yield { type: 'line', x1: groundX - 0.01, y1: groundY + 0.02, x2: groundX + 0.01, y2: groundY + 0.02 };

    // Power supply symbol at top
    const vccX = 0.5;
    const vccY = 0.12;
    yield { type: 'line', x1: vccX, y1: vccY, x2: vccX, y2: vccY + 0.03 };
    yield { type: 'line', x1: vccX - 0.02, y1: vccY, x2: vccX + 0.02, y2: vccY };

    // Labels
    if (showLabels) {
      // Simple label markers (underlines)
      yield { type: 'line', x1: 0.08, y1: inputY1 + 0.02, x2: 0.12, y2: inputY1 + 0.02 }; // A
      yield { type: 'line', x1: 0.08, y1: inputY2 + 0.02, x2: 0.12, y2: inputY2 + 0.02 }; // B
      yield { type: 'line', x1: 0.08, y1: inputY3 + 0.02, x2: 0.12, y2: inputY3 + 0.02 }; // C
      yield { type: 'line', x1: 0.08, y1: inputY4 + 0.02, x2: 0.12, y2: inputY4 + 0.02 }; // D
      yield { type: 'line', x1: 0.85, y1: notY + notHeight / 2 + 0.02, x2: 0.90, y2: notY + notHeight / 2 + 0.02 }; // Q
    }

    // Title underline
    yield { type: 'line', x1: 0.30, y1: 0.02, x2: 0.70, y2: 0.02 };
  }
};

/**
 * Oscilloscope waveform generator
 * Displays sine, square, and sawtooth waveforms
 */
export const oscilloscope = {
  id: 'oscilloscope',
  name: 'Oscilloscope',
  category: 'technical',
  description: 'Waveform display with sine, square, and sawtooth',
  thumbnail: null,
  params: {
    waveform: { default: 0, min: 0, max: 2, step: 1, label: 'Wave (0=sin, 1=sq, 2=saw)' },
    frequency: { default: 3, min: 1, max: 8, step: 1, label: 'Frequency' },
    amplitude: { default: 0.8, min: 0.3, max: 1.0, step: 0.1, label: 'Amplitude' }
  },
  *generate(params) {
    const { waveform, frequency, amplitude } = params;

    // Screen bounds (oscilloscope display area)
    const left = 0.12;
    const right = 0.92;
    const top = 0.15;
    const bottom = 0.85;
    const centerY = (top + bottom) / 2;
    const width = right - left;
    const height = bottom - top;

    // Draw oscilloscope frame
    yield { type: 'line', x1: left - 0.02, y1: top - 0.02, x2: right + 0.02, y2: top - 0.02 };
    yield { type: 'line', x1: right + 0.02, y1: top - 0.02, x2: right + 0.02, y2: bottom + 0.02 };
    yield { type: 'line', x1: right + 0.02, y1: bottom + 0.02, x2: left - 0.02, y2: bottom + 0.02 };
    yield { type: 'line', x1: left - 0.02, y1: bottom + 0.02, x2: left - 0.02, y2: top - 0.02 };

    // Draw screen border (inner)
    yield { type: 'line', x1: left, y1: top, x2: right, y2: top };
    yield { type: 'line', x1: right, y1: top, x2: right, y2: bottom };
    yield { type: 'line', x1: right, y1: bottom, x2: left, y2: bottom };
    yield { type: 'line', x1: left, y1: bottom, x2: left, y2: top };

    // Draw grid
    const gridX = 10;
    const gridY = 8;

    // Vertical grid lines (dashed)
    for (let i = 1; i < gridX; i++) {
      const x = left + (i / gridX) * width;
      for (let d = 0; d < 16; d += 2) {
        const y1 = top + (d / 16) * height;
        const y2 = top + ((d + 1) / 16) * height;
        yield { type: 'line', x1: x, y1, x2: x, y2 };
      }
    }

    // Horizontal grid lines (dashed)
    for (let i = 1; i < gridY; i++) {
      const y = top + (i / gridY) * height;
      for (let d = 0; d < 16; d += 2) {
        const x1 = left + (d / 16) * width;
        const x2 = left + ((d + 1) / 16) * width;
        yield { type: 'line', x1, y1: y, x2, y2: y };
      }
    }

    // Center lines (solid, emphasized)
    yield { type: 'line', x1: left, y1: centerY, x2: right, y2: centerY };
    const centerX = (left + right) / 2;
    yield { type: 'line', x1: centerX, y1: top, x2: centerX, y2: bottom };

    // Draw waveform
    const samples = 200;
    const halfHeight = (height / 2) * amplitude * 0.9;

    let prevX = left;
    let prevY = centerY;

    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const x = left + t * width;
      let y;

      const phase = t * frequency * 2 * Math.PI;

      if (waveform === 0) {
        // Sine wave
        y = centerY - Math.sin(phase) * halfHeight;
      } else if (waveform === 1) {
        // Square wave
        const sineVal = Math.sin(phase);
        y = centerY - (sineVal > 0 ? 1 : -1) * halfHeight;
      } else {
        // Sawtooth wave
        const sawPhase = (phase / (2 * Math.PI)) % 1;
        y = centerY - (sawPhase * 2 - 1) * halfHeight;
      }

      if (i > 0) {
        // For square waves, add vertical transitions
        if (waveform === 1 && Math.abs(y - prevY) > halfHeight) {
          yield { type: 'line', x1: prevX, y1: prevY, x2: x, y2: prevY };
          yield { type: 'line', x1: x, y1: prevY, x2: x, y2: y };
        } else {
          yield { type: 'line', x1: prevX, y1: prevY, x2: x, y2: y };
        }
      }

      prevX = x;
      prevY = y;
    }

    // Draw control knobs (decorative circles on sides)
    const knobRadius = 0.02;
    const knobSegments = 10;

    // Left knob (frequency)
    const knob1X = 0.05;
    const knob1Y = 0.30;
    for (let i = 0; i < knobSegments; i++) {
      const a1 = (i / knobSegments) * 2 * Math.PI;
      const a2 = ((i + 1) / knobSegments) * 2 * Math.PI;
      yield {
        type: 'line',
        x1: knob1X + knobRadius * Math.cos(a1),
        y1: knob1Y + knobRadius * Math.sin(a1),
        x2: knob1X + knobRadius * Math.cos(a2),
        y2: knob1Y + knobRadius * Math.sin(a2)
      };
    }
    // Knob indicator line
    const knobAngle = (frequency / 8) * Math.PI - Math.PI / 2;
    yield {
      type: 'line',
      x1: knob1X,
      y1: knob1Y,
      x2: knob1X + knobRadius * 0.7 * Math.cos(knobAngle),
      y2: knob1Y + knobRadius * 0.7 * Math.sin(knobAngle)
    };

    // Right knob (amplitude)
    const knob2X = 0.95;
    const knob2Y = 0.30;
    for (let i = 0; i < knobSegments; i++) {
      const a1 = (i / knobSegments) * 2 * Math.PI;
      const a2 = ((i + 1) / knobSegments) * 2 * Math.PI;
      yield {
        type: 'line',
        x1: knob2X + knobRadius * Math.cos(a1),
        y1: knob2Y + knobRadius * Math.sin(a1),
        x2: knob2X + knobRadius * Math.cos(a2),
        y2: knob2Y + knobRadius * Math.sin(a2)
      };
    }
    const ampAngle = amplitude * Math.PI - Math.PI / 2;
    yield {
      type: 'line',
      x1: knob2X,
      y1: knob2Y,
      x2: knob2X + knobRadius * 0.7 * Math.cos(ampAngle),
      y2: knob2Y + knobRadius * 0.7 * Math.sin(ampAngle)
    };

    // Measurement markers on screen
    // Time division markers
    for (let i = 0; i <= gridX; i++) {
      const x = left + (i / gridX) * width;
      yield { type: 'line', x1: x, y1: bottom + 0.01, x2: x, y2: bottom + 0.02 };
    }

    // Voltage division markers
    for (let i = 0; i <= gridY; i++) {
      const y = top + (i / gridY) * height;
      yield { type: 'line', x1: left - 0.01, y1: y, x2: left - 0.02, y2: y };
    }

    // Title underline
    yield { type: 'line', x1: 0.35, y1: 0.05, x2: 0.65, y2: 0.05 };
  }
};

/**
 * Logic gate diagram generator
 * Shows common logic gates with truth table style layout
 */
export const logicGates = {
  id: 'logic-gates',
  name: 'Logic Gates',
  category: 'technical',
  description: 'Common logic gate symbols diagram',
  thumbnail: null,
  params: {
    gateSize: { default: 0.10, min: 0.06, max: 0.14, step: 0.02, label: 'Gate size' },
    showConnections: { default: 1, min: 0, max: 1, step: 1, label: 'Connections (0/1)' }
  },
  *generate(params) {
    const { gateSize, showConnections } = params;
    const gateWidth = gateSize * 1.3;
    const gateHeight = gateSize;
    const gateSpacingX = 0.30;
    const gateSpacingY = 0.22;

    // Draw frame
    yield { type: 'line', x1: 0.05, y1: 0.05, x2: 0.95, y2: 0.05 };
    yield { type: 'line', x1: 0.95, y1: 0.05, x2: 0.95, y2: 0.95 };
    yield { type: 'line', x1: 0.95, y1: 0.95, x2: 0.05, y2: 0.95 };
    yield { type: 'line', x1: 0.05, y1: 0.95, x2: 0.05, y2: 0.05 };

    // Row 1: AND, OR, NOT
    const row1Y = 0.18;

    // AND gate
    const andX = 0.15;
    yield* drawAndGate(andX, row1Y, gateWidth, gateHeight);
    // Input/output lines
    if (showConnections) {
      yield { type: 'line', x1: andX - 0.05, y1: row1Y + gateHeight * 0.25, x2: andX, y2: row1Y + gateHeight * 0.25 };
      yield { type: 'line', x1: andX - 0.05, y1: row1Y + gateHeight * 0.75, x2: andX, y2: row1Y + gateHeight * 0.75 };
      yield { type: 'line', x1: andX + gateWidth * 0.5 + gateHeight / 2, y1: row1Y + gateHeight / 2, x2: andX + gateWidth + 0.03, y2: row1Y + gateHeight / 2 };
    }
    // Label underline
    yield { type: 'line', x1: andX, y1: row1Y + gateHeight + 0.03, x2: andX + gateWidth * 0.6, y2: row1Y + gateHeight + 0.03 };

    // OR gate
    const orX = 0.15 + gateSpacingX;
    yield* drawOrGate(orX, row1Y, gateWidth, gateHeight);
    if (showConnections) {
      yield { type: 'line', x1: orX - 0.05, y1: row1Y + gateHeight * 0.25, x2: orX + 0.02, y2: row1Y + gateHeight * 0.25 };
      yield { type: 'line', x1: orX - 0.05, y1: row1Y + gateHeight * 0.75, x2: orX + 0.02, y2: row1Y + gateHeight * 0.75 };
      yield { type: 'line', x1: orX + gateWidth, y1: row1Y + gateHeight / 2, x2: orX + gateWidth + 0.03, y2: row1Y + gateHeight / 2 };
    }
    yield { type: 'line', x1: orX, y1: row1Y + gateHeight + 0.03, x2: orX + gateWidth * 0.5, y2: row1Y + gateHeight + 0.03 };

    // NOT gate
    const notX = 0.15 + gateSpacingX * 2;
    yield* drawNotGate(notX, row1Y, gateWidth, gateHeight);
    if (showConnections) {
      yield { type: 'line', x1: notX - 0.05, y1: row1Y + gateHeight / 2, x2: notX, y2: row1Y + gateHeight / 2 };
      yield { type: 'line', x1: notX + gateWidth, y1: row1Y + gateHeight / 2, x2: notX + gateWidth + 0.03, y2: row1Y + gateHeight / 2 };
    }
    yield { type: 'line', x1: notX, y1: row1Y + gateHeight + 0.03, x2: notX + gateWidth * 0.6, y2: row1Y + gateHeight + 0.03 };

    // Row 2: NAND, NOR, XOR
    const row2Y = row1Y + gateSpacingY;

    // NAND gate
    const nandX = 0.15;
    yield* drawNandGate(nandX, row2Y, gateWidth, gateHeight);
    if (showConnections) {
      yield { type: 'line', x1: nandX - 0.05, y1: row2Y + gateHeight * 0.25, x2: nandX, y2: row2Y + gateHeight * 0.25 };
      yield { type: 'line', x1: nandX - 0.05, y1: row2Y + gateHeight * 0.75, x2: nandX, y2: row2Y + gateHeight * 0.75 };
      yield { type: 'line', x1: nandX + gateWidth, y1: row2Y + gateHeight / 2, x2: nandX + gateWidth + 0.03, y2: row2Y + gateHeight / 2 };
    }
    yield { type: 'line', x1: nandX, y1: row2Y + gateHeight + 0.03, x2: nandX + gateWidth * 0.7, y2: row2Y + gateHeight + 0.03 };

    // NOR gate (OR with bubble)
    const norX = 0.15 + gateSpacingX;
    yield* drawOrGate(norX, row2Y, gateWidth * 0.85, gateHeight);
    // Bubble
    const norBubbleRadius = gateWidth * 0.06;
    const norBubbleCx = norX + gateWidth * 0.85 + norBubbleRadius;
    const norBubbleCy = row2Y + gateHeight / 2;
    for (let i = 0; i < 8; i++) {
      const a1 = (i / 8) * 2 * Math.PI;
      const a2 = ((i + 1) / 8) * 2 * Math.PI;
      yield {
        type: 'line',
        x1: norBubbleCx + norBubbleRadius * Math.cos(a1),
        y1: norBubbleCy + norBubbleRadius * Math.sin(a1),
        x2: norBubbleCx + norBubbleRadius * Math.cos(a2),
        y2: norBubbleCy + norBubbleRadius * Math.sin(a2)
      };
    }
    if (showConnections) {
      yield { type: 'line', x1: norX - 0.05, y1: row2Y + gateHeight * 0.25, x2: norX + 0.02, y2: row2Y + gateHeight * 0.25 };
      yield { type: 'line', x1: norX - 0.05, y1: row2Y + gateHeight * 0.75, x2: norX + 0.02, y2: row2Y + gateHeight * 0.75 };
      yield { type: 'line', x1: norX + gateWidth, y1: row2Y + gateHeight / 2, x2: norX + gateWidth + 0.03, y2: row2Y + gateHeight / 2 };
    }
    yield { type: 'line', x1: norX, y1: row2Y + gateHeight + 0.03, x2: norX + gateWidth * 0.5, y2: row2Y + gateHeight + 0.03 };

    // XOR gate (OR with extra curve at back)
    const xorX = 0.15 + gateSpacingX * 2;
    yield* drawOrGate(xorX, row2Y, gateWidth, gateHeight);
    // Extra back curve for XOR
    const xorBackSegments = 8;
    for (let i = 0; i < xorBackSegments; i++) {
      const t1 = i / xorBackSegments;
      const t2 = (i + 1) / xorBackSegments;
      const curveDepth = gateWidth * 0.15;
      const xOffset = -0.02;

      yield {
        type: 'line',
        x1: xorX + xOffset + curveDepth * Math.sin(t1 * Math.PI),
        y1: row2Y + t1 * gateHeight,
        x2: xorX + xOffset + curveDepth * Math.sin(t2 * Math.PI),
        y2: row2Y + t2 * gateHeight
      };
    }
    if (showConnections) {
      yield { type: 'line', x1: xorX - 0.05, y1: row2Y + gateHeight * 0.25, x2: xorX - 0.01, y2: row2Y + gateHeight * 0.25 };
      yield { type: 'line', x1: xorX - 0.05, y1: row2Y + gateHeight * 0.75, x2: xorX - 0.01, y2: row2Y + gateHeight * 0.75 };
      yield { type: 'line', x1: xorX + gateWidth, y1: row2Y + gateHeight / 2, x2: xorX + gateWidth + 0.03, y2: row2Y + gateHeight / 2 };
    }
    yield { type: 'line', x1: xorX, y1: row2Y + gateHeight + 0.03, x2: xorX + gateWidth * 0.5, y2: row2Y + gateHeight + 0.03 };

    // Row 3: Buffer, XNOR, Tri-state
    const row3Y = row2Y + gateSpacingY;

    // Buffer (triangle without bubble)
    const bufX = 0.15;
    const bufHalf = gateHeight / 2;
    yield { type: 'line', x1: bufX, y1: row3Y, x2: bufX + gateWidth * 0.9, y2: row3Y + bufHalf };
    yield { type: 'line', x1: bufX + gateWidth * 0.9, y1: row3Y + bufHalf, x2: bufX, y2: row3Y + gateHeight };
    yield { type: 'line', x1: bufX, y1: row3Y + gateHeight, x2: bufX, y2: row3Y };
    if (showConnections) {
      yield { type: 'line', x1: bufX - 0.05, y1: row3Y + bufHalf, x2: bufX, y2: row3Y + bufHalf };
      yield { type: 'line', x1: bufX + gateWidth * 0.9, y1: row3Y + bufHalf, x2: bufX + gateWidth + 0.03, y2: row3Y + bufHalf };
    }
    yield { type: 'line', x1: bufX, y1: row3Y + gateHeight + 0.03, x2: bufX + gateWidth * 0.5, y2: row3Y + gateHeight + 0.03 };

    // XNOR gate
    const xnorX = 0.15 + gateSpacingX;
    yield* drawOrGate(xnorX, row3Y, gateWidth * 0.85, gateHeight);
    // Back curve
    for (let i = 0; i < xorBackSegments; i++) {
      const t1 = i / xorBackSegments;
      const t2 = (i + 1) / xorBackSegments;
      const curveDepth = gateWidth * 0.15;
      const xOffset = -0.02;

      yield {
        type: 'line',
        x1: xnorX + xOffset + curveDepth * Math.sin(t1 * Math.PI),
        y1: row3Y + t1 * gateHeight,
        x2: xnorX + xOffset + curveDepth * Math.sin(t2 * Math.PI),
        y2: row3Y + t2 * gateHeight
      };
    }
    // Bubble
    const xnorBubbleRadius = gateWidth * 0.06;
    const xnorBubbleCx = xnorX + gateWidth * 0.85 + xnorBubbleRadius;
    const xnorBubbleCy = row3Y + gateHeight / 2;
    for (let i = 0; i < 8; i++) {
      const a1 = (i / 8) * 2 * Math.PI;
      const a2 = ((i + 1) / 8) * 2 * Math.PI;
      yield {
        type: 'line',
        x1: xnorBubbleCx + xnorBubbleRadius * Math.cos(a1),
        y1: xnorBubbleCy + xnorBubbleRadius * Math.sin(a1),
        x2: xnorBubbleCx + xnorBubbleRadius * Math.cos(a2),
        y2: xnorBubbleCy + xnorBubbleRadius * Math.sin(a2)
      };
    }
    if (showConnections) {
      yield { type: 'line', x1: xnorX - 0.05, y1: row3Y + gateHeight * 0.25, x2: xnorX - 0.01, y2: row3Y + gateHeight * 0.25 };
      yield { type: 'line', x1: xnorX - 0.05, y1: row3Y + gateHeight * 0.75, x2: xnorX - 0.01, y2: row3Y + gateHeight * 0.75 };
      yield { type: 'line', x1: xnorX + gateWidth, y1: row3Y + gateHeight / 2, x2: xnorX + gateWidth + 0.03, y2: row3Y + gateHeight / 2 };
    }
    yield { type: 'line', x1: xnorX, y1: row3Y + gateHeight + 0.03, x2: xnorX + gateWidth * 0.6, y2: row3Y + gateHeight + 0.03 };

    // Tri-state buffer (triangle with enable line)
    const triX = 0.15 + gateSpacingX * 2;
    yield { type: 'line', x1: triX, y1: row3Y, x2: triX + gateWidth * 0.9, y2: row3Y + bufHalf };
    yield { type: 'line', x1: triX + gateWidth * 0.9, y1: row3Y + bufHalf, x2: triX, y2: row3Y + gateHeight };
    yield { type: 'line', x1: triX, y1: row3Y + gateHeight, x2: triX, y2: row3Y };
    // Enable input (at top)
    if (showConnections) {
      const enableX = triX + gateWidth * 0.45;
      yield { type: 'line', x1: enableX, y1: row3Y - 0.04, x2: enableX, y2: row3Y + bufHalf * 0.5 };
      yield { type: 'line', x1: triX - 0.05, y1: row3Y + bufHalf, x2: triX, y2: row3Y + bufHalf };
      yield { type: 'line', x1: triX + gateWidth * 0.9, y1: row3Y + bufHalf, x2: triX + gateWidth + 0.03, y2: row3Y + bufHalf };
    }
    yield { type: 'line', x1: triX, y1: row3Y + gateHeight + 0.03, x2: triX + gateWidth * 0.6, y2: row3Y + gateHeight + 0.03 };

    // Title underline
    yield { type: 'line', x1: 0.30, y1: 0.08, x2: 0.70, y2: 0.08 };
  }
};

/**
 * Block diagram generator
 * System architecture style diagram with boxes and connections
 */
export const blockDiagram = {
  id: 'block-diagram',
  name: 'Block Diagram',
  category: 'technical',
  description: 'System architecture with connected blocks',
  thumbnail: null,
  params: {
    complexity: { default: 1, min: 0, max: 2, step: 1, label: 'Detail (0=simple, 2=full)' },
    showArrows: { default: 1, min: 0, max: 1, step: 1, label: 'Arrows (0/1)' }
  },
  *generate(params) {
    const { complexity, showArrows } = params;

    // Draw frame
    yield { type: 'line', x1: 0.03, y1: 0.03, x2: 0.97, y2: 0.03 };
    yield { type: 'line', x1: 0.97, y1: 0.03, x2: 0.97, y2: 0.97 };
    yield { type: 'line', x1: 0.97, y1: 0.97, x2: 0.03, y2: 0.97 };
    yield { type: 'line', x1: 0.03, y1: 0.97, x2: 0.03, y2: 0.03 };

    // Helper function to draw a box with label line
    function* drawBox(x, y, w, h, hasLabel = true) {
      yield { type: 'line', x1: x, y1: y, x2: x + w, y2: y };
      yield { type: 'line', x1: x + w, y1: y, x2: x + w, y2: y + h };
      yield { type: 'line', x1: x + w, y1: y + h, x2: x, y2: y + h };
      yield { type: 'line', x1: x, y1: y + h, x2: x, y2: y };

      // Label line inside box (centered underline)
      if (hasLabel) {
        const labelY = y + h * 0.55;
        yield { type: 'line', x1: x + w * 0.2, y1: labelY, x2: x + w * 0.8, y2: labelY };
      }
    }

    // Helper function to draw arrow
    function* drawArrow(x1, y1, x2, y2) {
      yield { type: 'line', x1, y1, x2, y2 };

      if (showArrows) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const arrowLen = 0.015;
        const arrowAngle = 0.5;

        yield {
          type: 'line',
          x1: x2,
          y1: y2,
          x2: x2 - arrowLen * Math.cos(angle - arrowAngle),
          y2: y2 - arrowLen * Math.sin(angle - arrowAngle)
        };
        yield {
          type: 'line',
          x1: x2,
          y1: y2,
          x2: x2 - arrowLen * Math.cos(angle + arrowAngle),
          y2: y2 - arrowLen * Math.sin(angle + arrowAngle)
        };
      }
    }

    // Main architecture blocks
    const boxW = 0.15;
    const boxH = 0.08;

    // Top row: Input sources
    // Input 1
    const input1X = 0.08;
    const input1Y = 0.12;
    yield* drawBox(input1X, input1Y, boxW, boxH);

    // Input 2
    const input2X = 0.08;
    const input2Y = 0.28;
    yield* drawBox(input2X, input2Y, boxW, boxH);

    // Central processing block (larger)
    const cpuX = 0.35;
    const cpuY = 0.15;
    const cpuW = 0.25;
    const cpuH = 0.18;
    yield* drawBox(cpuX, cpuY, cpuW, cpuH);

    // Internal detail for CPU block
    if (complexity >= 1) {
      // Divider lines inside CPU
      yield { type: 'line', x1: cpuX + cpuW * 0.33, y1: cpuY + 0.02, x2: cpuX + cpuW * 0.33, y2: cpuY + cpuH - 0.02 };
      yield { type: 'line', x1: cpuX + cpuW * 0.66, y1: cpuY + 0.02, x2: cpuX + cpuW * 0.66, y2: cpuY + cpuH - 0.02 };
    }

    // Memory block
    const memX = 0.38;
    const memY = 0.40;
    const memW = 0.18;
    const memH = 0.12;
    yield* drawBox(memX, memY, memW, memH);

    // Memory lines (indicating stack/storage)
    if (complexity >= 1) {
      for (let i = 1; i < 4; i++) {
        const lineY = memY + (i / 4) * memH;
        yield { type: 'line', x1: memX + 0.02, y1: lineY, x2: memX + memW - 0.02, y2: lineY };
      }
    }

    // Output blocks
    const out1X = 0.72;
    const out1Y = 0.12;
    yield* drawBox(out1X, out1Y, boxW, boxH);

    const out2X = 0.72;
    const out2Y = 0.28;
    yield* drawBox(out2X, out2Y, boxW, boxH);

    // Connections
    // Input 1 to CPU
    yield* drawArrow(input1X + boxW, input1Y + boxH / 2, cpuX, cpuY + cpuH * 0.3);

    // Input 2 to CPU
    yield* drawArrow(input2X + boxW, input2Y + boxH / 2, cpuX, cpuY + cpuH * 0.7);

    // CPU to outputs
    yield* drawArrow(cpuX + cpuW, cpuY + cpuH * 0.3, out1X, out1Y + boxH / 2);
    yield* drawArrow(cpuX + cpuW, cpuY + cpuH * 0.7, out2X, out2Y + boxH / 2);

    // CPU to memory (bidirectional)
    const memConnX = cpuX + cpuW / 2;
    yield* drawArrow(memConnX - 0.02, cpuY + cpuH, memConnX - 0.02, memY);
    yield* drawArrow(memConnX + 0.02, memY, memConnX + 0.02, cpuY + cpuH);

    // Bottom section: Additional components
    if (complexity >= 1) {
      // I/O Controller
      const ioX = 0.10;
      const ioY = 0.60;
      const ioW = 0.20;
      const ioH = 0.12;
      yield* drawBox(ioX, ioY, ioW, ioH);

      // Bus lines
      const busY = 0.56;
      yield { type: 'line', x1: 0.08, y1: busY, x2: 0.90, y2: busY };
      yield { type: 'line', x1: 0.08, y1: busY + 0.015, x2: 0.90, y2: busY + 0.015 };

      // Bus connection to memory
      yield { type: 'line', x1: memX + memW / 2, y1: memY + memH, x2: memX + memW / 2, y2: busY };

      // Storage block
      const storageX = 0.40;
      const storageY = 0.65;
      const storageW = 0.16;
      const storageH = 0.12;
      yield* drawBox(storageX, storageY, storageW, storageH);

      // Storage cylinder hint
      const cylTop = storageY + 0.02;
      const cylSegments = 10;
      for (let i = 0; i < cylSegments; i++) {
        const t1 = i / cylSegments;
        const t2 = (i + 1) / cylSegments;
        const cx = storageX + storageW / 2;
        const rx = storageW * 0.35;
        const ry = 0.015;

        yield {
          type: 'line',
          x1: cx + rx * Math.cos(t1 * Math.PI * 2),
          y1: cylTop + ry * Math.sin(t1 * Math.PI * 2),
          x2: cx + rx * Math.cos(t2 * Math.PI * 2),
          y2: cylTop + ry * Math.sin(t2 * Math.PI * 2)
        };
      }

      // Connection from bus to storage
      yield { type: 'line', x1: storageX + storageW / 2, y1: busY + 0.015, x2: storageX + storageW / 2, y2: storageY };

      // Network block
      const netX = 0.68;
      const netY = 0.60;
      const netW = 0.18;
      const netH = 0.12;
      yield* drawBox(netX, netY, netW, netH);

      // Network cloud hint
      if (complexity >= 2) {
        const cloudCx = netX + netW / 2;
        const cloudCy = netY + netH / 2 - 0.01;
        const cloudR = 0.025;

        // Draw cloud bumps
        for (let bump = 0; bump < 5; bump++) {
          const bumpAngle = (bump / 5) * Math.PI + Math.PI;
          const bumpCx = cloudCx + cloudR * 0.7 * Math.cos(bumpAngle);
          const bumpCy = cloudCy + cloudR * 0.3 * Math.sin(bumpAngle);

          for (let i = 0; i < 6; i++) {
            const a1 = (i / 6) * Math.PI * 2;
            const a2 = ((i + 1) / 6) * Math.PI * 2;
            yield {
              type: 'line',
              x1: bumpCx + cloudR * 0.4 * Math.cos(a1),
              y1: bumpCy + cloudR * 0.3 * Math.sin(a1),
              x2: bumpCx + cloudR * 0.4 * Math.cos(a2),
              y2: bumpCy + cloudR * 0.3 * Math.sin(a2)
            };
          }
        }
      }

      // Connection from bus to network
      yield { type: 'line', x1: netX + netW / 2, y1: busY + 0.015, x2: netX + netW / 2, y2: netY };
    }

    // Full complexity: Add peripheral devices
    if (complexity >= 2) {
      // Keyboard/input device hint
      const kbX = 0.08;
      const kbY = 0.82;
      const kbW = 0.12;
      const kbH = 0.06;
      yield* drawBox(kbX, kbY, kbW, kbH, false);
      // Key grid
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 4; col++) {
          const keyX = kbX + 0.01 + col * 0.028;
          const keyY = kbY + 0.01 + row * 0.025;
          yield { type: 'line', x1: keyX, y1: keyY, x2: keyX + 0.02, y2: keyY };
          yield { type: 'line', x1: keyX + 0.02, y1: keyY, x2: keyX + 0.02, y2: keyY + 0.018 };
          yield { type: 'line', x1: keyX + 0.02, y1: keyY + 0.018, x2: keyX, y2: keyY + 0.018 };
          yield { type: 'line', x1: keyX, y1: keyY + 0.018, x2: keyX, y2: keyY };
        }
      }

      // Monitor/display hint
      const monX = 0.78;
      const monY = 0.80;
      const monW = 0.12;
      const monH = 0.10;
      yield* drawBox(monX, monY, monW, monH, false);
      // Screen
      yield { type: 'line', x1: monX + 0.015, y1: monY + 0.015, x2: monX + monW - 0.015, y2: monY + 0.015 };
      yield { type: 'line', x1: monX + monW - 0.015, y1: monY + 0.015, x2: monX + monW - 0.015, y2: monY + monH - 0.025 };
      yield { type: 'line', x1: monX + monW - 0.015, y1: monY + monH - 0.025, x2: monX + 0.015, y2: monY + monH - 0.025 };
      yield { type: 'line', x1: monX + 0.015, y1: monY + monH - 0.025, x2: monX + 0.015, y2: monY + 0.015 };
      // Stand
      yield { type: 'line', x1: monX + monW / 2 - 0.015, y1: monY + monH, x2: monX + monW / 2 + 0.015, y2: monY + monH };

      // Connection lines to I/O controller
      yield { type: 'line', x1: kbX + kbW, y1: kbY + kbH / 2, x2: kbX + kbW + 0.03, y2: kbY + kbH / 2 };
      yield { type: 'line', x1: kbX + kbW + 0.03, y1: kbY + kbH / 2, x2: kbX + kbW + 0.03, y2: 0.72 };

      yield { type: 'line', x1: netX + netW, y1: netY + netH / 2, x2: netX + netW + 0.02, y2: netY + netH / 2 };
      yield { type: 'line', x1: netX + netW + 0.02, y1: netY + netH / 2, x2: netX + netW + 0.02, y2: monY + monH / 2 };
      yield { type: 'line', x1: netX + netW + 0.02, y1: monY + monH / 2, x2: monX, y2: monY + monH / 2 };
    }

    // Title underline
    yield { type: 'line', x1: 0.30, y1: 0.06, x2: 0.70, y2: 0.06 };
  }
};

/**
 * All technical demos exported as an array
 */
export const technicalDemos = [
  circuitSchematic,
  oscilloscope,
  logicGates,
  blockDiagram
];

export default technicalDemos;
