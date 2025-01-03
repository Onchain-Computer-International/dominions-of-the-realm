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
  territories: Territory[];
}

export function Hex({ territory, isSelected, onClick, territories }: HexProps) {
  const [x, y] = hexToPixel(territory.x, territory.y);
  const points = getHexCorners(x, y);
  const color = territory.card.color;

  // Get the points array for creating individual border segments
  const cornerPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (2 * Math.PI * i) / 6;
    cornerPoints.push([
      x + HEX_SIZE * Math.cos(angle),
      y + HEX_SIZE * Math.sin(angle)
    ]);
  }

  // Helper function to check if a neighbor is owned
  const hasOwnedNeighbor = (direction: number) => {
    const directionToCoord = [
      [1, 0],   // 0: top-right
      [0, 1],   // 1: right
      [-1, 1],  // 2: bottom-right
      [-1, 0],  // 3: bottom-left
      [0, -1],  // 4: left
      [1, -1]   // 5: top-left
    ];
    
    const [dx, dy] = directionToCoord[direction];
    const neighborX = territory.x + dx;
    const neighborY = territory.y + dy;
    
    return territories.some(t => 
      t.x === neighborX && 
      t.y === neighborY && 
      t.isOwned
    );
  };

  return (
    <g 
      onClick={onClick} 
      className="cursor-pointer"
      style={{ pointerEvents: 'all' }}
    >
      <polygon
        points={points}
        fill={`rgb(${color.r}, ${color.g}, ${color.b})`}
        stroke={territory.isOwned ? 'none' : (isSelected ? '#ffffff' : '#1f2937')}
        strokeWidth={isSelected ? 2 : 1}
        className={`transition-all duration-200 ${
          isSelected ? 'brightness-125' : 'hover:brightness-110'
        }`}
      />
      {territory.isOwned && (
        <>
          <polygon
            points={points}
            fill="rgba(128, 0, 128, 0.1)"
            stroke="none"
          />
          {/* Draw individual border segments */}
          {[0, 1, 2, 3, 4, 5].map(i => {
            if (!hasOwnedNeighbor(i)) {
              const start = cornerPoints[i];
              const end = cornerPoints[(i + 1) % 6];
              return (
                <line
                  key={i}
                  x1={start[0]}
                  y1={start[1]}
                  x2={end[0]}
                  y2={end[1]}
                  stroke="purple"
                  strokeWidth="6"
                />
              );
            }
            return null;
          })}
        </>
      )}
      <HexFeatures 
        territory={territory} 
        position={[x, y]} 
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

  const CENTER_COORDS = { x: 0, y: 0 }; // Center of the map

  // Add this helper function to get adjacent coordinates
  const getAdjacentCoords = (x: number, y: number) => {
    // For hexagonal grid, these are the relative coordinates of adjacent tiles
    return [
      [x+1, y], [x+1, y-1],
      [x, y-1], [x-1, y],
      [x-1, y+1], [x, y+1]
    ];
  };

  // Add new Audio instance at the component level
  const selectSound = new Audio('/sounds/select.mp3');

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
    // Generate new map and mark center territory as owned
    const newMap = generateMap(BOARD_SIZE);
    
    // Mark center and adjacent territories as owned
    newMap.forEach(territory => {
      // Mark center
      if (territory.x === CENTER_COORDS.x && territory.y === CENTER_COORDS.y) {
        territory.isOwned = true;
      }
      
      // Mark adjacent territories
      const adjacentCoords = getAdjacentCoords(CENTER_COORDS.x, CENTER_COORDS.y);
      if (adjacentCoords.some(([x, y]) => territory.x === x && territory.y === y)) {
        territory.isOwned = true;
      }
    });

    setTerritories(newMap);
  }, [setTerritories]);

  const handleHexClick = useCallback((territory: Territory) => {
    if (!isDragging) {
      setSelectedTerritory(prev => {
        // Only play sound when selecting a territory, not deselecting
        if (prev?.id !== territory.id) {
          selectSound.play().catch(e => console.error('Error playing sound:', e));
        }
        return prev?.id === territory.id ? null : territory;
      });
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
              territories={territories}
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