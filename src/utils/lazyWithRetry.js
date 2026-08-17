import React, { lazy } from 'react';

/**
 * Robust Lazy Loader with automatic retry & reload fallback.
 * Prevents Vercel / Vite deployment chunk hash mismatch crashes (MIME text/html errors).
 */
export const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasBeenRefreshed = JSON.parse(
      window.sessionStorage.getItem('chunk_retry_refreshed') || 'false'
    );
    try {
      const component = await componentImport();
      window.sessionStorage.setItem('chunk_retry_refreshed', 'false');
      return component;
    } catch (error) {
      console.warn("Chunk load error detected, attempting reload fallback...", error);
      if (!pageHasBeenRefreshed) {
        window.sessionStorage.setItem('chunk_retry_refreshed', 'true');
        window.location.reload();
        return new Promise(() => {});
      }
      throw error;
    }
  });

export default lazyWithRetry;
