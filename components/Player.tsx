import React from 'react';
import { Song } from '../types';
import { Play, Pause, SkipBack, SkipForward, Maximize2 } from 'lucide-react';

interface PlayerProps {
  song: Song;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onExpand: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Player: React.FC<PlayerProps> = ({ 
  song, 
  isPlaying, 
  onTogglePlay, 
  currentTime, 
  duration, 
  onSeek,
  onExpand,
  onNext,
  onPrev
}) => {
  
  const stopProp = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      onClick={onExpand}
      className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 px-4 py-3 md:py-4 z-40 cursor-pointer hover:bg-white/5 transition-colors group"
    >
      {/* Seek bar overlaid on top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800" onClick={stopProp}>
         <div 
           className="h-full bg-sky-500 transition-all duration-300 ease-linear" 
           style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
         ></div>
      </div>

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 mt-1">
        
        {/* Song Info */}
        <div className="flex items-center gap-3 md:w-1/3 overflow-hidden">
          {song.coverUrl ? (
             <img src={song.coverUrl} alt="Cover" className="w-12 h-12 rounded-lg object-cover shadow-lg border border-white/10" />
          ) : (
             <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 border border-white/10 shadow-lg">
                <span className="text-sky-400 font-bold">♪</span>
             </div>
          )}
          
          <div className="min-w-0">
            <h3 className="text-white font-medium truncate text-sm md:text-base">{song.name}</h3>
            <p className="text-slate-400 text-xs truncate group-hover:text-sky-400 transition-colors">
              {song.artist || "Click to expand"}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 md:gap-6" onClick={stopProp}>
           <button 
             onClick={onPrev}
             className="hidden md:block text-slate-400 hover:text-white transition"
           >
             <SkipBack className="w-5 h-5" />
           </button>
           
           <button 
              onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
              className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:scale-105 transition-transform text-slate-900 shadow-lg shadow-white/10"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
            </button>
            
            <button 
              onClick={onNext}
              className="text-slate-400 hover:text-white transition"
            >
             <SkipForward className="w-5 h-5" />
           </button>
        </div>

        {/* Expand Button */}
        <div className="flex items-center justify-end md:w-1/3 gap-4">
           <button onClick={(e) => { e.stopPropagation(); onExpand(); }} className="text-slate-400 hover:text-sky-400 transition p-2 hover:bg-white/10 rounded-lg">
              <Maximize2 className="w-5 h-5" />
           </button>
        </div>
      </div>
    </div>
  );
};