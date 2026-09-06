import React from 'react';
import { Loader2, ShieldCheck, CheckCircle2, Cpu } from 'lucide-react';

const safetyPrinciples = [
  '연금 수급 가능 여부를 확정적으로 판단하지 않습니다.',
  '법률·세무·연금제도 관련 세부 내용은 공식 기관 확인이 필요하다고 안내합니다.',
  '특정 금융상품이나 회사를 추천하지 않습니다.',
  '투자수익률을 가정하여 확정적인 미래자산을 제시하지 않습니다.',
  '재취업 가능성을 단정하지 않습니다.',
  '건강상태를 의학적으로 판단하지 않습니다.',
  '입력되지 않은 자산·소득·연금액을 임의로 추정하지 않습니다.',
  '점수는 평가가 아니라 상담을 위한 출발점임을 명시합니다.',
  '불안을 과도하게 자극하는 표현을 사용하지 않습니다.',
  '준비하지 못한 부분보다 앞으로 선택할 수 있는 행동에 초점을 맞춥니다.',
];

export const Step3DiagnosisLoading: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center text-slate-100">
      {/* Spinner & Main Status */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl p-8 sm:p-10 mb-8 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

        <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-blue-500/20 border-b-blue-400 animate-spin [animation-duration:3s]" />
          <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Cpu className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2 tracking-tight">
          소득 크레바스 다차원 구조 분석 중...
        </h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed max-w-md mx-auto">
          퇴직 예정일과 연금 개시 시점의 소득 공백을 파악하고, 내담자의 현재 고민에 맞는 6대 영역별 준비도와 맞춤형 자각 질문을 도출하고 있습니다.
        </p>

        {/* Progress steps checklist */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-left max-w-md mx-auto space-y-3">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-cyan-300">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>퇴직 시점 및 예상 연금 개시일 공백 기간 분석 완료</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-semibold text-cyan-300">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>자산·부채·가족부담·생활비 현금흐름 구조 종합 완료</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-semibold text-cyan-300">
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
            <span>6대 영역 준비도 산출 및 우선 극복 주제 매핑 중</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-500">
            <span className="w-4 h-4 rounded-full border border-slate-700 inline-block shrink-0" />
            <span>Top 3 상담 우선순위 및 3단계 자각 질문(Fact·Emotion·Action) 생성</span>
          </div>
        </div>
      </div>

      {/* AI Safety Principles card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-left backdrop-blur-md">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">
            상담 도우미 AI 안전 원칙 준수 안내
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          본 시스템은 내담자를 평가하거나 재무 우열을 가리는 것이 아니라, 체계적이고 구조화된 생애설계 대화를 지원하기 위해 다음 10대 원칙을 철저히 준수합니다.
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
          {safetyPrinciples.map((principle, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-cyan-400 font-mono font-bold shrink-0">{String(idx + 1).padStart(2, '0')}.</span>
              <span className="leading-tight">{principle}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
