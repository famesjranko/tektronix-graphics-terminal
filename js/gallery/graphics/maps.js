/**
 * Maps and Astronomy Gallery Demos
 *
 * Geographic and space-themed demos for the Tektronix gallery.
 * Each demo is a generator function yielding line commands.
 */

/**
 * Simplified world continent outlines
 * Coordinates in normalized 0-1 range, centered
 */
const WORLD_CONTINENTS = {
  // North America (simplified)
  northAmerica: [
    [0.12, 0.25], [0.10, 0.30], [0.08, 0.35], [0.10, 0.40], [0.12, 0.45],
    [0.15, 0.48], [0.20, 0.50], [0.25, 0.52], [0.28, 0.50], [0.30, 0.45],
    [0.28, 0.40], [0.25, 0.35], [0.22, 0.32], [0.18, 0.28], [0.15, 0.25],
    [0.12, 0.25]
  ],
  // South America (simplified)
  southAmerica: [
    [0.25, 0.52], [0.28, 0.55], [0.30, 0.60], [0.32, 0.65], [0.30, 0.72],
    [0.28, 0.78], [0.25, 0.82], [0.22, 0.78], [0.20, 0.72], [0.22, 0.65],
    [0.23, 0.58], [0.25, 0.52]
  ],
  // Europe (simplified)
  europe: [
    [0.45, 0.28], [0.48, 0.25], [0.52, 0.24], [0.55, 0.26], [0.58, 0.28],
    [0.56, 0.32], [0.54, 0.35], [0.52, 0.38], [0.48, 0.40], [0.45, 0.38],
    [0.43, 0.35], [0.44, 0.30], [0.45, 0.28]
  ],
  // Africa (simplified)
  africa: [
    [0.45, 0.42], [0.48, 0.40], [0.52, 0.42], [0.55, 0.45], [0.58, 0.50],
    [0.60, 0.55], [0.58, 0.62], [0.55, 0.68], [0.52, 0.72], [0.48, 0.70],
    [0.45, 0.65], [0.44, 0.58], [0.43, 0.50], [0.45, 0.42]
  ],
  // Asia (simplified)
  asia: [
    [0.58, 0.28], [0.62, 0.25], [0.68, 0.22], [0.75, 0.25], [0.82, 0.28],
    [0.88, 0.32], [0.90, 0.38], [0.88, 0.45], [0.82, 0.50], [0.75, 0.48],
    [0.68, 0.45], [0.65, 0.42], [0.62, 0.38], [0.58, 0.35], [0.58, 0.28]
  ],
  // Australia (simplified)
  australia: [
    [0.78, 0.62], [0.82, 0.60], [0.88, 0.62], [0.90, 0.68], [0.88, 0.72],
    [0.82, 0.75], [0.78, 0.72], [0.76, 0.68], [0.78, 0.62]
  ]
};

/**
 * Simplified USA state boundaries
 * Major state outlines only for stylized effect
 */
const USA_STATES = {
  // Continental outline
  outline: [
    [0.08, 0.35], [0.12, 0.30], [0.18, 0.28], [0.25, 0.30], [0.32, 0.28],
    [0.40, 0.30], [0.50, 0.28], [0.58, 0.30], [0.68, 0.28], [0.78, 0.30],
    [0.85, 0.32], [0.90, 0.35], [0.92, 0.40], [0.90, 0.48], [0.85, 0.55],
    [0.78, 0.60], [0.70, 0.65], [0.60, 0.68], [0.50, 0.70], [0.40, 0.68],
    [0.30, 0.65], [0.22, 0.60], [0.15, 0.55], [0.10, 0.50], [0.08, 0.45],
    [0.08, 0.35]
  ],
  // Internal state-like divisions (stylized grid)
  divisions: [
    // Vertical divisions
    [[0.25, 0.30], [0.25, 0.65]],
    [[0.40, 0.30], [0.40, 0.68]],
    [[0.55, 0.28], [0.55, 0.70]],
    [[0.70, 0.28], [0.70, 0.65]],
    // Horizontal divisions
    [[0.08, 0.42], [0.92, 0.42]],
    [[0.08, 0.52], [0.90, 0.52]],
    // Mountain range hint (Rockies)
    [[0.28, 0.32], [0.32, 0.40], [0.30, 0.48], [0.33, 0.55]],
    // Great Lakes hint
    [[0.58, 0.32], [0.62, 0.35], [0.65, 0.33], [0.68, 0.36]]
  ],
  // Major cities (as small markers)
  cities: [
    { x: 0.85, y: 0.38, name: 'NYC' },
    { x: 0.15, y: 0.42, name: 'LA' },
    { x: 0.60, y: 0.40, name: 'CHI' },
    { x: 0.75, y: 0.55, name: 'ATL' },
    { x: 0.20, y: 0.35, name: 'SF' }
  ]
};

