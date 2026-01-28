import React, { useState, useEffect, useRef } from 'react';
import { XIcon } from './Icons';
import { loadProfile, saveProfile, canChangeUsername, getNextUsernameChangeDate, updateUsername, updateBio, updateAvatar } from '../profileStorage';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [initialUsername, setInitialUsername] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger le profil au montage et quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      const profile = loadProfile();
      setUsername(profile.username);
      setBio(profile.bio);
      setAvatarUrl(profile.avatarUrl);
      setInitialUsername(profile.username);
      setAvatarPreview(null);
      setUsernameError(null);
    }
  }, [isOpen]);

  // Vérifier si le pseudo peut être changé
  const checkUsernameChangeability = (newUsername: string) => {
    // Si le pseudo n'a pas changé, pas de problème
    if (newUsername === initialUsername) {
      setUsernameError(null);
      return true;
    }

    // Vérifier si le changement est autorisé
    if (!canChangeUsername()) {
      const nextDate = getNextUsernameChangeDate();
      if (nextDate) {
        const formattedDate = nextDate.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        setUsernameError(`Vous avez atteint la limite de 2 changements de pseudo sur 3 mois. Vous pourrez rechanger votre pseudo le ${formattedDate}.`);
        return false;
      }
    }

    // Validation basique du pseudo
    if (newUsername.trim().length === 0) {
      setUsernameError('Le pseudo ne peut pas être vide.');
      return false;
    }

    if (newUsername.length < 3) {
      setUsernameError('Le pseudo doit contenir au moins 3 caractères.');
      return false;
    }

    if (newUsername.length > 30) {
      setUsernameError('Le pseudo ne peut pas dépasser 30 caractères.');
      return false;
    }

    setUsernameError(null);
    return true;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    checkUsernameChangeability(newUsername);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image.');
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image est trop grande. Taille maximale : 5MB.');
        return;
      }

      // Créer une preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Vérifier le pseudo avant de sauvegarder
    if (!checkUsernameChangeability(username)) {
      return;
    }

    setIsSaving(true);

    try {
      const profile = loadProfile();
      let hasChanges = false;

      // Mettre à jour le pseudo si changé
      if (username !== profile.username) {
        const success = updateUsername(username);
        if (!success) {
          setUsernameError('Impossible de changer le pseudo. Limite atteinte.');
          setIsSaving(false);
          return;
        }
        hasChanges = true;
      }

      // Mettre à jour la bio si changée
      if (bio !== profile.bio) {
        updateBio(bio);
        hasChanges = true;
      }

      // Mettre à jour l'avatar si changé
      if (avatarUrl !== profile.avatarUrl) {
        updateAvatar(avatarUrl);
        hasChanges = true;
      }

      if (hasChanges && onProfileUpdated) {
        onProfileUpdated();
      }

      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Une erreur est survenue lors de la sauvegarde.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const canChange = canChangeUsername();
  const nextChangeDate = getNextUsernameChangeDate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full h-full md:w-[600px] md:h-[80vh] bg-black border border-gray-800 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-800">
          <h2 className="text-xl md:text-2xl font-bold text-white">Modifier le profil</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <XIcon className="w-6 h-6 text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-6">
          <div className="max-w-md mx-auto space-y-6">
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-green-400 to-green-700 p-1">
                  <img
                    src={avatarPreview || avatarUrl}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover border-2 border-black"
                  />
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-500 text-white p-2 rounded-full shadow-lg transition-colors"
                  aria-label="Changer la photo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <p className="text-xs text-gray-400 text-center">
                Cliquez sur le bouton + pour changer votre photo de profil
              </p>
            </div>

            {/* Username Section */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Pseudo
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={handleUsernameChange}
                disabled={!canChange && username === initialUsername}
                className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  usernameError ? 'border-red-500' : 'border-gray-700'
                } ${!canChange && username === initialUsername ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="Votre pseudo"
              />
              {usernameError && (
                <p className="mt-2 text-sm text-red-500">{usernameError}</p>
              )}
              {!canChange && username === initialUsername && nextChangeDate && (
                <p className="mt-2 text-sm text-yellow-500">
                  Vous avez atteint la limite de 2 changements sur 3 mois. Prochain changement possible le {nextChangeDate.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}.
                </p>
              )}
              {canChange && username !== initialUsername && (
                <p className="mt-2 text-xs text-gray-400">
                  Vous pouvez changer votre pseudo 2 fois tous les 3 mois.
                </p>
              )}
            </div>

            {/* Bio Section */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={150}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                placeholder="Parlez-nous de vous..."
              />
              <p className="mt-1 text-xs text-gray-400 text-right">
                {bio.length}/150
              </p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 p-4 md:p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !!usernameError}
            className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;

