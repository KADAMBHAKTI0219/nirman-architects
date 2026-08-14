import { useState, useCallback } from 'react';

/**
 * Reusable Custom Hook for Modal & Drawer State Management
 */
export default function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const [modalData, setModalData] = useState(null);

  const open = useCallback((data = null) => {
    setModalData(data);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setModalData(null);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    modalData,
    open,
    close,
    toggle,
    setModalData
  };
}