/**
 * Solar system orbital data
 * Simplified orbital radii (normalized, not to actual scale)
 */
const SOLAR_SYSTEM = {
  sun: { radius: 0.03 },
  planets: [
    { name: 'Mercury', orbit: 0.08, size: 0.004, period: 0.24 },
    { name: 'Venus', orbit: 0.12, size: 0.006, period: 0.62 },
    { name: 'Earth', orbit: 0.17, size: 0.006, period: 1.0 },
    { name: 'Mars', orbit: 0.22, size: 0.005, period: 1.88 },
    { name: 'Jupiter', orbit: 0.30, size: 0.015, period: 11.86 },
    { name: 'Saturn', orbit: 0.38, size: 0.012, period: 29.46 }
  ]
};

/**
 * World map generator
 * Draws simplified continent outlines
 */
export const worldMap = {
  id: 'world-map',
  name: 'World Map',
  category: 'maps',
  description: 'Simplified world continent outlines',
  thumbnail: null,
  params: {
    showGrid: { default: 1, min: 0, max: 1, step: 1, label: 'Show grid (0/1)' },
    showLabels: { default: 0, min: 0, max: 1, step: 1, label: 'Show markers (0/1)' }
  },
  *generate(params) {
    const { showGrid, showLabels } = params;

    // Chart bounds with padding
    const padding = 0.05;
    const left = padding;
    const right = 1 - padding;
    const top = padding + 0.05;
    const bottom = 0.9;

    // Draw map frame
    yield { type: 'line', x1: left, y1: top, x2: right, y2: top };
    yield { type: 'line', x1: right, y1: top, x2: right, y2: bottom };
    yield { type: 'line', x1: right, y1: bottom, x2: left, y2: bottom };
    yield { type: 'line', x1: left, y1: bottom, x2: left, y2: top };

    // Draw latitude/longitude grid
    if (showGrid) {
      const gridLines = 6;
      // Longitude lines (vertical)
      for (let i = 1; i < gridLines; i++) {
        const x = left + (i / gridLines) * (right - left);
        // Dashed line
        for (let d = 0; d < 12; d += 2) {
          const y1 = top + (d / 12) * (bottom - top);
          const y2 = top + ((d + 1) / 12) * (bottom - top);
          yield { type: 'line', x1: x, y1, x2: x, y2 };
        }
      }
      // Latitude lines (horizontal)
      for (let i = 1; i < 5; i++) {
        const y = top + (i / 5) * (bottom - top);
        // Dashed line
        for (let d = 0; d < 12; d += 2) {
          const x1 = left + (d / 12) * (right - left);
          const x2 = left + ((d + 1) / 12) * (right - left);
          yield { type: 'line', x1, y1: y, x2, y2: y };
        }
      }
      // Equator (solid)
      const equatorY = top + 0.5 * (bottom - top);
      yield { type: 'line', x1: left, y1: equatorY, x2: right, y2: equatorY };
    }

    // Draw each continent
    for (const [name, points] of Object.entries(WORLD_CONTINENTS)) {
      // Scale and position points to fit map area
      const scaledPoints = points.map(([x, y]) => ({
        x: left + x * (right - left),
        y: top + y * (bottom - top)
      }));

      // Draw continent outline
      for (let i = 0; i < scaledPoints.length - 1; i++) {
        yield {
          type: 'line',
          x1: scaledPoints[i].x,
          y1: scaledPoints[i].y,
          x2: scaledPoints[i + 1].x,
          y2: scaledPoints[i + 1].y
        };
      }
    }

    // Draw small markers for continent centers
    if (showLabels) {
      const centers = [
        { x: 0.18, y: 0.38 },  // North America
        { x: 0.26, y: 0.68 },  // South America
        { x: 0.50, y: 0.32 },  // Europe
        { x: 0.52, y: 0.55 },  // Africa
        { x: 0.72, y: 0.38 },  // Asia
        { x: 0.84, y: 0.68 }   // Australia
      ];

      for (const center of centers) {
        const cx = left + center.x * (right - left);
        const cy = top + center.y * (bottom - top);
        const size = 0.008;

        // Draw X marker
        yield { type: 'line', x1: cx - size, y1: cy - size, x2: cx + size, y2: cy + size };
        yield { type: 'line', x1: cx - size, y1: cy + size, x2: cx + size, y2: cy - size };
      }
    }

    // Title indicator
    yield { type: 'line', x1: 0.35, y1: 0.03, x2: 0.65, y2: 0.03 };
  }
};

