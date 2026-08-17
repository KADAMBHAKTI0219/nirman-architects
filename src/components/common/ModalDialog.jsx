import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Common Reusable ModalDialog Component
 * Provides a standardized modal popup overlay with dark backdrop, smooth animations, and clean header/footer structure.
 * 
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Close modal callback
 * @param {string} title - Modal heading title
 * @param {string} subtitle - Optional subtext caption
 * @param {React.ElementType} icon - Optional header icon component
 * @param {string} maxWidth - Width class (e.g. 'max-w-lg', 'max-w-2xl', 'max-w-4xl')
 * @param {React.ReactNode} children - Form or modal body content
 * @param {React.ReactNode} footer - Optional custom footer actions
 */
export default function ModalDialog({
  isOpen = false,
  onClose,
  title,
  subtitle,
  icon: IconComponent,
  maxWidth = 'max-w-lg',
  children,
  footer,
  className = ''
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-3xl border border-slate-200 shadow-2xl w-full ${maxWidth} overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            {IconComponent && (
              <div className="p-2.5 bg-brand-tint text-slate-700 rounded-2xl border border-brand-primary/20">
                <IconComponent className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer shrink-0"
              title="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
