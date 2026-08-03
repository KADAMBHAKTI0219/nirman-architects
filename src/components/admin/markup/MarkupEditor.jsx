import React, { useState, useEffect, useRef, useCallback } from 'react';
import CanvasViewer from './CanvasViewer';
import TopHeader from './TopHeader';
import BottomToolbar from './BottomToolbar';
import ToolSettingsSheet from './ToolSettingsSheet';
import RightSidePanel from './RightSidePanel';
import AnnotationPinModal from './AnnotationPinModal';
import SelectedObjectActionBar from './SelectedObjectActionBar';
import ZoomControls from './ZoomControls';
import { getBlueprintSvgDataUrl, renderPdfPageToDataUrl } from './sampleAssets';
import { exportAsPng, exportAsPdf, exportAsJson } from './ExportManager';

export default function MarkupEditor({
  documentData = null,
  onBack,
  onSaveDocument
}) {
  // Title & Metadata
  const docTitle = documentData?.name || documentData?.title || 'ARCHITECTURE_INTERIOR_BLUEPRINT.PDF';
  const docVersion = documentData?.version || 'v3.2';
  const docStatus = documentData?.status || 'GFC Released';
  const targetPdfUrl = documentData?.fileUrl || documentData?.pdfUrl || '/architecture.pdf';

  const [bgBlueprintSrc, setBgBlueprintSrc] = useState(null);

  // Load PDF Page 1 or fallback SVG Blueprint
  useEffect(() => {
    let isMounted = true;
    const loadPdfBackground = async () => {
      try {
        const dataUrl = await renderPdfPageToDataUrl(targetPdfUrl, 1, 2);
        if (isMounted) {
          if (dataUrl) {
            setBgBlueprintSrc(dataUrl);
          } else {
            setBgBlueprintSrc(getBlueprintSvgDataUrl(docTitle, docVersion));
          }
        }
      } catch (err) {
        if (isMounted) {
          setBgBlueprintSrc(getBlueprintSvgDataUrl(docTitle, docVersion));
        }
      }
    };
    loadPdfBackground();
    return () => { isMounted = false; };
  }, [targetPdfUrl, docTitle, docVersion]);

  // Canvas Instance & State
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Active Tool Configurations
  const [activeTool, setActiveTool] = useState('pen'); // select | pen | pencil | marker | highlighter | eraser | text | shape | pin | pan
  const [activeShape, setActiveShape] = useState('rectangle');
  const [strokeColor, setStrokeColor] = useState('#2484C6');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [opacity, setOpacity] = useState(1);
  const [fontSize, setFontSize] = useState(20);
  const [eraserMode, setEraserMode] = useState('pixel'); // pixel | object

  // Panels & Settings Sheet States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Saved just now');

  // Objects & Selection List
  const [annotations, setAnnotations] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);

  // Pins & Comments System
  const [pins, setPins] = useState([
    {
      id: 1,
      number: 1,
      x: 350,
      y: 280,
      author: 'Eng. Rohit Mehta',
      message: 'Verify beam clearance over Italian Marble flooring grid.',
      status: 'Open',
      date: '2 hours ago',
      replies: [
        { author: 'Bhakti Kadam', message: 'Clearance checked. 2.8m headroom compliant.', date: '1 hour ago' }
      ]
    }
  ]);
  const [activePinModal, setActivePinModal] = useState(null);

  // Undo / Redo Stack Management
  const historyStackRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Save State History Stack
  const saveCanvasState = useCallback(() => {
    if (!fabricCanvas) return;
    const json = fabricCanvas.toJSON();
    const stack = historyStackRef.current;
    const idx = historyIndexRef.current;

    // Slice any redone future states
    const newStack = stack.slice(0, idx + 1);
    newStack.push(json);
    historyStackRef.current = newStack;
    historyIndexRef.current = newStack.length - 1;

    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
    setSaveStatus('Saving...');

    setTimeout(() => {
      setSaveStatus('Saved just now');
    }, 400);

    // Refresh annotations list
    extractAnnotations();
  }, [fabricCanvas]);

  const extractAnnotations = () => {
    if (!fabricCanvas) return;
    const objects = fabricCanvas.getObjects().filter(o => !o.isBackground);
    const list = objects.map((obj) => ({
      type: obj.type || 'Object',
      color: obj.stroke || obj.fill || '#2484C6',
      opacity: obj.opacity || 1,
      rawObj: obj
    }));
    setAnnotations(list);
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0 && fabricCanvas) {
      historyIndexRef.current -= 1;
      const json = historyStackRef.current[historyIndexRef.current];
      fabricCanvas.loadFromJSON(json, () => {
        fabricCanvas.renderAll();
        setCanUndo(historyIndexRef.current > 0);
        setCanRedo(historyIndexRef.current < historyStackRef.current.length - 1);
        extractAnnotations();
      });
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyStackRef.current.length - 1 && fabricCanvas) {
      historyIndexRef.current += 1;
      const json = historyStackRef.current[historyIndexRef.current];
      fabricCanvas.loadFromJSON(json, () => {
        fabricCanvas.renderAll();
        setCanUndo(true);
        setCanRedo(historyIndexRef.current < historyStackRef.current.length - 1);
        extractAnnotations();
      });
    }
  };

  // Canvas Ready Handler
  const handleCanvasReady = (canvas) => {
    setFabricCanvas(canvas);
  };

  // Pin Events
  const handlePinDropped = (newPin) => {
    setPins(prev => [...prev, newPin]);
    setActivePinModal(newPin);
  };

  const handleSavePinReply = (pinId, replyText) => {
    setPins(prev => prev.map(p => {
      if (p.id === pinId) {
        return {
          ...p,
          replies: [...(p.replies || []), { author: 'Super Admin', message: replyText, date: 'Just now' }]
        };
      }
      return p;
    }));
  };

  const handleUpdatePinStatus = (pinId, newStatus) => {
    setPins(prev => prev.map(p => p.id === pinId ? { ...p, status: newStatus } : p));
  };

  const handleDeletePin = (pinId) => {
    setPins(prev => prev.filter(p => p.id !== pinId));
    setActivePinModal(null);
  };

  // Layer Ordering Operations
  const handleBringForward = (obj) => {
    if (fabricCanvas && obj) {
      fabricCanvas.bringObjectForward(obj);
      fabricCanvas.renderAll();
      extractAnnotations();
    }
  };

  const handleSendBackward = (obj) => {
    if (fabricCanvas && obj) {
      fabricCanvas.sendObjectBackwards(obj);
      fabricCanvas.renderAll();
      extractAnnotations();
    }
  };

  const handleDeleteObject = (targetObj) => {
    if (!fabricCanvas || !targetObj) return;

    if (targetObj.type === 'activeSelection' || typeof targetObj.forEachObject === 'function') {
      targetObj.forEachObject((obj) => {
        fabricCanvas.remove(obj);
      });
      fabricCanvas.discardActiveObject();
    } else {
      fabricCanvas.remove(targetObj);
    }

    fabricCanvas.renderAll();
    setSelectedObject(null);
    extractAnnotations();
    saveCanvasState();
  };

  const handleClearAllMarkups = () => {
    if (!fabricCanvas) return;
    if (window.confirm("Are you sure you want to clear all drawing markups from this document?")) {
      fabricCanvas.getObjects().forEach((obj) => {
        if (!obj.isBackground) fabricCanvas.remove(obj);
      });
      fabricCanvas.renderAll();
      setSelectedObject(null);
      extractAnnotations();
      saveCanvasState();
    }
  };

  const handleFlattenMarkups = () => {
    if (!fabricCanvas) return;
    fabricCanvas.getObjects().forEach((obj) => {
      if (!obj.isBackground) {
        obj.set({ selectable: false, evented: false, lockMovementX: true, lockMovementY: true });
      }
    });
    fabricCanvas.renderAll();
    alert("All markups have been flattened and locked permanently into the blueprint image layer!");
  };

  const handleSelectAllMarkups = () => {
    if (!fabricCanvas) return;
    const objects = fabricCanvas.getObjects().filter((obj) => !obj.isBackground && !obj.isRulerGuide);
    if (objects.length === 0) return;

    if (objects.length === 1) {
      fabricCanvas.setActiveObject(objects[0]);
    } else {
      const activeSel = new fabric.ActiveSelection(objects, { canvas: fabricCanvas });
      fabricCanvas.setActiveObject(activeSel);
    }
    fabricCanvas.renderAll();
    setSelectedObject(fabricCanvas.getActiveObject());
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        handleSelectAllMarkups();
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedObject && fabricCanvas) {
          e.preventDefault();
          handleDeleteObject(selectedObject);
        }
      }

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        handleUndo();
      }

      if (((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) ||
          ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z'))) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fabricCanvas, selectedObject, canUndo, canRedo]);

  const handleDuplicateSelectedObject = async () => {
    if (!fabricCanvas || !selectedObject) return;
    try {
      if (selectedObject.type === 'activeSelection' || typeof selectedObject.forEachObject === 'function') {
        const clonedSelection = await selectedObject.clone();
        clonedSelection.canvas = fabricCanvas;
        clonedSelection.forEachObject((clonedObj) => {
          clonedObj.set({
            left: clonedObj.left + 20,
            top: clonedObj.top + 20
          });
          fabricCanvas.add(clonedObj);
        });
        clonedSelection.destroy();
        fabricCanvas.renderAll();
      } else {
        const cloned = await selectedObject.clone();
        cloned.set({
          left: selectedObject.left + 20,
          top: selectedObject.top + 20
        });
        fabricCanvas.add(cloned);
        fabricCanvas.setActiveObject(cloned);
        fabricCanvas.renderAll();
      }
      extractAnnotations();
      saveCanvasState();
    } catch (e) {
      console.warn("Clone object error:", e);
    }
  };

  const handleSaveAll = () => {
    saveCanvasState();
    if (onSaveDocument && documentData) {
      onSaveDocument({
        ...documentData,
        lastUpdated: 'Just now',
        markups: historyStackRef.current[historyIndexRef.current],
        pins: pins
      });
    }
    alert(`Document "${docTitle}" markups & annotations saved successfully!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col font-sans select-none overflow-hidden animate-in fade-in duration-200">
      {/* 1. Top Glass Header */}
      <TopHeader
        title={docTitle}
        version={docVersion}
        status={docStatus}
        saveStatus={saveStatus}
        canUndo={canUndo}
        canRedo={canRedo}
        onBack={onBack}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSaveAll}
        onExportPng={() => exportAsPng(fabricCanvas, docTitle)}
        onExportPdf={() => exportAsPdf(fabricCanvas, docTitle)}
        onExportJson={() => exportAsJson(fabricCanvas, pins, docTitle)}
        onToggleSidePanel={() => setIsSidePanelOpen(!isSidePanelOpen)}
        isSidePanelOpen={isSidePanelOpen}
        onSelectAllMarkups={handleSelectAllMarkups}
        onClearAllMarkups={handleClearAllMarkups}
        onFlattenMarkups={handleFlattenMarkups}
        onOpenProperties={() => alert(`Properties: ${docTitle} (${docVersion})`)}
      />

      {/* 2. Main Canvas View Area */}
      <div className="flex-1 w-full h-full relative">
        <CanvasViewer
          bgImageSrc={bgBlueprintSrc}
          activeTool={activeTool}
          activeShape={activeShape}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          opacity={opacity}
          fontSize={fontSize}
          zoomLevel={zoomLevel}
          eraserMode={eraserMode}
          onCanvasReady={handleCanvasReady}
          onSelectionChange={setSelectedObject}
          onObjectsChange={saveCanvasState}
          onPinDropped={handlePinDropped}
          onPinClick={setActivePinModal}
        />
      </div>

      {/* 3. Floating Bottom Toolbar (iPhone PDF Markup Pill) */}
      <BottomToolbar
        activeTool={activeTool}
        activeShape={activeShape}
        strokeColor={strokeColor}
        onSelectTool={setActiveTool}
        onSelectShape={setActiveShape}
        onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
        isSettingsOpen={isSettingsOpen}
      />

      {/* 4. Tool Settings Sheet (Color / Stroke / Opacity / Font Size) */}
      {isSettingsOpen && (
        <ToolSettingsSheet
          activeTool={activeTool}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          opacity={opacity}
          fontSize={fontSize}
          eraserMode={eraserMode}
          onChangeColor={setStrokeColor}
          onChangeStrokeWidth={setStrokeWidth}
          onChangeOpacity={setOpacity}
          onChangeFontSize={setFontSize}
          onChangeEraserMode={setEraserMode}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* 5. Floating Zoom Controller */}
      <ZoomControls
        zoomLevel={zoomLevel}
        onZoomIn={() => setZoomLevel(prev => Math.min(prev + 0.25, 4))}
        onZoomOut={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
        onResetZoom={() => setZoomLevel(1)}
        onFitToScreen={() => setZoomLevel(1)}
      />

      {/* 6. Right Collapsible Sliding Panel (Annotations, Comments, Layers, Versions) */}
      <RightSidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        annotations={annotations}
        pins={pins}
        activeSelectedObject={selectedObject}
        onSelectObject={(obj) => {
          if (fabricCanvas && obj) {
            fabricCanvas.setActiveObject(obj);
            fabricCanvas.renderAll();
          }
        }}
        onDeleteObject={handleDeleteObject}
        onBringForward={handleBringForward}
        onSendBackward={handleSendBackward}
        onSelectPin={setActivePinModal}
      />

      {/* 7. Dropped Annotation Pin Comment Thread Modal */}
      {activePinModal && (
        <AnnotationPinModal
          pin={activePinModal}
          onClose={() => setActivePinModal(null)}
          onSaveReply={handleSavePinReply}
          onUpdateStatus={handleUpdatePinStatus}
          onDeletePin={handleDeletePin}
        />
      )}

      {/* 8. Floating Apple iOS Object Contextual Action Bar */}
      {selectedObject && (
        <SelectedObjectActionBar
          selectedObject={selectedObject}
          fabricCanvas={fabricCanvas}
          onUpdateObject={saveCanvasState}
          onDeleteObject={() => handleDeleteObject(selectedObject)}
          onDuplicateObject={handleDuplicateSelectedObject}
        />
      )}
    </div>
  );
}
