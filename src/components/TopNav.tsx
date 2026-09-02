import React from 'react';
import { ScreenType, TransitionDirection } from '../types';

interface TopNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType, transition: TransitionDirection) => void;
  activeNodesCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({ currentScreen, onNavigate, activeNodesCount }) => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#131314]/80 backdrop-blur-md border-b border-cyan-400/10 select-none">
      <div className="flex justify-between items-center w-full px-6 md:px-12 py-3.5 max-w-[1440px] mx-auto h-16">
        {/* Brand Div - Required xpath: //div[contains(text(), 'QUANTUM_OBSERVER')] */}
        <div
          id="brand-quantum-observer"
          onClick={() => {
            if (currentScreen === 'lab') {
              onNavigate('experiment', 'none');
            }
          }}
          className="font-label-mono text-xs md:text-sm font-bold tracking-widest text-[#dbfcff] cursor-pointer hover:text-cyan-300 transition-colors flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
          QUANTUM_OBSERVER
          {activeNodesCount > 1 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 hidden sm:inline-block">
              {activeNodesCount} NODES CONNECTED
            </span>
          )}
        </div>

        {/* Center Nav Links - Required xpaths */}
        <div className="flex items-center space-x-6 md:space-x-8">
          {/* EXPERIMENT link */}
          <a
            id="nav-link-experiment"
            href="#experiment"
            onClick={(e) => {
              e.preventDefault();
              if (currentScreen !== 'experiment') {
                onNavigate('experiment', 'push_back');
              }
            }}
            className={`font-label-mono text-xs tracking-wider transition-all duration-200 pb-1 ${
              currentScreen === 'experiment'
                ? 'text-[#dbfcff] border-b-2 border-cyan-400 shadow-[0_2px_10px_rgba(0,240,255,0.4)]'
                : 'text-[#b9cacb] hover:text-[#dbfcff]'
            }`}
          >
            EXPERIMENT
          </a>

          {/* ARCHIVE link */}
          <a
            id="nav-link-archive"
            href="#archive"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('lab', 'push');
            }}
            className={`font-label-mono text-xs tracking-wider transition-all duration-200 pb-1 ${
              currentScreen === 'lab'
                ? 'text-[#dbfcff] border-b-2 border-cyan-400 shadow-[0_2px_10px_rgba(0,240,255,0.4)]'
                : 'text-[#b9cacb] hover:text-[#dbfcff] hover:bg-cyan-400/10 px-1 py-0.5 rounded'
            }`}
          >
            ARCHIVE
          </a>

          {/* ABOUT link */}
          <a
            id="nav-link-about"
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('lab', 'push');
            }}
            className="font-label-mono text-xs tracking-wider text-[#b9cacb] hover:text-[#dbfcff] hover:bg-cyan-400/10 px-1 py-0.5 rounded transition-all duration-200 pb-1"
          >
            ABOUT
          </a>
        </div>

        {/* Right Icon Actions - Required xpaths */}
        <div className="flex items-center space-x-3">
          {/* settings_input_component icon - triggers slide_up */}
          <button
            id="nav-btn-settings"
            onClick={() => onNavigate('lab', 'slide_up')}
            title="Open Physics Tuning Lab (slide_up)"
            className="p-2 rounded hover:bg-cyan-400/10 transition-colors flex items-center justify-center text-[#b9cacb] hover:text-[#dbfcff]"
          >
            <span
              className="material-symbols-outlined text-[20px] cursor-pointer"
              data-icon="settings_input_component"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('lab', 'slide_up');
              }}
            >
              settings_input_component
            </span>
          </button>

          {/* terminal icon - triggers none transition */}
          <button
            id="nav-btn-terminal"
            onClick={() => onNavigate('lab', 'none')}
            title="Open Telemetry Terminal (instant)"
            className="p-2 rounded hover:bg-cyan-400/10 transition-colors flex items-center justify-center text-[#b9cacb] hover:text-[#dbfcff]"
          >
            <span
              className="material-symbols-outlined text-[20px] cursor-pointer"
              data-icon="terminal"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('lab', 'none');
              }}
            >
              terminal
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};
