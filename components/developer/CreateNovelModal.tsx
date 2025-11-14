
import React, { useState } from 'react';
import { Novel } from '../../data/novels';

interface CreateNovelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newNovel: Novel) => void;
}

const generateCover = async (title: string): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    const width = 400;
    const height = 600;
    canvas.width = width;
    canvas.height = height;

    const palettes = [
        ['#1a1a1a', '#00DC64', '#00A34A', '#FFFFFF'],
        ['#2c3e50', '#e74c3c', '#ecf0f1', '#3498db'],
        ['#1d1d1d', '#f1c40f', '#f39c12', '#e67e22'],
        ['#8e44ad', '#9b59b6', '#ecf0f1', '#34495e'],
        ['#16a085', '#1abc9c', '#f1c40f', '#e67e22'],
        ['#222222', '#ff79c6', '#bd93f9', '#50fa7b', '#f1fa8c'],
    ];
    const palette = palettes[Math.floor(Math.random() * palettes.length)];
    const [bgColor, ...accentColors] = palette;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, Math.random() * height);
        ctx.lineTo(Math.random() * width, Math.random() * height);
        ctx.strokeStyle = accentColors[Math.floor(Math.random() * accentColors.length)];
        ctx.lineWidth = Math.random() * 4 + 1;
        ctx.globalAlpha = Math.random() * 0.5 + 0.3;
        ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
    
    const wrapText = (context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const words = text.split(' ');
        let line = '';
        const lines = [];

        for(let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                lines.push(line);
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        const totalHeight = (lines.length - 1) * lineHeight;
        let currentY = y - totalHeight / 2;

        for (let i = 0; i < lines.length; i++) {
            context.fillText(lines[i].trim(), x, currentY);
            currentY += lineHeight;
        }
    };

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    const textBgHeight = height * 0.4;
    ctx.fillRect(20, (height - textBgHeight) / 2 - 50, width - 40, textBgHeight);

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    let fontSize = 70;
    const maxTextWidth = width - 80;
    
    do {
      ctx.font = `bold ${fontSize}px Righteous`;
      fontSize -= 2;
    } while (ctx.measureText(title).width > maxTextWidth && fontSize > 20);
    
    wrapText(ctx, title.toUpperCase(), width / 2, height / 2 - 50, maxTextWidth, fontSize * 1.1);

    return canvas.toDataURL('image/png');
};


const CreateNovelModal: React.FC<CreateNovelModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || isCreating) return;
    setIsCreating(true);

    try {
        const coverUrl = await generateCover(title.trim());
        const newNovel: Novel = {
            id: Date.now().toString(),
            title: title.trim(),
            coverUrl: coverUrl,
            status: 'Ongoing',
            author: '',
            description: '',
            genre: '',
        };
        onCreate(newNovel);
    } catch (error) {
        console.error("Failed to create novel cover:", error);
        alert("Could not generate novel cover. Please try again.");
    } finally {
        setIsCreating(false);
        setTitle('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-neutral-800 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 id="modal-title" className="text-xl font-bold text-white mb-4">Create a New Novel</h2>
          <p className="text-neutral-400 text-sm mb-4">Enter a title to get started. A cover will be generated for you, and you can edit all details later.</p>
          <div>
            <label htmlFor="novel-title" className="sr-only">Novel Title</label>
            <input
              id="novel-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., The Last Stand"
              className="w-full bg-neutral-700 rounded-lg p-3 border border-neutral-600 focus:ring-primary focus:border-primary text-white"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreate();
                }
              }}
            />
          </div>
        </div>
        <div className="bg-neutral-700/50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-neutral-600 text-white font-semibold rounded-lg hover:bg-neutral-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim() || isCreating}
            className="py-2 px-4 bg-primary text-black font-bold rounded-lg hover:bg-green-400 transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed flex items-center"
          >
            {isCreating ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Creating...
              </>
            ) : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateNovelModal;
