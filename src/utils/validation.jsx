import React from 'react';

/**
 * Reusable Frontend Form Validation Engine & Inline Error UI Helper
 * For Nirman Architects Enterprise Portal
 */

// 1. Validation Functions
export const validateRequired = (value, fieldName = 'This field') => {
  if (value === null || value === undefined) return `${fieldName} is required.`;
  if (typeof value === 'string' && !value.trim()) return `${fieldName} is required.`;
  if (Array.isArray(value) && value.length === 0) return `Please select at least one ${fieldName.toLowerCase()}.`;
  return '';
};

export const validateEmail = (email) => {
  if (!email || !email.trim()) return 'Email address is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Please enter a valid email address.';
  return '';
};

export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) return 'Phone number is required.';
  const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]{6,15}$/;
  if (!phoneRegex.test(phone.trim())) return 'Please enter a valid phone number.';
  return '';
};

export const validatePassword = (password, minLength = 6) => {
  if (!password) return 'Password is required.';
  if (password.length < minLength) return `Password must be at least ${minLength} characters.`;
  return '';
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password.';
  if (password !== confirmPassword) return 'Passwords do not match.';
  return '';
};

export const validateMinLength = (value, min, fieldName = 'This field') => {
  if (!value || typeof value !== 'string') return '';
  if (value.trim().length < min) return `${fieldName} must be at least ${min} characters.`;
  return '';
};

export const validateMaxLength = (value, max, fieldName = 'This field') => {
  if (!value || typeof value !== 'string') return '';
  if (value.trim().length > max) return `${fieldName} must not exceed ${max} characters.`;
  return '';
};

export const validateSelect = (value, fieldName = 'option') => {
  if (!value || value === '' || value === 'ALL') return `Please select a ${fieldName}.`;
  return '';
};

export const validateNumber = (value, fieldName = 'Number', min = null, max = null) => {
  if (value === '' || value === null || value === undefined) return `${fieldName} is required.`;
  const num = Number(value);
  if (isNaN(num)) return `Please enter a valid number.`;
  if (min !== null && num < min) return `${fieldName} must be at least ${min}.`;
  if (max !== null && num > max) return `${fieldName} must not exceed ${max}.`;
  return '';
};

// 2. Accessibility Helpers
export const getFieldProps = (error, id) => {
  return {
    'aria-invalid': !!error,
    'aria-describedby': error && id ? `${id}-error` : undefined
  };
};

// 3. Inline Field Error Display Component
export function FieldError({ error, id }) {
  if (!error) return null;
  return (
    <p 
      id={id ? `${id}-error` : undefined}
      className="text-[11px] font-bold text-rose-500 mt-1 animate-in fade-in leading-snug flex items-center gap-1"
    >
      <span>⚠</span>
      <span>{error}</span>
    </p>
  );
}
