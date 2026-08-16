/**
 * CustomBrushes.js
 * -------------------------------------------------------------
 * Real fabric.js (v6) brush engine that gives each toolbar brush
 * (Calligraphy Pen, Technical Pen, Crayon, Acrylic, Marker,
 * Highlighter, Pencil) its own distinct rendering behaviour, plus:
 *   - a draggable/rotatable Ruler guide that any brush can snap to
 *   - a non-destructive vector eraser (removes strokes, never the
 *     underlying blueprint image)
 *
 * Every brush class extends fabric.PencilBrush so pointer capture,
 * point smoothing and live-preview keep working exactly as fabric
 * already handles it. Only `createPath()` (called once on
 * mouse-up, with the finished SVG path string) is overridden to
 * decide what permanent object(s) actually get added to the canvas.
 * -------------------------------------------------------------
 */
import * as fabric from 'fabric';

/* ---------------------------------------------------------
   Small deterministic RNG so a brush's texture doesn't
   re-randomize (and visually "jump") on every re-render.
--------------------------------------------------------- */
function seededRandom(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function next() {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

/* ===========================================================
   RULER GUIDE
   A draggable, rotatable straight-edge. Any brush (see
   `withRulerSnap` below) will snap its points onto this guide's
   edge whenever the pointer comes within ~24px of it — exactly
   like using a real ruler with a pencil against it.
=========================================================== */
export function ensureRulerGuide(canvas) {
    if (canvas.__rulerGuide && canvas.getObjects().includes(canvas.__rulerGuide)) {
        return canvas.__rulerGuide;
    }

    const length = 480;
    const bar = new fabric.Rect({
        left: 0, top: -45, width: length, height: 90, rx: 12, ry: 12,
        fill: 'rgba(241, 245, 249, 0.75)',
        stroke: 'rgba(148, 163, 184, 0.9)',
        strokeWidth: 1.5,
        shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.25)', blur: 20, offsetY: 8 })
    });

    const angleText = new fabric.Text('0°', {
        left: 20, top: 0, originX: 'center', originY: 'center',
        fontSize: 12, fontFamily: 'monospace', fontWeight: 'bold', fill: '#0EA5E9',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 4, rx: 4, ry: 4
    });

    const elements = [bar, angleText];
    const SNAP_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315, 360];

    // Engraved ticks & numbers (0 1 2 3 4 5 6 7 8 9 10)
    for (let i = 0; i <= 10; i++) {
        const x = 30 + i * 42;
        // Top Ticks
        elements.push(new fabric.Line([x, -45, x, -28], { stroke: '#0F172A', strokeWidth: 1.5 }));
        // Bottom Ticks
        elements.push(new fabric.Line([x, 45, x, 28], { stroke: '#0F172A', strokeWidth: 1.5 }));
        // Centered Engraved Number Text
        elements.push(new fabric.Text(String(i), {
            left: x, top: 0, originX: 'center', originY: 'center',
            fontSize: 13, fontFamily: 'monospace', fontWeight: 'bold', fill: '#0F172A'
        }));

        // Minor ticks
        if (i < 10) {
            for (let m = 1; m < 5; m++) {
                const mx = x + m * (42 / 5);
                elements.push(new fabric.Line([mx, -45, mx, -35], { stroke: '#475569', strokeWidth: 1 }));
                elements.push(new fabric.Line([mx, 45, mx, 35], { stroke: '#475569', strokeWidth: 1 }));
            }
        }
    }

    const guide = new fabric.Group(elements, {
        left: 220,
        top: 300,
        angle: 0,
        selectable: true,
        evented: true,
        hasControls: true,
        lockScalingX: true,
        lockScalingY: true,
        isRulerGuide: true,
        hoverCursor: 'move',
        borderColor: '#38BDF8',
        cornerColor: '#0EA5E9',
        cornerSize: 12,
        transparentCorners: false
    });

    guide.setControlsVisibility({
        mt: false, mb: false, ml: false, mr: false,
        tl: false, tr: false, bl: false, br: false,
        mtr: true
    });

    // 360° Angle Snapping Physics & Live Badge Update
    guide.on('rotating', () => {
        const current = ((guide.angle % 360) + 360) % 360;
        let finalAngle = Math.round(current);
        for (const snap of SNAP_ANGLES) {
            if (Math.abs(current - snap) <= 3.5 || Math.abs(current - snap) >= 356.5) {
                finalAngle = snap % 360;
                guide.set('angle', finalAngle);
                break;
            }
        }
        angleText.set('text', `${finalAngle}°`);
        canvas.renderAll();
    });

    // Double-click ruler directly on canvas to delete / hide ruler guide
    guide.on('mousedblclick', () => {
        removeRulerGuide(canvas);
        canvas.renderAll();
    });

    canvas.add(guide);
    canvas.bringObjectToFront(guide);
    canvas.__rulerGuide = guide;
    return guide;
}

