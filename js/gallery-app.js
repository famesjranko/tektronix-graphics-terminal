/**
 * Tektronix Graphics Terminal - Gallery Application
 *
 * This is the entry point for the gallery page.
 */

import { COLORS } from './utils/colors.js';
import { geometricDemos } from './gallery/graphics/geometric.js';

// Log startup to verify module loading works
console.log('Tektronix Gallery initializing...');
console.log('Color palette loaded:', COLORS);

// Test geometric demos are loaded correctly
console.log('Geometric demos loaded:', geometricDemos.length);
geometricDemos.forEach(demo => {
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

// Placeholder - GalleryManager will be initialized here in US-034
