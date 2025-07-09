// src/utils/links.js

/**
 * Creates a URL for a given page name.
 * This function is a placeholder and can be expanded to handle more complex routing logic
 * or dynamic URL generation based on application needs.
 *
 * @param {string} pageName - The name of the page (e.g., 'PWASettings').
 * @returns {string} The URL for the specified page.
 */
export const createPageUrl = (pageName) => {
  // Basic implementation: converts 'PWASettings' to '/pwa-settings'
  // You can extend this logic to handle different page naming conventions or parameters.
  return `/${pageName.toLowerCase().replace(/([A-Z])/g, '-$1').replace(/^-/, '')}`;
};