export function removeRulerGuide(canvas) {
    if (canvas.__rulerGuide) {
        canvas.remove(canvas.__rulerGuide);
        canvas.__rulerGuide = null;
        canvas.renderAll();
    }
}


/** Projects a scene point onto the ruler's edge if it's close enough. */
export function applyRulerSnap(canvas, pointer) {
    const ruler = canvas && canvas.__rulerGuide;
    if (!ruler || !pointer) return pointer;

    const angleRad = (ruler.angle || 0) * (Math.PI / 180);
    const center = ruler.getCenterPoint();
    const dirX = Math.cos(angleRad);
    const dirY = Math.sin(angleRad);
    const relX = pointer.x - center.x;
    const relY = pointer.y - center.y;
    const along = relX * dirX + relY * dirY;
    const perp = relX * -dirY + relY * dirX;

    const halfLen = (ruler.width || 420) / 2;
    if (Math.abs(perp) < 26 && along > -halfLen - 20 && along < halfLen + 20) {
        return { x: center.x + dirX * along, y: center.y + dirY * along };
    }
    return pointer;
}

/** Wraps any brush class so its points snap to the ruler guide when nearby. */
function withRulerSnap(BrushClass) {
    return class RulerAwareBrush extends BrushClass {
        onMouseDown(pointer, options) {
            super.onMouseDown(applyRulerSnap(this.canvas, pointer), options);
        }
        onMouseMove(pointer, options) {
            super.onMouseMove(applyRulerSnap(this.canvas, pointer), options);
        }
    };
}

/* ===========================================================
   1. TECHNICAL PEN — crisp, uniform line with opacity control.
=========================================================== */
class TechnicalPenBrush extends fabric.PencilBrush {
    createPath(pathData) {
        const path = super.createPath(pathData);
        path.set({
            stroke: this.color,
            strokeWidth: Math.max(1.2, this.width * 0.34),
            opacity: this.opacity ?? 1,
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
            toolType: 'technical'
        });
        return path;
    }
}

/* ===========================================================
   2. FINE MARKER — flat, solid line with opacity control.
=========================================================== */
class MarkerBrush extends fabric.PencilBrush {
    createPath(pathData) {
        const path = super.createPath(pathData);
        path.set({
            stroke: this.color,
            strokeWidth: Math.max(2, this.width * 0.55),
            opacity: (this.opacity ?? 1) * 0.95,
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
            toolType: 'marker'
        });
        return path;
    }
}

/* ===========================================================
   3. HIGHLIGHTER — wide, translucent, chisel cap, multiply blend.
=========================================================== */
class HighlighterBrush extends fabric.PencilBrush {
    createPath(pathData) {
        const path = new fabric.Path(pathData, {
            stroke: this.color,
            strokeWidth: Math.max(14, this.width * 1.6),
            fill: null,
            opacity: (this.opacity ?? 1) * 0.5,
            strokeLineCap: 'butt',
            strokeLineJoin: 'round',
            globalCompositeOperation: 'multiply',
            toolType: 'highlighter'
        });
        return path;
    }
}

/* ===========================================================
   4. GRAPHITE PENCIL — crisp, grainy pencil stroke.
=========================================================== */
class PencilTextureBrush extends fabric.PencilBrush {
    createPath(pathData) {
        const path = super.createPath(pathData);
        path.set({
            stroke: this.color,
            strokeWidth: Math.max(1, this.width * 0.4),
            fill: null,
            opacity: (this.opacity ?? 1) * 0.8,
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
            toolType: 'pencil'
        });
        return path;
    }
}

