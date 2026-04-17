import React, { useState } from 'react';
import { supabase, supabaseUrl, supabaseAnonKey, saveSupabaseConfig } from '../lib/supabase';
import {
  Target,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
  Settings,
  Database,
} from 'lucide-react';
import { motion } from 'motion/react';

const shellClass =
  'relative overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(160deg,rgba(18,24,33,0.94),rgba(9,13,19,0.98))] shadow-[0_32px_120px_-40px_rgba(0,0,0,0.95)] backdrop-blur-2xl';
const panelGlow =
  'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(135,196,255,0.14),transparent_38%),radial-gradient(circle_at_80%_18%,rgba(107,224,184,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_26%,transparent_78%,rgba(255,255,255,0.03))]';
const inputClass =
  'w-full rounded-[22px] border border-white/[0.12] bg-white/[0.045] py-4 pl-12 pr-4 text-[15px] font-medium text-white placeholder:text-white/28 outline-none transition-all duration-300 focus:border-[#87c4ff]/60 focus:bg-white/[0.07] focus:shadow-[0_0_0_4px_rgba(135,196,255,0.12)]';
const labelClass = 'mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-white/46';
const secondaryButtonClass =
  'text-sm font-semibold text-white/56 transition-colors hover:text-white';

function AuthShell({
  children,
  isConfiguring,
}: {
  children: React.ReactNode;
  isConfiguring?: boolean;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06080c] px-4 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(135,196,255,0.16),transparent_24%),radial-gradient(circle_at_85%_18%,rgba(123,232,196,0.12),transparent_18%),radial-gradient(circle_at_50%_120%,rgba(84,168,255,0.12),transparent_34%),linear-gradient(180deg,#0b0f15_0%,#05070b_100%)]" />
      <div className="pointer-events-none absolute left-[-12%] top-[8%] h-80 w-80 rounded-full bg-[#8bc5ff]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-8%] right-[-5%] h-[24rem] w-[24rem] rounded-full bg-[#5fc4ff]/8 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent)]" />
      {isConfiguring ? (
        children
      ) : (
        <div className="w-full max-w-[1100px]">
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
        className="absolute right-4 top-4 z-20 rounded-full border border-white/12 bg-white/[0.05] p-3 text-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl transition-colors hover:text-white"
        title="Configure Database"
      >
        <Settings className="h-5 w-5" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(160deg,rgba(13,18,24,0.92),rgba(7,10,15,0.98))] shadow-[0_40px_130px_-48px_rgba(0,0,0,1)] backdrop-blur-2xl"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_26%),radial-gradient(circle_at_90%_15%,rgba(135,196,255,0.12),transparent_18%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent_34%,rgba(255,255,255,0.02))]" />

        <div className="grid min-h-[720px] grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden overflow-hidden border-r border-white/8 lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(135,196,255,0.18),transparent_26%),radial-gradient(circle_at_72%_34%,rgba(100,214,170,0.13),transparent_18%),linear-gradient(180deg,rgba(13,18,26,0.72),rgba(8,12,18,0.94))]" />
            <div className="absolute inset-x-10 top-10 h-28 rounded-full bg-white/[0.04] blur-3xl" />

            <div className="absolute left-10 right-10 top-14 rounded-[32px] border border-white/10 bg-white/[0.03] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#87c4ff]">
                GoalForge
              </p>
              <h2 className="mt-5 font-headline text-5xl leading-[1.02] tracking-[-0.05em] text-white">
                Design your next win with a sharper command center.
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-7 text-white/64">
                A calmer surface, richer focus, and a cleaner path back into the goals that
                matter most.
              </p>
            </div>

            <div className="absolute bottom-10 left-10 right-10 grid gap-4">
              <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[linear-gradient(180deg,rgba(135,196,255,0.26),rgba(135,196,255,0.12))] shadow-[0_20px_36px_-24px_rgba(135,196,255,0.9)]">
                      <Target className="h-7 w-7 text-[#d8ebff]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white/88">Daily clarity</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/38">
                        Premium workflow
                      </p>
                    </div>
                  </div>
                  <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200">
                    Live Sync
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="h-2 rounded-full bg-white/8">
                    <div className="h-full w-[78%] rounded-full bg-[linear-gradient(90deg,#87c4ff,#64d6aa)]" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-left">
                    <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/34">Focus</p>
                      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                        92%
                      </p>
                    </div>
                    <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/34">
                        Momentum
                      </p>
                      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                        14d
                      </p>
                    </div>
                    <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/34">Goals</p>
                      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                        Elite
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center p-5 sm:p-8 lg:p-10">
            <div className={`relative w-full max-w-md p-7 sm:p-8 ${shellClass}`}>
              <div className={panelGlow} />

              <div className="relative flex flex-col items-center mb-8 text-center">
                <div className="mb-6 flex h-18 w-18 items-center justify-center rounded-[26px] border border-white/12 bg-[linear-gradient(180deg,rgba(135,196,255,0.26),rgba(100,214,170,0.12))] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_20px_40px_-22px_rgba(0,0,0,0.9)]">
                  <Target className="h-8 w-8 text-[#ecf7ff]" />
                </div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#87c4ff]">
                  {isSignUp ? 'Premium Access' : 'Welcome Back'}
                </p>
                <h1 className="mb-3 text-4xl font-semibold tracking-[-0.05em] text-white">
                  {isSignUp ? 'Create Your Space' : 'Sign In Smoothly'}
                </h1>
                <p className="max-w-sm text-[15px] leading-7 text-white/60">
                  {isSignUp
                    ? 'Create an account to keep your goals, habits, and momentum beautifully in sync.'
                    : 'Step back into your dashboard with a cleaner, calmer, more premium flow.'}
                </p>
              </div>

              {error && <AuthError error={error} />}

              {isSuccess ? (
                <div className="relative py-6 text-center">
                  <div className="mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-full border border-emerald-300/18 bg-emerald-300/10">
                    <CheckCircle className="h-8 w-8 text-emerald-200" />
                  </div>
                  <h2 className="mb-2 text-3xl font-semibold tracking-[-0.04em] text-white">
                    Check your email
                  </h2>
                  <p className="mb-6 text-[15px] leading-7 text-white/58">
                    We sent a confirmation link to <span className="font-medium text-white">{email}</span>.
                  </p>
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setIsSignUp(false);
                      setPassword('');
                    }}
                    className={secondaryButtonClass}
                  >
                    Back to sign in
                  </button>
                </div>
              ) : (
                <>
                  <form onSubmit={handleAuth} className="relative space-y-5">
                    <div>
                      <label className={labelClass}>Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/34" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={inputClass}
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/34" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`${inputClass} pr-12`}
                          placeholder="••••••••"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-white/38 transition-colors hover:text-white"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/76">
                          {isSignUp ? 'Secure cloud sync' : 'Fast, secure access'}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#87c4ff]">
                          GoalForge
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-[22px] bg-[linear-gradient(135deg,#d9eeff_0%,#8dc5ff_46%,#64d6aa_100%)] px-6 py-4 text-[15px] font-semibold text-[#07111b] shadow-[0_24px_44px_-26px_rgba(100,214,170,0.8)] transition-all duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </button>
                  </form>

                  <div className="mt-8 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError(null);
                      }}
                      className={secondaryButtonClass}
                    >
                      {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AuthShell>
  );
};
