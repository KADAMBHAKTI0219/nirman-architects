import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import {
  getBrushForTool,
  ensureRulerGuide,
  removeRulerGuide,
  applyRulerSnap,
  eraseObjectsNear
} from './CustomBrushes';

export default function CanvasViewer({
  bgImageSrc,
  activeTool = 'pen',
  activeShape = 'rectangle',
  strokeColor = '#2484C6',
  strokeWidth = 4,
  opacity = 1,
  fontSize = 20,
  zoomLevel = 1,
  eraserMode = 'pixel',
  onCanvasReady,
  onSelectionChange,
  onObjectsChange,
  onPinDropped,
  onPinClick
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const bgImageRef = useRef(null);

  // Dragging shape creation state
  const isMouseDownRef = useRef(false);
  const shapeStartCoordsRef = useRef({ x: 0, y: 0 });
  const tempShapeObjRef = useRef(null);
  const pinCountRef = useRef(0);

  // Eraser drag state
  const isErasingRef = useRef(false);

  // Lasso Loop Selection refs
  const isLassoingRef = useRef(false);
  const lassoPointsRef = useRef([]);
  const tempLassoPathRef = useRef(null);

  // Point in polygon helper for lasso selection
  const isPointInPolygon = (point, vs) => {
    let x = point.x, y = point.y;
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      let xi = vs[i].x, yi = vs[i].y;
      let xj = vs[j].x, yj = vs[j].y;
      let intersect = ((yi > y) !== (yj > y)) &&
          (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  /* -----------------------------------------------------------
     Initialize Fabric Canvas
  ----------------------------------------------------------- */
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    // Configure Apple iOS Markup selection box & circular handle styling
    fabric.Object.prototype.set({
      borderColor: '#F59E0B',
      borderDashArray: [6, 6],
      borderScaleFactor: 2,
      cornerColor: '#FFFFFF',
      cornerStrokeColor: '#F59E0B',
      cornerStyle: 'circle',
      cornerSize: 12,
      transparentCorners: false,
      padding: 6
    });

    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#F8FAFC',
      selection: true,
      preserveObjectStacking: true
    });

    fabricCanvasRef.current = canvas;
    if (onCanvasReady) onCanvasReady(canvas);

    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      canvas.setDimensions({ width: w, height: h });
      canvas.renderAll();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  /* -----------------------------------------------------------
     Load Background Blueprint Image
  ----------------------------------------------------------- */
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !bgImageSrc) return;

    const imgElement = new Image();
    imgElement.crossOrigin = 'anonymous';
    imgElement.src = bgImageSrc;

    imgElement.onload = () => {
      try {
        const fabricImg = new fabric.FabricImage(imgElement);
        bgImageRef.current = fabricImg;

        const cWidth = canvas.width;
        const cHeight = canvas.height;
        const scale = Math.min((cWidth - 80) / fabricImg.width, (cHeight - 80) / fabricImg.height, 1);

        fabricImg.set({
          scaleX: scale,
          scaleY: scale,
          left: (cWidth - fabricImg.width * scale) / 2,
          top: (cHeight - fabricImg.height * scale) / 2,
          selectable: false,
          evented: false,
          isBackground: true
        });

        canvas.getObjects().forEach((obj) => {
          if (obj.isBackground) canvas.remove(obj);
        });

        canvas.add(fabricImg);
        canvas.sendObjectToBack(fabricImg);
        canvas.renderAll();
      } catch (err) {
        console.warn('Fabric background image loading issue:', err);
      }
    };
  }, [bgImageSrc]);

  /* -----------------------------------------------------------
     Update Canvas Zoom
  ----------------------------------------------------------- */
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const center = canvas.getVpCenter();
    canvas.zoomToPoint(center, zoomLevel);
    canvas.renderAll();
  }, [zoomLevel]);

  /* -----------------------------------------------------------
     Apply Tool Behaviors & Brushes
     Every freehand tool now gets its own physically-modeled
     brush from CustomBrushes.js instead of a single generic
     PencilBrush. The Ruler guide, once placed, snaps every
     brush's points onto its edge automatically.
  ----------------------------------------------------------- */
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = false;
    canvas.selection = activeTool === 'select' || activeTool === 'marker';
    canvas.defaultCursor = 'default';

    const DRAW_TOOLS = ['pen', 'technical', 'crayon', 'acrylic', 'highlighter', 'pencil'];

    canvas.getObjects().forEach((obj) => {
      if (obj.isBackground) return;
      if (obj.isRulerGuide) {
        // Ruler is only grabbable/rotatable while the Ruler tool itself is active;
        // otherwise it stays put and just acts as an invisible-to-events snap guide.
        obj.selectable = activeTool === 'ruler';
        obj.evented = activeTool === 'ruler';
        return;
      }
      obj.selectable = activeTool === 'select' || activeTool === 'marker';
      obj.evented = activeTool !== 'pan';
    });

    if (DRAW_TOOLS.includes(activeTool)) {
      canvas.isDrawingMode = true;
      const brush = getBrushForTool(canvas, activeTool, { color: strokeColor, width: strokeWidth, opacity: opacity });
      if (brush) {
        brush.width = strokeWidth;
        brush.opacity = opacity;
        canvas.freeDrawingBrush = brush;
      }
    } else if (activeTool === 'eraser') {
      canvas.defaultCursor = 'cell';
    } else if (activeTool === 'ruler') {
      canvas.defaultCursor = 'default';
      ensureRulerGuide(canvas);
    } else if (activeTool === 'pan') {
      canvas.defaultCursor = 'grab';
    } else if (activeTool === 'pin') {
      canvas.defaultCursor = 'pointer';
    } else if (activeTool === 'text' || activeTool === 'shape') {
      canvas.defaultCursor = 'crosshair';
    }

    canvas.renderAll();
  }, [activeTool, strokeColor, strokeWidth, opacity, fontSize]);

  /* -----------------------------------------------------------
     Mouse Events for Shapes, Text, Pins, Eraser & Panning
  ----------------------------------------------------------- */
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let isPanning = false;
    let lastPanPos = { x: 0, y: 0 };

    const handleMouseDown = (opt) => {
      const e = opt.e;
      const rawPointer = canvas.getScenePoint(e);
      const pointer = activeTool === 'shape' ? applyRulerSnap(canvas, rawPointer) : rawPointer;

      // 0. Lasso Selection Mode (Freehand circle around objects)
      if (activeTool === 'select' || activeTool === 'marker') {
        const target = opt.target;
        if (!target || target.isBackground) {
          isLassoingRef.current = true;
          lassoPointsRef.current = [{ x: rawPointer.x, y: rawPointer.y }];

          if (tempLassoPathRef.current) canvas.remove(tempLassoPathRef.current);

          tempLassoPathRef.current = new fabric.Polyline(lassoPointsRef.current, {
            stroke: '#0EA5E9',
            strokeWidth: 2,
            fill: 'rgba(14, 165, 233, 0.12)',
            strokeDashArray: [6, 4],
            selectable: false,
            evented: false,
            objectCaching: false
          });

          canvas.add(tempLassoPathRef.current);
          return;
        }
      }

      // 1. Pan Mode
      if (activeTool === 'pan') {
        isPanning = true;
        lastPanPos = { x: e.clientX, y: e.clientY };
        canvas.defaultCursor = 'grabbing';
        return;
      }

      // 2. Eraser Mode — click removes whatever's under the cursor
      //    (including the ruler guide, if directly targeted), then
      //    mouse-move below continues erasing along the drag path.
      if (activeTool === 'eraser') {
        isErasingRef.current = true;
        if (eraserMode === 'object') {
          const target = opt.target;
          if (target && !target.isBackground) {
            canvas.remove(target);
            if (target === canvas.__rulerGuide) canvas.__rulerGuide = null;
            canvas.renderAll();
            if (onObjectsChange) onObjectsChange();
          }
        } else {
          const radius = Math.max(24, strokeWidth * 2.2);
          const erased = eraseObjectsNear(canvas, rawPointer, radius);
          if (erased && onObjectsChange) onObjectsChange();
        }
        return;
      }

      // 3. Comment Pin Tool
      if (activeTool === 'pin') {
        if (opt.target && opt.target.isPin) {
          if (onPinClick) onPinClick(opt.target.pinData);
          return;
        }

        pinCountRef.current += 1;
        const pinNum = pinCountRef.current;

        const circle = new fabric.Circle({
          radius: 14,
          fill: '#0284C7',
          stroke: '#FFFFFF',
          strokeWidth: 2,
          originX: 'center',
          originY: 'center'
        });

        const text = new fabric.IText(`#${pinNum}`, {
          fontSize: 11,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: '#FFFFFF',
          originX: 'center',
          originY: 'center',
          editable: false
        });

        const pinGroup = new fabric.Group([circle, text], {
          left: pointer.x,
          top: pointer.y,
          originX: 'center',
          originY: 'center',
          selectable: true,
          isPin: true,
          pinData: { id: pinNum, number: pinNum, x: pointer.x, y: pointer.y, author: 'Super Admin', message: 'Comment pin at location' }
        });

        canvas.add(pinGroup);
        canvas.renderAll();

        if (onPinDropped) {
          onPinDropped({
            id: pinNum,
            number: pinNum,
            x: pointer.x,
            y: pointer.y,
            author: 'Super Admin',
            message: 'New comment thread dropped on blueprint.',
            status: 'Open',
            replies: []
          });
        }
        return;
      }

      // 4. Text Tool
      if (activeTool === 'text') {
        const iText = new fabric.IText('Type text here...', {
          left: pointer.x,
          top: pointer.y,
          fontFamily: 'Arial',
          fontSize: fontSize || 20,
          fill: strokeColor,
          opacity: opacity,
          editable: true
        });

        canvas.add(iText);
        canvas.setActiveObject(iText);
        iText.enterEditing();
        canvas.renderAll();
        if (onObjectsChange) onObjectsChange();
        return;
      }

      // 5. Shapes Tool Creation (ruler-snapped start point when near the guide)
      if (activeTool === 'shape') {
        isMouseDownRef.current = true;
        shapeStartCoordsRef.current = { x: pointer.x, y: pointer.y };

        let shapeObj = null;
        if (activeShape === 'rectangle') {
          shapeObj = new fabric.Rect({
            left: pointer.x, top: pointer.y, width: 1, height: 1,
            fill: 'transparent', stroke: strokeColor, strokeWidth: strokeWidth, opacity: opacity
          });
        } else if (activeShape === 'circle') {
          shapeObj = new fabric.Circle({
            left: pointer.x, top: pointer.y, radius: 1,
            fill: 'transparent', stroke: strokeColor, strokeWidth: strokeWidth, opacity: opacity
          });
        } else if (activeShape === 'triangle') {
          shapeObj = new fabric.Triangle({
            left: pointer.x, top: pointer.y, width: 1, height: 1,
            fill: 'transparent', stroke: strokeColor, strokeWidth: strokeWidth, opacity: opacity
          });
        } else if (activeShape === 'line' || activeShape === 'arrow' || activeShape === 'dimension') {
          shapeObj = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            stroke: strokeColor, strokeWidth: strokeWidth, opacity: opacity
          });
        }

        if (shapeObj) {
          tempShapeObjRef.current = shapeObj;
          canvas.add(shapeObj);
        }
      }
    };

    const handleMouseMove = (opt) => {
      if (isPanning && activeTool === 'pan') {
        const e = opt.e;
        const vpt = canvas.viewportTransform;
        vpt[4] += e.clientX - lastPanPos.x;
        vpt[5] += e.clientY - lastPanPos.y;
        lastPanPos = { x: e.clientX, y: e.clientY };
        canvas.requestRenderAll();
        return;
      }

      if (isLassoingRef.current && (activeTool === 'select' || activeTool === 'marker') && tempLassoPathRef.current) {
        const rawPointer = canvas.getScenePoint(opt.e);
        lassoPointsRef.current.push({ x: rawPointer.x, y: rawPointer.y });
        tempLassoPathRef.current.set({ points: lassoPointsRef.current });
        canvas.requestRenderAll();
        return;
      }

      if (activeTool === 'eraser' && isErasingRef.current) {
        const pointer = canvas.getScenePoint(opt.e);
        const radius = Math.max(24, strokeWidth * 2.2);
        const erased = eraseObjectsNear(canvas, pointer, radius);
        if (erased && onObjectsChange) onObjectsChange();
        return;
      }

      if (isMouseDownRef.current && activeTool === 'shape' && tempShapeObjRef.current) {
        const rawPointer = canvas.getScenePoint(opt.e);
        const pointer = applyRulerSnap(canvas, rawPointer);
        const startX = shapeStartCoordsRef.current.x;
        const startY = shapeStartCoordsRef.current.y;

        const width = Math.abs(pointer.x - startX);
        const height = Math.abs(pointer.y - startY);

        const obj = tempShapeObjRef.current;
        if (activeShape === 'rectangle' || activeShape === 'triangle') {
          obj.set({ left: Math.min(startX, pointer.x), top: Math.min(startY, pointer.y), width, height });
        } else if (activeShape === 'circle') {
          obj.set({ left: Math.min(startX, pointer.x), top: Math.min(startY, pointer.y), radius: width / 2 });
        } else if (activeShape === 'line' || activeShape === 'arrow' || activeShape === 'dimension') {
          obj.set({ x2: pointer.x, y2: pointer.y });
        }

        canvas.renderAll();
      }
    };

    const handleMouseUp = () => {
      isPanning = false;
      isErasingRef.current = false;
      if (activeTool === 'pan') canvas.defaultCursor = 'grab';

      if (isLassoingRef.current && tempLassoPathRef.current) {
        isLassoingRef.current = false;
        canvas.remove(tempLassoPathRef.current);
        tempLassoPathRef.current = null;

        const pts = lassoPointsRef.current;
        lassoPointsRef.current = [];

        if (pts.length > 5) {
          const enclosed = canvas.getObjects().filter(obj => {
            if (obj.isBackground || obj.isRulerGuide) return false;
            const center = obj.getCenterPoint();
            if (isPointInPolygon(center, pts)) return true;
            const rect = obj.getBoundingRect();
            if (isPointInPolygon({ x: rect.left, y: rect.top }, pts) ||
                isPointInPolygon({ x: rect.left + rect.width, y: rect.top }, pts) ||
                isPointInPolygon({ x: rect.left, y: rect.top + rect.height }, pts) ||
                isPointInPolygon({ x: rect.left + rect.width, y: rect.top + rect.height }, pts)) {
              return true;
            }
            return false;
          });

          if (enclosed.length === 1) {
            canvas.setActiveObject(enclosed[0]);
          } else if (enclosed.length > 1) {
            const activeSel = new fabric.ActiveSelection(enclosed, { canvas: canvas });
            canvas.setActiveObject(activeSel);
          }
          canvas.renderAll();
          if (onSelectionChange) {
            onSelectionChange(canvas.getActiveObject());
          }
        }
      }

      if (isMouseDownRef.current && tempShapeObjRef.current) {
        isMouseDownRef.current = false;
        tempShapeObjRef.current = null;
        if (onObjectsChange) onObjectsChange();
      }
    };

    const handleSelectionCreated = (e) => {
      if (onSelectionChange) onSelectionChange(e.selected ? e.selected[0] : null);
    };
    const handleSelectionCleared = () => {
      if (onSelectionChange) onSelectionChange(null);
    };
    const handleObjectAdded = (e) => {
      if (e.target && !e.target.isBackground && !e.target.isRulerGuide && onObjectsChange) {
        onObjectsChange();
      }
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    canvas.on('selection:created', handleSelectionCreated);
    canvas.on('selection:updated', handleSelectionCreated);
    canvas.on('selection:cleared', handleSelectionCleared);
    canvas.on('object:added', handleObjectAdded);
    canvas.on('object:modified', handleObjectAdded);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
      canvas.off('selection:created', handleSelectionCreated);
      canvas.off('selection:updated', handleSelectionCreated);
      canvas.off('selection:cleared', handleSelectionCleared);
      canvas.off('object:added', handleObjectAdded);
      canvas.off('object:modified', handleObjectAdded);
    };
  }, [activeTool, activeShape, strokeColor, strokeWidth, opacity, fontSize]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden select-none touch-none bg-[#F8FAFC]">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
}

export { removeRulerGuide };