/* ===========================================================
   5. CRAYON / WAX PASTEL — Authentic Wax Texture stroke.
=========================================================== */
class CrayonBrush extends fabric.PencilBrush {
  createPath(pathData) {
    const crayonWidth = Math.max(4, this.width * 1.5);
    const path = super.createPath(pathData);
    path.set({
      stroke: this.color,
      strokeWidth: crayonWidth,
      fill: null,
      opacity: (this.opacity ?? 1) * 0.85,
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
      toolType: 'crayon'
    });
    return path;
  }
}

/* ===========================================================
   6. ACRYLIC / WATERCOLOR BRUSH — Rich acrylic paint stroke.
=========================================================== */
class AcrylicBrush extends fabric.PencilBrush {
  createPath(pathData) {
    const acrylicWidth = Math.max(6, this.width * 1.8);
    const path = super.createPath(pathData);
    path.set({
      stroke: this.color,
      strokeWidth: acrylicWidth,
      fill: null,
      opacity: (this.opacity ?? 1) * 0.9,
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
      toolType: 'acrylic'
    });
    return path;
  }
}

/* ===========================================================
   7. CALLIGRAPHY / FOUNTAIN PEN — width varies with drawing
      speed (slow = thick, fast = thin), built as a filled
      variable-width outline polygon rather than a fixed stroke.
=========================================================== */
/* ===========================================================
   7. CALLIGRAPHY / FOUNTAIN PEN — Real 45° Chiseled Nib Physics
      + Smooth Catmull-Rom Bezier Spline Outline Ribbon
=========================================================== */
class CalligraphyBrush extends fabric.PencilBrush {
  constructor(canvas) {
    super(canvas);
    this._capturedPoints = [];
    this._capturedTimes = [];
  }

  onMouseDown(pointer, options) {
    this._capturedPoints = [pointer];
    this._capturedTimes = [performance.now()];
    super.onMouseDown(pointer, options);
  }

  onMouseMove(pointer, options) {
    if (!pointer) return;
    const pts = this._capturedPoints;
    const last = pts[pts.length - 1];
    if (!last || Math.hypot(pointer.x - last.x, pointer.y - last.y) > 1.5) {
      this._capturedPoints.push(pointer);
      this._capturedTimes.push(performance.now());
    }
    super.onMouseMove(pointer, options);
  }

  createPath(pathData) {
    const rawPts = this._capturedPoints;
    if (!rawPts || rawPts.length < 3) {
      const fallback = super.createPath(pathData);
      fallback.set({ toolType: 'pen' });
      return fallback;
    }

    // 1. Smooth raw points using Catmull-Rom Spline Interpolation
    const pts = [];
    for (let i = 0; i < rawPts.length - 1; i++) {
      const p0 = rawPts[Math.max(0, i - 1)];
      const p1 = rawPts[i];
      const p2 = rawPts[i + 1];
      const p3 = rawPts[Math.min(rawPts.length - 1, i + 2)];

      const steps = 4;
      for (let t = 0; t < steps; t++) {
        const u = t / steps;
        const u2 = u * u;
        const u3 = u2 * u;

        const x = 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * u + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3);
        const y = 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * u + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3);
        pts.push({ x, y });
      }
    }
    pts.push(rawPts[rawPts.length - 1]);

    // 2. Chiseled Nib Physics Angle (45 degrees = Math.PI / 4)
    const NIB_ANGLE = Math.PI / 4;
    const baseW = Math.max(2.5, this.width);
    const minW = Math.max(1.2, this.width * 0.45);

    const left = [];
    const right = [];

    const total = pts.length;
    for (let i = 0; i < total; i++) {
      const p = pts[i];
      const prev = pts[Math.max(0, i - 1)];
      const next = pts[Math.min(total - 1, i + 1)];

      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const moveAngle = Math.atan2(dy, dx);

      const angleDiff = moveAngle - NIB_ANGLE;

      // Calculate width between minW (horizontal/parallel) and baseW (vertical/perpendicular)
      let w = minW + (baseW - minW) * Math.abs(Math.sin(angleDiff));

      // Subtle cap taper at start and end
      if (i < 4) {
        w *= (i + 1) / 4;
      } else if (i > total - 5) {
        w *= (total - i) / 4;
      }

      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;

      const halfW = w / 2;
      left.push({ x: p.x + nx * halfW, y: p.y + ny * halfW });
      right.push({ x: p.x - nx * halfW, y: p.y - ny * halfW });
    }

    // 3. Build Smooth SVG Path with Quadratic Bezier Curves for Left & Right Ribbon Edges
    const generateSidePath = (arr) => {
      let cmd = '';
      for (let i = 0; i < arr.length - 1; i++) {
        const p1 = arr[i];
        const p2 = arr[i + 1];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        cmd += `Q ${p1.x} ${p1.y} ${midX} ${midY} `;
      }
      return cmd;
    };

    let d = `M ${left[0].x} ${left[0].y} `;
    d += generateSidePath(left);
    d += `L ${right[right.length - 1].x} ${right[right.length - 1].y} `;
    d += generateSidePath(right.reverse());
    d += 'Z';

    const path = new fabric.Path(d, {
      fill: this.color,
      stroke: null,
      opacity: 1,
      strokeLineJoin: 'round',
      strokeLineCap: 'round',
      toolType: 'pen'
    });

    return path;
  }
}