/**
 * USA states map generator
 * Draws simplified US boundaries with state divisions
 */
export const usaMap = {
  id: 'usa-map',
  name: 'USA States',
  category: 'maps',
  description: 'Simplified US state boundaries',
  thumbnail: null,
  params: {
    showCities: { default: 1, min: 0, max: 1, step: 1, label: 'Show cities (0/1)' },
    showDivisions: { default: 1, min: 0, max: 1, step: 1, label: 'Show states (0/1)' }
  },
  *generate(params) {
    const { showCities, showDivisions } = params;

    // Map bounds
    const padding = 0.08;
    const left = padding;
    const right = 1 - padding;
    const top = 0.12;
    const bottom = 0.88;
    const width = right - left;
    const height = bottom - top;

    // Scale outline points to fit
    const scalePoint = ([x, y]) => ({
      x: left + x * width,
      y: top + y * height
    });

    // Draw continental outline
    const outline = USA_STATES.outline.map(scalePoint);
    for (let i = 0; i < outline.length - 1; i++) {
      yield {
        type: 'line',
        x1: outline[i].x,
        y1: outline[i].y,
        x2: outline[i + 1].x,
        y2: outline[i + 1].y
      };
    }

    // Draw state divisions
    if (showDivisions) {
      for (const division of USA_STATES.divisions) {
        const points = division.map(scalePoint);
        for (let i = 0; i < points.length - 1; i++) {
          // Dashed style for internal borders
          const dx = points[i + 1].x - points[i].x;
          const dy = points[i + 1].y - points[i].y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const dashCount = Math.max(4, Math.floor(len * 40));

          for (let d = 0; d < dashCount; d += 2) {
            const t1 = d / dashCount;
            const t2 = (d + 1) / dashCount;
            yield {
              type: 'line',
              x1: points[i].x + t1 * dx,
              y1: points[i].y + t1 * dy,
              x2: points[i].x + t2 * dx,
              y2: points[i].y + t2 * dy
            };
          }
        }
      }
    }

    // Draw city markers
    if (showCities) {
      for (const city of USA_STATES.cities) {
        const cx = left + city.x * width;
        const cy = top + city.y * height;
        const size = 0.012;

        // Draw circle marker (octagon)
        const segments = 8;
        for (let i = 0; i < segments; i++) {
          const a1 = (i / segments) * 2 * Math.PI;
          const a2 = ((i + 1) / segments) * 2 * Math.PI;
          yield {
            type: 'line',
            x1: cx + size * Math.cos(a1),
            y1: cy + size * Math.sin(a1),
            x2: cx + size * Math.cos(a2),
            y2: cy + size * Math.sin(a2)
          };
        }

        // Draw dot in center
        yield { type: 'line', x1: cx - 0.002, y1: cy, x2: cx + 0.002, y2: cy };
      }
    }

    // Draw Alaska and Hawaii hints (small boxes)
    // Alaska
    const alaskaLeft = left + 0.02;
    const alaskaTop = bottom - 0.20;
    yield { type: 'line', x1: alaskaLeft, y1: alaskaTop, x2: alaskaLeft + 0.12, y2: alaskaTop };
    yield { type: 'line', x1: alaskaLeft + 0.12, y1: alaskaTop, x2: alaskaLeft + 0.10, y2: alaskaTop + 0.10 };
    yield { type: 'line', x1: alaskaLeft + 0.10, y1: alaskaTop + 0.10, x2: alaskaLeft, y2: alaskaTop + 0.08 };
    yield { type: 'line', x1: alaskaLeft, y1: alaskaTop + 0.08, x2: alaskaLeft, y2: alaskaTop };

    // Hawaii
    const hawaiiLeft = left + 0.18;
    const hawaiiTop = bottom - 0.12;
    // Draw small island chain
    for (let i = 0; i < 4; i++) {
      const ix = hawaiiLeft + i * 0.025;
      const iy = hawaiiTop + (i % 2) * 0.015;
      const isize = 0.008 - i * 0.001;
      yield { type: 'line', x1: ix, y1: iy, x2: ix + isize, y2: iy };
      yield { type: 'line', x1: ix + isize, y1: iy, x2: ix + isize, y2: iy + isize };
      yield { type: 'line', x1: ix + isize, y1: iy + isize, x2: ix, y2: iy + isize };
      yield { type: 'line', x1: ix, y1: iy + isize, x2: ix, y2: iy };
    }

    // Title line
    yield { type: 'line', x1: 0.38, y1: 0.05, x2: 0.62, y2: 0.05 };
  }
};

