
import React from 'react';

interface SidebarBackdropProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidebarBackdrop: React.FC<SidebarBackdropProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
    </div>
  );
};

export default SidebarBackdrop;
