# Tektronix Graphics Terminal Website

## Overview

A web application recreating the Tektronix vector graphics terminal experience. Users can draw vector graphics with animated line plotting, browse a gallery of classic terminal-style demos, and watch graphics render line-by-line as they would on original hardware.

**Aesthetic**: Green vector graphics with a modern twist - crisp lines, deliberate plotting animation, but not attempting full phosphor/CRT simulation.

## Target Users

- **Nostalgia seekers**: People who remember or appreciate vintage computing aesthetics
- **Artists/designers**: Looking for a unique creative tool with retro constraints
- **Educators**: Demonstrating computer graphics history or mathematical concepts
- **Developers**: Interested in vector graphics, canvas rendering, or animation techniques

## User Stories

### Drawing Canvas (index.html)
1. User opens the app and sees a full-screen dark canvas with green grid lines
2. User selects drawing tools from a left-side toolbar
3. User draws shapes; each line animates as it plots (like a pen plotter)
4. User adjusts animation speed via slider (or disables for instant drawing)
5. User undoes/redoes actions with Ctrl+Z / Ctrl+Shift+Z
6. User exports their drawing as PNG or SVG
7. User's work auto-saves to localStorage; restored on reload

### Gallery (gallery.html)
1. User browses a grid of demo graphics with thumbnails
2. User clicks a demo to watch it animate in a player view
3. User controls playback: play/pause, speed adjustment, restart
4. User returns to gallery grid to pick another demo

---

## Tech Stack

**Vanilla JS + Canvas 2D** - No framework, no build step. Deployable as static files anywhere.

**Deployment options:**
- Docker container (nginx serving static files)
- Any static hosting (Netlify, Vercel, GitHub Pages, S3, etc.)
- Local file:// serving for development

---

## Color Palette

```css
:root {
  --tek-primary:    #00FF88;  /* Bright modern green - lines, active elements */
  --tek-dim:        #00AA55;  /* Dimmed green - grid, inactive elements */
  --tek-background: #0A0F0D;  /* Near-black with green tint */
  --tek-panel:      #0D1410;  /* Slightly lighter for UI panels */
  --tek-border:     #1A3328;  /* Subtle green borders */
  --tek-text:       #88FFBB;  /* Readable text on dark backgrounds */
  --tek-highlight:  #AAFFDD;  /* Hover/focus states */
}
```

---

## Canvas Specifications

### Dimensions & Responsiveness
- Canvas fills available viewport (minus toolbar/status bar)
- Minimum supported size: 800x600 logical pixels
- Maximum practical size: 4096x4096 (performance limit)
- Coordinate system: origin (0,0) at top-left
- Internal resolution matches display pixels (HiDPI aware)

### Resize Behavior
- Canvas resizes with window
- Existing drawing scales proportionally (vector data stored in normalized 0-1 coordinates internally, rendered to current size)
- Aspect ratio not locked (drawings stretch if window shape changes significantly)

### Grid
- Optional background grid (toggleable)
- Grid spacing: 50px at default zoom
- Grid color: `--tek-dim` at 30% opacity

---

## Animation System (PlotAnimator)

### Speed Settings
| Setting | Speed (px/sec) | Use Case |
|---------|---------------|----------|
| Slowest | 100 | Dramatic demos, watching algorithms |
| Slow | 300 | Default gallery playback |
| Normal | 800 | Comfortable drawing |
| Fast | 2000 | Quick previews |
| Instant | Infinity | No animation, immediate render |

- User-adjustable via slider in status bar
- Speed persists in localStorage
- Default: Normal (800 px/sec)

### Animation Behavior
- Lines animate from start point to end point
- Circles animate as expanding radius from center
- Arcs animate along the arc path
- Text animates character-by-character, each character stroke-by-stroke
- Rectangles animate as 4 sequential lines

### Queue System
- All draw commands enter a FIFO queue
- Commands execute sequentially (one animation at a time)
- Queue can be paused/resumed
- "Skip" button instantly completes current queue

---

## Drawing Tools

### Tool Interactions

| Tool | Interaction | Output |
|------|-------------|--------|
| **Line** | Click start, drag to end, release | Single line segment |
| **Rectangle** | Click corner, drag to opposite corner | 4 lines forming rectangle |
| **Circle** | Click corner of bounding box, drag to opposite corner | Circle inscribed in box |
| **Arc** | Click center, drag to set radius, release, drag to set arc span, click to confirm | Arc segment |
| **Text** | Click to place cursor, type text, Enter to confirm, Escape to cancel | Vector text string |
| **Fill** | Click inside closed region | Pattern fill within bounds |
| **Eraser** | Click on line segment to delete it | Removes command from history |

### Tool Options (per-tool settings panel)

