// Mock Canvas API for testing
if (typeof HTMLCanvasElement !== 'undefined') {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    value: (contextId: string) => {
      if (contextId === '2d') {
        return {
          fillRect: () => {},
          clearRect: () => {},
          getImageData: () => ({ data: new Array(4) }),
          putImageData: () => {},
          createImageData: () => [],
          setTransform: () => {},
          drawImage: () => {},
          save: () => {},
          fillText: () => {},
          restore: () => {},
          beginPath: () => {},
          moveTo: () => {},
          lineTo: () => {},
          closePath: () => {},
          stroke: () => {},
          translate: () => {},
          scale: () => {},
          rotate: () => {},
          arc: () => {},
          fill: () => {},
          measureText: () => ({ width: 0 }),
          transform: () => {},
          rect: () => {},
          clip: () => {},
        }
      }
      return null
    },
  })
}

// Mock ResizeObserver
if (typeof globalThis !== 'undefined' && !globalThis.ResizeObserver) {
  (globalThis as any).ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

