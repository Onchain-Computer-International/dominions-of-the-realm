import { useMemo, useState } from 'react';
import { Card as CardComponent } from './Card';
import { Card as CardType } from '../types/game';
import { Layers, Hand, Play, Trash, ChevronDown, ChevronRight, Code } from 'lucide-react';
import { Modal, ModalHeader, ModalBody } from './Modal';

interface DeckViewerProps {
  isOpen: boolean;
  onClose: () => void;
  deck: CardType[];
  discard: CardType[];
  inPlay: CardType[];
  hand: CardType[];
}

type TabType = 'visual' | 'json';

function FaceDownCard({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`relative bg-gray-800 rounded-lg shadow-lg border ${className} w-48 h-72 transform-gpu overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900">
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-4 gap-4 p-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-full bg-white/20" />
            ))}
          </div>
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Layers className="w-16 h-16 text-gray-600" />
      </div>
    </div>
  );
}

export function DeckViewer({ isOpen, onClose, deck, discard, inPlay, hand }: DeckViewerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('visual');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    all: true
  });
  
  const totalCards = deck.length + discard.length + inPlay.length + hand.length;

  const sortedCards = useMemo(() => {
    const cardTracker = new Map<string, { card: CardType; zone: 'hand' | 'play' | 'discard' | 'deck' }>();
    
    deck.forEach((card, index) => {
      cardTracker.set(`deck-${card.id}-${index}`, { card, zone: 'deck' });
    });
    
    discard.forEach((card, index) => {
      cardTracker.set(`discard-${card.id}-${index}`, { card, zone: 'discard' });
    });
    
    inPlay.forEach((card, index) => {
      cardTracker.set(`play-${card.id}-${index}`, { card, zone: 'play' });
    });
    
    hand.forEach((card, index) => {
      cardTracker.set(`hand-${card.id}-${index}`, { card, zone: 'hand' });
    });

    return [...cardTracker.values()].sort((a, b) => {
      const getTypePriority = (card: CardType) => {
        if (card.type.includes('family')) return 1;
        if (card.type.includes('action')) return 2;
        if (card.type.includes('treasure')) return 3;
        if (card.type.includes('curse')) return 4;
        return 5;
      };

      const priorityA = getTypePriority(a.card);
      const priorityB = getTypePriority(b.card);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      return (a.card.cost || 0) - (b.card.cost || 0);
    });
  }, [deck, discard, inPlay, hand]);

  const groupedCards = useMemo(() => {
    return sortedCards.reduce((acc, { card, zone }) => {
      if (!acc[zone]) {
        acc[zone] = [];
      }
      acc[zone].push(card);
      return acc;
    }, {} as Record<string, CardType[]>);
  }, [sortedCards]);

  const allCards = useMemo(() => {
    return sortedCards.map(({ card }) => card);
  }, [sortedCards]);

  const displayGroups = useMemo(() => {
    return {
      all: allCards,
      ...groupedCards
    };
  }, [allCards, groupedCards]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getZoneIcon = (zone: string) => {
    switch (zone) {
      case 'all': return <Layers size={20} className="text-purple-400" />;
      case 'hand': return <Hand size={20} className="text-blue-400" />;
      case 'play': return <Play size={20} className="text-green-400" />;
      case 'discard': return <Trash size={20} className="text-red-400" />;
      default: return <Layers size={20} className="text-gray-400" />;
    }
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
            <Layers size={16} />
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
            {Object.entries(displayGroups).map(([zone, cards]) => (
              <div key={zone} className="bg-gray-800 rounded-lg">
                <button
                  onClick={() => toggleCategory(zone)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-750 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {expandedCategories[zone] ? (
                      <ChevronDown size={20} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={20} className="text-gray-400" />
                    )}
                    {getZoneIcon(zone)}
                    <h3 className="text-lg font-semibold text-gray-100 capitalize">
                      {zone} ({cards.length})
                    </h3>
                  </div>
                </button>

                {expandedCategories[zone] && (
                  <div className="p-4 pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {cards.map((card) => (
                        <div key={card.id} className="transform hover:scale-105 transition-transform">
                          {zone === 'discard' ? (
                            <FaceDownCard />
                          ) : (
                            <CardComponent card={card} />
                          )}
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
            {JSON.stringify({ deck, discard, inPlay, hand }, null, 2)}
          </pre>
        )}
      </ModalBody>
    </Modal>
  );
}