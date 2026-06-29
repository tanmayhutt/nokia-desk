import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Code, Camera, Mail, Phone, Briefcase, MapPin } from 'lucide-react';

export default function ModernOverlay({ overlay, onClose }) {
  const { type, data } = overlay;
  const [githubData, setGithubData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (type === 'github') {
      setLoading(true);
      fetch('https://api.github.com/users/tanmayhutt')
        .then(res => res.json())
        .then(data => {
          setGithubData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [type]);

  const renderContent = () => {
    if (type === 'github') {
      return (
        <div className="flex flex-col items-center p-6 text-white h-full overflow-y-auto pt-16">
          {loading ? (
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-24 h-24 bg-white/20 rounded-full mb-4"></div>
              <div className="w-32 h-6 bg-white/20 rounded mb-2"></div>
              <div className="w-48 h-4 bg-white/20 rounded"></div>
            </div>
          ) : githubData ? (
            <div className="flex flex-col items-center w-full max-w-md">
              <img src={githubData.avatar_url} alt="GitHub Avatar" className="w-32 h-32 rounded-full border-4 border-white/30 shadow-xl mb-4" />
              <h2 className="text-3xl font-bold mb-1">{githubData.name || 'Tanmay'}</h2>
              <a href={githubData.html_url} target="_blank" rel="noreferrer" className="text-white/60 hover:text-white mb-6 flex items-center gap-1 transition-colors">
                @{githubData.login} <ExternalLink size={14} />
              </a>
              
              <div className="text-center text-white/90 mb-8 leading-relaxed max-w-sm">
                {githubData.bio || 'Full-stack developer blending retro hardware vibes with modern web technologies.'}
              </div>

              <div className="flex gap-4 w-full justify-center mb-8">
                <div className="bg-white/10 p-4 rounded-2xl flex-1 text-center backdrop-blur-md border border-white/10 shadow-lg">
                  <div className="text-2xl font-black">{githubData.public_repos}</div>
                  <div className="text-xs text-white/50 uppercase tracking-wider font-semibold">Repos</div>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl flex-1 text-center backdrop-blur-md border border-white/10 shadow-lg">
                  <div className="text-2xl font-black">{githubData.followers}</div>
                  <div className="text-xs text-white/50 uppercase tracking-wider font-semibold">Followers</div>
                </div>
              </div>

              {githubData.location && (
                <div className="flex items-center gap-2 text-white/60 mb-8 bg-white/5 px-4 py-2 rounded-full">
                  <MapPin size={16} /> {githubData.location}
                </div>
              )}

              <a 
                href={githubData.html_url} 
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <Code size={20} /> View Profile
              </a>
            </div>
          ) : (
            <div className="text-white/50 mt-10">Failed to load GitHub data.</div>
          )}
        </div>
      );
    }

    if (type === 'instagram') {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-white h-full text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-1 mb-6 shadow-2xl shadow-purple-500/30">
            <div className="w-full h-full bg-black/40 rounded-3xl backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Camera size={40} className="text-white drop-shadow-md" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2">Instagram</h2>
          <p className="text-white/60 mb-8 max-w-xs">Check out my latest photos and updates on Instagram.</p>
          <a 
            href={data?.url || 'https://www.instagram.com/tanmayhutt/'} 
            target="_blank" 
            rel="noreferrer"
            className="w-full max-w-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:scale-[1.02] active:scale-[0.98]"
          >
            Open App <ExternalLink size={18} />
          </a>
        </div>
      );
    }

    if (type === 'project') {
      return (
        <div className="flex flex-col p-8 text-white h-full max-w-lg mx-auto justify-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/20 shadow-lg shadow-white/5">
            <Briefcase size={32} className="text-white/80" />
          </div>
          <h2 className="text-4xl font-bold mb-4 tracking-tight leading-none">{data.name}</h2>
          <p className="text-lg text-white/70 mb-8 leading-relaxed">
            {data.description || 'An awesome project showcasing my skills in modern web development and design.'}
          </p>
          
          <div className="space-y-4">
            <a 
              href={data.url} 
              target="_blank" 
              rel="noreferrer"
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-white/20 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              Launch Project <ExternalLink size={18} />
            </a>
          </div>
        </div>
      );
    }

    if (type === 'contact') {
      return (
        <div className="flex flex-col p-8 text-white h-full max-w-lg mx-auto justify-center text-center items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 p-1 mb-6 shadow-2xl shadow-blue-500/30">
            <div className="w-full h-full bg-black/40 rounded-full backdrop-blur-sm flex items-center justify-center border border-white/20">
              {data.label.toLowerCase().includes('mail') ? <Mail size={40} /> : <Phone size={40} />}
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2">{data.label}</h2>
          <p className="text-white/60 mb-10 max-w-xs">{data.url.replace(/(mailto:|tel:)/, '')}</p>
          
          <a 
            href={data.url} 
            className="w-full bg-blue-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-400 transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-[0.98]"
          >
            {data.label.toLowerCase().includes('mail') ? 'Send Email' : 'Make Call'}
          </a>
        </div>
      );
    }

    return null;
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-8 pointer-events-auto"
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-xl"
          onClick={onClose}
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl h-[600px] bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden flex flex-col"
        >
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md border border-white/10 transition-colors shadow-lg cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="relative z-0 flex-1 w-full h-full">
            {renderContent()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