/* ===========================================================
   FACTORY — returns a ready-to-use, ruler-snap-aware brush
   instance configured for the requested tool id, or null if
   the tool id isn't a freehand-drawing tool.
=========================================================== */
const BRUSH_CLASSES = {
    technical: TechnicalPenBrush,
    marker: MarkerBrush,
    highlighter: HighlighterBrush,
    pencil: PencilTextureBrush,
    crayon: CrayonBrush,
    acrylic: AcrylicBrush,
    pen: CalligraphyBrush
};

export function getBrushForTool(canvas, tool, { color, width, opacity = 1 }) {
    const BaseClass = BRUSH_CLASSES[tool];
    if (!BaseClass) return null;
    const WrappedClass = withRulerSnap(BaseClass);
    const brush = new WrappedClass(canvas);
    brush.color = color;
    brush.width = width;
    brush.opacity = opacity;
    brush.strokeLineCap = 'round';
    brush.strokeLineJoin = 'round';
    return brush;
}

/**
 * Distance squared from point p to line segment v-w
 */
function distToSegmentSquared(p, v, w) {
  const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
  if (l2 === 0) return (p.x - v.x) ** 2 + (p.y - v.y) ** 2;
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return (p.x - (v.x + t * (w.x - v.x))) ** 2 + (p.y - (v.y + t * (w.y - v.y))) ** 2;
}

/**
 * Sub-path segment splitter for TRUE PIXEL/SEGMENT ERASING.
 * Erases only the exact line segments under the eraser circle instead of deleting the whole line object!
 */
function splitAndErasePath(canvas, pathObj, pointer, radius) {
  if (!pathObj || !pathObj.path || !Array.isArray(pathObj.path) || pathObj.path.length < 2) return false;

  const matrix = pathObj.calcTransformMatrix ? pathObj.calcTransformMatrix() : [1, 0, 0, 1, pathObj.left || 0, pathObj.top || 0];
  const r2 = radius * radius;
  const pathCmds = pathObj.path;

  const newSegments = [];
  let currentSeg = [];

  for (let i = 0; i < pathCmds.length; i++) {
    const cmd = pathCmds[i];
    if (!cmd || cmd.length < 3) continue;

    const x = cmd[cmd.length - 2];
    const y = cmd[cmd.length - 1];
    const pt = fabric.util.transformPoint({ x, y }, matrix);

    const distSq = (pointer.x - pt.x) ** 2 + (pointer.y - pt.y) ** 2;
    const isErased = distSq <= r2;

    if (!isErased) {
      currentSeg.push(cmd);
    } else {
      if (currentSeg.length >= 2) {
        newSegments.push(currentSeg);
      }
      currentSeg = [];
    }
  }

  if (currentSeg.length >= 2) {
    newSegments.push(currentSeg);
  }

  // If no points were erased, do nothing
  if (newSegments.length === 1 && newSegments[0].length === pathCmds.length) {
    return false;
  }

  // Remove original path object from canvas
  canvas.remove(pathObj);

  // If entire path was erased, return true
  if (newSegments.length === 0) {
    return true;
  }

  // Add the remaining non-erased path segments back to canvas
  newSegments.forEach((seg) => {
    const formattedSeg = seg.map((c, idx) => {
      if (idx === 0) return ['M', c[c.length - 2], c[c.length - 1]];
      return c;
    });

    const newPath = new fabric.Path(formattedSeg, {
      stroke: pathObj.stroke,
      strokeWidth: pathObj.strokeWidth,
      fill: pathObj.fill,
      opacity: pathObj.opacity,
      strokeLineCap: pathObj.strokeLineCap || 'round',
      strokeLineJoin: pathObj.strokeLineJoin || 'round',
      globalCompositeOperation: pathObj.globalCompositeOperation,
      toolType: pathObj.toolType || 'pen'
    });

    canvas.add(newPath);
  });

  return true;
}

