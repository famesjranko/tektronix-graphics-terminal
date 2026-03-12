# Tektronix Graphics Terminal

A web application recreating the Tektronix vector graphics terminal experience. Draw vector graphics with animated line plotting, browse a gallery of classic terminal-style demos, and watch graphics render line-by-line as they would on original hardware.

## Features

- **Vector Drawing Tools** - Line, Rectangle, Circle, Arc, Text, Fill, and Eraser
- **Animated Plotting** - Watch lines draw progressively like a pen plotter
- **Adjustable Speed** - From slow dramatic demos to instant rendering
- **Demo Gallery** - 20+ pre-built graphics including spirographs, 3D wireframes, charts, and maps
- **Export Options** - Save as PNG or SVG vector format
- **Auto-Save** - Work persists in localStorage automatically
- **Dark Theme** - Authentic green-on-black terminal aesthetic

## Quick Start

### Using Docker

```bash
docker-compose up
```

Open http://localhost:8080 in your browser.

### Using Docker (manual)

```bash
docker build -t tektronix-terminal .
docker run -p 8080:80 tektronix-terminal
```

## Development

No build step required. Simply open the HTML files directly in your browser:

```bash
# Open the drawing canvas
open index.html

# Open the demo gallery
open gallery.html
```

Or serve with any static file server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

## Keyboard Shortcuts

### Tools

| Key | Tool |
|-----|------|
| `L` | Line |
| `R` | Rectangle |
| `C` | Circle |
| `A` | Arc |
| `T` | Text |
| `F` | Fill |
| `E` | Eraser |

### Actions

| Key | Action |
|-----|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+S` | Save to file |
| `Ctrl+O` | Open file |
| `Ctrl+E` | Export |
| `G` | Toggle grid |
| `Space` | Pause/resume animation |
| `Escape` | Cancel current operation |

## File Format

Drawings are saved as `.tek.json` files with the following structure:

```json
{
  "version": 1,
  "created": "2024-01-15T10:30:00.000Z",
  "modified": "2024-01-15T11:45:00.000Z",
  "canvasAspect": 1.6,
  "commands": [
    { "type": "line", "x1": 0.1, "y1": 0.2, "x2": 0.5, "y2": 0.8 },
    { "type": "rect", "x": 0.1, "y": 0.1, "width": 0.3, "height": 0.2 },
    { "type": "circle", "cx": 0.5, "cy": 0.5, "radius": 0.2 },
    { "type": "arc", "cx": 0.5, "cy": 0.5, "radius": 0.2, "startAngle": 0, "endAngle": 1.57 },
    { "type": "text", "x": 0.1, "y": 0.5, "text": "HELLO", "scale": 1 },
    { "type": "fill", "x": 0.3, "y": 0.3, "pattern": "crosshatch" }
  ]
}
```

### Command Types

| Type | Properties |
|------|------------|
| `line` | `x1`, `y1`, `x2`, `y2`, `style` (solid/dashed/dotted) |
| `rect` | `x`, `y`, `width`, `height`, `filled` |
| `circle` | `cx`, `cy`, `radius`, `filled` |
| `arc` | `cx`, `cy`, `radius`, `startAngle`, `endAngle` |
| `text` | `x`, `y`, `text`, `scale` |
| `fill` | `x`, `y`, `pattern` |

All coordinates are normalized to 0-1 range for resolution independence.

## Gallery Demos

The gallery includes demos in several categories:

- **Geometric** - Spirograph, Lissajous curves, Rose curves, Fibonacci spiral
- **3D Graphics** - Wireframe cube, sphere, torus, pyramid
- **Data Visualization** - Bar chart, line graph, pie chart, scatter plot
- **Maps & Astronomy** - World map, USA map, Earth globe, Solar system
- **Technical** - Circuit schematic, oscilloscope waveforms, logic gates, block diagrams

Each demo supports parameter adjustment and can be opened in the editor for modification.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Tech Stack

- Vanilla JavaScript (ES6 modules)
- Canvas 2D API
- No frameworks or build tools
- nginx for Docker deployment

## Project Structure

```
tektronix-graphics-terminal/
├── index.html          # Drawing canvas page
├── gallery.html        # Demo gallery page
├── css/
│   └── style.css       # Dark theme styles
├── js/
│   ├── app.js          # Main app initialization
│   ├── gallery-app.js  # Gallery initialization
│   ├── canvas/         # Canvas and rendering
│   ├── tools/          # Drawing tools
│   ├── gallery/        # Gallery and demos
│   ├── fonts/          # Vector font data
│   └── utils/          # Helpers and export
├── Dockerfile
├── docker-compose.yml
└── README.md
```
