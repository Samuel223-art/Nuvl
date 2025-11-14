
import React, { useState } from 'react';
import { Novel } from '../../data/novels';
import NovelsList from './NovelsList';
import NovelForm from './NovelForm';
import CreateNovelModal from './CreateNovelModal';

interface User {
  idToken: string;
  localId: string;
  email: string;
}

interface NovelsViewProps {
  currentUser: User | null;
  novels: Novel[];
  onSaveNovel: (novel: Novel) => void;
  onDeleteNovel: (id: string) => void;
}

const NovelsView: React.FC<NovelsViewProps> = ({ currentUser, novels, onSaveNovel, onDeleteNovel }) => {
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<'Novel' | 'Ongoing' | 'Completed'>('Novel');

  const handleEdit = (novel: Novel) => {
    setEditingNovel(novel);
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };
  
  const handleCancelEdit = () => {
    setEditingNovel(null);
  };

  const handleSave = (novelToSave: Novel) => {
    onSaveNovel(novelToSave);
    handleCancelEdit();
  };

  const handleDelete = (novelId: string) => {
    if (window.confirm("Are you sure you want to delete this novel? This cannot be undone.")) {
      onDeleteNovel(novelId);
      if (editingNovel?.id === novelId) {
        handleCancelEdit();
      }
    }
  };

  const handleCreateFromModal = (newNovel: Novel) => {
    onSaveNovel(newNovel); // Save to global state
    setIsCreateModalOpen(false); // Close modal
    setEditingNovel(newNovel); // Open full editor for the new novel
  };


  if (editingNovel) {
    return (
      <NovelForm 
        currentUser={currentUser}
        novel={editingNovel}
        onSave={handleSave}
        onCancel={handleCancelEdit}
      />
    );
  }

  const filteredNovels = novels.filter(novel => {
    if (filter === 'Novel') return true;
    return novel.status === filter;
  });

  const filterTabs: Array<'Novel' | 'Ongoing' | 'Completed'> = ['Novel', 'Ongoing', 'Completed'];

  return (
    <div className="pb-24">
       {isCreateModalOpen && (
        <CreateNovelModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateFromModal}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Novels</h1>
          <p className="text-neutral-400 mt-1">Add, edit, or remove novels from the app.</p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="border-b border-neutral-700">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none ${
                  filter === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-500'
                }`}
                aria-current={filter === tab ? 'page' : undefined}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <NovelsList 
        novels={filteredNovels}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <div className="fixed bottom-0 left-0 right-0 bg-neutral-800/80 backdrop-blur-sm border-t border-neutral-700 z-30">
        <div className="max-w-4xl mx-auto p-4">
          <button
            onClick={handleOpenCreateModal}
            className="w-full bg-primary text-black font-bold py-3 px-4 rounded-lg hover:bg-green-400 transition-colors flex items-center justify-center text-base"
          >
            <i className="fas fa-plus mr-2"></i>
            Create Novel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NovelsView;
