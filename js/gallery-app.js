/**
 * Tektronix Graphics Terminal - Gallery Application
 *
 * This is the entry point for the gallery page.
 */

import { COLORS } from './utils/colors.js';
import { GalleryManager } from './gallery/GalleryManager.js';
import { GraphicPlayer } from './gallery/GraphicPlayer.js';

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

// Test GraphicPlayer
console.log('--- GraphicPlayer Tests ---');

// Create a test container for the player
// Use the player canvas container from the new gallery layout
const playerContainer = document.getElementById('player-canvas-container');
if (!playerContainer) {
  console.error('Player container not found - make sure gallery.html is updated');
}

// Create player with the first demo
const testDemo = allDemos[0];
console.log(`Creating GraphicPlayer with demo: ${testDemo.name}`);

const player = new GraphicPlayer(testDemo, playerContainer);
console.log('GraphicPlayer created');

// Test getDemo()
console.log(`getDemo(): ${player.getDemo().name}`);

// Test getParams()
console.log('getParams():', player.getParams());

// Test getParamDefinitions()
console.log('getParamDefinitions():', player.getParamDefinitions());

// Test setSpeed()
player.setSpeed(800);
console.log(`setSpeed(800) - getSpeed(): ${player.getSpeed()}`);

// Test play state methods
console.log(`getIsPlaying() before play: ${player.getIsPlaying()}`);
console.log(`getIsPaused() before play: ${player.getIsPaused()}`);

// Listen for complete event
player.addEventListener('complete', () => {
  console.log('GraphicPlayer emitted "complete" event');
});

// Start playback
console.log('Calling play()...');
player.play();
console.log(`getIsPlaying() after play: ${player.getIsPlaying()}`);

// Test pause after 1 second
setTimeout(() => {
  console.log('Calling pause() after 1s...');
  player.pause();
  console.log(`getIsPlaying() after pause: ${player.getIsPlaying()}`);
  console.log(`getIsPaused() after pause: ${player.getIsPaused()}`);

  // Test resume after another second
  setTimeout(() => {
    console.log('Calling play() to resume...');
    player.play();
    console.log(`getIsPlaying() after resume: ${player.getIsPlaying()}`);
  }, 1000);
}, 1000);

// Update player title in the UI
const playerTitle = document.getElementById('player-title');
if (playerTitle) {
  playerTitle.textContent = testDemo.name;
}

// Show player view for testing
const galleryMain = document.querySelector('.gallery-main');
if (galleryMain) {
  galleryMain.classList.add('player-active');
}

console.log('--- GraphicPlayer Tests Running (check console for async results) ---');
console.log('Gallery page loaded with new HTML structure. Full UI wiring in US-034.');

// Placeholder - Full gallery UI will be wired up in US-034
