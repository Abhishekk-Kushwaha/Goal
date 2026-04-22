import React, { useState } from 'react';
import { supabase, supabaseUrl, supabaseAnonKey, saveSupabaseConfig } from '../lib/supabase';
import {
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
  Settings,
  Database,
  ArrowRight,
  Target,
} from 'lucide-react';
import { motion } from 'motion/react';

const shellClass =
  'relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(15,18,30,0.88),rgba(5,7,14,0.96))] shadow-[0_28px_90px_-44px_rgba(34,64,255,0.7),0_28px_80px_-54px_rgba(0,0,0,1)] backdrop-blur-2xl sm:rounded-[34px]';
const panelGlow =
  'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(123,154,255,0.16),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_30%,rgba(255,255,255,0.02)_100%)]';
const inputClass =
  'h-12 w-full rounded-[10px] border border-[#8f91bf]/24 bg-[#080a14]/62 py-0 pl-12 pr-4 text-base font-medium text-[#f2f3ff] outline-none transition-all duration-300 placeholder:text-[#b9bad3]/58 focus:border-[#8aa2ff]/70 focus:bg-[#0d1020]/74 focus:shadow-[0_0_0_4px_rgba(89,119,255,0.12)] sm:h-14 sm:rounded-[12px] sm:pl-14 sm:text-lg';
const labelClass = 'mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-white/46';
const secondaryButtonClass =
  'text-sm font-semibold text-white/56 transition-colors hover:text-white';

function GoalForgeMark() {
  return (
    <div className="relative flex h-14 w-14 items-center justify-center rounded-[19px] border border-[#8da2ff]/28 bg-[linear-gradient(145deg,rgba(123,154,255,0.32),rgba(32,42,104,0.54)_48%,rgba(6,9,22,0.88)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_18px_44px_-24px_rgba(105,135,255,0.95)] sm:h-16 sm:w-16 sm:rounded-[22px]">
      <div className="absolute inset-[5px] rounded-[15px] bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.26),transparent_36%),linear-gradient(160deg,rgba(78,109,255,0.3),rgba(4,6,16,0.2))]" />
      <Target className="relative h-7 w-7 text-[#e9efff] drop-shadow-[0_0_16px_rgba(124,155,255,0.72)] sm:h-8 sm:w-8" />
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M23.64 12.2c0-.82-.07-1.61-.21-2.36H12v4.46h6.54a5.6 5.6 0 0 1-2.43 3.68v2.99h3.93c2.3-2.13 3.6-5.27 3.6-8.77z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.93-2.99c-1.08.73-2.47 1.16-4.01 1.16-3.13 0-5.78-2.1-6.73-4.94H1.21v3.08A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.32A7.18 7.18 0 0 1 4.89 12c0-.8.14-1.58.38-2.32V6.6H1.21A12 12 0 0 0 0 12c0 1.94.46 3.78 1.21 5.4l4.06-3.08z"
      />
      <path
        fill="#EA4335"
        d="M12 4.74c1.76 0 3.35.6 4.6 1.8l3.43-3.43A11.54 11.54 0 0 0 12 0 12 12 0 0 0 1.21 6.6l4.06 3.08C6.22 6.84 8.87 4.74 12 4.74z"
      />
    </svg>
  );
}

