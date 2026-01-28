'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, ImageIcon, XIcon } from './Icons';
import { useSendMessage, useTypingIndicator, useUploadChatMedia } from '@/lib/hooks/useChat';

interface MessageInputProps {
  conversationId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ conversationId }) => {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const sendMessage = useSendMessage();
  const uploadMedia = useUploadChatMedia();
  const { startTyping, stopTyping } = useTypingIndicator(conversationId);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('L\'image ne doit pas dépasser 10 Mo');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    startTyping();
  };

  // Handle send message
  const handleSend = async () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage && !selectedImage) return;

    try {
      setIsUploading(true);
      stopTyping();

      let mediaUrl: string | undefined;
      let mediaType: 'image' | undefined;

      // Upload image if selected
      if (selectedImage) {
        mediaUrl = await uploadMedia.mutateAsync(selectedImage);
        mediaType = 'image';
      }

      // Send message
      await sendMessage.mutateAsync({
        conversation_id: conversationId,
        content: trimmedMessage || undefined,
        media_url: mediaUrl,
        media_type: mediaType
      });

      // Clear input
      setMessage('');
      removeImage();
      
      // Focus input
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle blur
  const handleBlur = () => {
    stopTyping();
  };

  const canSend = (message.trim() || selectedImage) && !isUploading;

  return (
    <div className="border-t border-gray-800 bg-black p-3 safe-area-pb">
      {/* Image preview */}
      {imagePreview && (
        <div className="relative inline-block mb-3">
          <img
            src={imagePreview}
            alt="Preview"
            className="h-20 rounded-lg object-cover"
          />
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 p-1 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Supprimer l'image"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Image upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors flex-shrink-0"
          aria-label="Ajouter une image"
          disabled={isUploading}
        >
          <ImageIcon className={`w-6 h-6 ${isUploading ? 'text-gray-600' : 'text-gray-400'}`} />
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            onBlur={handleBlur}
            placeholder="Votre message..."
            rows={1}
            className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-2.5 px-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 resize-none max-h-[120px]"
            disabled={isUploading}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`p-2.5 rounded-full flex-shrink-0 transition-all ${
            canSend
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
          aria-label="Envoyer"
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <SendIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;

