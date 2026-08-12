export {};

declare global {
  interface Window {
    /** gtag.js command queue — every gtag() call lands here, even before the vendor script loads. */
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
