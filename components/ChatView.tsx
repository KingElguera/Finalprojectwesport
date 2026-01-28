import React from 'react';
import { ChevronRightIcon } from './Icons';

interface ChatViewProps {
  // onClose removed as we use bottom nav
}

const ChatView: React.FC<ChatViewProps> = () => {
  const conversations = [
    { id: 1, name: 'Coach Mike', message: 'T’es dispo pour la séance de demain ?', time: '14:30', unread: true },
    { id: 2, name: 'Sarah CrossFit', message: 'Bravo pour ton PR ! 🔥', time: 'Hier', unread: false },
    { id: 3, name: 'Team Running', message: 'On se retrouve au parc à 18h.', time: 'Mar', unread: false },
    { id: 4, name: 'Lucas Skate', message: 'Regarde cette vidéo...', time: 'Lun', unread: false },
  ];

  return (
    <div className="w-full h-full bg-black text-white flex flex-col animate-in slide-in-from-right duration-300">
      
      <div className="flex justify-center items-center p-4 border-b border-gray-800">
        <h2 className="font-bold text-lg">Messages</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map((chat) => (
          <div key={chat.id} className="flex items-center gap-4 p-4 hover:bg-gray-900 cursor-pointer border-b border-gray-800/50">
            <div className="w-12 h-12 rounded-full bg-gray-700 flex-shrink-0 relative">
                {/* Avatar Placeholder */}
                <div className="w-full h-full rounded-full bg-gradient-to-br from-green-900 to-black opacity-80 border border-gray-700"></div>
                {chat.unread && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className={`font-semibold truncate ${chat.unread ? 'text-white' : 'text-gray-300'}`}>
                  {chat.name}
                </h3>
                <span className="text-xs text-gray-500">{chat.time}</span>
              </div>
              <p className={`text-sm truncate ${chat.unread ? 'text-gray-200 font-medium' : 'text-gray-500'}`}>
                {chat.message}
              </p>
            </div>
            
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatView;