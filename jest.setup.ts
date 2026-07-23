import "@testing-library/jest-dom";

// jsdom doesn't implement the Pointer Events capture methods or scrollIntoView,
// which Radix UI primitives (Select, etc.) call internally when opening/closing
// and navigating their popups. Without these no-op polyfills, interacting with
// a Radix Select in jsdom throws "target.hasPointerCapture is not a function".
// See: https://github.com/radix-ui/primitives/issues/1822
if (typeof Element !== "undefined") {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
}

// jsdom has no ResizeObserver. recharts' ResponsiveContainer instantiates one
// unconditionally (`new ResizeObserver(...)`), which throws a ReferenceError
// without this stub. @tanstack/react-virtual, by contrast, feature-detects it
// and no-ops gracefully - this stub keeps both paths working, letting the
// virtualizer fall back to its estimated size and recharts render at 0x0.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom never performs real layout, so every element's offsetWidth/offsetHeight
// is 0. @tanstack/react-virtual reads these to size its scroll container and
// decide which rows are "visible" - with a real 0, it computes an empty visible
// range and renders no rows at all. Stubbing a realistic viewport size here is
// the standard workaround for testing virtualized lists under jsdom.
if (typeof HTMLElement !== "undefined") {
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    value: 768,
  });
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    value: 1024,
  });
  // recharts' ResponsiveContainer sizes itself from getBoundingClientRect()
  // instead - also always zeroed in jsdom - which otherwise makes it render a
  // 0x0 chart with no visible bars.
  HTMLElement.prototype.getBoundingClientRect = function () {
    return {
      width: 1024,
      height: 768,
      top: 0,
      left: 0,
      bottom: 768,
      right: 1024,
      x: 0,
      y: 0,
      toJSON() {},
    };
  };
}
