import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const FooterPolicy: React.FC = () => {
  return (
    <footer className="no-print mt-16 py-8 border-t border-white/10 bg-[#070D18] text-slate-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>개인정보 보호 및 세션 데이터 보안 정책 (100% 로컬 처리)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>© 라이프 앤 커리어 디자인 스쿨 (LCDS) - Career Captain Pyo</span>
            <span>개발 및 감수 책임: 표성일 대표</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-slate-300 leading-relaxed">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_6px_#38BDF8]"></span>
          <p>
            본 도구는 상담사의 세션 내 실시간 분석을 지원하며, &ldquo;새로운 상담 시작&rdquo; 또는 브라우저 새로고침 시 모든 입력 데이터와 진단 결과가 즉시 영구 삭제(초기화)됩니다. 서버 측에 내담자의 개인정보나 금융자산 수치를 일절 저장하지 않습니다.
          </p>
        </div>

        <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-300 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-cyan-300">API 데이터 활용 정책 안내:</strong> 무료 티어 API 키는 입력 데이터가 모델 학습에 활용될 수 있습니다(옵트아웃 가능). 실제 상담 데이터가 오가는 앱이므로, 개발자 및 운영자가 본 앱을 실제 상담 현장에서 사용하기 전에는 데이터 학습 활용 옵트아웃을 설정하거나 과금 키(유료 결제 계정)로 전환할 것을 권장합니다.
          </p>
        </div>
      </div>
    </footer>
  );
};
