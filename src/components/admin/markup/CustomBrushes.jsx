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
        fill: 'rgba(241, 245, 249, 0.52)',
        stroke: 'rgba(148, 163, 184, 0.9)',
        strokeWidth: 1.5,
        shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.25)', blur: 20, offsetY: 8 })
    });

    const elements = [bar];
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
        left: 180,
        top: 280,
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

    // 360° Angle Snapping Physics
    guide.on('rotating', () => {
        const current = ((guide.angle % 360) + 360) % 360;
        for (const snap of SNAP_ANGLES) {
            if (Math.abs(current - snap) <= 3.5 || Math.abs(current - snap) >= 356.5) {
                guide.set('angle', snap % 360);
                break;
            }
        }
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
 * Checks if an object (path, group, shape, text) intersects with eraser circle at pointer
 */
function doesObjectIntersectEraser(obj, pointer, radius) {
  if (!obj || obj.isBackground) return false;

  // 1. Bounding box check with radius margin
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

  // 2. If object is a Path (pen, pencil, marker, highlighter stroke)
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

  // 3. If object is a Group (Crayon, PencilTexture, Acrylic multi-layer strokes)
  if (obj.type === 'group' && typeof obj.getObjects === 'function') {
    const children = obj.getObjects();
    for (let child of children) {
      if (doesObjectIntersectEraser(child, pointer, radius)) return true;
    }
  }

  // 4. Center point & bounding box fallback for shapes, text, pins
  const center = obj.getCenterPoint();
  const distCenterSq = (pointer.x - center.x) ** 2 + (pointer.y - center.y) ** 2;
  if (distCenterSq <= (radius + Math.max(rect.width, rect.height) / 2) ** 2) return true;

  return false;
}

/* ===========================================================
   VECTOR ERASER — removes markup objects that intersect the
   pointer (never the background blueprint, never the ruler
   unless directly clicked).
=========================================================== */
export function eraseObjectsNear(canvas, pointer, radius = 24, { includeGuide = false } = {}) {
  const toRemove = [];

  canvas.getObjects().forEach((obj) => {
    if (obj.isBackground) return;
    if (obj.isRulerGuide && !includeGuide) return;

    if (doesObjectIntersectEraser(obj, pointer, radius)) {
      toRemove.push(obj);
    }
  });

  if (toRemove.length) {
    toRemove.forEach((o) => {
      canvas.remove(o);
      if (o === canvas.__rulerGuide) canvas.__rulerGuide = null;
    });
    canvas.requestRenderAll();
  }
  return toRemove.length > 0;
}