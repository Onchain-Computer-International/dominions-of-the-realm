interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, children, className = "" }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`bg-gray-900 rounded-lg shadow-xl w-[800px] max-w-[90vw] max-h-[90vh] flex flex-col ${className}`}>
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ 
  children, 
  onClose 
}: { 
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="flex justify-between items-center p-4 border-b border-gray-700">
      {children}
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-200"
      >
        ✕
      </button>
    </div>
  );
}

export function ModalBody({ 
  children,
  className = ""
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex-1 overflow-auto p-4 ${className}`}>
      {children}
    </div>
  );
} 