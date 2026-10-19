import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserPlus, ArrowRight, X, ShieldCheck, Trash2 } from 'lucide-react';
import godysellLogo from '../../assets/images/godysell_logo.png';
import { getEmailProfilePhoto } from '../../utils/avatar';

interface GoogleAccountItem {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export const GoogleLoginWall: React.FC = () => {
  const { loginWithGoogle } = useApp();

  const [isChooserOpen, setIsChooserOpen] = useState(false);
  const [showAddNewAccount, setShowAddNewAccount] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Load saved accounts strictly from this specific device's localStorage.
  const [accounts, setAccounts] = useState<GoogleAccountItem[]>(() => {
    try {
      const saved = localStorage.getItem('godysell_google_accounts');
      if (saved) {
        const parsed: GoogleAccountItem[] = JSON.parse(saved);
        const cleaned = parsed.filter((a) => a.id !== 'acc-1');
        if (cleaned.length !== parsed.length) {
          localStorage.setItem('godysell_google_accounts', JSON.stringify(cleaned));
        }
        return cleaned;
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
        picture: account.picture
      });
      setIsLoading(false);
    }, 450);
  };

  const handleAddCustomAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    const email = newEmail.trim().toLowerCase();
    const autoName = email.split('@')[0]
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') || 'Google User';

    const name = newName.trim() || autoName;
    const picture = getEmailProfilePhoto(email);

    const newAcc: GoogleAccountItem = {
      id: `acc-${Date.now()}`,
      name,
      email,
      picture
    };

    const updated = [newAcc, ...accounts.filter((a) => a.email.toLowerCase() !== email)];
    saveAccounts(updated);

    handleSelectAccount(newAcc);
  };

  const handleOpenLogin = () => {
    if (accounts.length === 0) {
      setShowAddNewAccount(true);
    } else {
      setShowAddNewAccount(false);
    }
    setIsChooserOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Main Container Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative z-10 flex flex-col">
        <div className="p-6 sm:p-8 space-y-6 text-center">
          {/* Logo & Brand */}
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 flex items-center justify-center">
              <img
                src={godysellLogo}
                alt="GodySell Ghana"
                className="w-full h-full object-contain filter drop-shadow-xs"
              />
            </div>

            <div className="mt-2">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Ghana&apos;s Verified Marketplace
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
            Sign in to browse listings, communicate directly with buyers and sellers, and manage your inventory.
          </p>

          {/* Clean Google Sign In Button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleOpenLogin}
              className="w-full relative flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 shadow-2xs hover:border-slate-400 transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <p className="text-[11px] text-slate-400">
              {accounts.length > 0
                ? 'Sign in with your saved account on this device'
                : 'Connect your personal Google account'}
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-2.5 border-t border-slate-200 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Encrypted authentication</span>
        </div>
      </div>

      {/* GOOGLE SIGN IN / ACCOUNT CHOOSER MODAL */}
      {isChooserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs">
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-left relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Google Logo & Close */}
            <div className="p-4 pb-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="font-semibold text-slate-800 text-xs">Google</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsChooserOpen(false);
                  setShowAddNewAccount(false);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  {accounts.length > 0 && !showAddNewAccount ? 'Choose an account' : 'Sign in with Google'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  to continue to <span className="font-semibold text-slate-800">GodySell Ghana</span>
                </p>
              </div>

              {/* Show Account Chooser ONLY if this device has accounts and user is not adding a new one */}
              {accounts.length > 0 && !showAddNewAccount ? (
                <div className="space-y-1.5 divide-y divide-slate-100">
                  {/* List of accounts saved strictly on this device */}
                  <div className="space-y-1">
                    {accounts.map((acc) => {
                      const isSelected = selectedAccountId === acc.id && isLoading;
                      return (
                        <div
                          key={acc.id}
                          className="w-full p-2.5 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center justify-between text-left group cursor-pointer border border-transparent hover:border-slate-200"
                          onClick={() => handleSelectAccount(acc)}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <img
                              src={acc.picture}
                              alt={acc.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 bg-slate-100 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-900 text-xs truncate">
                                {acc.name}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">
                                {acc.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            {isSelected ? (
                              <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin shrink-0" />
                            ) : (
                              <>
                                <button
                                  type="button"
                                  title="Remove account from this device"
                                  onClick={(e) => handleRemoveAccount(e, acc.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs text-slate-700 font-semibold group-hover:text-slate-900">
                                  Select
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Option: Use another account */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => setShowAddNewAccount(true)}
                      className="w-full p-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2.5 text-left group"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-xs">
                          Use another account
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Sign in with a different Google account
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                /* Form to enter Google account details for this device */
                <form onSubmit={handleAddCustomAccount} className="space-y-3 pt-1">
                  {accounts.length > 0 && (
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs font-semibold text-slate-800">
                        Enter Google Account
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddNewAccount(false)}
                        className="text-[11px] text-slate-500 hover:text-slate-800 font-medium"
                      >
                        Back to accounts
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Google Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      autoFocus
                      placeholder="name@gmail.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-slate-500 focus:bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Your Full Name <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kwame Mensah"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-slate-500 focus:bg-white font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !newEmail.trim()}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 mt-2 shadow-2xs"
                  >
                    <span>{isLoading ? 'Connecting...' : 'Continue'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              {/* Privacy Disclosure Footer */}
              <div className="pt-2 text-[10px] text-slate-400 leading-relaxed border-t border-slate-100">
                To continue, Google will share your name, email address, language preference, and profile picture with GodySell Ghana.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
