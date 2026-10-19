import React from 'react';
import { useUIStore } from '../store/uiStore';
import { MangaPage } from './MangaPage';

export const IntroCutscene: React.FC = () => {
  const setGameScreen = useUIStore((s) => s.setGameScreen);

  const handleComplete = () => {
    setGameScreen('game');
    useUIStore.getState().openRoleCard();
  };

  return <MangaPage cutsceneId="intro" onComplete={handleComplete} />;
};
