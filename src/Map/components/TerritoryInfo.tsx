import React from 'react';
import { Territory } from '../types';
import { Card } from '../../components/Card';

interface TerritoryInfoProps {
  territory: Territory;
}

export function TerritoryInfo({ territory }: TerritoryInfoProps) {
  return (
    <div className="absolute bottom-4 left-4">
      <Card 
        card={territory.card}
        className="w-64" // Slightly larger than default
      />
    </div>
  );
}