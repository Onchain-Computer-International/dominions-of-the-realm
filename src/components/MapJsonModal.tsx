import { Territory } from '../Map/types';
import { useState } from 'react';
import { Code, Grid, ChevronRight, ChevronDown } from 'lucide-react';
import { Modal, ModalHeader, ModalBody } from './Modal';

interface MapJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  territories: Territory[];
}

type TabType = 'visual' | 'json';

export function MapJsonModal({ isOpen, onClose, territories }: MapJsonModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('visual');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  if (!isOpen) return null;

  // Group territories by type
  const groupedTerritories = territories.reduce((acc, territory) => {
    if (!acc[territory.type]) {
      acc[territory.type] = [];
    }
    acc[territory.type].push(territory);
    return acc;
  }, {} as Record<string, Territory[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('visual')}
            className={`flex items-center gap-2 px-3 py-1 rounded ${
              activeTab === 'visual' 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Grid size={16} />
            <span>Categories</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 px-3 py-1 rounded ${
              activeTab === 'json' 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Code size={16} />
            <span>JSON</span>
          </button>
        </div>
      </ModalHeader>
      
      <ModalBody>
        {activeTab === 'visual' ? (
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(groupedTerritories).map(([type, territories]) => (
              <div key={type} className="bg-gray-800 rounded-lg">
                <button
                  onClick={() => toggleCategory(type)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-750 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {expandedCategories[type] ? (
                      <ChevronDown size={20} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={20} className="text-gray-400" />
                    )}
                    <h3 className="text-lg font-semibold text-gray-100 capitalize">
                      {type} ({territories.length})
                    </h3>
                  </div>
                </button>
                
                {expandedCategories[type] && (
                  <div className="p-4 pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {territories.map((territory) => (
                        <div 
                          key={territory.id} 
                          className="bg-gray-700 rounded p-3 text-sm text-gray-200"
                        >
                          <div className="flex justify-between mb-2">
                            <span>ID: {territory.id}</span>
                            <span>({territory.x}, {territory.y})</span>
                          </div>
                          <div className="space-y-1 text-xs">
                            {territory.resources.food > 0 && (
                              <div>Food: {territory.resources.food}</div>
                            )}
                            {territory.resources.production > 0 && (
                              <div>Production: {territory.resources.production}</div>
                            )}
                            {territory.resources.gold > 0 && (
                              <div>Gold: {territory.resources.gold}</div>
                            )}
                            {territory.resources.science > 0 && (
                              <div>Science: {territory.resources.science}</div>
                            )}
                            {Object.keys(territory.features).length > 0 && (
                              <div className="text-gray-400">
                                Features: {Object.keys(territory.features).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap">
            {JSON.stringify(territories, null, 2)}
          </pre>
        )}
      </ModalBody>
    </Modal>
  );
} 