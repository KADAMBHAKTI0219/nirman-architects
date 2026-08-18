import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

/**
 * CustomSelect Component
 * Implements a modern, brand-styled custom selection box matching Image 2:
 * - Brand primary trigger styling & border-radius layout
 * - Bullet option items (• Option 1)
 * - Brand selection hover & keyboard navigation state (up/down arrow highlights with brand selection background + white text)
 * - Optional inline search for long lists (e.g. client/employee drop-downs)
 * - Click-outside dismissal & accessibility support
 */
export default function CustomSelect({
  value = '',
  onChange,
  options = [],
  placeholder = 'Select option...',
  label = '',
  error = '',
  disabled = false,
  required = false,
  searchable = false,
  showBullet = true,
  variant = 'default', // 'default' | 'brand' | 'filter'
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  name = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const selectId = useId();

  // Normalize options into uniform shape: { value, label, subtext, icon, raw }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: String(opt), label: String(opt), subtext: '', raw: opt };
    }
    if (opt && typeof opt === 'object') {
      const val = opt.value !== undefined ? opt.value : (opt.id !== undefined ? opt.id : opt.name);
      const lbl = opt.label !== undefined ? opt.label : (opt.name !== undefined ? opt.name : String(val));
      return {
        value: String(val ?? ''),
        label: String(lbl ?? ''),
        subtext: opt.subtext || opt.email || opt.description || '',
        icon: opt.icon || null,
        raw: opt
      };
    }
    return { value: '', label: '', subtext: '', raw: opt };
  });

  // Filter options based on search query
  const filteredOptions = normalizedOptions.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      opt.label.toLowerCase().includes(q) ||
      opt.subtext.toLowerCase().includes(q) ||
      opt.value.toLowerCase().includes(q)
    );
  });

  // Find currently selected option
  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value));

  // Determine auto-searchable mode if options > 6
  const isSearchEnabled = searchable || normalizedOptions.length > 6;

  // Toggle dropdown
  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset search, active index, and auto-scroll into view when menu opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      // Set active index to currently selected option or first option
      const idx = filteredOptions.findIndex((opt) => String(opt.value) === String(value));
      setActiveIndex(idx >= 0 ? idx : 0);
      
      // Auto-focus search input if present
      if (isSearchEnabled) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }

      // Smooth scroll dropdown into view at modal bottom
      setTimeout(() => {
        if (dropdownRef.current) {
          dropdownRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        } else if (containerRef.current) {
          containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 60);
    } else {
      setActiveIndex(-1);
    }
  }, [isOpen]);

  // Handle keyboard navigation (ArrowUp, ArrowDown, Enter, Escape, Tab)
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev + 1;
          return next >= filteredOptions.length ? 0 : next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev - 1;
          return next < 0 ? filteredOptions.length - 1 : next;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          selectOption(filteredOptions[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Scroll active option into view when activeIndex changes
  useEffect(() => {
    if (isOpen && listRef.current && activeIndex >= 0) {
      const activeEl = listRef.current.children[activeIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [activeIndex, isOpen]);

  // Handle selection of an option
  const selectOption = (opt) => {
    if (onChange) {
      onChange(opt.value, opt.raw || opt);
    }
    setIsOpen(false);

    if (containerRef.current) {
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  };

  // Variant Styles
  let triggerBaseClasses = "w-full flex items-center justify-between gap-2 px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer outline-none select-none";
  let triggerVariantClasses = "";

  if (variant === 'brand') {
    // Solid Brand Header (Image 2 style with #BDE0FE brand primary & #8FC9FF border)
    triggerVariantClasses = isOpen
      ? "bg-[#BDE0FE] text-slate-900 rounded-t-2xl shadow-md border border-[#8FC9FF]"
      : "bg-[#BDE0FE] text-slate-900 hover:bg-[#8FC9FF] rounded-2xl shadow-md border border-[#8FC9FF]";
  } else if (variant === 'filter') {
    // Compact Toolbar Filter style
    triggerVariantClasses = isOpen
      ? "bg-[#BDE0FE]/40 border border-[#8FC9FF] text-slate-900 rounded-xl shadow-2xs"
      : "bg-slate-50 border border-slate-200 hover:border-[#8FC9FF] text-slate-800 rounded-xl";
  } else {
    // Default form input style
    triggerVariantClasses = isOpen
      ? "bg-white border-2 border-[#8FC9FF] text-slate-900 rounded-t-xl shadow-sm ring-2 ring-[#BDE0FE]/60"
      : "bg-white border border-slate-200 hover:border-[#8FC9FF] focus:border-[#8FC9FF] text-slate-900 rounded-xl shadow-3xs";
  }

  if (disabled) {
    triggerVariantClasses += " opacity-60 cursor-not-allowed bg-slate-100";
  }

  if (error) {
    triggerVariantClasses += " border-rose-500 ring-rose-500/20";
  }

  return (
    <div className={`relative w-full text-left font-sans ${className}`} ref={containerRef} onKeyDown={handleKeyDown}>
      {/* Optional Top Label */}
      {label && (
        <label htmlFor={selectId} className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Hidden Native Select for standard HTML form submission compatibility */}
      {name && (
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={() => {}}
          required={required}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        >
          <option value="">{placeholder}</option>
          {normalizedOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`${triggerBaseClasses} ${triggerVariantClasses} ${buttonClassName}`}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className={`truncate ${!selectedOption ? (variant === 'brand' ? 'text-slate-600 font-medium' : 'text-slate-400 font-medium') : 'font-extrabold text-slate-900'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${variant === 'brand' ? 'text-slate-900' : 'text-slate-400'}`}
        />
      </button>

      {/* Dropdown Options Container (Matching Image 2 rounded layout & brand #8FC9FF / #BDE0FE selection) */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute left-0 right-0 z-50 bg-white border border-[#8FC9FF]/60 shadow-2xl overflow-hidden transition-all duration-150 animate-in fade-in-50 zoom-in-95 ${
            variant === 'brand' ? 'top-full rounded-b-2xl border-t-0 -mt-0.5' : 'top-full mt-1.5 rounded-2xl'
          } ${dropdownClassName}`}
          role="listbox"
        >
          {/* Search Box inside Dropdown */}
          {isSearchEnabled && (
            <div className="p-2 border-b border-slate-100 bg-[#BDE0FE]/20 sticky top-0 z-10 flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 ml-1.5 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#8FC9FF] placeholder-slate-400"
                onClick={(e) => e.stopPropagation()}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Options List */}
          <ul ref={listRef} className="max-h-56 overflow-y-auto py-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-xs text-slate-400 font-semibold text-center italic">
                No matching options found
              </li>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value);
                const isActive = idx === activeIndex;

                return (
                  <li
                    key={`${opt.value}-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => selectOption(opt)}
                    className={`px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer flex items-center justify-between gap-2.5 ${
                      isActive || isSelected
                        ? 'bg-[#8FC9FF] text-slate-900'
                        : 'text-slate-700 hover:bg-[#8FC9FF] hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 truncate">
                      {/* Option Bullet Point (Matching Image 2: • Option 1 with brand secondary blue) */}
                      {showBullet && (
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                            isActive || isSelected ? 'bg-slate-900' : 'bg-[#3B82F6]'
                          }`}
                        />
                      )}
                      
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}

                      <div className="truncate">
                        <span className="truncate block leading-tight">{opt.label}</span>
                        {opt.subtext && (
                          <span
                            className={`text-[10px] block font-semibold truncate mt-0.5 ${
                              isActive || isSelected ? 'text-slate-800' : 'text-slate-400'
                            }`}
                          >
                            {opt.subtext}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Selected Checkmark Indicator */}
                    {isSelected && (
                      <Check className={`w-4 h-4 shrink-0 ${isActive || isSelected ? 'text-slate-900' : 'text-[#3B82F6]'}`} />
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {/* Error Message */}
      {error && <p className="text-[10px] font-extrabold text-rose-500 mt-1">{error}</p>}
    </div>
  );
}
