import React from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function MapControls({ onZoomIn, onZoomOut, onReset }: MapControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
      <button
        onClick={onZoomIn}
        className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
        title="Zoom In"
      >
        <ZoomIn size={20} />
      </button>
      <button
        onClick={onZoomOut}
        className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
        title="Zoom Out"
      >
        <ZoomOut size={20} />
      </button>
      <button
        onClick={onReset}
        className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
        title="Reset View"
      >
        <Maximize2 size={20} />
      </button>
    </div>
  );
}