/**
 * 3D rotation helper
 */
function rotateY3D(point, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: point.x * cos + point.z * sin,
    y: point.y,
    z: -point.x * sin + point.z * cos
  };
}

function rotateX3D(point, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: point.x,
    y: point.y * cos - point.z * sin,
    z: point.y * sin + point.z * cos
  };
}

/**
 * Project 3D point to 2D
 */
function project3D(point, fov, distance) {
  const scale = fov / (distance + point.z);
  return {
    x: 0.5 + point.x * scale,
    y: 0.5 + point.y * scale,
    z: point.z // Keep z for visibility sorting
  };
}

/**
 * Earth globe generator
 * Wireframe sphere with continent hints
 */
export const earthGlobe = {
  id: 'earth-globe',
  name: 'Earth Globe',
  category: 'maps',
  description: 'Wireframe sphere with continent hints',
  thumbnail: null,
  params: {
    rotationY: { default: 0.5, min: 0, max: 6.28, step: 0.1, label: 'Y Rotation' },
    rotationX: { default: 0.3, min: 0, max: 6.28, step: 0.1, label: 'X Rotation' },
    showContinents: { default: 1, min: 0, max: 1, step: 1, label: 'Continents (0/1)' }
  },
  *generate(params) {
    const { rotationY, rotationX, showContinents } = params;
    const radius = 0.35;
    const latLines = 6;
    const lonLines = 12;
    const segments = 24;

    // Draw latitude lines (horizontal circles)
    for (let lat = 1; lat < latLines; lat++) {
      const phi = (lat / latLines) * Math.PI;
      const y = radius * Math.cos(phi);
      const latRadius = radius * Math.sin(phi);

      let prevPoint = null;

      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * 2 * Math.PI;
        let point = {
          x: latRadius * Math.cos(theta),
          y: y,
          z: latRadius * Math.sin(theta)
        };

        point = rotateX3D(point, rotationX);
        point = rotateY3D(point, rotationY);

        const projected = project3D(point, 0.5, 1.5);

        if (prevPoint && point.z < 0.1) { // Only draw front-facing
          yield {
            type: 'line',
            x1: prevPoint.x,
            y1: prevPoint.y,
            x2: projected.x,
            y2: projected.y
          };
        }

        prevPoint = projected;
      }
    }

    // Draw longitude lines (vertical circles)
    for (let lon = 0; lon < lonLines; lon++) {
      const theta = (lon / lonLines) * 2 * Math.PI;

      let prevPoint = null;
      let prevZ = 0;

      for (let i = 0; i <= segments; i++) {
        const phi = (i / segments) * Math.PI;
        let point = {
          x: radius * Math.sin(phi) * Math.cos(theta),
          y: radius * Math.cos(phi),
          z: radius * Math.sin(phi) * Math.sin(theta)
        };

        const origZ = point.z;
        point = rotateX3D(point, rotationX);
        point = rotateY3D(point, rotationY);

        const projected = project3D(point, 0.5, 1.5);

        if (prevPoint && point.z < 0.1) {
          yield {
            type: 'line',
            x1: prevPoint.x,
            y1: prevPoint.y,
            x2: projected.x,
            y2: projected.y
          };
        }

        prevPoint = projected;
        prevZ = point.z;
      }
    }

    // Draw continent hints (simplified land masses on sphere surface)
    if (showContinents) {
      // Simplified continent outlines projected onto sphere
      const continentHints = [
        // North America hint
        [
          { lat: 50, lon: -120 }, { lat: 45, lon: -100 }, { lat: 35, lon: -90 },
          { lat: 30, lon: -85 }, { lat: 25, lon: -80 }, { lat: 30, lon: -100 },
          { lat: 40, lon: -115 }, { lat: 50, lon: -120 }
        ],
        // Europe hint
        [
          { lat: 55, lon: 0 }, { lat: 50, lon: 10 }, { lat: 45, lon: 15 },
          { lat: 40, lon: 10 }, { lat: 45, lon: -5 }, { lat: 55, lon: 0 }
        ],
        // Africa hint
        [
          { lat: 30, lon: 0 }, { lat: 20, lon: 20 }, { lat: 0, lon: 25 },
          { lat: -20, lon: 25 }, { lat: -30, lon: 20 }, { lat: -25, lon: 15 },
          { lat: -10, lon: 10 }, { lat: 10, lon: -10 }, { lat: 30, lon: 0 }
        ],
        // South America hint
        [
          { lat: 10, lon: -70 }, { lat: 0, lon: -50 }, { lat: -15, lon: -45 },
          { lat: -30, lon: -55 }, { lat: -45, lon: -65 }, { lat: -30, lon: -70 },
          { lat: -10, lon: -75 }, { lat: 10, lon: -70 }
        ]
      ];

      for (const continent of continentHints) {
        let prevPoint = null;
        let allVisible = true;

        // Convert lat/lon to 3D points and check visibility
        const points3D = continent.map(({ lat, lon }) => {
          const phi = (90 - lat) * Math.PI / 180;
          const theta = lon * Math.PI / 180;

          let point = {
            x: radius * Math.sin(phi) * Math.cos(theta),
            y: radius * Math.cos(phi),
            z: radius * Math.sin(phi) * Math.sin(theta)
          };

          point = rotateX3D(point, rotationX);
          point = rotateY3D(point, rotationY);

          return { point, projected: project3D(point, 0.5, 1.5) };
        });

        // Draw continent outline
        for (let i = 0; i < points3D.length; i++) {
          const current = points3D[i];
          const next = points3D[(i + 1) % points3D.length];

          // Only draw if both points are on visible side
          if (current.point.z < 0.15 && next.point.z < 0.15) {
            yield {
              type: 'line',
              x1: current.projected.x,
              y1: current.projected.y,
              x2: next.projected.x,
              y2: next.projected.y
            };
          }
        }
      }
    }

    // Draw globe outline (equator emphasized)
    const equatorSegments = 48;
    let prevEq = null;
    for (let i = 0; i <= equatorSegments; i++) {
      const theta = (i / equatorSegments) * 2 * Math.PI;
      let point = {
        x: radius * Math.cos(theta),
        y: 0,
        z: radius * Math.sin(theta)
      };

      point = rotateX3D(point, rotationX);
      point = rotateY3D(point, rotationY);

      const projected = project3D(point, 0.5, 1.5);

      if (prevEq) {
        yield {
          type: 'line',
          x1: prevEq.x,
          y1: prevEq.y,
          x2: projected.x,
          y2: projected.y
        };
      }

      prevEq = projected;
    }
  }
};