**Line Tool:**
- Line style: solid, dashed, dotted

**Rectangle Tool:**
- Filled vs outline only

**Circle Tool:**
- Filled vs outline only

**Arc Tool:**
- Show angle guides while drawing (on/off)

**Text Tool:**
- Scale: 0.5x, 1x, 2x, 3x
- Font: Single vector font (Hershey Simplex style)

**Fill Tool - Patterns:**
- Crosshatch (diagonal lines both directions)
- Horizontal lines
- Vertical lines
- Diagonal lines (45°)
- Diagonal lines (135°)
- Dots (grid pattern)
- Dense crosshatch

**Eraser Tool:**
- Click erases single element
- Drag erases all elements touched

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| L | Line tool |
| R | Rectangle tool |
| C | Circle tool |
| A | Arc tool |
| T | Text tool |
| F | Fill tool |
| E | Eraser tool |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z | Redo |
| Ctrl+S | Save to file |
| Ctrl+O | Open file |
| Ctrl+E | Export PNG |
| Escape | Cancel current operation |
| Delete | Delete selected (if selection exists) |
| G | Toggle grid |
| Space | Pause/resume animation |

---

## Vector Data Model

All drawings stored as command arrays, enabling undo/redo, export, and replay.

### Command Format

```javascript
// Line
{ type: 'line', x1: 0.1, y1: 0.2, x2: 0.5, y2: 0.8, style: 'solid' }

// Rectangle (stored as 4 lines, but grouped)
{ type: 'rect', x: 0.1, y: 0.1, width: 0.3, height: 0.2, filled: false }

// Circle
{ type: 'circle', cx: 0.5, cy: 0.5, radius: 0.2, filled: false }

// Arc
{ type: 'arc', cx: 0.5, cy: 0.5, radius: 0.2, startAngle: 0, endAngle: 1.57 }

// Text
{ type: 'text', x: 0.1, y: 0.5, text: 'HELLO', scale: 1 }

// Fill
{ type: 'fill', x: 0.3, y: 0.3, pattern: 'crosshatch' }
```

### Coordinate System
- All coordinates normalized to 0-1 range
- Rendered to actual canvas size at draw time
- Enables resolution independence and proper resize behavior

### File Format (.tek.json)

```javascript
{
  "version": 1,
  "created": "2024-01-15T10:30:00Z",
  "modified": "2024-01-15T11:45:00Z",
  "canvasAspect": 1.6,  // width/height at time of creation
  "commands": [
    // array of command objects
  ]
}
```

---

## Gallery System

### Demo Categories

**Geometric**
- Spirograph patterns (various gear ratios)
- Lissajous curves
- Rose curves (rhodonea)
- Fibonacci spiral
- Fractal tree

**3D Graphics**
- Wireframe cube (rotating)
- Wireframe sphere
- Wireframe torus
- 3D function surface (z = f(x,y))
- Perspective grid/room

**Data Visualization**
- Bar chart (animated bars growing)
- Line graph (stock-ticker style)
- Pie chart (segments drawing in)
- Scatter plot

**Maps & Astronomy**
- World map (continents outline)
- USA state boundaries
- Earth globe (wireframe sphere with continents)
- Solar system (orbits and planets)
- Star field with constellations

**Technical**
- Circuit schematic
- Oscilloscope waveform (sine, square, sawtooth)
- Logic gate diagram
- Block diagram

**Text Art**
- Large vector text banner
- ASCII-style art in vector font

### Demo Definition Format

Each demo is a generator function:

```javascript
export const spirograph = {
  id: 'spirograph',
  name: 'Spirograph',
  category: 'geometric',
  description: 'Classic spirograph pattern',
  thumbnail: null,  // generated on first run
  params: {
    R: { default: 0.4, min: 0.1, max: 0.5, label: 'Outer radius' },
    r: { default: 0.15, min: 0.05, max: 0.3, label: 'Inner radius' },
    d: { default: 0.1, min: 0.01, max: 0.2, label: 'Pen offset' }
  },
  *generate(params, width, height) {
    // yield drawing commands
    for (let t = 0; t < Math.PI * 20; t += 0.05) {
      const x1 = /* previous point */;
      const y1 = /* previous point */;
      const x2 = /* current point */;
      const y2 = /* current point */;
      yield { type: 'line', x1, y1, x2, y2 };
    }
  }
};
```

### Player Controls
- Play / Pause button
- Speed slider (same as drawing canvas)
- Restart button
- Parameter sliders (if demo has params)
- "Open in Editor" button (loads commands into drawing canvas)

---

## UI Layout

### index.html (Drawing Canvas)

