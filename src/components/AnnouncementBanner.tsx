import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X } from 'lucide-react';

export const AnnouncementBanner: React.FC = () => {
  const { announcement, setActiveView } = useApp();
  const [dismissed, setDismissed] = useState(false);

  if (!announcement.active || dismissed) {
    return null;
  }

  return (
    <div className="bg-slate-900 text-slate-100 text-xs py-2 px-4 border-b border-slate-800">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400 shrink-0">
            {announcement.badgeText || 'Notice'}
          </span>
          <span className="text-slate-400 shrink-0" aria-hidden="true">·</span>
          <span className="text-xs text-slate-200 truncate">{announcement.text}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveView('management')}
            className="hidden sm:inline-block text-[11px] font-medium text-slate-300 hover:text-white transition-colors"
          >
            Manage Banner
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
