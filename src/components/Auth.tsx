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
} from 'lucide-react';
import { motion } from 'motion/react';

const shellClass =
  'relative overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(160deg,rgba(18,24,33,0.94),rgba(9,13,19,0.98))] shadow-[0_32px_120px_-40px_rgba(0,0,0,0.95)] backdrop-blur-2xl';
const panelGlow =
  'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(135,196,255,0.14),transparent_38%),radial-gradient(circle_at_80%_18%,rgba(107,224,184,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_26%,transparent_78%,rgba(255,255,255,0.03))]';
const inputClass =
  'w-full rounded-[17px] border border-[#9f9bd6]/25 bg-[#070914]/40 py-4 pl-[74px] pr-5 text-[24px] font-normal tracking-[0.02em] text-[#ebeafe] outline-none transition-all duration-300 placeholder:text-[#c4c0dc]/74 focus:border-[#8ea8ff]/65 focus:bg-[#0b0e1b]/58 focus:shadow-[0_0_0_4px_rgba(89,119,255,0.13)]';
const labelClass = 'mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-white/46';
const secondaryButtonClass =
  'text-sm font-semibold text-white/56 transition-colors hover:text-white';

function MiraiMark() {
  return (
    <div className="relative h-[82px] w-[116px]">
      <div className="absolute left-[10px] top-[14px] h-[42px] w-[56px] rounded-[8px] bg-[linear-gradient(145deg,#6da3ff_0%,#3959ec_62%,#2731a7_100%)] shadow-[0_0_34px_rgba(84,123,255,0.72)] [clip-path:polygon(0_18%,36%_0,73%_42%,100%_13%,100%_68%,55%_100%,0_55%)]" />
      <div className="absolute right-[5px] top-[5px] h-[66px] w-[86px] rounded-[10px] bg-[linear-gradient(145deg,#89c3ff_0%,#547cff_48%,#2738c4_100%)] shadow-[0_0_42px_rgba(105,144,255,0.72)] [clip-path:polygon(0_28%,25%_5%,48%_29%,83%_0,83%_31%,44%_82%,20%_63%,0_73%)]" />
      <div className="absolute left-[24px] top-[48px] h-[18px] w-[47px] bg-[#080a16] [clip-path:polygon(0_76%,42%_18%,100%_77%,100%_100%,42%_43%,0_100%)]" />
    </div>
  );
}