```
+--------------------------------------------------+
|  TEKTRONIX GRAPHICS TERMINAL           [?] [=]   |  <- Header (minimal)
+--------+-----------------------------------------+
|  [L]   |                                         |
|  [R]   |                                         |
|  [C]   |                                         |
|  [A]   |           CANVAS AREA                   |
|  [T]   |                                         |
|  [F]   |                                         |
|  [E]   |                                         |
|        |                                         |
| ------ |                                         |
| [Undo] |                                         |
| [Redo] |                                         |
| ------ |                                         |
| [Save] |                                         |
| [Open] |                                         |
| [Exp]  |                                         |
+--------+-----------------------------------------+
|  Speed: [====|----]  |  Grid: [x]  |  Pos: 234,567  |
+--------------------------------------------------+
                        ^ Status bar
```

- Toolbar: 48px wide, icon buttons with tooltips
- Status bar: 32px tall
- Canvas: fills remaining space
- Tool options panel: slides out from toolbar when tool selected

### gallery.html

**Grid View:**
```
+--------------------------------------------------+
|  TEKTRONIX GALLERY                    [Canvas]   |
+--------------------------------------------------+
|  [Geometric] [3D] [Data] [Maps] [Technical] [Text]|
+--------------------------------------------------+
|  +--------+  +--------+  +--------+  +--------+  |
|  |        |  |        |  |        |  |        |  |
|  | Thumb  |  | Thumb  |  | Thumb  |  | Thumb  |  |
|  |        |  |        |  |        |  |        |  |
|  +--------+  +--------+  +--------+  +--------+  |
|  Spirograph   Lissajous    Rose      Fibonacci   |
|                                                   |
|  +--------+  +--------+  +--------+  +--------+  |
|  ...                                              |
+--------------------------------------------------+
```

**Player View:**
```
+--------------------------------------------------+
|  [< Back]  SPIROGRAPH                            |
+--------------------------------------------------+
|                                                   |
|                                                   |
|                   CANVAS                          |
|                                                   |
|                                                   |
+--------------------------------------------------+
|  [|<] [>]  Speed: [====|----]   R: [===] r: [==] |
+--------------------------------------------------+
```

---

## Export Options

### PNG Export
- Exports at current canvas resolution
- Option for 2x resolution (for retina/print)
- Background: transparent or `--tek-background`
- Filename: `tektronix-{timestamp}.png`

### SVG Export
- True vector output
- All commands converted to SVG path elements
- Viewbox matches original aspect ratio
- Styled with inline CSS (works standalone)
- Filename: `tektronix-{timestamp}.svg`

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Initial load | < 500ms on 3G |
| Time to interactive | < 1s |
| Animation frame rate | 60fps |
| Max commands before degradation | 10,000 |
| Memory usage | < 100MB typical |

### Performance Strategies
- Canvas layers (persistent + animation) to avoid full redraws
- Command batching for complex demos
- Throttled resize handler
- Lazy thumbnail generation for gallery

---

## Browser Support

**Supported (tested):**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Not supported:**
- Internet Explorer (any version)
- Opera Mini
- Browsers without Canvas 2D

---

## File Structure

```
tektronix-graphics-terminal/
├── index.html                 # Drawing canvas page
├── gallery.html               # Gallery page
├── css/
│   └── style.css              # All styles (dark theme, responsive)
├── js/
│   ├── app.js                 # Main bootstrap for index.html
│   ├── gallery-app.js         # Main bootstrap for gallery.html
│   ├── canvas/
│   │   ├── TekCanvas.js       # Dual-layer canvas management
│   │   ├── PlotAnimator.js    # Animation queue and timing
│   │   └── VectorRenderer.js  # HiDPI-aware line/shape rendering
│   ├── tools/
│   │   ├── ToolManager.js     # Tool state, undo/redo, history
│   │   ├── BaseTool.js        # Abstract base class
│   │   ├── LineTool.js
│   │   ├── RectTool.js
│   │   ├── CircleTool.js
│   │   ├── ArcTool.js
│   │   ├── TextTool.js
│   │   ├── FillTool.js
│   │   └── EraserTool.js
│   ├── gallery/
│   │   ├── GalleryManager.js  # Load, categorize, display demos
│   │   ├── GraphicPlayer.js   # Playback controls, param UI
│   │   └── graphics/
│   │       ├── index.js       # Export all demos
│   │       ├── geometric.js   # Spirograph, Lissajous, etc.
│   │       ├── threed.js      # Wireframe 3D graphics
│   │       ├── data.js        # Charts and graphs
│   │       ├── maps.js        # World, USA, globe
│   │       └── technical.js   # Circuits, waveforms
│   ├── fonts/
│   │   └── hershey.js         # Stroke-based vector font data
│   └── utils/
│       ├── colors.js          # Palette constants
│       ├── storage.js         # localStorage + file I/O
│       ├── export.js          # PNG/SVG generation
│       └── math.js            # Geometry helpers
├── assets/
│   └── favicon.svg            # Vector favicon
├── Dockerfile                 # nginx-based container
├── docker-compose.yml
└── README.md                  # Setup and usage docs
```

