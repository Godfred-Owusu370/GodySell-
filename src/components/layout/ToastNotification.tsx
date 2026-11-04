import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { toast, dismissToast } = useApp();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 max-w-sm w-full pointer-events-auto animate-in slide-in-from-bottom-3 fade-in duration-200">
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md ${
          isSuccess
            ? 'bg-emerald-900/95 text-white border-emerald-700/60 shadow-emerald-950/20'
            : isError
            ? 'bg-rose-900/95 text-white border-rose-700/60 shadow-rose-950/20'
            : 'bg-slate-900/95 text-white border-slate-700/60 shadow-slate-950/20'
        }`}
      >
        <div className="shrink-0 pt-0.5">
          {isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : isError ? (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          ) : (
            <Info className="w-5 h-5 text-sky-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-bold leading-snug">
            {toast.message}
          </p>
        </div>

        <button
          type="button"
          onClick={dismissToast}
          className="shrink-0 p-1 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