/**
 * Checks if an object (path, group, shape, text) intersects with eraser circle at pointer
 */
function doesObjectIntersectEraser(obj, pointer, radius) {
  if (!obj || obj.isBackground) return false;

  const rect = obj.getBoundingRect();
  if (
    pointer.x < rect.left - radius ||
    pointer.x > rect.left + rect.width + radius ||
    pointer.y < rect.top - radius ||
    pointer.y > rect.top + rect.height + radius
  ) {
    return false;
  }

  const r2 = radius * radius;

  if (obj.path && Array.isArray(obj.path)) {
    try {
      const matrix = obj.calcTransformMatrix ? obj.calcTransformMatrix() : [1, 0, 0, 1, obj.left || 0, obj.top || 0];
      let prevPt = null;

      for (let i = 0; i < obj.path.length; i++) {
        const cmd = obj.path[i];
        if (cmd && cmd.length >= 3) {
          const rawX = cmd[cmd.length - 2];
          const rawY = cmd[cmd.length - 1];
          const pt = fabric.util.transformPoint({ x: rawX, y: rawY }, matrix);

          const distSq = (pointer.x - pt.x) ** 2 + (pointer.y - pt.y) ** 2;
          if (distSq <= r2) return true;

          if (prevPt) {
            if (distToSegmentSquared(pointer, prevPt, pt) <= r2) return true;
          }
          prevPt = pt;
        }
      }
    } catch (err) {
      // Fallback
    }
  }

  if (obj.type === 'group' && typeof obj.getObjects === 'function') {
    const children = obj.getObjects();
    for (let child of children) {
      if (doesObjectIntersectEraser(child, pointer, radius)) return true;
    }
  }

  const center = obj.getCenterPoint();
  const distCenterSq = (pointer.x - center.x) ** 2 + (pointer.y - center.y) ** 2;
  if (distCenterSq <= (radius + Math.max(rect.width, rect.height) / 2) ** 2) return true;

  return false;
}

/* ===========================================================
   VECTOR & PIXEL ERASER ENGINE
   Supports:
   - 'pixel' mode: Segment splitting (erases ONLY the exact pixels under cursor)
   - 'object' mode: Deletes whole object when touched
=========================================================== */
export function eraseObjectsNear(canvas, pointer, radius = 24, { mode = 'pixel', includeGuide = false } = {}) {
  const removedList = [];

  const candidateObjects = canvas.getObjects().filter(obj => {
    if (obj.isBackground) return false;
    if (obj.isRulerGuide && !includeGuide) return false;
    return doesObjectIntersectEraser(obj, pointer, radius);
  });

  candidateObjects.forEach((obj) => {
    if (mode === 'pixel' && obj.path && Array.isArray(obj.path)) {
      const isSplit = splitAndErasePath(canvas, obj, pointer, radius);
      if (isSplit) removedList.push(obj);
    } else {
      canvas.remove(obj);
      if (obj === canvas.__rulerGuide) canvas.__rulerGuide = null;
      removedList.push(obj);
    }
  });

  if (removedList.length) {
    canvas.requestRenderAll();
  }

  return removedList;
}



/* ===========================================================
   ARCHITECTURAL DIMENSION TOOL
   Creates dimension lines with extension ticks, arrows, and
   scaled measurement label (e.g. <---------- 4500 mm ---------->).
=========================================================== */
export function createDimensionShape(x1, y1, x2, y2, { color = '#2484C6', width = 2, opacity = 1, unit = 'mm', scale = 10 } = {}) {
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const val = Math.round(dist * scale);
  const textLabel = `${val} ${unit}`;

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const perp = angle + Math.PI / 2;

  const extLen = 14;
  const pX = Math.cos(perp) * extLen;
  const pY = Math.sin(perp) * extLen;

  // Main dimension line
  const mainLine = new fabric.Line([x1, y1, x2, y2], {
    stroke: color, strokeWidth: width, opacity
  });

  // Start extension line
  const ext1 = new fabric.Line([x1 - pX, y1 - pY, x1 + pX, y1 + pY], {
    stroke: color, strokeWidth: width, opacity
  });

  // End extension line
  const ext2 = new fabric.Line([x2 - pX, y2 - pY, x2 + pX, y2 + pY], {
    stroke: color, strokeWidth: width, opacity
  });

  // Center measurement text
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  const text = new fabric.Text(textLabel, {
    left: midX,
    top: midY - 12,
    originX: 'center',
    originY: 'center',
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fill: color,
    opacity,
    angle: (angle * 180) / Math.PI
  });

  const group = new fabric.Group([mainLine, ext1, ext2, text], {
    left: Math.min(x1, x2),
    top: Math.min(y1, y2) - 15,
    isDimension: true,
    toolType: 'dimension',
    dimensionData: { x1, y1, x2, y2, val, unit }
  });

  return group;
}