---

## Implementation Phases

### Phase 1: Foundation (Core Canvas)
1. Project scaffolding (HTML, CSS reset, file structure)
2. `colors.js` - palette constants
3. `TekCanvas.js` - dual canvas setup, HiDPI scaling, resize handling
4. `VectorRenderer.js` - line/circle/arc/rect primitives
5. `PlotAnimator.js` - animation queue, timing, pause/resume
6. Basic `index.html` with centered canvas, no tools yet
7. Test: manually queue commands, verify animation works

### Phase 2: Drawing Tools
1. `BaseTool.js` - abstract tool interface
2. `ToolManager.js` - tool switching, undo/redo stack, history
3. `LineTool.js` - simplest tool, validates architecture
4. `RectTool.js` - multi-line shape
5. `CircleTool.js` - bounding box interaction
6. `ArcTool.js` - multi-step interaction
7. `hershey.js` - vector font data
8. `TextTool.js` - text input with vector rendering
9. `FillTool.js` - pattern fills (flood fill boundary detection)
10. `EraserTool.js` - hit testing and command removal
11. Test: create drawing using each tool, verify undo/redo

### Phase 3: UI & Polish
1. Complete `style.css` - toolbar, status bar, panels
2. Complete `index.html` - full layout with all UI elements
3. `app.js` - wire up tools, keyboard shortcuts, event handlers
4. Tool options panels (line style, fill patterns, text scale)
5. Grid toggle, position display
6. Speed slider
7. Test: full drawing workflow, keyboard navigation

### Phase 4: Persistence & Export
1. `storage.js` - localStorage auto-save, JSON file save/load
2. `export.js` - PNG export with options
3. `export.js` - SVG export
4. Save/Open/Export buttons wired up
5. Test: save, reload, verify restoration; export both formats

### Phase 5: Gallery
1. Define all demo graphics (geometric, 3D, data, maps, technical)
2. `GalleryManager.js` - load demos, generate thumbnails, filtering
3. `GraphicPlayer.js` - playback controls, parameter sliders
4. `gallery.html` - grid view and player view
5. `gallery-app.js` - wire up gallery functionality
6. "Open in Editor" feature
7. Test: play all demos, test all controls

### Phase 6: Deployment & Polish
1. Cross-browser testing
2. Touch support for drawing (nice-to-have)
3. `Dockerfile` and `docker-compose.yml`
4. `README.md` with setup instructions
5. Performance profiling, optimize if needed
6. Final testing on deployed container

---

## Verification Checklist

### Drawing Tools
- [ ] Each tool creates correct vector output
- [ ] All tools animate properly at various speeds
- [ ] Undo removes last action, redo restores it
- [ ] Undo/redo works across all tool types
- [ ] Eraser removes individual elements
- [ ] Text renders in vector font, animates stroke-by-stroke
- [ ] Fill patterns render correctly within boundaries

### Animation
- [ ] Speed slider changes animation rate
- [ ] Pause/resume works mid-animation
- [ ] Skip completes queue instantly
- [ ] Complex drawings (1000+ commands) maintain 60fps

### Persistence
- [ ] Drawing survives page reload (localStorage)
- [ ] Save to .tek.json produces valid file
- [ ] Open .tek.json restores drawing exactly
- [ ] Large drawings save/load without corruption

### Export
- [ ] PNG export matches canvas appearance
- [ ] PNG 2x option produces double resolution
- [ ] SVG export renders correctly in browser
- [ ] SVG export opens correctly in Inkscape/Illustrator

### Gallery
- [ ] All demos load and play without errors
- [ ] Category filtering works
- [ ] Player controls (play/pause/restart) work
- [ ] Parameter sliders affect demo output
- [ ] "Open in Editor" transfers commands correctly

### Deployment
- [ ] Docker container builds successfully
- [ ] Container serves site on port 80
- [ ] Site works when served from any static host
- [ ] No console errors in production

---

## Open Questions / Future Considerations

_Not in scope for v1, but worth noting:_

1. **Multi-user collaboration** - Real-time shared canvas
2. **Animation recording** - Export as video/GIF
3. **Custom demos** - User-created demos saved to gallery
4. **More fonts** - Multiple Hershey font variants
5. **Layers** - Multiple drawing layers with visibility toggle
6. **Zoom/pan** - Navigate large drawings
7. **Command palette** - Searchable action menu (Ctrl+P style)
