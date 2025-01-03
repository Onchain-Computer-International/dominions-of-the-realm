import React from 'react';
import { Territory } from '../types';
import { Card } from '../../components/Card';

interface TerritoryInfoProps {
  territory: Territory;
}

export function TerritoryInfo({ territory }: TerritoryInfoProps) {
  return (
    <div className="absolute bottom-4 left-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold mb-2">Territory Info</h3>
      <Card 
        card={territory.card}
      />
      <p>Position: ({territory.x}, {territory.y})</p>
      <p>Type: {territory.type}</p>
      
      {/* Add Features Section */}
      <div className="mt-2">
        <p className="font-bold">Features:</p>
        <ul className="list-disc list-inside">
          {territory.features.rivers && <li>Rivers</li>}
          {territory.features.mountains && <li>Mountains</li>}
          {territory.features.forest && <li>Forest</li>}
        </ul>
      </div>

      {/* Resources Section */}
      <div className="mt-2">
        <p className="font-bold">Resources:</p>
        <ul className="list-disc list-inside">
          {territory.resources.gold > 0 && <li>Gold: {territory.resources.gold}</li>}
          {territory.resources.production > 0 && <li>Production: {territory.resources.production}</li>}
          {territory.resources.food > 0 && <li>Food: {territory.resources.food}</li>}
          {territory.resources.science > 0 && <li>Science: {territory.resources.science}</li>}
        </ul>
      </div>
    </div>
  );
}