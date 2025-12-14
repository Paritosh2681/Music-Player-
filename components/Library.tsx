import React from 'react';
import { Song, User } from '../types';
import { Play, Pause, Music, Disc, Cloud, RefreshCw, CloudOff, ListPlus } from 'lucide-react';
import { Button } from './Button';

interface LibraryProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlay: (song: Song) => void;
  onPause: () => void;
  onNavigateHome: () => void;
  user?: User | null;
  onLoginClick?: () => void;
  onRefresh?: () => void;
  onAddToQueue?: (song: Song) => void;
}

export const Library: React.FC<LibraryProps> = ({ 
  songs, 
  currentSong, 
  isPlaying, 
  onPlay, 
  onPause,
  onNavigateHome,
  user,
  onLoginClick,
  onRefresh,
  onAddToQueue
}) => {
  const isGuest = user?.id === 'guest';

  // 1. Not Logged In State
  if (!user) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center px-6 pb-32">
        <div className="w-24 h-24 bg-zinc-900/50 rounded-full flex items-center justify-center mb-8 border border-zinc-800">
          <Cloud className="w-10 h-10 text-zinc-600" />
        </div>
        <h2 className="text-3xl font-heading text-white mb-4">Cloud Library Locked</h2>
        <p className="text-zinc-500 max-w-md mb-8 leading-relaxed">
          Sign in to access your uploaded tracks across all your devices.<br/>
          Secure, private, and always available.
        </p>
        <Button onClick={onLoginClick}>
          Connect Account
        </Button>
      </div>
    );
  }

  // 2. Logged In but Empty Library
  if (songs.length === 0) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center px-6 pb-32">
        <div className="w-24 h-24 bg-zinc-900/50 rounded-full flex items-center justify-center mb-8 border border-zinc-800 animate-pulse">
          <Music className="w-10 h-10 text-zinc-600" />
        </div>
        <h2 className="text-3xl font-heading text-white mb-4">{isGuest ? 'Session Empty' : 'Library Empty'}</h2>
        <p className="text-zinc-500 max-w-md mb-8 leading-relaxed">
          {isGuest 
            ? "You are in Guest Mode. Upload tracks to play them instantly." 
            : "Your cloud collection is waiting. Head back home to upload your first high-fidelity track."}
        </p>
        <div className="flex gap-4">
          <button 
            onClick={onNavigateHome}
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors font-medium text-sm"
          >
            Go to Upload
          </button>
          {!isGuest && onRefresh && (
            <button 
              onClick={onRefresh}
              className="px-4 py-3 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors"
              title="Refresh Library"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. Authenticated Library View
  return (
    <div className="min-h-screen pt-32 pb-48 px-6 max-w-6xl mx-auto animate-[fadeIn_0.5s_ease-out]">
       <div className="flex items-end justify-between mb-12 border-b border-zinc-800 pb-6">
         <div>
            <h2 className="text-4xl font-heading text-white mb-2">{isGuest ? 'Guest Session' : 'My Collection'}</h2>
            <div className="flex items-center gap-4">
               {isGuest ? (
                 <p className="text-amber-500/80 text-sm flex items-center gap-2">
                   <CloudOff className="w-3 h-3" />
                   Offline Mode - Tracks vanish on refresh
                 </p>
               ) : (
                 <p className="text-zinc-500 text-sm flex items-center gap-2">
                   <Cloud className="w-3 h-3" />
                   Synced to {user.email}
                 </p>
               )}
               {!isGuest && onRefresh && (
                  <button 
                    onClick={onRefresh} 
                    className="text-zinc-600 hover:text-sky-500 transition-colors"
                    title="Force Refresh"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
               )}
            </div>
         </div>
         <div className="text-right">
            <div className="text-3xl font-light text-sky-500">{songs.length}</div>
            <div className="text-xs text-zinc-600 uppercase tracking-widest">Tracks</div>
         </div>
       </div>
       
       <div className="grid grid-cols-1 gap-1">
         <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-zinc-600 uppercase tracking-wider border-b border-zinc-900 mb-2">
            <div className="col-span-1">#</div>
            <div className="col-span-6 md:col-span-5">Title</div>
            <div className="col-span-0 md:col-span-4 hidden md:block">Artist</div>
            <div className="col-span-5 md:col-span-2 text-right">Action</div>
         </div>

         {songs.map((song, index) => {
           const isCurrent = currentSong?.id === song.id;
           
           return (
             <div 
                key={song.id} 
                className={`group grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  isCurrent ? 'bg-zinc-900/80 border border-zinc-800' : 'hover:bg-zinc-900/30 border border-transparent hover:border-zinc-800/50'
                }`}
             >
                {/* Index / Playing Indicator */}
                <div className="col-span-1 text-zinc-600 font-mono text-sm relative">
                   <span className={`transition-opacity ${isCurrent ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'}`}>{index + 1}</span>
                   <div className={`absolute inset-0 flex items-center ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      {isCurrent && isPlaying ? (
                          <div className="flex gap-0.5 items-end h-3">
                             <div className="w-0.5 h-full bg-sky-500 animate-[pulse_0.5s_ease-in-out_infinite]"></div>
                             <div className="w-0.5 h-2 bg-sky-500 animate-[pulse_0.6s_ease-in-out_infinite]"></div>
                             <div className="w-0.5 h-3 bg-sky-500 animate-[pulse_0.7s_ease-in-out_infinite]"></div>
                          </div>
                      ) : (
                          <Play className="w-3 h-3 text-zinc-400 fill-zinc-400" />
                      )}
                   </div>
                </div>

                {/* Title + Cover */}
                <div className="col-span-6 md:col-span-5 flex items-center gap-4 overflow-hidden">
                   <div className="relative w-10 h-10 flex-shrink-0 bg-zinc-900 rounded overflow-hidden border border-zinc-800">
                      {song.coverUrl ? (
                        <img src={song.coverUrl} className="w-full h-full object-cover" alt="Art" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-zinc-700">
                          <Disc className="w-5 h-5" />
                        </div>
                      )}
                   </div>
                   
                   <div className="min-w-0 flex-1">
                      <h3 className={`font-medium truncate text-sm ${isCurrent ? 'text-sky-400' : 'text-zinc-300 group-hover:text-white'}`}>{song.name}</h3>
                      <div className="md:hidden text-xs text-zinc-500 truncate mt-0.5">{song.artist || 'Unknown'}</div>
                   </div>
                </div>

                {/* Artist (Desktop) */}
                <div className="col-span-0 md:col-span-4 hidden md:block text-sm text-zinc-500 truncate">
                   {song.artist || <span className="text-zinc-700">-</span>}
                </div>

                {/* Actions */}
                <div className="col-span-5 md:col-span-2 flex items-center justify-end gap-2">
                   {onAddToQueue && (
                      <button 
                         onClick={(e) => { e.stopPropagation(); onAddToQueue(song); }}
                         className="p-2 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
                         title="Add to Queue"
                      >
                         <ListPlus className="w-4 h-4" />
                      </button>
                   )}
                   <button 
                      onClick={() => isCurrent && isPlaying ? onPause() : onPlay(song)}
                      className={`p-2 rounded-full transition-all ${
                         isCurrent 
                            ? 'bg-sky-500/10 text-sky-500 hover:bg-sky-500/20' 
                            : 'bg-zinc-800 text-zinc-400 opacity-0 group-hover:opacity-100 hover:bg-zinc-700 hover:text-white'
                      }`}
                   >
                      {isCurrent && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                   </button>
                </div>
             </div>
           );
         })}
       </div>
    </div>
  );
};