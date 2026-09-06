import React from 'react';
import { ShieldCheck, RotateCcw, CheckCircle2, ChevronRight, Key } from 'lucide-react';

interface HeaderProps {
  currentStep: number; // 0 (Intro), 1, 2, 3, 4, 5
  onStepClick: (step: number) => void;
  onReset: () => void;
  canNavigateToResult: boolean;
  isKeyVerified?: boolean;
  onApiKeyClick?: () => void;
}

const steps = [
  { num: 1, label: '기본정보', sub: 'Basic Info' },
  { num: 2, label: '재정·퇴직정보', sub: 'Finance & Crevasse' },
  { num: 3, label: '정밀진단', sub: 'AI Diagnosis' },
  { num: 4, label: '상담결과', sub: 'Evaluation' },
  { num: 5, label: '공식리포트', sub: 'Official Report' },
];

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onStepClick,
  onReset,
  canNavigateToResult,
  isKeyVerified = false,
  onApiKeyClick,
}) => {
  return (
    <header className="no-print bg-[#070D18]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Navbar */}
        <div className="flex items-center justify-between py-3 sm:py-3.5 border-b border-white/5">
          {/* Logo in style of image */}
          <div
            onClick={() => onStepClick(0)}
            className="flex items-center gap-3 cursor-pointer group select-none"
            title="소개(홈)으로 이동"
          >
            {/* High-tech geometric logo icon */}
            <div className="relative flex items-center justify-center">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.25)] group-hover:border-cyan-400 transition-all">
                {/* Stylized geometric polygon */}
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 18L12 4L20 18" />
                  <path d="M8 12L12 18L16 12" />
                  <circle cx="12" cy="4" r="1.5" fill="#38BDF8" />
                </svg>
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-75" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg md:text-xl font-extrabold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                  공무원 소득 크레바스 진단
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Value Partner
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block truncate">
                정년퇴직과 연금 개시 사이의 소득 공백(크레바스) 정밀 진단 및 6대 영역 생애설계 솔루션
              </p>
            </div>
          </div>

          {/* Navigation Items in style of top navbar */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Quick Landing Page Nav Links (Visible on desktop when step = 0) */}
            {currentStep === 0 && (
              <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300 tracking-wide">
                <a href="#section-why-crevasse" className="hover:text-cyan-400 transition-colors">
                  소득 공백 원인
                </a>
                <a href="#section-balance-wheel" className="hover:text-cyan-400 transition-colors">
                  6대 영역 밸런스 구체
                </a>
                <a href="#section-methodology" className="hover:text-cyan-400 transition-colors">
                  3단계 자각 질문
                </a>
                <a href="#section-process" className="hover:text-cyan-400 transition-colors">
                  진단 절차
                </a>
                <a href="#section-faq" className="hover:text-cyan-400 transition-colors">
                  FAQ
                </a>
              </nav>
            )}

            {/* Gemini API Key Status Button */}
            <button
              type="button"
              onClick={onApiKeyClick}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                isKeyVerified
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-900/90 border border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-cyan-300'
              }`}
              title={
                isKeyVerified
                  ? 'Gemini API Key가 승인 및 활성화되었습니다. 클릭 시 API Key 설정으로 이동합니다.'
                  : 'Gemini API Key를 입력하고 활성화하려면 클릭하세요.'
              }
            >
              <Key className={`w-3.5 h-3.5 ${isKeyVerified ? 'text-emerald-400' : 'text-cyan-400'}`} />
              <span className="hidden sm:inline">
                {isKeyVerified ? 'API Key 승인됨' : 'API Key 등록'}
              </span>
              {isKeyVerified && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse hidden sm:inline-block" />
              )}
            </button>

            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => onStepClick(0)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-all cursor-pointer"
                title="서비스 소개(홈)으로 이동"
              >
                <span>소개(홈)</span>
              </button>
            )}

            {currentStep > 0 && (
              <button
                type="button"
                id="btn-new-consultation-header"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-lg transition-all cursor-pointer"
                title="새로운 상담 시작 (모든 입력값 초기화)"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">새 상담 시작</span>
                <span className="sm:hidden text-[11px]">초기화</span>
              </button>
            )}

            {/* Quick Start Diagnostic Button in Header */}
            {currentStep === 0 && (
              <button
                type="button"
                onClick={() => onStepClick(1)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
              >
                <span>5분 진단 시작</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 5-step Progress indicator (High-tech cyber styling) */}
        {/* Desktop & Tablet View */}
        <div className="hidden sm:block py-2.5 overflow-x-auto scrollbar-none">
          <nav aria-label="진행 단계" className="min-w-[560px]">
            <ol className="flex items-center justify-between">
              {steps.map((step, idx) => {
                const isActive = currentStep === step.num;
                const isCompleted = currentStep > step.num;
                const isClickable =
                  step.num < currentStep ||
                  (step.num === 4 && canNavigateToResult) ||
                  (step.num === 5 && canNavigateToResult) ||
                  (step.num === 1 && currentStep > 0) ||
                  (step.num === 2 && currentStep > 1);

                return (
                  <li key={step.num} className="flex-1 flex items-center">
                    <button
                      type="button"
                      disabled={!isClickable && currentStep !== step.num}
                      onClick={() => isClickable && onStepClick(step.num)}
                      className={`group flex items-center gap-2 text-xs font-medium transition-all ${
                        isClickable ? 'cursor-pointer' : 'cursor-default opacity-60'
                      } ${
                        isActive
                          ? 'text-cyan-300 font-bold'
                          : isCompleted
                          ? 'text-slate-200'
                          : 'text-slate-500'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all shrink-0 ${
                          isActive
                            ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-400/40 ring-offset-2 ring-offset-[#070D18] shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                            : isCompleted
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          step.num
                        )}
                      </span>
                      <div className="text-left">
                        <div className="truncate text-xs">{step.label}</div>
                      </div>
                    </button>

                    {idx < steps.length - 1 && (
                      <div
                        className={`flex-1 mx-3 h-[2px] rounded-full transition-all ${
                          currentStep > step.num
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                            : 'bg-slate-800'
                        }`}
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        {/* Mobile View */}
        <div className="sm:hidden py-2">
          {currentStep === 0 ? (
            <div className="flex items-center justify-between text-xs text-slate-400 py-0.5">
              <span className="font-semibold text-cyan-400">생애설계 진단 솔루션</span>
              <span className="text-[11px] text-slate-500">진단 준비 대기</span>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#38BDF8]" />
                  <span>
                    {currentStep}단계: {steps.find((s) => s.num === currentStep)?.label || '진행'}
                  </span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {currentStep} / 5 단계
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {steps.map((step) => {
                  const isActive = currentStep === step.num;
                  const isCompleted = currentStep > step.num;
                  const isClickable =
                    step.num < currentStep ||
                    (step.num === 4 && canNavigateToResult) ||
                    (step.num === 5 && canNavigateToResult) ||
                    (step.num === 1 && currentStep > 0) ||
                    (step.num === 2 && currentStep > 1);

                  return (
                    <button
                      key={step.num}
                      type="button"
                      disabled={!isClickable && currentStep !== step.num}
                      onClick={() => isClickable && onStepClick(step.num)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cyan-400 ring-1 ring-cyan-300 shadow-[0_0_8px_#38BDF8]'
                          : isCompleted
                          ? 'bg-cyan-500/50'
                          : 'bg-slate-800'
                      }`}
                      title={`${step.num}단계: ${step.label}`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
