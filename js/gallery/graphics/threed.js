/**
 * 3D Wireframe Gallery Demos
 *
 * Wireframe 3D graphics for the Tektronix gallery.
 * Each demo is a generator function yielding line commands.
 */

/**
 * 3D projection utilities
 */

/**
 * Rotate a point around the X axis
 */
function rotateX(point, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: point.x,
    y: point.y * cos - point.z * sin,
    z: point.y * sin + point.z * cos
  };
}

/**
 * Rotate a point around the Y axis
 */
function rotateY(point, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: point.x * cos + point.z * sin,
    y: point.y,
    z: -point.x * sin + point.z * cos
  };
}

/**
 * Rotate a point around the Z axis
 */
function rotateZ(point, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos,
    z: point.z
  };
}

/**
 * Project a 3D point to 2D using perspective projection
 * @param {object} point - 3D point {x, y, z}
 * @param {number} fov - Field of view factor (higher = more perspective)
 * @param {number} distance - Camera distance from origin
 * @returns {object} 2D point {x, y} in normalized coordinates
 */
function projectPerspective(point, fov, distance) {
  const scale = fov / (distance + point.z);
  return {
    x: 0.5 + point.x * scale,
    y: 0.5 + point.y * scale
  };
}

/**
 * Project a 3D point to 2D using orthographic projection
 * @param {object} point - 3D point {x, y, z}
 * @param {number} scale - Scale factor
 * @returns {object} 2D point {x, y} in normalized coordinates
 */
function projectOrthographic(point, scale) {
  return {
    x: 0.5 + point.x * scale,
    y: 0.5 + point.y * scale
  };
}

/**
 * Wireframe cube generator
 * A rotating 3D cube with perspective projection
 */
export const wireframeCube = {
  id: 'wireframe-cube',
  name: 'Wireframe Cube',
  category: '3d',
  description: 'Rotating 3D wireframe cube with perspective',
  thumbnail: null,
  params: {
    rotationX: { default: 0.5, min: 0, max: 6.28, step: 0.1, label: 'X Rotation' },
    rotationY: { default: 0.8, min: 0, max: 6.28, step: 0.1, label: 'Y Rotation' },
    rotationZ: { default: 0.2, min: 0, max: 6.28, step: 0.1, label: 'Z Rotation' },
    size: { default: 0.25, min: 0.1, max: 0.4, step: 0.02, label: 'Size' }
  },
  *generate(params) {
    const { rotationX, rotationY, rotationZ, size } = params;

    // Define cube vertices (centered at origin)
    const vertices = [
      { x: -size, y: -size, z: -size },
      { x: size, y: -size, z: -size },
      { x: size, y: size, z: -size },
      { x: -size, y: size, z: -size },
      { x: -size, y: -size, z: size },
      { x: size, y: -size, z: size },
      { x: size, y: size, z: size },
      { x: -size, y: size, z: size }
    ];

    // Define edges as pairs of vertex indices
    const edges = [
      // Back face
      [0, 1], [1, 2], [2, 3], [3, 0],
      // Front face
      [4, 5], [5, 6], [6, 7], [7, 4],
      // Connecting edges
      [0, 4], [1, 5], [2, 6], [3, 7]
    ];

    // Transform and project vertices
    const projected = vertices.map(v => {
      let p = rotateX(v, rotationX);
      p = rotateY(p, rotationY);
      p = rotateZ(p, rotationZ);
      return projectPerspective(p, 0.5, 1.5);
    });

    // Yield line commands for each edge
    for (const [i, j] of edges) {
      yield {
        type: 'line',
        x1: projected[i].x,
        y1: projected[i].y,
        x2: projected[j].x,
        y2: projected[j].y
      };
    }
  }
};

/**
 * Wireframe sphere generator
 * A 3D sphere made of latitude and longitude lines
 */
