import { useState, useCallback } from 'react';

interface MapControls {
  scale: number;
  position: { x: number; y: number };
}

export function useMapControls(minZoom = 0.5, maxZoom = 2) {
  const [controls, setControls] = useState<MapControls>({
    scale: 1,
    position: { x: 0, y: 0 },
  });

  const handleZoom = useCallback((delta: number) => {
    setControls(prev => {
      const newScale = Math.min(Math.max(prev.scale + delta, minZoom), maxZoom);
      return { ...prev, scale: newScale };
    });
  }, [minZoom, maxZoom]);

  const handlePan = useCallback((dx: number, dy: number) => {
    setControls(prev => ({
      ...prev,
      position: { x: dx, y: dy },
    }));
  }, []);

  const resetView = useCallback(() => {
    setControls({
      scale: 1,
      position: { x: 0, y: 0 },
    });
  }, []);

  return {
    scale: controls.scale,
    position: controls.position,
    handleZoom,
    handlePan,
    resetView,
  };
}