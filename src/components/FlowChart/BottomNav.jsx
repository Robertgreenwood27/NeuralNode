import React from 'react';
import { PlusCircle, Save, Undo, ArrowUpCircle } from 'lucide-react';

const BottomNav = ({ onAddNode, onSave, onUndoDelete, onScrollToTop, canUndo, showScrollToTop }) => {
  return (
    <nav className="bottom-nav">
      <button onClick={onAddNode} className="bottom-nav-item" aria-label="Add Node">
        <PlusCircle size={24} />
        <span>Add</span>
      </button>
      <button onClick={onSave} className="bottom-nav-item" aria-label="Save">
        <Save size={24} />
        <span>Save</span>
      </button>
      <button 
        onClick={onUndoDelete} 
        className="bottom-nav-item" 
        disabled={!canUndo}
        aria-label="Undo Delete"
      >
        <Undo size={24} />
        <span>Undo</span>
      </button>
      {showScrollToTop && (
        <button onClick={onScrollToTop} className="bottom-nav-item" aria-label="Scroll to top">
          <ArrowUpCircle size={24} />
          <span>Top</span>
        </button>
      )}
    </nav>
  );
};

export default BottomNav;