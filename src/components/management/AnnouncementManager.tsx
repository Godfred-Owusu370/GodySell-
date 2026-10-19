import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Megaphone, CheckCircle2, Save } from 'lucide-react';

export const AnnouncementManager: React.FC = () => {
  const { announcement, updateAnnouncement } = useApp();

  const [text, setText] = useState(announcement.text);
  const [badgeText, setBadgeText] = useState(announcement.badgeText);
  const [active, setActive] = useState(announcement.active);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAnnouncement({
      id: announcement.id,
      text,
      badgeText,
      active
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <Megaphone className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Marketplace Announcement &amp; Promo Banner
          </h3>
          <p className="text-xs text-slate-500">
            Broadcast flash sales, holidays, or promotional announcements across the live site
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Site announcement updated in real-time!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Badge Tag</label>
          <input
            type="text"
            required
            placeholder="HOT DEAL, PROMO, ACCRA SALE"
            value={badgeText}
            onChange={(e) => setBadgeText(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 uppercase font-bold"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Announcement Message</label>
          <textarea
            rows={3}
            required
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 resize-none text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="bannerActive"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
          />
          <label htmlFor="bannerActive" className="font-semibold text-slate-700 cursor-pointer">
            Display banner at top of site
          </label>
        </div>

        {/* Live Preview */}
        <div className="pt-2">
          <span className="block font-bold text-slate-500 text-[11px] mb-1.5 uppercase">
            Live Banner Preview
          </span>
          <div className="bg-gradient-to-r from-emerald-800 to-green-700 text-white text-xs py-2 px-4 rounded-lg flex items-center gap-2">
            <span className="bg-amber-400 text-slate-900 font-extrabold text-[10px] tracking-wide px-1.5 py-0.5 rounded uppercase shrink-0">
              {badgeText || 'PROMO'}
            </span>
            <span className="truncate">{text || 'Enter announcement message...'}</span>
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg transition-colors shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>Publish Banner Update</span>
        </button>
      </form>
    </div>
  );
};
