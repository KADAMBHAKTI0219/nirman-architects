/**
 * High-performance smooth auto-scroller for Kanban Drag & Drop.
 * Auto-scrolls vertical columns (overflow-y-auto) and horizontal board containers (overflow-x-auto)
 * when a dragged item or touch approaches the boundaries.
 */

export const handleKanbanAutoScroll = (e) => {
  if (!e) return;

  const mouseX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
  const mouseY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

  if (!mouseX && !mouseY) return;

  // 1. Identify Vertical Column Container
  let colElement = null;
  if (e.currentTarget && e.currentTarget.classList && e.currentTarget.classList.contains('overflow-y-auto')) {
    colElement = e.currentTarget;
  } else if (e.currentTarget && e.currentTarget.querySelector) {
    colElement = e.currentTarget.querySelector('.overflow-y-auto');
  }
  
  if (!colElement && e.target && e.target.closest) {
    colElement = e.target.closest('.overflow-y-auto');
  }

  // 2. Identify Horizontal Board Container
  let boardElement = null;
  if (e.currentTarget && e.currentTarget.classList && e.currentTarget.classList.contains('overflow-x-auto')) {
    boardElement = e.currentTarget;
  } else if (e.currentTarget && e.currentTarget.closest) {
    boardElement = e.currentTarget.closest('.overflow-x-auto');
  }

  if (!boardElement && e.target && e.target.closest) {
    boardElement = e.target.closest('.overflow-x-auto');
  }

  // Fallback board container search by class or tag if not resolved
  if (!boardElement && typeof document !== 'undefined') {
    const candidates = document.querySelectorAll('.overflow-x-auto');
    candidates.forEach(cand => {
      const r = cand.getBoundingClientRect();
      if (mouseX >= r.left && mouseX <= r.right && mouseY >= r.top && mouseY <= r.bottom) {
        boardElement = cand;
      }
    });
  }

  // Vertical Column Auto-Scroll Math
  if (colElement) {
    const colRect = colElement.getBoundingClientRect();
    const vZone = 90; // 90px trigger distance from top/bottom boundary
    const maxVStep = 20;

    if (mouseY >= colRect.top && mouseY <= colRect.top + vZone) {
      const factor = 1 - (mouseY - colRect.top) / vZone;
      colElement.scrollTop -= Math.max(5, Math.round(factor * maxVStep));
    } else if (mouseY <= colRect.bottom && mouseY >= colRect.bottom - vZone) {
      const factor = 1 - (colRect.bottom - mouseY) / vZone;
      colElement.scrollTop += Math.max(5, Math.round(factor * maxVStep));
    }
  }

  // Horizontal Board Auto-Scroll Math
  if (boardElement) {
    const boardRect = boardElement.getBoundingClientRect();
    const hZone = 110; // 110px trigger distance from left/right boundary
    const maxHStep = 25;

    if (mouseX >= boardRect.left && mouseX <= boardRect.left + hZone) {
      const factor = 1 - (mouseX - boardRect.left) / hZone;
      boardElement.scrollLeft -= Math.max(6, Math.round(factor * maxHStep));
    } else if (mouseX <= boardRect.right && mouseX >= boardRect.right - hZone) {
      const factor = 1 - (boardRect.right - mouseX) / hZone;
      boardElement.scrollLeft += Math.max(6, Math.round(factor * maxHStep));
    }
  }
};
