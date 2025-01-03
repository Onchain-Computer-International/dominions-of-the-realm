import { useEffect, useRef, useState } from 'react';

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState(0);
  
  const tracks = [
    '/music/dominion1.mp3',
    '/music/dominion2.mp3',
    '/music/dominion3.mp3'
  ];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', () => {
        setCurrentTrack((prev) => (prev + 1) % tracks.length);
      });
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = tracks[currentTrack];
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrack]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-800 p-2 rounded-lg shadow-lg">
      <audio ref={audioRef} />
      <button 
        onClick={togglePlay}
        className="text-white hover:text-gray-300"
      >
        {isPlaying ? '⏸️ Pause' : '▶️ Play'} Music
      </button>
    </div>
  );
} 