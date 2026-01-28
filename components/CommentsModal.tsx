import React from 'react';
import { XIcon } from './Icons';
import { WeSportPostData } from '../types';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: WeSportPostData;
  focusCommentText?: string;
}

const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  post,
  focusCommentText,
}) => {
  if (!isOpen) return null;

  // Mock comments pour le post
  const mockComments = [
    { id: '1', username: 'user1', text: 'Super ! 🔥', time: '2h' },
    { id: '2', username: 'user2', text: 'Bravo ! 💪', time: '5h' },
    { id: '3', username: 'user3', text: 'Impressionnant ! 👏', time: '1j' },
  ];

  // Ajouter le commentaire focusé s'il existe
  const comments = focusCommentText
    ? [{ id: 'focus', username: 'user_focus', text: focusCommentText, time: 'À l\'instant' }, ...mockComments]
    : mockComments;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full h-full md:w-[600px] md:h-[80vh] bg-black border border-gray-800 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-800">
          <h2 className="text-xl md:text-2xl font-bold text-white">Commentaires</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <XIcon className="w-6 h-6 text-gray-300" />
          </button>
        </div>

        {/* Post Preview */}
        <div className="p-4 border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-3">
            <img
              src={post.userAvatarUrl}
              alt={post.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="text-white font-semibold">@{post.username}</p>
              <p className="text-gray-400 text-sm line-clamp-2">{post.description}</p>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-6">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p className="text-lg">Aucun commentaire</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    comment.id === 'focus' ? 'bg-green-900/20 border border-green-500/30' : 'bg-gray-900/30'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-600 to-gray-800"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-white font-semibold text-sm">@{comment.username}</span>
                      <span className="text-gray-500 text-xs">{comment.time}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area (placeholder) */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-900 rounded-full px-4 py-2 text-gray-400 text-sm">
              Ajouter un commentaire...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;




