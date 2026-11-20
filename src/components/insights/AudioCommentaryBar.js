"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Radio,
  ExternalLink,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// Live commentary & official match audio feeds
// BBC Radio 5 Live / official audio broadcast stream endpoints
const AUDIO_STREAMS = [
  {
    id: "bbc-5live",
    title: "BBC Radio 5 Live",
    subtitle: "Premier League Live Matchday Commentary",
    src: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_five_live",
    isLive: true,
  },
  {
    id: "talksport",
    title: "talkSPORT UK",
    subtitle: "National Football Broadcast & Punditry",
    src: "https://talksport.stream.bytheway.ie/talksport128.mp3",
    isLive: true,
  },
];

export default function AudioCommentaryBar() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedStreamIndex, setSelectedStreamIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef(null);

  const currentStream = AUDIO_STREAMS[selectedStreamIndex];

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setHasError(false);
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Audio play prevented or blocked by browser:", err);
          setHasError(true);
          setIsPlaying(false);
        });
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-xl transition-all duration-300">
      <audio
        ref={audioRef}
        src={currentStream.src}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
      />

      <div className="apple-tile rounded-2xl border border-white/[0.12] bg-[#0F141C]/90 backdrop-blur-md p-3 shadow-2xl text-white">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Stream Info & Live Indicator */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={togglePlay}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer shadow-md ${
                isPlaying
                  ? "bg-white text-black"
                  : "bg-[#FF2636] text-white hover:bg-[#FF3848]"
              }`}
              aria-label={isPlaying ? "Pause audio" : "Play live commentary"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white truncate">
                  {currentStream.title}
                </span>
                <span className="flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-[#FF2636]/20 text-[#FF4D5A] border border-[#FF2636]/30 shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full bg-[#FF2636] ${isPlaying ? "animate-ping" : ""}`} />
                  Live Audio
                </span>
              </div>
              <p className="text-[10px] text-white/60 truncate mt-0.5">
                {hasError
                  ? "Stream temporarily restricted by broadcaster"
                  : currentStream.subtitle}
              </p>
            </div>
          </div>

          {/* Right: Controls & Stream Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
              aria-label="Toggle stream channels"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded Channel Switcher Drawer */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-white/[0.08] space-y-1.5 animate-fadeIn">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E8E93] block px-1 mb-1">
              Select Matchday Broadcast Channel
            </span>
            {AUDIO_STREAMS.map((stream, idx) => (
              <button
                key={stream.id}
                type="button"
                onClick={() => {
                  setSelectedStreamIndex(idx);
                  setIsPlaying(false);
                  setIsExpanded(false);
                  if (audioRef.current) {
                    audioRef.current.pause();
                  }
                }}
                className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition cursor-pointer ${
                  selectedStreamIndex === idx
                    ? "bg-white/10 border border-white/15 text-white"
                    : "hover:bg-white/5 text-white/70 hover:text-white"
                }`}
              >
                <div>
                  <span className="text-xs font-semibold block">{stream.title}</span>
                  <span className="text-[10px] text-white/50">{stream.subtitle}</span>
                </div>
                {selectedStreamIndex === idx && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    Active
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
