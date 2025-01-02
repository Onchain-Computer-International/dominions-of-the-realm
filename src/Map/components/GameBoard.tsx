import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Territory } from '../types';
import { TerritoryInfo } from './TerritoryInfo';
import { MapControls } from './MapControls';
import { useMapControls } from './useMapControls';
import { generateMap } from '../mapGenerator';
import { useAtom } from 'jotai';
import { mapAtom } from '../../atoms';

export const HEX_SIZE = 30;

export function hexToPixel(q: number, r: number): [number, number] {
  const x = HEX_SIZE * (3/2 * q);
  const y = HEX_SIZE * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
  return [x, y];
}

export function getHexCorners(x: number, y: number): string {
  const corners = [];
  for (let i = 0; i < 6; i++) {
    const angle = (2 * Math.PI * i) / 6;
    corners.push([
      x + HEX_SIZE * Math.cos(angle),
      y + HEX_SIZE * Math.sin(angle)
    ]);
  }
  return corners.map(([x, y]) => `${x},${y}`).join(' ');
}

const BOARD_SIZE = 12;

interface HexFeaturesProps {
  territory: Territory;
  position: [number, number];
}

export function HexFeatures({ territory, position: [x, y] }: HexFeaturesProps) {
  const features = [];
  
  // Rivers
  if (territory.features.rivers) {
    features.push(
      <path
        key="river"
        d={`M${x-15},${y} Q${x},${y+5} ${x+15},${y}`}
        stroke="#4287f5"
        strokeWidth="2"
        fill="none"
      />
    );
  }

  // Resources
  if (territory.resources.gold > 0) {
    features.push(
      <circle key="gold" cx={x-8} cy={y-8} r={4} fill="#ffd700" />
    );
  }
  if (territory.resources.production > 0) {
    features.push(
      <circle key="production" cx={x+8} cy={y-8} r={4} fill="#cd853f" />
    );
  }
  if (territory.resources.food > 0) {
    features.push(
      <circle key="food" cx={x} cy={y+8} r={4} fill="#32cd32" />
    );
  }
  if (territory.resources.science > 0) {
    features.push(
      <circle key="science" cx={x+8} cy={y+8} r={4} fill="#4169e1" />
    );
  }

  // Terrain features
  if (territory.type === 'mountains') {
    features.push(
      <path
        key="mountain"
        d={`M${x-10},${y+5} L${x},${y-10} L${x+10},${y+5}`}
        stroke="#666"
        strokeWidth="2"
        fill="none"
      />
    );
  }
  if (territory.type === 'forest' || territory.type === 'rainforest') {
    features.push(
      <circle key="tree" cx={x} cy={y} r={6} fill="#228b22" />
    );
  }

  return <>{features}</>;
}

interface HexProps {
  territory: Territory;
  isSelected: boolean;
  onClick: () => void;
}

export function Hex({ territory, isSelected, onClick }: HexProps) {
  const [x, y] = hexToPixel(territory.x, territory.y);
  const points = getHexCorners(x, y);
  const baseCardId = territory.card.id.split('-')[0];
  const color = territory.card.color;

  return (
    <g 
      onClick={onClick} 
      className="cursor-pointer"
      style={{ pointerEvents: 'all' }}
    >
      <polygon
        points={points}
        fill={`rgb(${color.r}, ${color.g}, ${color.b})`}
        stroke={isSelected ? '#ffffff' : '#1f2937'}
        strokeWidth={isSelected ? 2 : 1}
        className={`transition-all duration-200 ${
          isSelected ? 'brightness-125' : 'hover:brightness-110'
        }`}
      />
    </g>
  );
}

export function GameBoard() {
  const [territories, setTerritories] = useAtom(mapAtom);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    scale,
    position,
    handleZoom,
    handlePan,
    resetView
  } = useMapControls(0.5, 3);

  useEffect(() => {
    // Check if there's a map in localStorage
    const storedMap = false;//localStorage.getItem('game-map');
    if (storedMap) {
      try {
        const parsedMap = JSON.parse(storedMap);
        if (Array.isArray(parsedMap) && parsedMap.length > 0) {
          setTerritories(parsedMap);
          return;
        }
      } catch (e) {
        console.error('Error parsing stored map:', e);
      }
    }
    // Only generate new map if we don't have a valid stored map
    setTerritories(generateMap(BOARD_SIZE));
  }, [setTerritories]);

  const handleHexClick = useCallback((territory: Territory) => {
    if (!isDragging) {
      setSelectedTerritory(prev => prev?.id === territory.id ? null : territory);
    }
  }, [isDragging]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        startX: position.x,
        startY: position.y
      };
    }
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const dx = (e.clientX - dragStart.current.x) / scale;
      const dy = (e.clientY - dragStart.current.y) / scale;
      handlePan(
        dragStart.current.startX + dx,
        dragStart.current.startY + dy
      );
    }
  }, [isDragging, handlePan, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    handleZoom(delta);
  }, [handleZoom]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    
    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-hidden bg-gray-900"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ 
        touchAction: 'none',
        overscrollBehavior: 'none'
      }}
    >
      <svg
        viewBox="-800 -800 1600 1600"
        className="w-full h-full"
        style={{ 
          pointerEvents: 'all',
          cursor: isDragging ? 'grabbing' : 'grab',
          transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <g>
          {territories.map((territory) => (
            <Hex
              key={territory.id}
              territory={territory}
              isSelected={selectedTerritory?.id === territory.id}
              onClick={() => handleHexClick(territory)}
            />
          ))}
        </g>
      </svg>
      
      {selectedTerritory && <TerritoryInfo territory={selectedTerritory} />}
      <MapControls
        onZoomIn={() => handleZoom(0.2)}
        onZoomOut={() => handleZoom(-0.2)}
        onReset={resetView}
      />
    </div>
  );
}