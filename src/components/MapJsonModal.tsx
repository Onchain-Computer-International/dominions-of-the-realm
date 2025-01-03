import { Territory } from '../Map/types';
import { useState } from 'react';
import { Code, Grid } from 'lucide-react';
import { Modal, ModalHeader, ModalBody } from './Modal';
import { baseCards } from '../Cards';
import { Card } from './Card';

interface MapJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  territories: Territory[];
}

type TabType = 'visual' | 'json';

export function MapJsonModal({ isOpen, onClose, territories }: MapJsonModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('visual');
  
  if (!isOpen) return null;

  // Count cards by ID
  const cardCounts = territories.reduce((acc, territory) => {
    const cardId = territory.card.id;
    acc[cardId] = (acc[cardId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get base card details for each card type found
  const cardDetails = Object.keys(cardCounts).map(cardId => {
    const baseCard = baseCards.find(card => card.id === cardId);
    return {
      id: cardId,
      count: cardCounts[cardId],
      name: baseCard?.name || cardId,
      rarity: baseCard?.rarity,
      type: baseCard?.type?.[0] || 'unknown'
    };
  });

  // Sort by count (descending), then by name
  cardDetails.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

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
            <span>Cards</span>
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
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">
                Card Distribution ({territories.length} total territories)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cardDetails.map(({ id, count, name }) => {
                  const card = baseCards.find(c => c.id === id);
                  if (!card) return null;
                  
                  return (
                    <Card
                      key={id}
                      card={card}
                      count={count}
                      className="w-full h-auto aspect-[2/3]"
                    />
                  );
                })}
              </div>
            </div>
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