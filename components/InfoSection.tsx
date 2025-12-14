import React from 'react';
import { Zap, Maximize2 } from 'lucide-react';

export const InfoSection: React.FC = () => {
  return (
    <section id="features" className="py-32 bg-black relative">
      {/* Subtle Grid Background - Fades out quickly with mask */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20 pointer-events-none [mask-image:linear-gradient(to_bottom,black_10%,transparent_80%)]"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header - Left Aligned, austere */}
        <div className="mb-20 max-w-2xl">
           <h2 className="text-4xl md:text-5xl font-heading text-white mb-6 leading-tight">
             System <br/><span className="text-zinc-600">Architecture</span>
           </h2>
           <div className="h-1 w-12 bg-sky-600 mb-6 shadow-[0_0_10px_rgba(14,165,233,0.3)]"></div>
           <p className="text-zinc-400 text-lg font-light tracking-wide">
             Engineered for raw performance. <br className="hidden md:block"/>
             Capable of both offline isolation and secure cloud synchronization.
           </p>
        </div>

        {/* The "Anti-Grid" Layout - Matte/Dark styling */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min">
          
          {/* 1. Zero Latency - Matte black, strong borders, no background fill */}
          <div className="md:col-span-7 border-l border-t border-zinc-800 p-8 md:p-12 min-h-[300px] flex flex-col justify-between bg-transparent hover:border-zinc-700 transition-colors duration-500">
             <div>
               <Zap className="w-8 h-8 text-sky-600 mb-6" strokeWidth={1.5} />
               <h3 className="text-3xl text-white font-light mb-4">Zero-Latency Playback</h3>
             </div>
             <p className="text-zinc-500 text-lg leading-relaxed max-w-md">
                Whether loading a local blob or streaming a synced track, our optimized buffering engine ensures instant response times.
             </p>
          </div>

          {/* 2. Hybrid Mode - Deep black, minimal effect */}
          <div className="md:col-span-5 bg-black border border-zinc-800 p-6 flex flex-col justify-center items-start relative overflow-hidden group">
             {/* Very subtle noise on hover only */}
             <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] transition-opacity duration-700"></div>
             
             <div className="relative z-10">
               <span className="text-sky-600 font-mono text-xs uppercase tracking-[0.2em] mb-4 block">
                 Storage Protocol
               </span>
               <h3 className="text-xl text-white font-medium mb-3">Hybrid Storage Model</h3>
               <p className="text-zinc-600 text-sm font-mono leading-relaxed">
                 GUEST: RAM-ONLY SANDBOX.<br/>
                 USER: SECURE CLOUD BUCKETS.<br/>
                 YOU DECIDE.
               </p>
               <p className="mt-4 text-zinc-700 text-xs">
                 Seamlessly switch between ephemeral local sessions and persistent cloud libraries.
               </p>
             </div>
          </div>

          {/* 3. Responsive - Transparent, sharp borders */}
          <div className="md:col-span-4 border-r border-b border-zinc-800 p-8 flex flex-col justify-end min-h-[280px] hover:border-zinc-700 transition-colors">
             <Maximize2 className="w-6 h-6 text-zinc-600 mb-auto" />
             <h3 className="text-white text-lg font-medium mb-2">Adaptive Viewport</h3>
             <p className="text-zinc-500 text-sm">
               The interface scales mathematically to any density, providing a consistent experience on desktop or mobile.
             </p>
          </div>

          {/* 4. Audio Specs - Solid black, horizontal, no gradient */}
          <div className="md:col-span-8 border-y border-zinc-800 p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-black">
             <div className="max-w-md">
               <h3 className="text-2xl text-white font-light mb-2">Lossless Audio Engine</h3>
               <p className="text-zinc-500">
                 Native decoding of high-resolution formats with floating point mixing.
               </p>
             </div>
             
             {/* Technical specs visual list */}
             <div className="flex flex-col gap-2 font-mono text-xs text-sky-900 text-right uppercase tracking-widest select-none">
                <span className="text-sky-900/60">44.1kHz / 96kHz</span>
                <span className="text-sky-900/60">16-bit / 24-bit</span>
                <span className="text-sky-900/60">Stereo / Mono</span>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};