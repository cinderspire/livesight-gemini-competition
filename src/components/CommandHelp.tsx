import React, { useCallback, memo } from 'react';
import type { CommandHelpProps } from '../types';

// Voice commands list
const COMMANDS = [
  { cmd: 'System Report', desc: 'Status summary & logs' },
  { cmd: 'Open/Close Settings', desc: 'Toggle config menu' },
  { cmd: 'Show/Hide Logs', desc: 'Toggle hazard feed' },
  { cmd: 'Silence / Mute', desc: 'Disable audio output' },
  { cmd: 'Speak / Unmute', desc: 'Enable audio output' },
  { cmd: 'Proactive Mode', desc: 'Enable predictive warnings' },
  { cmd: 'Passive Mode', desc: 'Wait for user queries' },
  { cmd: 'System Help', desc: 'Show this list' },
] as const;

/**
 * Command Help Modal Component
 * Displays available voice commands
 */
const CommandHelp: React.FC<CommandHelpProps> = memo(({ isOpen, onClose }) => {
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal Content */}
      <div className="relative bg-black/90 border border-cyan-500/50 w-full max-w-sm rounded-2xl shadow-[0_0_40px_rgba(8,145,178,0.2)] overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-cyan-950/20">
          <h3
            id="help-title"
            className="text-cyan-400 font-mono font-bold tracking-widest flex items-center gap-2"
          >
            <span className="text-xl" aria-hidden="true">⌘</span>
            VOICE PROTOCOLS
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition"
            aria-label="Close help"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        {/* Commands Table */}
        <div className="p-2 overflow-y-auto max-h-[60vh]">
          <table className="w-full text-left border-collapse" role="table">
            <caption className="sr-only">Available voice commands</caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">Command</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              {COMMANDS.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-800/50 last:border-0 hover:bg-white/5 transition"
                >
                  <td className="p-3 text-cyan-300 font-bold text-xs font-mono border-r border-gray-800/50 w-1/2">
                    "{item.cmd}"
                  </td>
                  <td className="p-3 text-gray-400 text-[10px] uppercase tracking-wide">
                    {item.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-cyan-900/10 text-center border-t border-gray-800">
          <p className="text-[10px] text-cyan-600 font-mono">
            LIVESIGHT.OS // AUDIO LISTENER ACTIVE
          </p>
        </div>
      </div>
    </div>
  );
});

CommandHelp.displayName = 'CommandHelp';

export default CommandHelp;