function AuthShell({
  children,
  isConfiguring,
}: {
  children: React.ReactNode;
  isConfiguring?: boolean;
}) {
  return (
    <div className="relative flex h-screen min-h-screen items-start justify-center overflow-y-auto overflow-x-hidden bg-[#03040a] px-4 py-5 text-white sm:items-center sm:py-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(92,118,255,0.34),transparent_28%),radial-gradient(circle_at_50%_105%,rgba(103,86,196,0.28),transparent_34%),linear-gradient(180deg,#02040a_0%,#090b17_48%,#03040a_100%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.6)_0_1px,transparent_1px)] [background-size:5px_5px]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(154deg,rgba(0,0,0,0.7)_0_20%,transparent_20.2%_66%,rgba(0,0,0,0.48)_66.2%_100%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(28deg,transparent_0_16%,rgba(57,64,146,0.28)_16.2%_23%,transparent_23.2%_100%),linear-gradient(154deg,transparent_0_56%,rgba(72,60,157,0.3)_56.2%_64%,transparent_64.2%_100%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.2)_0%,transparent_34%,rgba(0,0,0,0.32)_100%)]" />
      {isConfiguring ? (
        children
      ) : (
        <div className="relative z-10 flex w-full justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

function AuthError({ error }: { error: string }) {
  return (
    <div className="relative mb-6 flex items-start gap-3 rounded-[22px] border border-rose-400/18 bg-rose-400/10 p-4 text-rose-100">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
      <p className="text-sm leading-6">{error}</p>
    </div>
  );
}

export const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isConfigMissing =
    !supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co';
  const [isConfiguring, setIsConfiguring] = useState(isConfigMissing);
  const [configUrl, setConfigUrl] = useState(
    supabaseUrl === 'https://placeholder.supabase.co' ? '' : supabaseUrl,
  );
  const [configKey, setConfigKey] = useState(
    supabaseAnonKey === 'placeholder' ? '' : supabaseAnonKey,
  );

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configUrl.startsWith('http')) {
      setError('Supabase URL must start with https://');
      return;
    }
    saveSupabaseConfig(configUrl.trim(), configKey.trim());
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isConfigMissing) {
      setError('Supabase is not configured. Please click the settings icon to configure it.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (signUpError) throw signUpError;
        setIsSuccess(true);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (isConfigMissing) {
      setError('Supabase is not configured. Please click the settings icon to configure it.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: googleAuthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (googleAuthError) throw googleAuthError;
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google sign-in.');
      setIsLoading(false);
    }
  };

  if (isConfiguring) {
    return (
      <AuthShell isConfiguring>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative w-full max-w-lg p-8 sm:p-10 ${shellClass}`}
        >
          <div className={panelGlow} />
          <div className="relative flex flex-col items-center mb-10">
            <div className="mb-6 flex h-18 w-18 items-center justify-center rounded-[26px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.05))] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_20px_40px_-22px_rgba(0,0,0,0.9)]">
              <Database className="h-8 w-8 text-[#d8ebff]" />
            </div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#87c4ff]">
              GoalForge Setup
            </p>
            <h1 className="mb-3 text-center text-4xl font-semibold tracking-[-0.04em] text-white">
              Database Setup
            </h1>
            <p className="max-w-sm text-center text-[15px] leading-7 text-white/62">
              Connect your Supabase project to continue.
            </p>
          </div>

          {error && <AuthError error={error} />}

          <form onSubmit={handleSaveConfig} className="relative space-y-5">
            <div>
              <label className={labelClass}>Supabase URL</label>
              <input
                type="url"
                value={configUrl}
                onChange={(e) => setConfigUrl(e.target.value)}
                className="w-full rounded-[22px] border border-white/[0.12] bg-white/[0.045] px-5 py-4 text-[15px] font-medium text-white placeholder:text-white/28 outline-none transition-all duration-300 focus:border-[#87c4ff]/60 focus:bg-white/[0.07] focus:shadow-[0_0_0_4px_rgba(135,196,255,0.12)]"
                placeholder="https://your-project.supabase.co"
                required
              />
            </div>

            <div>
              <label className={labelClass}>Anon Key</label>
              <input
                type="text"
                value={configKey}
                onChange={(e) => setConfigKey(e.target.value)}
                className="w-full rounded-[22px] border border-white/[0.12] bg-white/[0.045] px-5 py-4 text-[15px] font-medium text-white placeholder:text-white/28 outline-none transition-all duration-300 focus:border-[#87c4ff]/60 focus:bg-white/[0.07] focus:shadow-[0_0_0_4px_rgba(135,196,255,0.12)]"
                placeholder="eyJh..."
                required
              />
            </div>

            <button
              type="submit"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-[22px] bg-[linear-gradient(135deg,#d9eeff_0%,#8dc5ff_46%,#64d6aa_100%)] px-6 py-4 text-[15px] font-semibold text-[#07111b] shadow-[0_22px_44px_-26px_rgba(100,214,170,0.7)] transition-transform duration-300 hover:scale-[1.01]"
            >
              Connect Database
            </button>

            {!isConfigMissing && (
              <button
                type="button"
                onClick={() => setIsConfiguring(false)}
                className={`w-full py-2 ${secondaryButtonClass}`}
              >
                Cancel
              </button>
            )}
          </form>
        </motion.div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <button
        onClick={() => setIsConfiguring(true)}
        className="absolute right-5 top-5 z-20 rounded-full border border-[#9d99d8]/18 bg-[#0c0e1a]/45 p-3 text-[#d8d6ef]/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl transition-colors hover:text-white"
        title="Configure Database"
      >
        <Settings className="h-5 w-5" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex min-h-[calc(100vh-2.5rem)] w-full max-w-[640px] flex-col items-center justify-center px-0 py-3 text-center sm:min-h-[calc(100vh-4rem)] sm:py-6"
      >
        <div className="flex flex-col items-center">
          <GoalForgeMark />
          <h1 className="mt-4 text-[34px] font-semibold leading-none text-[#f3f4ff] drop-shadow-[0_0_24px_rgba(129,153,255,0.22)] sm:mt-5 sm:text-[44px]">
            GoalForge
          </h1>
          <p className="mt-3 text-sm font-medium text-[#c7c9df]/82 sm:mt-4 sm:text-base">
            Build your life with intention.
          </p>
          <div className="mt-4 flex items-center gap-3 sm:mt-5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#86a0ff] shadow-[0_0_10px_2px_rgba(96,126,255,0.62)]" />
            <span className="h-1.5 w-6 rounded-full bg-[linear-gradient(90deg,#86a0ff,#5f73ff)] shadow-[0_0_13px_2px_rgba(96,126,255,0.56)]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#86a0ff] shadow-[0_0_10px_2px_rgba(96,126,255,0.62)]" />
          </div>
        </div>

        <div className="relative mt-5 w-[calc(100vw-32px)] max-w-[560px] overflow-hidden rounded-[18px] border border-[#8b8fbd]/24 bg-[#070914]/76 px-5 pb-5 pt-6 shadow-[0_0_0_1px_rgba(183,190,255,0.04),inset_0_1px_0_rgba(255,255,255,0.07),0_26px_76px_-48px_rgba(0,0,0,1)] backdrop-blur-[18px] sm:mt-8 sm:rounded-[22px] sm:px-8 sm:pb-8 sm:pt-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_0%,rgba(108,123,255,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_24%,rgba(255,255,255,0.012)_100%)]" />

          <div className="relative">
            <h2 className="text-2xl font-semibold tracking-normal text-[#f5f5ff] sm:text-[32px]">
              {isSignUp ? 'Create account' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-sm font-medium leading-6 text-[#c3c5dc]/74 sm:mt-3 sm:text-base">
              {isSignUp
                ? 'Start building your goals with clarity.'
                : 'Continue building your goals with clarity.'}
            </p>

            {error && <div className="mt-4 sm:mt-6"><AuthError error={error} /></div>}

            {isSuccess ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-full border border-emerald-300/18 bg-emerald-300/10">
                  <CheckCircle className="h-8 w-8 text-emerald-200" />
                </div>
                <h3 className="mb-2 text-3xl font-semibold tracking-[0.02em] text-white">
                  Check your email
                </h3>
                <p className="mb-6 text-[16px] leading-7 text-[#c5c1dc]/80">
                  We sent a confirmation link to <span className="font-medium text-white">{email}</span>.
                </p>
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setIsSignUp(false);
                    setPassword('');
                  }}
                  className="text-[18px] font-medium tracking-[0.03em] text-[#8faaff] transition-colors hover:text-white"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <>
                <form onSubmit={handleAuth} className="mt-5 space-y-3.5 sm:mt-7 sm:space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 stroke-[1.7] text-[#cfd2ec]/78 sm:left-5 sm:h-5 sm:w-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      placeholder="Email address"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 stroke-[1.7] text-[#cfd2ec]/78 sm:left-5 sm:h-5 sm:w-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputClass} pr-12 sm:pr-14`}
                      placeholder="Password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 z-10 -translate-y-1/2 p-1.5 text-[#cfd2ec]/64 transition-colors hover:text-white sm:right-4"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 stroke-[1.7]" />
                      ) : (
                        <Eye className="h-5 w-5 stroke-[1.7]" />
                      )}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group mt-5 flex h-11 w-full items-center justify-center rounded-[10px] border border-white/10 bg-[linear-gradient(180deg,#6f83e8_0%,#5366cf_48%,#3b48a7_100%)] px-4 text-base font-medium text-[#f7f8ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_12px_26px_-24px_rgba(80,96,180,0.55)] transition-all duration-300 hover:bg-[linear-gradient(180deg,#7789eb_0%,#596bd2_48%,#414dab_100%)] disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:rounded-[12px] sm:px-4 sm:text-base"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <span className="flex-1 text-center">{isSignUp ? 'Create account' : 'Continue'}</span>
                        <ArrowRight className="h-5 w-5 stroke-[1.6] transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-5 flex items-center gap-3 sm:mt-6 sm:gap-4">
                  <div className="h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(179,175,222,0.18),rgba(179,175,222,0.04))]" />
                  <span className="text-xs font-medium text-[#c4c7df]/68 sm:text-sm">or continue with</span>
                  <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(179,175,222,0.04),rgba(179,175,222,0.18),transparent)]" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="mx-auto mt-4 flex h-11 w-full max-w-[300px] items-center justify-center gap-3 rounded-[11px] border border-[#8f91bf]/24 bg-[#151826]/68 px-5 text-sm font-semibold text-[#f2f3ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors hover:bg-[#1d2133]/76 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-5 sm:h-12 sm:text-base"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <GoogleGlyph />
                      Continue with Google
                    </>
                  )}
                </button>

                <div className="mt-5 text-center text-sm font-medium text-[#c4c7df]/72 sm:mt-6 sm:text-base">
                  {isSignUp ? 'Already here?' : 'New here?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError(null);
                    }}
                    className="font-semibold text-[#88a1ff] transition-colors hover:text-white"
                  >
                    {isSignUp ? 'Welcome back' : 'Create account'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AuthShell>
  );
};
