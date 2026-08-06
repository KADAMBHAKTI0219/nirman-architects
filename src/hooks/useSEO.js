import { useEffect } from 'react';

/**
 * Custom hook to dynamically manage Page Title, Meta Description, and OpenGraph/SEO tags.
 * Enhances SEO, GEO (Geofencing / Location), and AEO (AI Answer Engine Optimization).
 * 
 * @param {object} options
 * @param {string} options.title - Page title
 * @param {string} options.description - Meta description for search & AI engines
 * @param {string} options.keywords - Comma-separated SEO keywords
 * @param {string} options.canonical - Canonical page URL
 */
export default function useSEO({ title, description, keywords, canonical }) {
  useEffect(() => {
    // 1. Update Title
    if (title) {
      document.title = `${title} | Nirman Architects & NexAlliance`;
    }

    // 2. Update Meta Description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }

    // 3. Update Meta Keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords);
    }

    // 4. Update Canonical Link
    if (canonical) {
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonical);
    }
  }, [title, description, keywords, canonical]);
}