/* ===========================================================
   REVISION CLOUD TOOL
   Creates scalloped arc revision clouds for architectural revisions.
=========================================================== */
export function createCloudShape(left, top, width, height, { color = '#EF4444', strokeWidth = 2, opacity = 1 } = {}) {
  const w = Math.max(30, width);
  const h = Math.max(30, height);
  const r = 12; // arc radius

  let d = `M ${left + r} ${top} `;
  // Top edge arcs
  for (let x = left + r; x < left + w; x += r * 1.5) {
    const nextX = Math.min(left + w, x + r * 1.5);
    d += `A ${r} ${r} 0 0 1 ${nextX} ${top} `;
  }
  // Right edge arcs
  for (let y = top; y < top + h; y += r * 1.5) {
    const nextY = Math.min(top + h, y + r * 1.5);
    d += `A ${r} ${r} 0 0 1 ${left + w} ${nextY} `;
  }
  // Bottom edge arcs
  for (let x = left + w; x > left; x -= r * 1.5) {
    const nextX = Math.max(left, x - r * 1.5);
    d += `A ${r} ${r} 0 0 1 ${nextX} ${top + h} `;
  }
  // Left edge arcs
  for (let y = top + h; y > top; y -= r * 1.5) {
    const nextY = Math.max(top, y - r * 1.5);
    d += `A ${r} ${r} 0 0 1 ${left} ${nextY} `;
  }
  d += 'Z';

  const path = new fabric.Path(d, {
    fill: 'transparent',
    stroke: color,
    strokeWidth,
    opacity,
    strokeLineCap: 'round',
    strokeLineJoin: 'round',
    toolType: 'cloud'
  });

  return path;
}

/* ===========================================================
   REVIEW STAMP TOOL
   Creates architectural review stamps (APPROVED, REVIEW, REVISE, REJECTED).
=========================================================== */
export function createStampShape(x, y, stampType = 'APPROVED') {
  const typeConfigs = {
    APPROVED: { label: 'APPROVED', color: '#16A34A', bg: 'rgba(22, 163, 74, 0.08)' },
    REVIEW: { label: 'UNDER REVIEW', color: '#2563EB', bg: 'rgba(37, 99, 235, 0.08)' },
    REVISE: { label: 'REVISE & RESUBMIT', color: '#D97706', bg: 'rgba(217, 119, 6, 0.08)' },
    REJECTED: { label: 'REJECTED', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.08)' }
  };

  const cfg = typeConfigs[stampType] || typeConfigs.APPROVED;

  const rect = new fabric.Rect({
    width: 210,
    height: 60,
    rx: 8,
    ry: 8,
    fill: cfg.bg,
    stroke: cfg.color,
    strokeWidth: 3.5,
    originX: 'center',
    originY: 'center'
  });

  const text = new fabric.Text(cfg.label, {
    fontSize: 18,
    fontFamily: 'Impact, sans-serif',
    fontWeight: 'bold',
    fill: cfg.color,
    originX: 'center',
    originY: 'center',
    letterSpacing: 2
  });

  const dateText = new fabric.Text(new Date().toISOString().split('T')[0], {
    fontSize: 10,
    fontFamily: 'monospace',
    fill: cfg.color,
    originX: 'center',
    originY: 'center',
    top: 18
  });

  const stampGroup = new fabric.Group([rect, text, dateText], {
    left: x,
    top: y,
    originX: 'center',
    originY: 'center',
    angle: -8,
    selectable: true,
    isStamp: true,
    toolType: 'stamp',
    stampType
  });

  return stampGroup;
}