export const wireframeSphere = {
  id: 'wireframe-sphere',
  name: 'Wireframe Sphere',
  category: '3d',
  description: '3D sphere with latitude and longitude lines',
  thumbnail: null,
  params: {
    rotationX: { default: 0.4, min: 0, max: 6.28, step: 0.1, label: 'X Rotation' },
    rotationY: { default: 0.3, min: 0, max: 6.28, step: 0.1, label: 'Y Rotation' },
    size: { default: 0.3, min: 0.15, max: 0.4, step: 0.02, label: 'Size' },
    latitudeLines: { default: 8, min: 4, max: 16, step: 1, label: 'Latitude lines' },
    longitudeLines: { default: 12, min: 6, max: 24, step: 1, label: 'Longitude lines' }
  },
  *generate(params) {
    const { rotationX, rotationY, size, latitudeLines, longitudeLines } = params;
    const radius = size;
    const segments = 32; // Line segments per circle

    // Draw latitude lines (horizontal circles)
    for (let lat = 1; lat < latitudeLines; lat++) {
      const phi = (lat / latitudeLines) * Math.PI; // From 0 to PI
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

        // Apply rotations
        point = rotateX(point, rotationX);
        point = rotateY(point, rotationY);

        const projected = projectPerspective(point, 0.5, 1.5);

        if (prevPoint) {
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
    for (let lon = 0; lon < longitudeLines; lon++) {
      const theta = (lon / longitudeLines) * 2 * Math.PI;

      let prevPoint = null;

      for (let i = 0; i <= segments; i++) {
        const phi = (i / segments) * Math.PI;
        let point = {
          x: radius * Math.sin(phi) * Math.cos(theta),
          y: radius * Math.cos(phi),
          z: radius * Math.sin(phi) * Math.sin(theta)
        };

        // Apply rotations
        point = rotateX(point, rotationX);
        point = rotateY(point, rotationY);

        const projected = projectPerspective(point, 0.5, 1.5);

        if (prevPoint) {
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
  }
};

/**
 * Wireframe torus generator
 * A 3D donut shape
 */
export const wireframeTorus = {
  id: 'wireframe-torus',
  name: 'Wireframe Torus',
  category: '3d',
  description: '3D donut shape with ring segments',
  thumbnail: null,
  params: {
    rotationX: { default: 0.6, min: 0, max: 6.28, step: 0.1, label: 'X Rotation' },
    rotationY: { default: 0.3, min: 0, max: 6.28, step: 0.1, label: 'Y Rotation' },
    majorRadius: { default: 0.25, min: 0.15, max: 0.35, step: 0.02, label: 'Major radius' },
    minorRadius: { default: 0.1, min: 0.05, max: 0.15, step: 0.01, label: 'Minor radius' }
  },
  *generate(params) {
    const { rotationX, rotationY, majorRadius, minorRadius } = params;
    const majorSegments = 24; // Around the ring
    const minorSegments = 12; // Around the tube

    // Generate torus vertices
    const getTorusPoint = (u, v) => {
      const theta = u * 2 * Math.PI; // Angle around the ring
      const phi = v * 2 * Math.PI;   // Angle around the tube

      return {
        x: (majorRadius + minorRadius * Math.cos(phi)) * Math.cos(theta),
        y: minorRadius * Math.sin(phi),
        z: (majorRadius + minorRadius * Math.cos(phi)) * Math.sin(theta)
      };
    };

    // Draw rings around the tube (major circles)
    for (let i = 0; i < majorSegments; i++) {
      const u = i / majorSegments;

      let prevPoint = null;
      for (let j = 0; j <= minorSegments; j++) {
        const v = j / minorSegments;
        let point = getTorusPoint(u, v);

        // Apply rotations
        point = rotateX(point, rotationX);
        point = rotateY(point, rotationY);

        const projected = projectPerspective(point, 0.5, 1.5);

        if (prevPoint) {
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

    // Draw rings around the major axis (minor circles)
    for (let j = 0; j < minorSegments; j++) {
      const v = j / minorSegments;

      let prevPoint = null;
      for (let i = 0; i <= majorSegments; i++) {
        const u = i / majorSegments;
        let point = getTorusPoint(u, v);

        // Apply rotations
        point = rotateX(point, rotationX);
        point = rotateY(point, rotationY);

        const projected = projectPerspective(point, 0.5, 1.5);

        if (prevPoint) {
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
  }
};

/**
 * Wireframe pyramid generator
 * A 3D pyramid with square base
 */
export const wireframePyramid = {
  id: 'wireframe-pyramid',
  name: 'Wireframe Pyramid',
  category: '3d',
  description: '3D pyramid with square base',
  thumbnail: null,
  params: {
    rotationX: { default: 0.3, min: 0, max: 6.28, step: 0.1, label: 'X Rotation' },
    rotationY: { default: 0.5, min: 0, max: 6.28, step: 0.1, label: 'Y Rotation' },
    rotationZ: { default: 0, min: 0, max: 6.28, step: 0.1, label: 'Z Rotation' },
    size: { default: 0.2, min: 0.1, max: 0.35, step: 0.02, label: 'Size' },
    height: { default: 0.35, min: 0.2, max: 0.5, step: 0.02, label: 'Height' }
  },
  *generate(params) {
    const { rotationX, rotationY, rotationZ, size, height } = params;
    const baseSize = size;

    // Define pyramid vertices
    // Base corners at y = height/2, apex at y = -height/2
    const vertices = [
      // Base corners (clockwise from above)
      { x: -baseSize, y: height / 2, z: -baseSize },
      { x: baseSize, y: height / 2, z: -baseSize },
      { x: baseSize, y: height / 2, z: baseSize },
      { x: -baseSize, y: height / 2, z: baseSize },
      // Apex
      { x: 0, y: -height / 2, z: 0 }
    ];

    // Define edges
    const edges = [
      // Base
      [0, 1], [1, 2], [2, 3], [3, 0],
      // Sides to apex
      [0, 4], [1, 4], [2, 4], [3, 4]
    ];

    // Transform and project vertices
    const projected = vertices.map(v => {
      let p = rotateX(v, rotationX);
      p = rotateY(p, rotationY);
      p = rotateZ(p, rotationZ);
      return projectPerspective(p, 0.5, 1.5);
    });

    // Yield line commands for each edge
    for (const [i, j] of edges) {
      yield {
        type: 'line',
        x1: projected[i].x,
        y1: projected[i].y,
        x2: projected[j].x,
        y2: projected[j].y
      };
    }
  }
};

/**
 * All 3D wireframe demos exported as an array
 */
export const threedDemos = [
  wireframeCube,
  wireframeSphere,
  wireframeTorus,
  wireframePyramid
];

export default threedDemos;
