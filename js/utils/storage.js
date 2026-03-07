/**
 * Storage utilities for localStorage auto-save and load
 *
 * Provides auto-save/load functionality for the drawing canvas.
 */

const STORAGE_KEY = 'tektronix-drawing';

/**
 * Save commands to localStorage
 * @param {Object[]} commands - Array of drawing commands
 */
export function saveToLocalStorage(commands) {
  try {
    const data = JSON.stringify(commands);
    localStorage.setItem(STORAGE_KEY, data);
  } catch (e) {
    // Ignore storage errors (quota exceeded, etc.)
    console.warn('Failed to save to localStorage:', e.message);
  }
}

/**
 * Load commands from localStorage
 * @returns {Object[]|null} - Array of commands or null if none saved
 */
export function loadFromLocalStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return null;
    }
    const commands = JSON.parse(data);
    // Validate it's an array
    if (!Array.isArray(commands)) {
      return null;
    }
    return commands;
  } catch (e) {
    // Invalid data or parse error
    console.warn('Failed to load from localStorage:', e.message);
    return null;
  }
}

/**
 * Clear saved drawing from localStorage
 */
export function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // Ignore errors
  }
}

/**
 * Create a debounced auto-save function
 * @param {Function} getCommands - Function that returns current commands
 * @param {number} delay - Debounce delay in milliseconds (default 1000)
 * @returns {Function} - Debounced save function
 */
export function createAutoSave(getCommands, delay = 1000) {
  let timeoutId = null;

  return function triggerAutoSave() {
    // Clear any pending save
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    // Schedule new save
    timeoutId = setTimeout(() => {
      const commands = getCommands();
      saveToLocalStorage(commands);
      timeoutId = null;
    }, delay);
  };
}
