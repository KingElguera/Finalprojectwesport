import React from 'react';

interface PlaceholderViewProps {
  title: string;
  icon: React.ReactNode;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title, icon }) => {
  return (
    <div className="w-full h-full bg-black/95 backdrop-blur-md text-white flex flex-col animate-in slide-in-from-right duration-300 z-50">
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="p-6 bg-gray-800 rounded-full text-green-500">
            {React.cloneElement(icon as React.ReactElement<any>, { className: "w-16 h-16" })}
        </div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-gray-400 max-w-xs">
          Cette fonctionnalité sera disponible dans une prochaine mise à jour de WeSport. Restez connectés ! 🚀
        </p>
      </div>
    </div>
  );
};

export default PlaceholderView;