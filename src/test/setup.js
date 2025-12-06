/**
 * Vitest Setup File
 * 
 * إعدادات الاختبارات
 */

import '@testing-library/jest-dom';

// Mock matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock Audio
window.HTMLMediaElement.prototype.load = vi.fn();
window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue();
window.HTMLMediaElement.prototype.pause = vi.fn();
