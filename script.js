'use strict'; // Helps catch common coding errors, including variable issues

// --- Get DOM Elements ---
const inputText = document.getElementById('inputText');
const outputCanvas = document.getElementById('outputCanvas');
const presetButtonsContainer = document.getElementById('presetButtons');


// --- Global Variables (Declared Once) ---
let animationTimer; // Variable is now less used, kept in case needed for other animations
// Cycling timer variables removed as Surprise Me is removed
let currentPresetElement = null; // To keep track of the active preset display element


// --- Helper Functions ---

// Helper to convert hex color to RGB array [r, g, b] (used for rgba backgrounds)
// This helper is actually not needed anymore with the current variable strategy, but kept in case presets change.
function hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
}


// --- Preset Data ---
// Removed the 'Surprise Me!' preset object
// Updated previewStyles to use static values or var(--tempad-...)
const presets = [
     { // TEMPAD DEFAULT THEME
        name: 'TemPad',
        type: 'static',
        theme: {
            '--theme-color': 'var(--tempad-orange)', '--theme-color-rgb': 'var(--tempad-orange-rgb)',
            '--theme-bg': 'var(--tempad-black)', '--theme-bg-rgb': 'var(--tempad-black-rgb)',
            '--theme-accent': 'var(--tempad-dark-orange)', '--theme-accent-rgb': 'var(--tempad-dark-orange-rgb)',
            '--theme-font': 'var(--tempad-font)',
            '--theme-grid-color': 'rgba(var(--tempad-orange-rgb, 255,152,0), 0.2)',
            '--theme-menu-bg': 'var(--tempad-brown)',
            '--theme-title-color': 'var(--tempad-orange)'
        },
         styles: {
             fontFamily: 'var(--tempad-font)', textShadow: 'none', border: 'none', fontSize: '16px', lineHeight: '1.5', filter: 'none'
         },
        previewStyles: { color: 'var(--tempad-orange)', fontFamily: 'var(--tempad-font)', textShadow: 'none' }
    },
     {
        name: 'Matrix Code',
        type: 'static',
        theme: {
            '--theme-color': '#0f0', '--theme-color-rgb': '0,255,0', '--theme-bg': 'rgba(0, 0, 0, 0.9)', '--theme-bg-rgb': '0,0,0', '--theme-accent': '#39ff14', '--theme-accent-rgb': '57,255,20', '--theme-font': '"DejaVu Sans Mono", monospace',
             '--theme-grid-color': 'rgba(var(--theme-color-rgb, 0,255,0), 0.2)', '--theme-menu-bg': '#333', '--theme-title-color': '#0f0'
        },
         styles: {
             fontFamily: '"DejaVu Sans Mono", monospace', textShadow: 'none', border: 'none', fontSize: '16px', lineHeight: '1.4', filter: 'none'
         },
        previewStyles: { color: '#0f0', fontFamily: '"DejaVu Sans Mono", monospace', textShadow: 'none' } // Static hex/font
    },
     {
        name: 'Neon Terminal', type: 'static',
        theme: { '--theme-color': '#39ff14', '--theme-color-rgb': '57,255,20', '--theme-bg': 'rgba(0, 0, 0, 0.95)', '--theme-bg-rgb': '0,0,0', '--theme-accent': '#00ffff', '--theme-accent-rgb': '0,255,255', '--theme-font': 'Consolas, monospace', '--theme-grid-color': 'rgba(var(--theme-accent-rgb, 0,255,255), 0.3)', '--theme-menu-bg': '#111', '--theme-title-color': '#39ff14' },
        styles: { textShadow: '0 0 5px var(--theme-color), 0 0 10px var(--theme-color)', border: 'none', fontSize: '18px', lineHeight: '1.3', filter: 'none' },
        previewStyles: { color: '#39ff14', fontFamily: 'Consolas, monospace', textShadow: '0 0 3px #39ff14' } // Static hex/font
    },
     {
        name: 'Retro CRT', type: 'static',
        theme: { '--theme-color': '#00ff00', '--theme-color-rgb': '0,255,0', '--theme-bg': '#000000', '--theme-bg-rgb': '0,0,0', '--theme-accent': '#00ffff', '--theme-accent-rgb': '0,255,255', '--theme-font': '"Courier New", monospace', '--theme-grid-color': 'rgba(var(--theme-color-rgb, 0,255,0), 0.3)', '--theme-menu-bg': '#222', '--theme-title-color': '#00ff00' },
        styles: { textShadow: '1px 1px #000000', border: 'none', fontSize: '15px', lineHeight: '1.5', filter: 'brightness(1.3) contrast(1.2)' },
        previewStyles: { color: '#00ff00', fontFamily: '"Courier New", monospace', textShadow: 'none', filter: 'brightness(1.3)' } // Static hex/font
    },
     {
        name: 'Vaporwave Haze', type: 'static',
        theme: { '--theme-color': '#ff7edb', '--theme-color-rgb': '255,126,219', '--theme-bg': 'rgba(42, 44, 90, 0.7)', '--theme-bg-rgb': '42,44,90', '--theme-accent': '#00ffff', '--theme-accent-rgb': '0,255,255', '--theme-font': '"Arial", sans-serif', '--theme-grid-color': 'rgba(var(--theme-accent-rgb, 0,255,255), 0.4)', '--theme-menu-bg': '#2a2c5a', '--theme-title-color': '#ff7edb' },
        styles: { textShadow: '2px 2px #4a0d66, -2px -2px #00ffff', border: 'none', lineHeight: '1.2', fontSize: '20px', filter: 'none' },
        previewStyles: { color: '#ff7edb', fontFamily: '"Arial", sans-serif', textShadow: '1px 1px #4a0d66' } // Static hex/font
    },
     {
        name: 'Cyberpunk Glitch', type: 'static',
        theme: { '--theme-color': '#0ff', '--theme-color-rgb': '0,255,255', '--theme-bg': 'rgba(26, 13, 46, 0.8)', '--theme-bg-rgb': '26,13,46', '--theme-accent': '#f0f', '--theme-accent-rgb': '255,0,255', '--theme-font': '"Share Tech Mono", monospace', '--theme-grid-color': 'rgba(var(--theme-accent-rgb, 255,0,255), 0.4)', '--theme-menu-bg': '#1a0d2e', '--theme-title-color': '#0ff' },
        styles: { textShadow: '0 0 2px var(--theme-color), 0 0 5px var(--theme-color)', border: 'none', fontSize: '17px', lineHeight: '1.3', filter: 'none' },
        previewStyles: { color: '#0ff', fontFamily: '"Share Tech Mono", monospace', textShadow: '0 0 1px #0ff' } // Static hex/font
    },
     {
        name: 'Fire Text', type: 'static',
        theme: { '--theme-color': '#ff4500', '--theme-color-rgb': '255,69,0', '--theme-bg': 'rgba(30, 10, 0, 0.7)', '--theme-bg-rgb': '30,10,0', '--theme-accent': '#ff8c00', '--theme-accent-rgb': '255,140,0', '--theme-font': '"Impact", sans-serif', '--theme-grid-color': 'rgba(var(--theme-color-rgb, 255,69,0), 0.3)', '--theme-menu-bg': '#1e0a00', '--theme-title-color': '#ff4500' },
        styles: { textShadow: '0 0 5px var(--theme-accent), 0 0 10px var(--theme-color)', border: 'none', fontSize: '30px', lineHeight: '1.0', filter: 'none' },
        previewStyles: { color: '#ff4500', fontFamily: '"Impact", sans-serif', textShadow: '0 0 2px #ff8c00' } // Static hex/font
    },
     {
        name: 'Ice Crystal', type: 'static',
        theme: { '--theme-color': '#00ffff', '--theme-color-rgb': '0,255,255', '--theme-bg': 'rgba(0, 20, 30, 0.6)', '--theme-bg-rgb': '0,20,30', '--theme-accent': '#00eeee', '--theme-accent-rgb': '0,238,238', '--theme-font': '"Arial Black", sans-serif', '--theme-grid-color': 'rgba(var(--theme-color-rgb, 0,255,255), 0.4)', '--theme-menu-bg': '#00141e', '--theme-title-color': '#00ffff' },
        styles: { textShadow: '0 0 5px var(--theme-accent), 0 0 10px var(--theme-color)', border: 'none', fontSize: '25px', lineHeight: '1.1', filter: 'contrast(1.5)' },
        previewStyles: { color: '#00ffff', fontFamily: '"Arial Black", sans-serif', textShadow: '0 0 3px #00ffff', filter: 'contrast(1.5)' } // Static hex/font
    },
    {
        name: 'Golden Era', type: 'static',
         theme: { '--theme-color': '#FFD700', '--theme-color-rgb': '255,215,0', '--theme-bg': 'rgba(50, 40, 0, 0.7)', '--theme-bg-rgb': '50,40,0', '--theme-accent': '#FFA500', '--theme-accent-rgb': '255,165,0', '--theme-font': '"Times New Roman", serif', '--theme-grid-color': 'rgba(var(--theme-color-rgb, 255,215,0), 0.2)', '--theme-menu-bg': '#322800', '--theme-title-color': '#FFD700' },
         styles: { textShadow: '2px 2px 3px rgba(0,0,0,0.5)', border: 'none', fontSize: '22px', lineHeight: '1.5', filter: 'none' },
         previewStyles: { color: '#FFD700', fontFamily: '"Times New Roman", serif', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' } // Static hex/font
    },
     {
        name: 'Grayscale Ghost', type: 'static',
         theme: { '--theme-color': '#cccccc', '--theme-color-rgb': '204,204,204', '--theme-bg': 'rgba(10, 10, 10, 0.95)', '--theme-bg-rgb': '10,10,10', '--theme-accent': '#888888', '--theme-accent-rgb': '136,136,136', '--theme-font': '"Roboto Mono", monospace', '--theme-grid-color': 'rgba(var(--theme-color-rgb, 204,204,204), 0.1)', '--theme-menu-bg': '#0a0a0a', '--theme-title-color': '#cccccc' },
         styles: { textShadow: 'none', border: 'none', fontSize: '16px', lineHeight: '1.6', filter: 'grayscale(80%)' },
         previewStyles: { color: '#cccccc', fontFamily: '"Roboto Mono", monospace', textShadow: 'none', filter: 'grayscale(80%)' } // Static hex/font
    },
     {
        name: 'Purple Haze', type: 'static',
         theme: { '--theme-color': '#E0B0FF', '--theme-color-rgb': '224,176,255', '--theme-bg': 'rgba(40, 0, 80, 0.8)', '--theme-bg-rgb': '40,0,80', '--theme-accent': '#8A2BE2', '--theme-accent-rgb': '138,43,226', '--theme-font': '"Courier New", monospace', '--theme-grid-color': 'rgba(var(--theme-color-rgb, 224,176,255), 0.3)', '--theme-menu-bg': '#280050', '--theme-title-color': '#E0B0FF' },
        styles: { textShadow: '0 0 8px var(--theme-accent)', border: 'none', fontSize: '18px', lineHeight: '1.4', filter: 'none' },
        previewStyles: { color: '#E0B0FF', fontFamily: '"Courier New", monospace', textShadow: '0 0 5px #8A2BE2' } // Static hex/font
    },
     {
        name: 'Deep Blue', type: 'static',
         theme: { '--theme-color': '#87CEFA', '--theme-color-rgb': '135,206,250', '--theme-bg': 'rgba(0, 20, 60, 0.9)', '--theme-bg-rgb': '0,20,60', '--theme-accent': '#4682B4', '--theme-accent-rgb': '70,130,180', '--theme-font': '"Lucida Console", monospace', '--theme-grid-color': 'rgba(var(--theme-color-rgb, 135,206,250), 0.4)', '--theme-menu-bg': '#00143c', '--theme-title-color': '#87CEFA' },
        styles: { textShadow: '0 0 5px var(--theme-accent)', border: 'none', fontSize: '17px', lineHeight: '1.3', filter: 'none' },
        previewStyles: { color: '#87CEFA', fontFamily: '"Lucida Console", monospace', textShadow: '0 0 3px #4682B4' } // Static hex/font
    },
      {
        name: 'Forest Green', type: 'static',
         theme: { '--theme-color': '#98FB98', '--theme-color-rgb': '152,251,152', '--theme-bg': 'rgba(0, 30, 0, 0.8)', '--theme-bg-rgb': '0,30,0', '--theme-accent': '#32CD32', '--theme-accent-rgb': '50,205,50', '--theme-font': '"Consolas", monospace', '--theme-grid-color': 'rgba(var(--theme-color-rgb, 152,251,152), 0.3)', '--theme-menu-bg': '#001e00', '--theme-title-color': '#98FB98' },
         styles: { textShadow: '0 0 5px var(--theme-accent)', border: 'none', fontSize: '16px', lineHeight: '1.5', filter: 'none' },
         previewStyles: { color: '#98FB98', fontFamily: '"Consolas", monospace', textShadow: '0 0 3px #32CD32' } // Static hex/font
    },
    {
        name: 'Blood Moon', type: 'static',
        theme: { '--theme-color': '#FF6347', '--theme-color-rgb': '255,99,71', '--theme-bg': 'rgba(50, 0, 0, 0.9)', '--theme-bg-rgb': '50,0,0', '--theme-accent': '#B22222', '--theme-accent-rgb': '178,34,34', '--theme-font': '"Georgia", serif', '--theme-grid-color': 'rgba(var(--theme-color-rgb, 255,99,71), 0.3)', '--theme-menu-bg': '#320000', '--theme-title-color': '#FF6347' },
        styles: { textShadow: '1px 1px 5px var(--theme-accent)', border: 'none', fontSize: '24px', lineHeight: '1.2', filter: 'none' },
        previewStyles: { color: '#FF6347', fontFamily: '"Georgia", serif', textShadow: '1px 1px 3px #B22222' } // Static hex/font
    },
     {
        name: 'Arctic Chill', type: 'static',
        theme: { '--theme-color': '#ADD8E6', '--theme-color-rgb': '173,216,230', '--theme-bg': 'rgba(0, 10, 20, 0.95)', '--theme-bg-rgb': '0,10,20', '--theme-accent': '#E0FFFF', '--theme-accent-rgb': '224,255,255', '--theme-font': '"Verdana", sans-serif', '--theme-grid-color': 'rgba(var(--theme-color-rgb, 173,216,230), 0.4)', '--theme-menu-bg': '#000a14', '--theme-title-color': '#ADD8E6' },
        styles: { textShadow: '0 0 10px var(--theme-accent)', border: 'none', fontSize: '18px', lineHeight: '1.3', filter: 'none' },
        previewStyles: { color: '#ADD8E6', fontFamily: '"Verdana", sans-serif', textShadow: '0 0 5px #E0FFFF' } // Static hex/font
    },
     {
        name: 'Desert Sand', type: 'static',
        theme: { '--theme-color': '#F5F5DC', '--theme-color-rgb': '245,245,220', '--theme-bg': 'rgba(80, 60, 40, 0.7)', '--theme-bg-rgb': '80,60,40', '--theme-accent': '#C0C0B0', '--theme-accent-rgb': '192,192,176', '--theme-font': '"Trebuchet MS", sans-serif', '--theme-grid-color': 'rgba(var(--theme-color-rgb, 245,245,220), 0.3)', '--theme-menu-bg': '#503c28', '--theme-title-color': '#F5F5DC' },
        styles: { textShadow: '1px 1px 2px var(--theme-accent)', border: 'none', fontSize: '20px', lineHeight: '1.4', filter: 'none' },
        previewStyles: { color: '#F5F5DC', fontFamily: '"Trebuchet MS", sans-serif', textShadow: '1px 1px 1px #C0C0B0' } // Static hex/font
    }
    // Removed the Surprise Me preset
];


// --- Core Functions ---

// Function to apply a preset's theme variables and canvas styles
function applyPreset(preset, presetElement = null) {
    const root = document.documentElement;

    // Apply theme variables to the root element (affects body, input, controls, menu, etc.)
    if (preset.theme) { // Ensure theme exists
        for (const variable in preset.theme) {
            root.style.setProperty(variable, preset.theme[variable]);
        }
    }


    // Apply specific canvas styles (if defined)
    if (preset.styles) {
        for (const property in preset.styles) {
             // Explicitly set font-family for canvas if specified in styles, otherwise it inherits theme font
             if (property === 'fontFamily') {
                 outputCanvas.style.setProperty('font-family', preset.styles.fontFamily);
             } else {
                 outputCanvas.style[property] = preset.styles[property];
             }
        }
    } else {
         // If no specific styles, ensure canvas uses theme font and clear previous specific styles
         outputCanvas.style.setProperty('font-family', getComputedStyle(root).getPropertyValue('--theme-font') || 'monospace'); // Fallback font
         outputCanvas.style.textShadow = '';
         outputCanvas.style.border = '';
         outputCanvas.style.fontSize = '';
         outputCanvas.style.lineHeight = '';
         outputCanvas.style.filter = '';
    }


    // --- Update active state visual ---
    // Remove active class from the previously active element
    if (currentPresetElement) {
        currentPresetElement.classList.remove('active');
    }

    // If a preset element (the clickable div) was passed, mark it active
    if (presetElement) {
         presetElement.classList.add('active');
         currentPresetElement = presetElement;
    }


    // The main outputCanvas content is managed by displaySentMessage now.
    // No need to clear or re-animate here, just ensure theme is applied.
}


// Create and add styled preset name elements
function createPresetButtons() {
     presetButtonsContainer.innerHTML = ''; // Clear existing

    presets.forEach((preset, index) => {
        const presetElement = document.createElement('div'); // Use div
        presetElement.textContent = preset.name;
        presetElement.classList.add('preset-name');
        presetElement.dataset.presetType = preset.type || 'static';
        presetElement.dataset.presetName = preset.name; // Add data attribute for name lookup

        // Apply preview styles *directly* as inline styles using element.style
        // This makes the preview styling independent of the main active theme's variables.
        if (preset.previewStyles) {
            for (const property in preset.previewStyles) {
                 // Apply the value directly. Expecting static colors, fonts, or var(--tempad-...)
                 presetElement.style[property] = preset.previewStyles[property];
            }
        }
        // Default CSS styles for .preset-name handle base appearance and resets.


        // Add click listener
        presetElement.addEventListener('click', () => {
            applyPreset(preset, presetElement);
        });

        presetButtonsContainer.appendChild(presetElement);
    });
}

// Function to display sent messages in the output area (canvas)
function displaySentMessage(message) {
    // Create a new div for the sent message
    const messageElement = document.createElement('div');
    messageElement.classList.add('sent-message'); // Apply styling for sent messages

    // Set the text content (can add a prefix like '>' if desired)
    messageElement.textContent = `> ${message}`; // Example: add '>' prefix

    // Append the message element to the output canvas
    outputCanvas.appendChild(messageElement);

    // Scroll the output canvas to the bottom to show the latest message
    outputCanvas.scrollTop = outputCanvas.scrollHeight;
}

// Function to update the input area (now only for preview)
function updateInputPreview() {
     // This function is not strictly needed for basic typing preview,
     // which is handled by the browser in the input field.
     // Kept in case needed for clearing input or other state updates.
     // Currently called by applyPreset but doesn't do much with input text.
}


// --- Event Listeners ---

// Add keypress event listener to the input field for sending messages
inputText.addEventListener('keypress', function(event) {
    // Check if the pressed key is Enter
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default Enter key behavior (e.g., form submission)

        const message = inputText.value.trim(); // Get the text and remove leading/trailing whitespace

        if (message !== '') { // Only send if the message is not empty
            displaySentMessage(message); // Display the sent message
        }

        // Clear the input field regardless of whether a message was sent
        inputText.value = '';
    }
});


// --- Initialization ---

// Create the styled preset name elements when the page loads
createPresetButtons();

// Apply the default preset (TemPad Default) on load and mark it active
const defaultPreset = presets.find(p => p.name === 'TemPad Default' && p.type === 'static');
if (defaultPreset) {
    // Find the corresponding element in the DOM after buttons are created
    const defaultPresetElement = document.querySelector(`.preset-name[data-preset-type="static"][data-preset-name="TemPad Default"]`);
     if (defaultPresetElement) {
         applyPreset(defaultPreset, defaultPresetElement); // Pass preset object and element
     } else {
        applyPreset(defaultPreset); // Fallback
     }
} else if (presets.length > 0 && presets[0].type === 'static') {
     // Fallback: Apply the first static preset found and mark its element active
     const firstStaticPreset = presets[0]; // Get the first preset
     const firstStaticPresetElement = document.querySelector(`.preset-name[data-preset-type="static"][data-preset-name="${firstStaticPreset.name}"]`); // Find its element
      if (firstStaticPreset && firstStaticPresetElement) {
         applyPreset(firstStaticPreset, firstStaticPresetElement);
      } else if (firstStaticPreset) {
          applyPreset(firstStaticPreset);
      }
}


// Give focus to the input field on load
inputText.focus();