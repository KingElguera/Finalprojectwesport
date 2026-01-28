'use client';

import React, { useState, useEffect, useRef } from 'react';
import { XIcon } from './Icons';
import { WeSportPostData } from '@/lib/types';
import { useComments, useAddComment } from '@/lib/hooks/usePosts';
import { useAuth } from './AuthProvider';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

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
  const { data: commentsData, isLoading } = useComments(post.id);
  const addComment = useAddComment();
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const focusCommentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (focusCommentText && focusCommentRef.current) {
      setTimeout(() => {
        focusCommentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [focusCommentText, commentsData]);

  if (!isOpen) return null;

  const comments = commentsData || [];
  const hasFocusComment = !!focusCommentText;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await addComment.mutateAsync({ postId: post.id, text: commentText.trim() });
      setCommentText('');
      toast.success('Commentaire ajouté');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'ajout du commentaire');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : comments.length === 0 && !hasFocusComment ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p className="text-lg">Aucun commentaire</p>
              <p className="text-sm mt-2">Soyez le premier à commenter !</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {hasFocusComment && (
                <div
                  ref={focusCommentRef}
                  className="flex items-start gap-3 p-3 rounded-lg bg-green-900/20 border border-green-500/30"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                    <img
                      src={user?.user_metadata?.avatar_url || ''}
                      alt={user?.user_metadata?.username || 'user'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-white font-semibold text-sm">@{user?.user_metadata?.username || 'user'}</span>
                      <span className="text-gray-500 text-xs">À l'instant</span>
                    </div>
                    <p className="text-gray-300 text-sm">{focusCommentText}</p>
                  </div>
                </div>
              )}
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-900/30"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                    {comment.avatarUrl ? (
                      <img
                        src={comment.avatarUrl}
                        alt={comment.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-600 to-gray-800"></div>
                    )}
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

        {/* Input Area */}
        {user && (
          <div className="border-t border-gray-800 p-4">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Ajouter un commentaire..."
                disabled={isSubmitting}
                className="flex-1 bg-gray-900 rounded-full px-4 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || isSubmitting}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-full font-semibold text-sm transition-colors"
              >
                {isSubmitting ? '...' : 'Publier'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsModal;