function GoogleGlyph() {
  return (
    <span className="relative block h-8 w-8 rounded-full bg-[conic-gradient(from_-40deg,#4285f4_0_25%,#34a853_25%_50%,#fbbc05_50%_75%,#ea4335_75%_100%)]">
      <span className="absolute left-1/2 top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1c1d26]" />
      <span className="absolute left-[17px] top-[13px] h-[8px] w-[14px] bg-[#4285f4]" />
    </span>
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#03040a] px-4 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_53%_29%,rgba(82,93,186,0.46),transparent_23%),radial-gradient(circle_at_51%_100%,rgba(103,93,171,0.46),transparent_34%),linear-gradient(180deg,#03040a_0%,#0d0e1b_47%,#04050a_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.34] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.5)_0_1px,transparent_1px)] [background-size:4px_4px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(154deg,rgba(1,2,8,0.94)_0_18%,transparent_18.2%_44%,rgba(2,3,10,0.68)_44.2%_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(30deg,rgba(20,25,72,0.88)_0_13%,transparent_13.2%_100%),linear-gradient(154deg,transparent_0_42%,rgba(81,68,154,0.5)_42.2%_49%,transparent_49.2%_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(27deg,transparent_0_24%,rgba(43,44,117,0.72)_24.2%_32%,transparent_32.2%_100%),linear-gradient(154deg,transparent_0_56%,rgba(44,40,105,0.84)_56.2%_64%,transparent_64.2%_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.36)_0%,transparent_28%,rgba(0,0,0,0.24)_100%)]" />
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
        className="relative flex min-h-[calc(100vh-4rem)] w-full max-w-[900px] flex-col items-center px-3 pt-12 text-center sm:pt-16"
      >
        <div className="flex flex-col items-center">
          <MiraiMark />
          <h1 className="mt-2 text-[56px] font-semibold leading-none tracking-[0.16em] text-[#ecebfb] drop-shadow-[0_0_26px_rgba(212,214,255,0.18)] sm:text-[66px]">
            Mirai
          </h1>
          <p className="mt-7 text-[21px] font-normal tracking-[0.13em] text-[#d7d4e8]/88 sm:text-[23px]">
            Build your life with intention.
          </p>
          <div className="mt-9 flex items-center gap-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7397ff] shadow-[0_0_12px_3px_rgba(84,119,255,0.72)]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#7397ff] shadow-[0_0_16px_5px_rgba(84,119,255,0.9)]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#7397ff] shadow-[0_0_12px_3px_rgba(84,119,255,0.72)]" />
          </div>
        </div>

        <div className="relative mt-10 w-full max-w-[686px] overflow-hidden rounded-[42px] border border-[#938fe0]/38 bg-[#080a13]/58 px-9 pb-8 pt-11 shadow-[0_0_0_1px_rgba(180,178,255,0.05),inset_0_1px_0_rgba(255,255,255,0.08),0_34px_90px_-42px_rgba(0,0,0,0.95)] backdrop-blur-[18px] sm:px-[38px] sm:pb-9">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_0%,rgba(126,103,220,0.22),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_22%,rgba(255,255,255,0.015)_100%)]" />

          <div className="relative">
            <h2 className="text-[34px] font-medium tracking-[0.06em] text-[#f0effd] sm:text-[39px]">
              {isSignUp ? 'Create account' : 'Welcome back'}
            </h2>
            <p className="mt-4 text-[22px] font-normal tracking-[0.02em] text-[#c5c1dc]/82">
              {isSignUp
                ? 'Start building your goals with clarity.'
                : 'Continue building your goals with clarity.'}
            </p>

            {error && <div className="mt-7"><AuthError error={error} /></div>}

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
                <form onSubmit={handleAuth} className="mt-8 space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-[23px] top-1/2 z-10 h-8 w-8 -translate-y-1/2 stroke-[1.55] text-[#d5d2e9]/86" />
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
                    <Lock className="absolute left-[27px] top-1/2 z-10 h-7 w-7 -translate-y-1/2 stroke-[1.6] text-[#d5d2e9]/86" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputClass} pr-[72px]`}
                      placeholder="Password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-[22px] top-1/2 z-10 -translate-y-1/2 p-1 text-[#d5d2e9]/70 transition-colors hover:text-white"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-8 w-8 stroke-[1.5]" />
                      ) : (
                        <Eye className="h-8 w-8 stroke-[1.5]" />
                      )}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group mt-8 flex h-[72px] w-full items-center justify-center rounded-[18px] border border-[#6585ff]/50 bg-[linear-gradient(180deg,#86b3ff_0%,#3759ea_45%,#1424a9_100%)] px-6 text-[25px] font-medium tracking-[0.05em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.42),0_0_35px_rgba(60,91,255,0.56)] transition-all duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <Loader2 className="h-7 w-7 animate-spin" />
                    ) : (
                      <>
                        {isSignUp ? 'Create account' : 'Continue'}
                        <ArrowRight className="ml-auto h-8 w-8 stroke-[1.4] transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 flex items-center gap-4">
                  <div className="h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(179,175,222,0.18),rgba(179,175,222,0.04))]" />
                  <span className="text-[20px] tracking-[0.04em] text-[#c4c0dc]/86">or continue with</span>
                  <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(179,175,222,0.04),rgba(179,175,222,0.18),transparent)]" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="mx-auto mt-6 flex h-[66px] w-full max-w-[330px] items-center justify-center gap-5 rounded-[14px] border border-[#9f9bd6]/24 bg-[#1b1d2a]/60 px-7 text-[20px] font-normal tracking-[0.04em] text-[#f0effd] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors hover:bg-[#242637]/68 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <Loader2 className="h-7 w-7 animate-spin" />
                  ) : (
                    <>
                      <GoogleGlyph />
                      continue with Google
                    </>
                  )}
                </button>

                <div className="mt-8 text-center text-[22px] tracking-[0.03em] text-[#c4c0dc]/82">
                  {isSignUp ? 'Already here?' : 'New here?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError(null);
                    }}
                    className="font-normal text-[#80a6ff] transition-colors hover:text-white"
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
