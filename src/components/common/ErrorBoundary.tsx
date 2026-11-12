import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import godysellLogo from '../../assets/images/godysell_logo.png';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GodySell ErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    try {
      // Clear potentially corrupted transient caches while keeping user session
      sessionStorage.clear();
    } catch {}
    window.location.href = '/';
  };

  handleResetCacheAndReload = () => {
    try {
      localStorage.removeItem('godysell_shared_products_cache');
      localStorage.removeItem('jiji_gh_products');
      sessionStorage.clear();
    } catch {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 text-center space-y-5">
            <div className="w-24 h-24 mx-auto flex items-center justify-center">
              <img
                src={godysellLogo}
                alt="GodySell Ghana"
                className="w-full h-full object-contain filter drop-shadow-xs"
              />
            </div>

            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center border border-amber-200">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                GodySell Ghana Marketplace
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We encountered a temporary display issue loading the page. You can refresh now to load all active listings.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left overflow-x-auto max-h-24">
                <p className="text-[11px] font-mono text-slate-600 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                onClick={this.handleResetCacheAndReload}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset Cache &amp; Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
