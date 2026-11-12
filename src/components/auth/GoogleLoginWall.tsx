import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserPlus, ArrowRight, X, ShieldCheck, Trash2, LogIn, ShoppingCart, Store, CheckCircle2 } from 'lucide-react';
import godysellLogo from '../../assets/images/godysell_logo.png';
import { getEmailProfilePhoto } from '../../utils/avatar';

interface GoogleAccountItem {
  id: string;
  name: string;
  email: string;
  picture: string;
  memberSince?: string;
  phone?: string;
}

export const GoogleLoginWall: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalReason,
    authModalMode,
    closeAuthModal,
    loginWithGoogle,
    clearPendingAction
  } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'create'>('login');
  const [showAddNewAccount, setShowAddNewAccount] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Sync activeTab with authModalMode whenever modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setActiveTab(authModalMode || 'login');
      setShowAddNewAccount(false);
    }
  }, [isAuthModalOpen, authModalMode]);

  // Load saved accounts from localStorage
  const [accounts, setAccounts] = useState<GoogleAccountItem[]>(() => {
    try {
      const saved = localStorage.getItem('godysell_google_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((a) => a && typeof a === 'object' && a.id !== 'acc-1');
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('godysell_google_accounts', JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  const saveAccounts = (newAccounts: GoogleAccountItem[]) => {
    setAccounts(newAccounts);
    try {
      localStorage.setItem('godysell_google_accounts', JSON.stringify(newAccounts));
    } catch {
      // fallback
    }
  };

  const handleRemoveAccount = (e: React.MouseEvent, accountId: string) => {
    e.stopPropagation();
    const updated = accounts.filter((a) => a.id !== accountId);
    saveAccounts(updated);
  };

  const handleSelectAccount = (account: GoogleAccountItem) => {
    setSelectedAccountId(account.id);
    setIsLoading(true);
    setTimeout(() => {
      loginWithGoogle({
        name: account.name,
        email: account.email,
        picture: account.picture,
        memberSince: '2026',
        phone: account.phone
      });
      setIsLoading(false);
    }, 450);
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    const email = emailInput.trim().toLowerCase();
    const autoName = email
      .split('@')[0]
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') || 'Google User';

    const name = nameInput.trim() || autoName;
    const picture = getEmailProfilePhoto(email);

    const newAcc: GoogleAccountItem = {
      id: `acc-${Date.now()}`,
      name,
      email,
      picture,
      memberSince: '2026',
      phone: phoneInput.trim()
    };

    const updated = [newAcc, ...accounts.filter((a) => a.email.toLowerCase() !== email)];
    saveAccounts(updated);

    handleSelectAccount(newAcc);
  };

  const handleDismiss = () => {
    clearPendingAction();
    closeAuthModal();
  };

  if (!isAuthModalOpen) {
    return null;
  }

  // Exact user message requirements
  const isBuyingPrompt = authModalReason === 'buying';
  const isSellingPrompt = authModalReason === 'selling';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={handleDismiss}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
              <img
                src={godysellLogo}
                alt="GodySell"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                  GodySell Ghana
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.2 rounded">
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {isBuyingPrompt
                  ? 'Buyer Authentication'
                  : isSellingPrompt
                  ? 'Seller Authentication'
                  : 'Marketplace Sign In'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            title="Close and continue browsing"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Context Notification Banner with Required Exact Copy */}
        <div className="p-4 sm:p-5 space-y-4">
          {isBuyingPrompt && (
            <div className="p-3.5 bg-amber-50 border border-amber-200/90 rounded-xl space-y-1 text-left">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <ShoppingCart className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Buyer Account Required</span>
              </div>
              <p className="text-xs text-amber-950 font-semibold leading-relaxed">
                Please log in or create an account to continue buying on GodySell.
              </p>
              <p className="text-[11px] text-amber-800/90">
                Your selected product will be waiting for you immediately after signing in.
              </p>
            </div>
          )}

          {isSellingPrompt && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200/90 rounded-xl space-y-1 text-left">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <Store className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Seller Account Required</span>
              </div>
              <p className="text-xs text-emerald-950 font-semibold leading-relaxed">
                Join GodySell today! Please log in or create an account before you can start selling your products.
              </p>
              <p className="text-[11px] text-emerald-800/90">
                Reach thousands of active Ghanaian buyers with 0% commission fees.
              </p>
            </div>
          )}

          {!isBuyingPrompt && !isSellingPrompt && (
            <div className="text-left">
              <h2 className="text-sm font-bold text-slate-900">
                Welcome to GodySell Ghana
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Log in or create an account to publish ads, contact sellers, and manage orders.
              </p>
            </div>
          )}

          {/* TWO MANDATORY ACTION BUTTONS: [ Login ] and [ Create Account ] */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setShowAddNewAccount(false);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-700" />
              <span>Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('create');
                setShowAddNewAccount(true);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'create'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
              <span>Create Account</span>
            </button>
          </div>

          {/* TAB 1: LOGIN MODE */}
          {activeTab === 'login' && (
            <div className="space-y-3 pt-1">
              {accounts.length > 0 && !showAddNewAccount ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Saved accounts on this device:</span>
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {accounts.map((acc) => {
                      const isSelected = selectedAccountId === acc.id && isLoading;
                      return (
                        <div
                          key={acc.id}
                          onClick={() => handleSelectAccount(acc)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/30 transition-all flex items-center justify-between text-left cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <img
                              src={acc.picture}
                              alt={acc.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 bg-slate-100 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-900 text-xs truncate group-hover:text-emerald-900">
                                {acc.name}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">
                                {acc.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            {isSelected ? (
                              <div className="w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin shrink-0" />
                            ) : (
                              <>
                                <button
                                  type="button"
                                  title="Remove account from device"
                                  onClick={(e) => handleRemoveAccount(e, acc.id)}
                                  className="p-1 text-slate-300 hover:text-rose-600 rounded transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 group-hover:bg-emerald-100 px-2 py-1 rounded-md transition-colors">
                                  Login
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setShowAddNewAccount(true)}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-xs font-semibold text-slate-700"
                  >
                    <UserPlus className="w-4 h-4 text-slate-500" />
                    <span>Use another Google account</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAccountSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Google Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      autoFocus
                      placeholder="e.g. kwame@gmail.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
                    />
                  </div>

                  {accounts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddNewAccount(false)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 font-medium underline"
                    >
                      ← Back to saved accounts
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !emailInput.trim()}
                    className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <span>{isLoading ? 'Connecting...' : 'Login with Google'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: CREATE ACCOUNT MODE */}
          {activeTab === 'create' && (
            <form onSubmit={handleAccountSubmit} className="space-y-3 pt-1 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name or Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Kwame Mensah or V-Store Ghana"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghana Phone Number <span className="text-slate-400 font-normal">(WhatsApp / MoMo)</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 0244123456"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Used for buyer inquiries and instant doorstep order dispatch.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !emailInput.trim()}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs mt-2"
              >
                <span>{isLoading ? 'Creating Account...' : 'Create Account & Continue'}</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Guest Dismiss Option */}
          <div className="pt-2 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors"
            >
              Continue browsing as guest
            </button>
          </div>
        </div>

        {/* Safe Encryption Footer */}
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Encrypted GodySell Ghana Authentication</span>
        </div>
      </div>
    </div>
  );
};
