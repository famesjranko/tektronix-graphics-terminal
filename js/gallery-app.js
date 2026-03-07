/**
 * Tektronix Graphics Terminal - Gallery Application
 *
 * This is the entry point for the gallery page.
 */

import { COLORS } from './utils/colors.js';
import { geometricDemos } from './gallery/graphics/geometric.js';
import { threedDemos } from './gallery/graphics/threed.js';
import { dataDemos } from './gallery/graphics/data.js';

// Log startup to verify module loading works
console.log('Tektronix Gallery initializing...');
console.log('Color palette loaded:', COLORS);

// Helper to test demos
function testDemos(demos, category) {
  console.log(`${category} demos loaded:`, demos.length);
  demos.forEach(demo => {
    console.log(`  - ${demo.id}: ${demo.name} (${demo.category})`);
    // Test generator produces commands
    const generator = demo.generate(
      Object.fromEntries(
        Object.entries(demo.params).map(([key, param]) => [key, param.default])
      )
    );
    const firstCmd = generator.next().value;
    console.log(`    First command:`, firstCmd);
  });
}

// Test all demo categories
testDemos(geometricDemos, 'Geometric');
testDemos(threedDemos, '3D Wireframe');
testDemos(dataDemos, 'Data Visualization');

// Placeholder - GalleryManager will be initialized here in US-034
