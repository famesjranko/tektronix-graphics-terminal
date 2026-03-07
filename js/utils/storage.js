/**
 * Storage utilities for localStorage auto-save and file I/O
 *
 * Provides auto-save/load functionality for the drawing canvas,
 * plus file save/load for .tek.json format.
 */

const STORAGE_KEY = 'tektronix-drawing';
const FILE_VERSION = 1;

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

/**
 * Save commands to a .tek.json file (triggers download)
 * @param {Object[]} commands - Array of drawing commands
 * @param {number} canvasAspect - Canvas aspect ratio (width/height)
 */
export function saveToFile(commands, canvasAspect = 1.6) {
  const now = new Date().toISOString();
  const fileData = {
    version: FILE_VERSION,
    created: now,
    modified: now,
    canvasAspect: canvasAspect,
    commands: commands
  };

  const json = JSON.stringify(fileData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `tektronix-${timestamp}.tek.json`;

  // Trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Validate a .tek.json file data object
 * @param {Object} data - Parsed JSON data
 * @returns {{ valid: boolean, error?: string, commands?: Object[] }}
 */
function validateTekFile(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid file format: not a JSON object' };
  }

  if (typeof data.version !== 'number') {
    return { valid: false, error: 'Invalid file format: missing version' };
  }

  if (data.version > FILE_VERSION) {
    return { valid: false, error: `Unsupported file version: ${data.version} (max supported: ${FILE_VERSION})` };
  }

  if (!Array.isArray(data.commands)) {
    return { valid: false, error: 'Invalid file format: commands must be an array' };
  }

  // Basic validation of commands
  for (let i = 0; i < data.commands.length; i++) {
    const cmd = data.commands[i];
    if (!cmd || typeof cmd !== 'object' || !cmd.type) {
      return { valid: false, error: `Invalid command at index ${i}: missing type` };
    }
  }

  return { valid: true, commands: data.commands };
}

/**
 * Load commands from a .tek.json file via file input
 * @param {HTMLInputElement} fileInput - The file input element
 * @returns {Promise<{ success: boolean, commands?: Object[], error?: string }>}
 */
export function loadFromFile(fileInput) {
  return new Promise((resolve) => {
    const handleChange = (e) => {
      const file = e.target.files[0];
      if (!file) {
        resolve({ success: false, error: 'No file selected' });
        cleanup();
        return;
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          const validation = validateTekFile(data);

          if (!validation.valid) {
            resolve({ success: false, error: validation.error });
          } else {
            resolve({ success: true, commands: validation.commands });
          }
        } catch (e) {
          resolve({ success: false, error: 'Failed to parse file: invalid JSON' });
        }
        cleanup();
      };

      reader.onerror = () => {
        resolve({ success: false, error: 'Failed to read file' });
        cleanup();
      };

      reader.readAsText(file);
    };

    const cleanup = () => {
      fileInput.removeEventListener('change', handleChange);
      fileInput.value = ''; // Reset for next use
    };

    fileInput.addEventListener('change', handleChange);
    fileInput.click();
  });
}
