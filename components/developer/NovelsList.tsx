
import React from 'react';
import { Novel } from '../../data/novels';

interface NovelsListProps {
  novels: Novel[];
  onEdit: (novel: Novel) => void;
  onDelete: (id: string) => void;
}

const NovelsList: React.FC<NovelsListProps> = ({ novels, onEdit, onDelete }) => {
  return (
    <div className="text-white">
      <div className="bg-neutral-800 rounded-lg shadow">
        {novels.length === 0 ? (
          <div className="text-center py-12 px-6">
            <p className="text-neutral-400">There are no novels for the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-neutral-700/50">
                    <tr>
                        <th className="p-4 font-semibold">Cover</th>
                        <th className="p-4 font-semibold">Title</th>
                        <th className="p-4 font-semibold hidden md:table-cell">Author</th>
                        <th className="p-4 font-semibold hidden sm:table-cell">Status</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700">
                  {novels.map(novel => (
                    <tr key={novel.id}>
                      <td className="p-4">
                        <img src={novel.coverUrl} alt={novel.title} className="w-12 h-16 object-cover rounded-md" />
                      </td>
                      <td className="p-4 font-medium">{novel.title}</td>
                      <td className="p-4 text-neutral-300 hidden md:table-cell">{novel.author}</td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          novel.status === 'Ongoing' ? 'bg-blue-500/20 text-blue-300' :
                          novel.status === 'Completed' ? 'bg-green-500/20 text-green-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {novel.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => onEdit(novel)} className="px-3 py-2 bg-neutral-700 rounded-md hover:bg-neutral-600" aria-label={`Edit ${novel.title}`}>
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                          <button onClick={() => onDelete(novel.id)} className="px-3 py-2 bg-neutral-700 text-red-500 rounded-md hover:bg-red-500 hover:text-white" aria-label={`Delete ${novel.title}`}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default NovelsList;
