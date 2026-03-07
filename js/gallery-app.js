/**
 * Tektronix Graphics Terminal - Gallery Application
 *
 * This is the entry point for the gallery page.
 */

import { COLORS } from './utils/colors.js';
import { GalleryManager } from './gallery/GalleryManager.js';

// Log startup to verify module loading works
console.log('Tektronix Gallery initializing...');
console.log('Color palette loaded:', COLORS);

// Initialize GalleryManager
const galleryManager = new GalleryManager();

// Test GalleryManager methods
console.log('--- GalleryManager Tests ---');

// Test getAllDemos()
const allDemos = galleryManager.getAllDemos();
console.log(`getAllDemos(): ${allDemos.length} total demos`);

// Test getCategories()
const categories = galleryManager.getCategories();
console.log('getCategories():', categories);

// Test getDemosByCategory() for each category
for (const category of categories) {
  const demos = galleryManager.getDemosByCategory(category.id);
  console.log(`getDemosByCategory('${category.id}'): ${demos.length} demos`);
  demos.forEach(demo => {
    console.log(`  - ${demo.id}: ${demo.name}`);
  });
}

// Test getDemoById() with first demo
const firstDemo = allDemos[0];
const foundDemo = galleryManager.getDemoById(firstDemo.id);
console.log(`getDemoById('${firstDemo.id}'):`, foundDemo ? foundDemo.name : 'NOT FOUND');

// Test getDemoById() with invalid ID
const notFound = galleryManager.getDemoById('invalid-demo-id');
console.log(`getDemoById('invalid-demo-id'):`, notFound === null ? 'null (correct)' : 'ERROR');

// Test generateThumbnail() - create a sample thumbnail
console.log('Testing generateThumbnail()...');
const thumbnailCanvas = galleryManager.generateThumbnail(firstDemo);
console.log(`Thumbnail generated: ${thumbnailCanvas.width}x${thumbnailCanvas.height} (physical pixels)`);

// Test generateThumbnailDataURL()
const dataURL = galleryManager.generateThumbnailDataURL(firstDemo);
console.log(`Thumbnail data URL length: ${dataURL.length} chars`);

// Test getDemoCount() and getCategoryCount()
console.log(`getDemoCount(): ${galleryManager.getDemoCount()}`);
for (const category of categories) {
  console.log(`getCategoryCount('${category.id}'): ${galleryManager.getCategoryCount(category.id)}`);
}

console.log('--- GalleryManager Tests Complete ---');

// Placeholder - Full gallery UI will be wired up in US-034