/**
 * Solar system generator
 * Shows planetary orbits and planet positions
 */
export const solarSystem = {
  id: 'solar-system',
  name: 'Solar System',
  category: 'maps',
  description: 'Planetary orbits and positions',
  thumbnail: null,
  params: {
    time: { default: 0, min: 0, max: 6.28, step: 0.1, label: 'Time (rotation)' },
    showOrbits: { default: 1, min: 0, max: 1, step: 1, label: 'Show orbits (0/1)' },
    showLabels: { default: 0, min: 0, max: 1, step: 1, label: 'Show labels (0/1)' }
  },
  *generate(params) {
    const { time, showOrbits, showLabels } = params;
    const cx = 0.5;
    const cy = 0.5;

    // Draw Sun
    const sunRadius = SOLAR_SYSTEM.sun.radius;
    const sunSegments = 16;
    for (let i = 0; i < sunSegments; i++) {
      const a1 = (i / sunSegments) * 2 * Math.PI;
      const a2 = ((i + 1) / sunSegments) * 2 * Math.PI;
      yield {
        type: 'line',
        x1: cx + sunRadius * Math.cos(a1),
        y1: cy + sunRadius * Math.sin(a1),
        x2: cx + sunRadius * Math.cos(a2),
        y2: cy + sunRadius * Math.sin(a2)
      };
    }

    // Draw sun rays
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * 2 * Math.PI;
      const innerR = sunRadius * 1.1;
      const outerR = sunRadius * 1.4;
      yield {
        type: 'line',
        x1: cx + innerR * Math.cos(angle),
        y1: cy + innerR * Math.sin(angle),
        x2: cx + outerR * Math.cos(angle),
        y2: cy + outerR * Math.sin(angle)
      };
    }

    // Draw planets and orbits
    for (const planet of SOLAR_SYSTEM.planets) {
      // Draw orbit
      if (showOrbits) {
        const orbitSegments = 48;
        for (let i = 0; i < orbitSegments; i++) {
          const a1 = (i / orbitSegments) * 2 * Math.PI;
          const a2 = ((i + 1) / orbitSegments) * 2 * Math.PI;

          // Dashed orbit for outer planets
          if (planet.orbit > 0.25 && i % 2 === 1) continue;

          yield {
            type: 'line',
            x1: cx + planet.orbit * Math.cos(a1),
            y1: cy + planet.orbit * Math.sin(a1),
            x2: cx + planet.orbit * Math.cos(a2),
            y2: cy + planet.orbit * Math.sin(a2)
          };
        }
      }

      // Calculate planet position based on time
      const planetAngle = time / planet.period;
      const px = cx + planet.orbit * Math.cos(planetAngle);
      const py = cy + planet.orbit * Math.sin(planetAngle);

      // Draw planet as circle
      const planetSegments = 8;
      for (let i = 0; i < planetSegments; i++) {
        const a1 = (i / planetSegments) * 2 * Math.PI;
        const a2 = ((i + 1) / planetSegments) * 2 * Math.PI;
        yield {
          type: 'line',
          x1: px + planet.size * Math.cos(a1),
          y1: py + planet.size * Math.sin(a1),
          x2: px + planet.size * Math.cos(a2),
          y2: py + planet.size * Math.sin(a2)
        };
      }

      // Draw Saturn's rings
      if (planet.name === 'Saturn') {
        const ringInner = planet.size * 1.5;
        const ringOuter = planet.size * 2.2;

        // Inner ring arc
        for (let i = 0; i < 6; i++) {
          const a1 = -0.4 + (i / 6) * 0.8;
          const a2 = -0.4 + ((i + 1) / 6) * 0.8;
          yield {
            type: 'line',
            x1: px + ringInner * Math.cos(a1),
            y1: py + ringInner * 0.3 * Math.sin(a1),
            x2: px + ringInner * Math.cos(a2),
            y2: py + ringInner * 0.3 * Math.sin(a2)
          };
        }

        // Outer ring arc
        for (let i = 0; i < 8; i++) {
          const a1 = -0.5 + (i / 8) * 1.0;
          const a2 = -0.5 + ((i + 1) / 8) * 1.0;
          yield {
            type: 'line',
            x1: px + ringOuter * Math.cos(a1),
            y1: py + ringOuter * 0.3 * Math.sin(a1),
            x2: px + ringOuter * Math.cos(a2),
            y2: py + ringOuter * 0.3 * Math.sin(a2)
          };
        }
      }

      // Draw label line if enabled
      if (showLabels) {
        const labelOffset = planet.size + 0.02;
        yield {
          type: 'line',
          x1: px + labelOffset,
          y1: py - labelOffset,
          x2: px + labelOffset + 0.03,
          y2: py - labelOffset - 0.01
        };
      }
    }

    // Draw asteroid belt hint (between Mars and Jupiter)
    const beltRadius = 0.26;
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * 2 * Math.PI + time * 0.1;
      const r = beltRadius + (Math.sin(i * 7) * 0.01);
      const dotSize = 0.003;

      // Small dot
      yield {
        type: 'line',
        x1: cx + r * Math.cos(angle) - dotSize,
        y1: cy + r * Math.sin(angle),
        x2: cx + r * Math.cos(angle) + dotSize,
        y2: cy + r * Math.sin(angle)
      };
    }

    // Title line
    yield { type: 'line', x1: 0.30, y1: 0.03, x2: 0.70, y2: 0.03 };
  }
};

/**
 * All maps and astronomy demos exported as an array
 */
export const mapsDemos = [
  worldMap,
  usaMap,
  earthGlobe,
  solarSystem
];

export default mapsDemos;
