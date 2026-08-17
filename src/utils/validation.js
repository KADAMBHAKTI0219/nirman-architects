import React from 'react';
import { FieldError as FieldErrorJSX } from './validation.jsx';

export * from './validation.jsx';

export function FieldError(props) {
  return React.createElement(FieldErrorJSX, props);
}
