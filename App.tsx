import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { InfoSection } from './components/InfoSection';
import { WhyLocal } from './components/WhyLocal';
import { Footer } from './components/Footer';
import { Player } from './components/Player';
import { FullPlayer } from './components/FullPlayer';
import { LoginModal } from './components/LoginModal';
import { Library } from './components/Library';
import { Docs } from './components/Docs';
import { Song, User } from './types';
import { extractMetadata } from './services/metadataService';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { uploadTrack, fetchUserTracks } from './services/storageService';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

// Toast Component
const Toast: React.FC<{ message: string; type: 'error' | 'success' | 'info'; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    error: 'bg-red-900/90 border-red-700',
    success: 'bg-green-900/90 border-green-700',
    info: 'bg-sky-900/90 border-sky-700'
  };

  return (
    <div className={`fixed top-24 right-6 z-[100] flex items-start gap-3 px-4 py-3 rounded-lg border shadow-xl backdrop-blur-md max-w-sm animate-[slideIn_0.3s_ease-out] ${bgColors[type]}`}>
      {type === 'error' ? <AlertCircle className="w-5 h-5 text-white/80 mt-0.5" /> : <CheckCircle className="w-5 h-5 text-white/80 mt-0.5" />}
      <div className="flex-1">
        <p className="text-sm text-white font-medium leading-snug">{message}</p>
      </div>
      <button onClick={onClose} className="text-white/60 hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);
  
  // Navigation State
  const [view, setView] = useState<'home' | 'library'>('home');
  
  // Audio State
  const [library, setLibrary] = useState<Song[]>([]);
  const [queue, setQueue] = useState<Song[]>([]); // Manual Priority Queue
  const [history, setHistory] = useState<Song[]>([]); // Playback History
  const [skippedTracks, setSkippedTracks] = useState<Set<string>>(new Set()); // Tracks removed from "Up Next"
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  
  // Shuffle & Repeat State
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [shuffledQueue, setShuffledQueue] = useState<Song[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);

  // Define refreshLibrary using useCallback
  const refreshLibrary = useCallback(async (userId: string) => {
    if (userId === 'guest') return; // Guests don't sync
    if (!isSupabaseConfigured) return; // Skip if no backend

    try {
      console.log("Syncing library for user:", userId);
      const remoteTracks = await fetchUserTracks(userId);
      setLibrary(remoteTracks);
    } catch (e) {
      console.error("Failed to refresh library", e);
    }
  }, []);

  // Initialize Supabase Auth Listener & Fetch Library
  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.log("Supabase not configured (Offline Mode). Auth disabled.");
      return;
    }

    // Helper to sync user and library
    const syncUserSession = async (sessionUser: any) => {
      if (sessionUser) {
        const currentUser = {
          id: sessionUser.id,
          username: sessionUser.email?.split('@')[0] || 'User',
          email: sessionUser.email || ''
        };
        setUser(currentUser);
        // Fetch immediately on login/restore
        refreshLibrary(currentUser.id);
      } else {
        // Only clear if we aren't already in guest mode
        setUser(prev => prev?.id === 'guest' ? prev : null);
        if (user?.id !== 'guest') {
           setLibrary([]); 
           setCurrentSong(null);
           setIsPlaying(false);
           setQueue([]);
           setHistory([]);
           setSkippedTracks(new Set());
           setIsShuffled(false);
           setShuffledQueue([]);
        }
      }
    };

    // 1. Check initial session
    supabase.auth.getSession()
      .then(({ data }) => {
        syncUserSession(data?.session?.user);
      })
      .catch(err => {
        console.warn("Supabase auth check failed (offline mode):", err);
      });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUserSession(session?.user);
    });

    return () => subscription.unsubscribe();
  }, [refreshLibrary]);

  // Fetch library when entering library view
  useEffect(() => {
    if (view === 'library' && user && user.id !== 'guest') {
      refreshLibrary(user.id);
    }
  }, [view, user, refreshLibrary]);

  const handleLogout = async () => {
    if (user?.id === 'guest') {
      setUser(null);
      setLibrary([]);
      setQueue([]);
      setHistory([]);
      setSkippedTracks(new Set());
      setShuffledQueue([]);
      setIsShuffled(false);
      setCurrentSong(null);
      setIsPlaying(false);
      setView('home');
      return;
    }
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Error signing out:', error.message);
    } else {
      setUser(null);
    }
  };

  const handleGuestLogin = () => {
    setUser({ id: 'guest', username: 'Guest', email: '' });
    setIsLoginOpen(false);
    showNotification("Entered Guest Mode. Tracks will not be saved to cloud.", 'info');
  };

  const showNotification = (message: string, type: 'error' | 'success' | 'info') => {
    setNotification({ message, type });
  };

  // --- Audio Logic ---

  const handleUpload = async (file: File) => {
    if (!user) {
      showNotification("Please sign in or continue as guest to upload music.", 'info');
      setIsLoginOpen(true);
      return;
    }

    setIsUploading(true);
    let title = file.name.replace(/\.[^/.]+$/, "");
    let artist = 'Unknown Artist';
    let coverUrl: string | undefined = undefined;

    // GUEST MODE or NO BACKEND MODE
    if (user.id === 'guest' || !isSupabaseConfigured) {
        try {
          const metadata = await extractMetadata(file);
          title = metadata.title || title;
          artist = metadata.artist || artist;
          coverUrl = metadata.coverUrl;

          const guestSong: Song = {
            id: `guest-${Date.now()}`,
            url: URL.createObjectURL(file),
            name: title,
            artist: artist,
            duration: 0,
            userId: 'guest',
            file: file,
            coverUrl: coverUrl
          };

          setLibrary(prev => [guestSong, ...prev]);
          if (!currentSong) {
             setCurrentSong(guestSong);
             setIsPlaying(true);
          }
          setView('library');
          
          if (!isSupabaseConfigured && user.id !== 'guest') {
             showNotification("Backend not connected. Track added locally.", 'info');
          } else {
             showNotification("Track added to session", 'success');
          }
        } catch (e) {
          showNotification("Failed to load local file", 'error');
        } finally {
          setIsUploading(false);
        }
        return;
    }

    // AUTHENTICATED UPLOAD
    try {
      const metadata = await extractMetadata(file);
      title = metadata.title || title;
      artist = metadata.artist || artist;
      coverUrl = metadata.coverUrl;

      const newSong = await uploadTrack(file, user.id, {
        title,
        artist,
        duration: 0 
      });

      newSong.coverUrl = coverUrl;

      setLibrary(prev => [newSong, ...prev]);
      if (!currentSong) {
         setCurrentSong(newSong);
         setIsPlaying(true);
      }
      setView('library');
      showNotification("Track uploaded & synced successfully", 'success');

    } catch (error: any) {
      console.error("Upload/Sync failed:", error);
      const msg = error.message || "Unknown error";

      const localUrl = URL.createObjectURL(file);
      const tempSong: Song = {
        id: `local-${Date.now()}`,
        url: localUrl,
        name: title,
        artist: artist,
        duration: 0,
        userId: user.id,
        file: file,
        coverUrl: coverUrl
      };

      setLibrary(prev => [tempSong, ...prev]);
      if (!currentSong) {
          setCurrentSong(tempSong);
          setIsPlaying(true);
      }
      setView('library');

      showNotification(`Playing locally. Cloud error: ${msg}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  // Toggle Repeat
  const toggleRepeat = () => setIsRepeat(prev => !prev);

  // Toggle Shuffle
  const toggleShuffle = () => {
    if (isShuffled) {
      setIsShuffled(false);
      setShuffledQueue([]);
    } else {
      // Create shuffled version of the CURRENT playback context (Queue + Remaining Library)
      const manualQueue = [...queue];
      let autoQueue: Song[] = [];
      
      // Calculate remaining library tracks
      if (currentSong && library.length > 0) {
        const idx = library.findIndex(s => s.id === currentSong.id);
        if (idx !== -1 && idx < library.length - 1) {
          autoQueue = library.slice(idx + 1);
        }
      }
      
      // Combine and filter skipped
      const tracksToShuffle = [...manualQueue, ...autoQueue.filter(s => !skippedTracks.has(s.id))];
      
      // Fisher-Yates Shuffle
      for (let i = tracksToShuffle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tracksToShuffle[i], tracksToShuffle[j]] = [tracksToShuffle[j], tracksToShuffle[i]];
      }
      
      setShuffledQueue(tracksToShuffle);
      setIsShuffled(true);
    }
  };

  const playNext = useCallback(() => {
    if (!currentSong && library.length === 0) return;

    // 1. Save current song to history before moving
    if (currentSong) {
      setHistory(prev => [...prev, currentSong]);
    }

    // 2. SHUFFLE MODE LOGIC
    if (isShuffled) {
      if (shuffledQueue.length > 0) {
        const nextSong = shuffledQueue[0];
        setShuffledQueue(prev => prev.slice(1));
        setCurrentSong(nextSong);
        setIsPlaying(true);
        
        // IMPORTANT: Sync with manual queue. If we play a song that was in the manual queue, remove it.
        // This prevents it from playing again if shuffle is turned off.
        setQueue(prev => prev.filter(s => s.id !== nextSong.id));
      } else {
        setIsPlaying(false);
      }
      return;
    }

    // 3. STANDARD MODE LOGIC
    
    // Check Priority Queue (Manual Additions)
    if (queue.length > 0) {
      const nextSong = queue[0];
      setQueue(prev => prev.slice(1)); // Remove first item
      setCurrentSong(nextSong);
      setIsPlaying(true);
      return;
    }

    // Fallback to Library Order
    if (library.length === 0) {
        setIsPlaying(false);
        return;
    }
    
    let currentIndex = -1;
    if (currentSong) {
        currentIndex = library.findIndex(s => s.id === currentSong.id);
    }
    
    // Find next unskipped track
    let nextIndex = currentIndex + 1;
    while (nextIndex < library.length && skippedTracks.has(library[nextIndex].id)) {
        nextIndex++;
    }
    
    if (nextIndex < library.length) {
       setCurrentSong(library[nextIndex]);
       setIsPlaying(true);
    } else {
       setIsPlaying(false);
    }
  }, [currentSong, queue, library, skippedTracks, isShuffled, shuffledQueue]);

  // Handler for Audio Ended Event
  const handleSongEnd = () => {
    if (isRepeat && audioRef.current) {
        // Repeat the current song
        audioRef.current.currentTime = 0;
        audioRef.current.play();
    } else {
        playNext();
    }
  };

  const playPrevious = useCallback(() => {
    if (!currentSong) return;
    
    // 1. Restart if > 3 seconds in
    if (currentTime > 3) {
       if (audioRef.current) audioRef.current.currentTime = 0;
       return;
    }

    // 2. Check History
    if (history.length > 0) {
       const prevSong = history[history.length - 1];
       setHistory(prev => prev.slice(0, -1)); // Pop
       setCurrentSong(prevSong);
       setIsPlaying(true);
       return;
    }

    // 3. Fallback to Library Logic (if history empty)
    if (library.length > 0) {
       const currentIndex = library.findIndex(s => s.id === currentSong.id);
       if (currentIndex > 0) {
          setCurrentSong(library[currentIndex - 1]);
          setIsPlaying(true);
       } else {
          if (audioRef.current) audioRef.current.currentTime = 0;
       }
    }
  }, [currentSong, currentTime, history, library]);

  const handleAddToQueue = (song: Song) => {
    setQueue(prev => [...prev, song]);
    
    // If we are in shuffle mode, also add to shuffle queue (randomly placed or at end? Let's append to end for simplicity)
    if (isShuffled) {
      setShuffledQueue(prev => [...prev, song]);
    }
    
    showNotification(`Added "${song.name}" to queue`, 'info');
  };

  // Derived state: What is actually playing next?
  const getUpNext = useCallback(() => {
    if (isShuffled) {
      return shuffledQueue;
    }

    // Standard Logic
    const manualQueue = [...queue];
    let autoQueue: Song[] = [];
    if (currentSong && library.length > 0) {
       const idx = library.findIndex(s => s.id === currentSong.id);
       if (idx !== -1 && idx < library.length - 1) {
          autoQueue = library.slice(idx + 1);
       }
    }
    const filteredAutoQueue = autoQueue.filter(s => !skippedTracks.has(s.id));
    return [...manualQueue, ...filteredAutoQueue];
  }, [queue, library, currentSong, skippedTracks, isShuffled, shuffledQueue]);

  const upNext = getUpNext();

  const handleRemoveFromUpNext = (index: number) => {
     if (isShuffled) {
       setShuffledQueue(prev => prev.filter((_, i) => i !== index));
       return;
     }

     // If the index is within the manual queue range
     if (index < queue.length) {
        setQueue(prev => prev.filter((_, i) => i !== index));
     } else {
        // It's a library track. We can't delete it from library, but we can "skip" it.
        const songToSkip = upNext[index];
        if (songToSkip) {
            setSkippedTracks(prev => {
                const newSet = new Set(prev);
                newSet.add(songToSkip.id);
                return newSet;
            });
        }
     }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
        setDuration(audioRef.current.duration);
        audioRef.current.volume = volume;
    }
  };
  
  const handleAudioError = (e: any) => {
    console.error("Audio playback error:", e);
    showNotification("Error playing file. Skipping...", 'error');
    playNext();
  };

  const onSeek = (time: number) => {
    if (audioRef.current) {
       audioRef.current.currentTime = time;
       setCurrentTime(time);
    }
  };

  const onVolumeChange = (vol: number) => {
    setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  };

  const handleNavigate = (page: 'home' | 'library') => {
    setView(page);
    window.scrollTo(0, 0);
  };

  const handlePlayFromLibrary = (song: Song) => {
      if (currentSong) {
         setHistory(prev => [...prev, currentSong]);
      }
      setCurrentSong(song);
      setIsPlaying(true);
      // Reset contextual states
      setSkippedTracks(new Set()); 
      // If we jump track while shuffled, we should probably regenerate shuffle or just clear it?
      // Standard behavior: Shuffle mode usually persists, but queue is effectively "reshuffled" relative to new song?
      // For simplicity and matching "original order" requirement, let's keep shuffle ON but clear the shuffled queue 
      // so it regenerates next time toggleShuffle is called OR if we want it to be smart, we regenerate it now.
      // But the prompt says "return to its original order".
      // Let's just turn off shuffle to avoid confusion when manually selecting a specific track in library
      setIsShuffled(false);
      setShuffledQueue([]);
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.error("Playback start error:", e);
                if (e.name === 'NotAllowedError') {
                    setIsPlaying(false);
                    showNotification("Autoplay blocked. Click play to start.", 'info');
                }
            });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume, currentSong]);

  return (
    <div className="min-h-screen bg-black text-slate-200 selection:bg-sky-500/30 relative">
      <div className="bg-noise"></div>
      
      {notification && (
        <Toast 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      {currentSong && (
        <audio 
          ref={audioRef}
          src={currentSong.url}
          preload="auto"
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onError={handleAudioError}
          onEnded={handleSongEnd} 
        />
      )}

      {isUploading && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
             <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
             <p className="text-white font-medium animate-pulse">
               {user?.id === 'guest' ? 'Processing Local Audio...' : 'Uploading & Syncing...'}
             </p>
          </div>
        </div>
      )}

      <div className="relative z-10">
        <Header 
          user={user} 
          onLoginClick={() => setIsLoginOpen(true)} 
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          currentPage={view}
        />
        
        <main>
          {view === 'home' ? (
             <>
               <Hero 
                 onUpload={handleUpload} 
                 currentSong={currentSong}
                 onPlayClick={() => {
                    if (currentSong) {
                        setIsPlaying(true);
                        setIsFullPlayerOpen(true);
                    }
                 }}
                 onViewLibrary={() => handleNavigate('library')}
               />
               <WhyLocal />
               <InfoSection />
               <Docs />
             </>
          ) : (
             <Library 
                songs={library}
                currentSong={currentSong}
                isPlaying={isPlaying}
                onPlay={handlePlayFromLibrary}
                onPause={() => setIsPlaying(false)}
                onNavigateHome={() => handleNavigate('home')}
                user={user}
                onLoginClick={() => setIsLoginOpen(true)}
                onRefresh={() => user && refreshLibrary(user.id)}
                onAddToQueue={handleAddToQueue}
             />
          )}
        </main>
        
        {view === 'home' && <Footer />}
      </div>

      {currentSong && !isFullPlayerOpen && (
        <Player 
          song={currentSong} 
          isPlaying={isPlaying} 
          onTogglePlay={togglePlay} 
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
          onExpand={() => setIsFullPlayerOpen(true)}
          onNext={playNext}
          onPrev={playPrevious}
        />
      )}

      {currentSong && isFullPlayerOpen && (
        <FullPlayer
          song={currentSong}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
          volume={volume}
          onVolumeChange={onVolumeChange}
          onClose={() => setIsFullPlayerOpen(false)}
          onNext={playNext}
          onPrev={playPrevious}
          queue={upNext}
          onRemoveFromQueue={handleRemoveFromUpNext}
          isShuffled={isShuffled}
          toggleShuffle={toggleShuffle}
          isRepeat={isRepeat}
          toggleRepeat={toggleRepeat}
        />
      )}

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onGuestLogin={handleGuestLogin}
      />
      
      {currentSong && !isFullPlayerOpen && <div className="h-24" />}
    </div>
  );
};

export default App;