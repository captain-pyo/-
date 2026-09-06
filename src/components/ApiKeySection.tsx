import React, { useState } from 'react';
import {
  Key,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  RefreshCw,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

interface ApiKeySectionProps {
  apiKey: string;
  isKeyVerified: boolean;
  onKeyVerified: (key: string) => void;
  onKeyReset: () => void;
  onStartDiagnosis: () => void;
}

export const ApiKeySection: React.FC<ApiKeySectionProps> = ({
  apiKey,
  isKeyVerified,
  onKeyVerified,
  onKeyReset,
  onStartDiagnosis,
}) => {
  const [inputKey, setInputKey] = useState<string>(apiKey || '');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    description: string;
  } | null>(
    isKeyVerified
      ? {
          type: 'success',
          title: 'Gemini API Key 승인 완료',
          description: 'Google AI Studio 실시간 분석 엔진(gemini-3.8-flash)이 성공적으로 연결되었습니다.',
        }
      : null
  );
  const [autoRedirectTimer, setAutoRedirectTimer] = useState<number | null>(null);

  // Helper to mask key for safe display (e.g. AIza••••••••k8Zq)
  const getMaskedKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanKey = inputKey.trim();

    if (!cleanKey) {
      setStatusMessage({
        type: 'error',
        title: 'API Key를 입력해주세요',
        description: 'Google AI Studio에서 발급받은 API 키를 입력창에 붙여넣어 주세요.',
      });
      return;
    }

    // Basic format check
    if (!cleanKey.startsWith('AIza') && cleanKey.length < 20) {
      setStatusMessage({
        type: 'error',
        title: '올바르지 않은 API Key 형식',
        description: 'Google Gemini API Key는 일반적으로 "AIza"로 시작합니다. 키를 다시 확인해 주세요.',
      });
      return;
    }

    setIsValidating(true);
    setStatusMessage(null);

    try {
      // Direct server-to-server proxy verification (prevents client-side exposure and CORS)
      const res = await fetch('/api/verify-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cleanKey}`,
        },
        body: JSON.stringify({ apiKey: cleanKey }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        throw new Error(data.error || 'Gemini API Key 유효성 검증에 실패했습니다.');
      }

      // Success
      setStatusMessage({
        type: 'success',
        title: '승인 성공! Gemini 3.8 Flash 엔진 활성화 완료',
        description: 'Google Gemini 서버 대 서버 인증이 완료되었습니다. 3초 후 진단 화면으로 이동하거나 바로 시작할 수 있습니다.',
      });

      onKeyVerified(cleanKey);

      // Auto redirect countdown
      let count = 3;
      setAutoRedirectTimer(count);
      const timer = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          clearInterval(timer);
          setAutoRedirectTimer(null);
          onStartDiagnosis();
        } else {
          setAutoRedirectTimer(count);
        }
      }, 1000);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        title: 'API Key 승인 실패',
        description: err.message || '인증 서버와의 통신 중 오류가 발생했습니다. 키를 다시 확인해주세요.',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleReset = () => {
    setInputKey('');
    setStatusMessage(null);
    setAutoRedirectTimer(null);
    onKeyReset();
  };

  return (
    <section
      id="section-api-key"
      className="py-12 sm:py-16 px-4 max-w-5xl mx-auto scroll-mt-20"
      aria-label="Gemini API Key 활성화 및 승인 섹션"
    >
      <div className="relative rounded-3xl p-6 sm:p-8 lg:p-10 border border-cyan-500/30 bg-gradient-to-b from-[#0B1528] via-[#08101E] to-[#070D18] shadow-[0_0_40px_rgba(6,182,212,0.15)] overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-semibold tracking-wide mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>GEMINI AI NEURAL ENGINE ACTIVATION</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Key className="w-6 h-6 text-cyan-400 shrink-0" />
              <span>Gemini API Key 활성화 및 승인</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
              사용자 고유의 Google Gemini API Key를 입력하여 실시간 AI 소득 크레바스 정밀 분석 엔진을 가동합니다.
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2 self-start md:self-center">
            {isKeyVerified ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>API KEY 인증 활성화됨</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>API Key 미승인 (입력 대기)</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Interactive Form Body */}
        <div className="relative z-10 pt-6">
          {isKeyVerified ? (
            /* ========================================================= */
            /* ALREADY VERIFIED STATE                                    */
            /* ========================================================= */
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                      ACTIVE GOOGLE GEMINI KEY
                    </div>
                    <div className="text-base font-mono font-bold text-white tracking-wide mt-0.5">
                      {getMaskedKey(apiKey)}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Google AI Studio 모델 <code>gemini-3.8-flash</code> 연동 준비 완료
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>키 재설정 / 변경</span>
                  </button>

                  <button
                    type="button"
                    onClick={onStartDiagnosis}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs sm:text-sm font-extrabold shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer group"
                  >
                    <span>소득 크레바스 정밀 진단 시작</span>
                    <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {autoRedirectTimer !== null && (
                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    <strong>{autoRedirectTimer}초</strong> 후 진단 1단계 화면으로 자동 이동합니다...
                  </span>
                  <button
                    type="button"
                    onClick={onStartDiagnosis}
                    className="underline text-cyan-300 font-bold hover:text-white cursor-pointer"
                  >
                    지금 바로 이동하기
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ========================================================= */
            /* INPUT & VERIFICATION FORM                                 */
            /* ========================================================= */
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="gemini-api-key-input"
                    className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5"
                  >
                    <Key className="w-4 h-4 text-cyan-400" />
                    <span>Google Gemini API Key 입력</span>
                    <span className="text-rose-400">*</span>
                  </label>

                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 hover:underline transition-colors cursor-pointer"
                    title="Google AI Studio에서 무료 API Key 발급받기"
                  >
                    <span>무료 API Key 발급받기</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Input with visibility toggle */}
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                    <Lock className="w-4 h-4 text-cyan-400/80" />
                  </div>

                  <input
                    id="gemini-api-key-input"
                    type={showPassword ? 'text' : 'password'}
                    value={inputKey}
                    onChange={(e) => {
                      setInputKey(e.target.value);
                      if (statusMessage?.type === 'error') {
                        setStatusMessage(null);
                      }
                    }}
                    placeholder="AIzaSy... (Google AI Studio에서 발급받은 API Key를 붙여넣으세요)"
                    autoComplete="off"
                    spellCheck={false}
                    disabled={isValidating}
                    className="w-full bg-[#070D18]/90 border border-slate-700 focus:border-cyan-400 rounded-xl pl-10 pr-24 py-3.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-mono transition-all"
                  />

                  <div className="absolute right-2.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                      title={showPassword ? '키 숨기기' : '키 보기'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>

                    {inputKey && (
                      <button
                        type="button"
                        onClick={() => setInputKey('')}
                        className="px-2 py-1 text-[11px] text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                        title="지우기"
                        tabIndex={-1}
                      >
                        지우기
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Alert Message Area */}
              {statusMessage && (
                <div
                  role="alert"
                  className={`p-4 rounded-xl text-xs sm:text-sm flex items-start gap-3 transition-all ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                      : statusMessage.type === 'error'
                      ? 'bg-rose-950/40 border border-rose-500/40 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                      : 'bg-cyan-950/40 border border-cyan-500/40 text-cyan-200'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="font-bold">{statusMessage.title}</div>
                    <div className="text-xs opacity-90 leading-relaxed break-keep">
                      {statusMessage.description}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
                <button
                  type="submit"
                  id="btn-verify-gemini-key"
                  disabled={isValidating || !inputKey.trim()}
                  className={`inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    isValidating || !inputKey.trim()
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]'
                  }`}
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-950" />
                      <span>Google Gemini 서버 대 서버 검증 중...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>유효성 확인 및 승인</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Google AI Studio 개인 계정 발급 키는 무료 플랜으로 즉시 사용 가능합니다.</span>
                </div>
              </div>
            </form>
          )}

          {/* Security Disclaimer Banner (Mandatory Requirement) */}
          <div className="mt-8 pt-5 border-t border-slate-800/80">
            <div className="rounded-xl p-4 bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-1 flex-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span>🔒 입력하신 API Key는 서버나 DB에 저장되지 않으며, 세션 종료 시 즉시 파기됩니다.</span>
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed break-keep">
                  본 애플리케이션은 브라우저에서 Google API를 직접 호출하지 않고, 백엔드 프록시를 통해 서버 대 서버(Server-to-Server) 방식으로 안전하게 통신합니다. 사용자가 입력한 키는 파일이나 데이터베이스에 일체 기록되지 않으며 오직 현재 활성 세션 메모리에서만 일회성으로 처리됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
