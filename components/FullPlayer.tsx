import React, { useState } from 'react';
import { Song } from '../types';
import { Play, Pause, SkipBack, SkipForward, Volume2, ChevronDown, Repeat, Shuffle, ListMusic, X } from 'lucide-react';

interface FullPlayerProps {
  song: Song;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  queue: Song[];
  onRemoveFromQueue: (index: number) => void;
}

export const FullPlayer: React.FC<FullPlayerProps> = ({
  song,
  isPlaying,
  onTogglePlay,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  onClose,
  onNext,
  onPrev,
  queue,
  onRemoveFromQueue
}) => {
  const [showQueue, setShowQueue] = useState(false);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = (currentTime / (duration || 1)) * 100;

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-xl flex flex-col transition-all duration-300 animate-[fadeIn_0.3s_ease-out]">
      {/* Background Ambience based on Cover - Monochromed and Reduced */}
      {song.coverUrl && (
        <div 
          className="absolute inset-0 z-0 opacity-5 blur-[120px] scale-125 pointer-events-none grayscale"
          style={{ backgroundImage: `url(${song.coverUrl})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
        ></div>
      )}

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6 shrink-0">
        <button 
          onClick={onClose} 
          className="p-2 text-slate-500 hover:text-white transition rounded-lg hover:bg-white/5"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
        <div className="text-center">
          <h2 className="text-xs font-bold tracking-widest text-slate-600 uppercase">Now Playing</h2>
          <p className="text-sm font-medium text-slate-300 line-clamp-1">{song.name}</p>
        </div>
        
        {/* Queue Toggle Button */}
        <button 
           onClick={() => setShowQueue(!showQueue)}
           className={`p-2 transition rounded-lg hover:bg-white/5 ${showQueue ? 'text-sky-500' : 'text-slate-500 hover:text-white'}`}
           title="Toggle Queue"
        >
           <ListMusic className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-8 w-full max-w-3xl mx-auto overflow-hidden">
        
        {/* Conditional View: Queue vs Player */}
        {showQueue ? (
          <div className="w-full h-full flex flex-col animate-[fadeIn_0.2s_ease-out]">
             <h3 className="text-xl text-white font-medium mb-4">Up Next</h3>
             {queue.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                  <ListMusic className="w-12 h-12 mb-2 opacity-20" />
                  <p>Queue is empty</p>
               </div>
             ) : (
               <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {queue.map((item, idx) => (
                     <div key={`${item.id}-${idx}`} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 group">
                        <div className="w-10 h-10 rounded bg-zinc-800 flex-shrink-0 overflow-hidden">
                           {item.coverUrl ? (
                              <img src={item.coverUrl} className="w-full h-full object-cover" alt="" />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">♪</div>
                           )}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="text-white text-sm font-medium truncate">{item.name}</div>
                           <div className="text-slate-500 text-xs truncate">{item.artist || 'Unknown'}</div>
                        </div>
                        <button 
                          onClick={() => onRemoveFromQueue(idx)}
                          className="p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                           <X className="w-4 h-4" />
                        </button>
                     </div>
                  ))}
               </div>
             )}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-6 md:gap-8 h-full justify-center min-h-[500px]">
          
            {/* Album Art / Visualizer */}
            <div className="relative aspect-square w-[min(100%,_35vh)] md:w-[min(100%,_45vh)] max-w-[280px] md:max-w-[380px] group perspective-[1000px] shrink-0">
              {/* Ambient Glow */}
              <div className={`absolute inset-0 bg-sky-900/10 blur-3xl rounded-full transition-all duration-1000 ease-in-out ${isPlaying ? 'opacity-40 scale-105' : 'opacity-0 scale-90'}`}></div>

              {/* Art Container */}
              <div className={`relative w-full h-full rounded shadow-2xl overflow-hidden ring-1 ring-white/5 transform transition-all duration-[3s] ease-in-out ${isPlaying ? 'scale-[1.01]' : 'scale-100'}`}>
                  
                {song.coverUrl ? (
                  <img 
                    src={song.coverUrl} 
                    alt="Album Art" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                      <div className={`w-3/4 h-3/4 rounded-full bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center border border-white/5 shadow-inner ${isPlaying ? 'animate-[spin_8s_linear_infinite]' : ''}`}>
                          <div className="w-1/3 h-1/3 rounded-full bg-sky-900/10 blur-xl"></div>
                          <span className="text-4xl text-slate-700 absolute">♪</span>
                      </div>
                  </div>
                )}
                
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
              </div>
            </div>

            {/* Track Info */}
            <div className="text-center w-full shrink-0">
              <h1 className="text-2xl md:text-3xl font-medium text-white mb-2 truncate px-4 tracking-tight">{song.name}</h1>
              <p className="text-lg text-slate-500">{song.artist || "Unknown Artist"}</p>
            </div>

            {/* Custom Progress Bar */}
            <div className="w-full max-w-2xl relative group shrink-0 px-4 md:px-0">
              <div className="h-1 w-full bg-slate-800 rounded-sm overflow-visible relative">
                  <div 
                    className="absolute left-0 top-0 h-full bg-sky-500 rounded-sm transition-all duration-100 ease-linear"
                    style={{ width: `${progressPercent}%` }}
                  >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)] scale-0 group-hover:scale-100 transition-transform duration-200"></div>
                  </div>
              </div>

              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              <div className="flex justify-between mt-3 text-xs text-slate-500 font-mono tracking-wider">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between w-full max-w-sm shrink-0">
              <button className="text-slate-600 hover:text-sky-500 transition p-2"><Shuffle className="w-5 h-5" /></button>
              
              <button onClick={onPrev} className="text-slate-300 hover:text-white transition hover:scale-105 p-2">
                 <SkipBack className="w-8 h-8" />
              </button>
              
              <button 
                onClick={onTogglePlay}
                className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-lg shadow-white/5"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-black text-black" /> : <Play className="w-6 h-6 fill-black text-black ml-1" />}
              </button>
              
              <button onClick={onNext} className="text-slate-300 hover:text-white transition hover:scale-105 p-2">
                 <SkipForward className="w-8 h-8" />
              </button>
              
              <button className="text-slate-600 hover:text-sky-500 transition p-2"><Repeat className="w-5 h-5" /></button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-4 w-full max-w-xs px-4 py-3 bg-zinc-900/50 rounded-lg border border-white/5 shrink-0">
              <Volume2 className="w-4 h-4 text-slate-500" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-slate-700 rounded-sm appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-slate-400 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2"
              />
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};