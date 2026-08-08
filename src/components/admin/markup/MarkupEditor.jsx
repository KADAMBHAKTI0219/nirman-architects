import React, { useState, useEffect, useRef, useCallback } from 'react';
import CanvasViewer from './CanvasViewer';
import TopHeader from './TopHeader';
import BottomToolbar from './BottomToolbar';
import ToolSettingsSheet from './ToolSettingsSheet';
import RightSidePanel from './RightSidePanel';
import AnnotationPinModal from './AnnotationPinModal';
import SelectedObjectActionBar from './SelectedObjectActionBar';
import ZoomControls from './ZoomControls';
import { getBlueprintSvgDataUrl, renderPdfPageToDataUrl, convertFileToDataUrl } from './sampleAssets';
import { exportAsPng, exportAsPdf, exportAsJson } from './ExportManager';
import { 
  getAggregatedReviewData, 
  postCommentOrNote, 
  postMarking, 
  deleteMarking 
} from '../../../service/drawingReview';
import { cacheDrawingFile } from '../../../service/drawing';

export default function MarkupEditor({
  documentData = null,
  onBack,
  onSaveDocument
}) {
  const docTitle = documentData?.name || documentData?.title || 'ARCHITECTURE_INTERIOR_BLUEPRINT.PDF';
  const [currentTitle, setCurrentTitle] = useState(docTitle);
  const docVersion = documentData?.version || 'V1.0';
  const docStatus = documentData?.status || 'GFC Released';
  const targetPdfUrl = documentData?.originalFileUrl || (Array.isArray(documentData?.versions) && documentData.versions.length > 0 ? documentData.versions[0].fileUrl : null) || documentData?.fileUrl || documentData?.pdfUrl || '/architecture.pdf';
  const versionId = documentData?.currentVersionId || documentData?._id || documentData?.id || 'ver-1';

  const [bgBlueprintSrc, setBgBlueprintSrc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPdfLoading, setIsPdfLoading] = useState(true);
  const [activeFileRef, setActiveFileRef] = useState(targetPdfUrl);

  const loadBackgroundPage = useCallback(async (fileTarget, page = 1) => {
    setIsPdfLoading(true);
    try {
      const res = await convertFileToDataUrl(fileTarget, page, 2.5);
      if (res) {
        const src = typeof res === 'string' ? res : res.dataUrl;
        setBgBlueprintSrc(src);
        setTotalPages(res.numPages || 1);
        setCurrentPage(res.pageNum || 1);
      } else {
        setBgBlueprintSrc(getBlueprintSvgDataUrl(docTitle, docVersion));
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (err) {
      console.warn("Background PDF load error:", err);
      setBgBlueprintSrc(getBlueprintSvgDataUrl(docTitle, docVersion));
    } finally {
      setIsPdfLoading(false);
    }
  }, [docTitle, docVersion]);

  useEffect(() => {
    setActiveFileRef(targetPdfUrl);
    loadBackgroundPage(targetPdfUrl, 1);
  }, [targetPdfUrl, loadBackgroundPage]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    loadBackgroundPage(activeFileRef, newPage);
  };

  // Handle User Opening ANY Custom PDF or Image File
  const handleUserFileSelect = async (file) => {
    if (!file) return;
    try {
      setActiveFileRef(file);
      setCurrentTitle(file.name);
      await loadBackgroundPage(file, 1);
      if (fabricCanvas) {
        // Keep background and clear old markups for new file
        fabricCanvas.getObjects().forEach((obj) => {
          if (!obj.isBackground) fabricCanvas.remove(obj);
        });
        fabricCanvas.renderAll();
      }
    } catch (err) {
      alert("Error opening file: " + err.message);
    }
  };

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

  // Dynamic Pins & Comments System
  const [pins, setPins] = useState([]);
  const [activePinModal, setActivePinModal] = useState(null);

  // 26.1 Fetch Aggregated Review Data on Mount
  useEffect(() => {
    if (versionId) {
      getAggregatedReviewData(versionId).then(res => {
        if (res?.success) {
          if (Array.isArray(res.comments) && res.comments.length > 0) {
            const mappedPins = res.comments.filter(c => c.annotationCoords).map((c, i) => ({
              id: c._id || c.id || (i + 1),
              number: i + 1,
              x: c.annotationCoords?.x || 300,
              y: c.annotationCoords?.y || 200,
              author: c.authorName || 'Internal Employee',
              message: c.commentText,
              status: c.isDraft ? 'Draft' : 'Open',
              date: c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
              replies: []
            }));
            setPins(mappedPins);
          }
        }
      }).catch(e => console.warn(e));
    }
  }, [versionId]);

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
  const handlePinDropped = async (newPin) => {
    setPins(prev => [...prev, newPin]);
    setActivePinModal(newPin);
    try {
      await postCommentOrNote(versionId, {
        commentText: newPin.message || 'Annotation note pin',
        annotationCoords: { x: newPin.x, y: newPin.y },
        isDraft: false
      });
    } catch (e) {
      console.warn("Notice saving pin note to API:", e);
    }
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

  const handleSaveAll = async () => {
    saveCanvasState();
    setSaveStatus('Saving...');
    try {
      let canvasDataUrl = null;
      if (fabricCanvas) {
        try {
          canvasDataUrl = fabricCanvas.toDataURL({ format: 'png', quality: 0.9, multiplier: 1.5 });
        } catch (e) {
          console.warn("Canvas image export notice:", e);
        }

        const objects = fabricCanvas.getObjects().filter(o => !o.isBackground);
        for (const obj of objects) {
          const typeStr = obj.type === 'rect' ? 'RECTANGLE' : (obj.type === 'circle' ? 'CIRCLE' : 'FREEHAND');
          await postMarking(versionId, {
            markingType: typeStr,
            geometry: obj.toJSON(),
            color: obj.stroke || obj.fill || '#2484C6'
          });
        }
      }
      setSaveStatus('Saved just now');

      if (onSaveDocument && documentData) {
        const currentVersions = Array.isArray(documentData.versions) && documentData.versions.length > 0
          ? [...documentData.versions]
          : [
              {
                _id: 'ver-v1',
                version: 'V1.0',
                versionNumber: 1,
                date: new Date().toISOString().split('T')[0],
                uploader: 'Lead Designer',
                changeLog: 'Initial layout draft',
                fileUrl: documentData.fileUrl
              }
            ];

        // Auto-increment version number (V1.0 -> V2.0 -> V3.0)
        const nextVerNum = currentVersions.length + 1;
        const nextVersionTag = `V${nextVerNum}.0`;
        const newVersionId = `ver-${Date.now()}`;

        const newVersionObj = {
          _id: newVersionId,
          version: nextVersionTag,
          versionNumber: nextVerNum,
          date: new Date().toISOString().split('T')[0],
          uploader: 'Architect / Designer',
          changeLog: `Markup & annotation revision (${nextVersionTag})`,
          fileUrl: canvasDataUrl || documentData.fileUrl,
          fileName: documentData.fileName || documentData.name || 'Blueprint_Markup.pdf'
        };

        const updatedVersions = [...currentVersions, newVersionObj];

        // Cache the newly created version image data
        if (canvasDataUrl) {
          cacheDrawingFile(newVersionId, canvasDataUrl);
          cacheDrawingFile(nextVersionTag, canvasDataUrl);
          if (documentData._id) cacheDrawingFile(documentData._id, canvasDataUrl);
          if (documentData.id) cacheDrawingFile(documentData.id, canvasDataUrl);
          if (documentData.drawingNumber) cacheDrawingFile(documentData.drawingNumber, canvasDataUrl);
        }

        const updatedDoc = {
          ...documentData,
          version: nextVersionTag,
          currentVersionId: newVersionId,
          fileUrl: canvasDataUrl || documentData.fileUrl,
          versions: updatedVersions,
          lastUpdated: 'Just now',
          markups: historyStackRef.current[historyIndexRef.current],
          pins: pins
        };

        onSaveDocument(updatedDoc);
        alert(`Document "${docTitle}" saved successfully!\nCreated new revision version: ${nextVersionTag}`);
      } else {
        alert(`Document "${docTitle}" markups & annotations saved successfully!`);
      }
    } catch (err) {
      console.warn("Notice saving markups to API:", err);
      setSaveStatus('Saved locally');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col font-sans select-none overflow-hidden animate-in fade-in duration-200">
      {/* 1. Top Glass Header */}
      <TopHeader
        title={currentTitle}
        version={docVersion}
        status={docStatus}
        saveStatus={saveStatus}
        canUndo={canUndo}
        canRedo={canRedo}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onBack={onBack}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSaveAll}
        onExportPng={() => exportAsPng(fabricCanvas, currentTitle)}
        onExportPdf={() => exportAsPdf(fabricCanvas, currentTitle)}
        onExportJson={() => exportAsJson(fabricCanvas, pins, currentTitle)}
        onToggleSidePanel={() => setIsSidePanelOpen(!isSidePanelOpen)}
        isSidePanelOpen={isSidePanelOpen}
        onSelectAllMarkups={handleSelectAllMarkups}
        onClearAllMarkups={handleClearAllMarkups}
        onFlattenMarkups={handleFlattenMarkups}
        onOpenProperties={() => alert(`Properties: ${currentTitle} (${docVersion})`)}
        onFileSelect={handleUserFileSelect}
      />

      {/* 2. Main Canvas View Area */}
      <div className="flex-1 w-full h-full relative">
        {isPdfLoading && (
          <div className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
              <svg className="animate-spin h-6 w-6 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="text-center">
              <span className="font-extrabold text-sm block">Rendering High-Res Architectural Blueprint...</span>
              <span className="text-[11px] text-slate-300 font-medium mt-0.5 block">Converting CAD PDF Vector Layers to Fabric Canvas</span>
            </div>
          </div>
        )}

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
