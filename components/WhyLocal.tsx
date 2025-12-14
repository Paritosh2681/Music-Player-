import React from 'react';
import { Shield, Cloud, HardDrive } from 'lucide-react';

export const WhyLocal: React.FC = () => {
  return (
    <section id="why-local" className="py-24 bg-black relative border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-heading text-white mb-6">
              The Best of <br />
              <span className="text-sky-500">Both Worlds</span>
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
              SonicStream bridges the gap between the privacy of local file playback and the convenience of modern cloud streaming. You choose how you listen.
            </p>
            
            <div className="space-y-8">
              <div className="flex gap-4 group">
                <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-800 group-hover:border-sky-500/50 transition-colors">
                  <Shield className="w-6 h-6 text-zinc-400 group-hover:text-sky-500 transition-colors" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Guest Mode: Total Privacy</h3>
                  <p className="text-zinc-500 text-sm">Stay offline. In Guest Mode, files never leave your device. They play directly from browser memory with zero tracking.</p>
                </div>
              </div>

              <div className="flex gap-4 group">
                <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-800 group-hover:border-sky-500/50 transition-colors">
                  <Cloud className="w-6 h-6 text-zinc-400 group-hover:text-sky-500 transition-colors" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Cloud Sync: Universal Access</h3>
                  <p className="text-zinc-500 text-sm">Sign in to sync your library. Your high-fidelity tracks are securely uploaded and streamable to any device you own.</p>
                </div>
              </div>

              <div className="flex gap-4 group">
                <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-800 group-hover:border-sky-500/50 transition-colors">
                  <HardDrive className="w-6 h-6 text-zinc-400 group-hover:text-sky-500 transition-colors" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Uncompromised Audio</h3>
                  <p className="text-zinc-500 text-sm">Whether playing locally or from the cloud, we prioritize the original file integrity. No aggressive compression algorithms.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-12 md:mt-0">
            {/* Abstract visual representation of quality comparison */}
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 to-purple-500/10 blur-3xl rounded-full"></div>
            <div className="relative bg-zinc-950/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
               <div className="space-y-4 font-mono text-sm">
                  <div className="flex justify-between text-zinc-600 border-b border-zinc-800 pb-2 text-xs tracking-widest uppercase">
                    <span>Feature</span>
                    <span>Streaming Services</span>
                    <span className="text-sky-500">SonicStream</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                    <span className="text-zinc-400">Source</span>
                    <span className="text-zinc-600">Rented Catalog</span>
                    <span className="text-sky-400">Your Files</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                    <span className="text-zinc-400">Format</span>
                    <span className="text-zinc-600">Ogg / AAC</span>
                    <span className="text-sky-400">FLAC / MP3 / WAV</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                    <span className="text-zinc-400">Data Model</span>
                    <span className="text-zinc-600">Ad-Targeting</span>
                    <span className="text-sky-400">Private / Synced</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-zinc-400">Ownership</span>
                    <span className="text-zinc-600">None</span>
                    <span className="text-sky-400">100% Yours</span>
                  </div>
               </div>
               
               <div className="mt-8 pt-6 border-t border-zinc-800">
                  <div className="flex items-end justify-between mb-2">
                     <span className="text-xs text-zinc-500 uppercase tracking-wider">Audio Fidelity</span>
                     <span className="text-xs text-sky-500 font-bold">Max</span>
                  </div>
                  <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-sky-600 to-sky-400 w-full"></div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};