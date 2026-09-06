import React, { useState } from 'react';
import {
  Download,
  Printer,
  FileText,
  Clock,
  TrendingDown,
  ShieldCheck,
  CheckSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  Maximize2,
  CheckCircle2,
  HelpCircle,
  FileCode,
} from 'lucide-react';
import { DiagnosisResult, ConsultationForm } from '../types';

interface MobileReadingViewProps {
  result: DiagnosisResult;
  form: ConsultationForm;
  primaryColor: string;
  accentColor: string;
  accentBg: string;
  accentText: string;
  sealColor: string;
  todayStr: string;
  docId: string;
  onDownloadPdf: () => void;
  onDownloadHtml: () => void;
  onPrint: () => void;
  isGeneratingPdf: boolean;
  onSwitchToA4Fit: () => void;
}

export const MobileReadingView: React.FC<MobileReadingViewProps> = ({
  result,
  form,
  primaryColor,
  accentColor,
  accentBg,
  accentText,
  sealColor,
  todayStr,
  docId,
  onDownloadPdf,
  onDownloadHtml,
  onPrint,
  isGeneratingPdf,
  onSwitchToA4Fit,
}) => {
  const [activeQuestionTab, setActiveQuestionTab] = useState<number>(0);

  return (
    <div className="no-print max-w-2xl mx-auto space-y-5 pb-8 text-slate-800">
      {/* 1. Mobile Notice & View switcher badge */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
            📱
          </span>
          <div>
            <h3 className="text-sm font-bold text-emerald-900">
              스마트폰 전용 모바일 리포트 모드
            </h3>
            <p className="text-xs text-emerald-700">
              작은 화면에서도 편안하게 읽을 수 있도록 세로형 큰 글씨로 최적화되었습니다.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onSwitchToA4Fit}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-900 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors cursor-pointer shrink-0 min-h-[40px]"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>A4 원본 실물 보기</span>
        </button>
      </div>

      {/* 2. Document Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-slate-100 text-xs text-slate-500">
          <span
            className="px-2.5 py-0.5 rounded font-mono font-bold text-white text-[10px]"
            style={{ backgroundColor: primaryColor }}
          >
            대외비 · 1:1 상담용
          </span>
          <span className="font-mono text-slate-400">문서번호: {docId}</span>
        </div>

        <span
          className="text-xs font-bold tracking-wide uppercase block mb-1"
          style={{ color: accentColor }}
        >
          대한민국 공무원 퇴직 생애설계 전문 진단 리포트
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug mb-3">
          공무원 소득 크레바스(Income Crevasse) 종합 진단 리포트
        </h2>

        {/* Client Profile Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">내담자</span>
            <strong className="text-slate-900 text-sm">
              {form.clientName || '내담자'}{' '}
              <span className="text-xs text-slate-600 font-normal">
                {[form.gender, form.rankPosition].filter(Boolean).length > 0 &&
                  `(${[form.gender, form.rankPosition].filter(Boolean).join(' · ')})`}
              </span>
            </strong>
          </div>
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60">
            <span className="text-slate-500 font-medium">연령 / 재직상태</span>
            <span className="text-slate-800 font-semibold">
              {form.currentAge ? `${form.currentAge}세` : '미입력'} / {form.employmentStatus || '재직중'}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60">
            <span className="text-slate-500 font-medium">퇴직 예정일</span>
            <span className="text-slate-800 font-semibold">
              {form.retirementDate || '미정'}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60">
            <span className="text-slate-500 font-medium">공무원연금 개시 예정일</span>
            <strong className="font-bold" style={{ color: accentColor }}>
              {form.pensionStartDate || '미정'}
            </strong>
          </div>
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 text-slate-500 text-[11px]">
            <span>상담일자: {todayStr}</span>
            <span>컨설턴트: 표성일 대표 (LCDS)</span>
          </div>
        </div>
      </div>

      {/* 3. Crevasse Timeline Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4" style={{ color: accentColor }} />
            <span>1. 소득 공백기(크레바스) 구간</span>
          </h3>
          <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
            예상 공백: {result.summary.gapPeriod}
          </span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-700">
            <span>① 퇴직 시점: <strong>{form.retirementDate || '미정'}</strong></span>
            <span>② 연금 개시: <strong>{form.pensionStartDate || '미정'}</strong></span>
          </div>
          <div
            className="p-3 rounded-lg text-white font-bold text-center shadow-xs"
            style={{ backgroundColor: primaryColor }}
          >
            <p className="text-sm">소득 공백기 (소득 크레바스 구간): {result.summary.gapPeriod}</p>
            <p className="text-[11px] font-normal opacity-90 mt-0.5">
              정규 급여 중단 ── [생활비 인출 및 가교소득 마련] ──▶ 공무원연금 개시
            </p>
          </div>
          <p className="text-[11px] text-rose-600 font-medium leading-tight">
            ※ 소득 공백기에는 생활비 방어와 함께 건강보험 임의계속가입(지역가입자 보험료 급증 방지) 신청을 반드시 사전에 챙기셔야 합니다.
          </p>
        </div>
      </div>

      {/* 4. Four Key Summary Diagnostics Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b pb-2 border-slate-100">
          <span
            className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
            style={{ backgroundColor: primaryColor }}
          >
            2
          </span>
          <span>내담자 맞춤 핵심 요약 진단</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-bold block mb-1">
              내담자 크레바스 유형
            </span>
            <strong className="text-slate-900 text-sm block">
              {result.summary.crevasseType}
            </strong>
            <span className="text-[11px] text-slate-500 mt-1 block">
              자산·부채·가족부담 및 근로의향 종합 유형
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-bold block mb-1">
              현재 핵심 과제
            </span>
            <strong className="text-slate-900 text-sm block">
              {result.summary.mainIssue}
            </strong>
            <span className="text-[11px] text-slate-500 mt-1 block">
              퇴직 전 가장 먼저 해결해야 할 최우선 과제
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-bold block mb-1">
              가장 큰 불확실성
            </span>
            <strong className="text-slate-900 text-sm block">
              {result.summary.majorUncertainty}
            </strong>
            <span className="text-[11px] text-slate-500 mt-1 block">
              현금흐름 변동 요인 및 심리적 위험
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-bold block mb-1">
              진단 신뢰도
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <strong className="text-slate-900 text-sm">
                {result.summary.confidence}
              </strong>
              <span
                className="text-[10px] px-2 py-0.5 rounded font-medium"
                style={{ backgroundColor: accentBg, color: accentText }}
              >
                상담 추천
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              입력 데이터 기반 구조화 분석
            </span>
          </div>
        </div>

        {result.situationSummary && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900 block mb-1">
              💡 내담자 눈높이 상황 해설
            </span>
            {result.situationSummary}
          </div>
        )}
      </div>

      {/* 5. Six Domains Evaluation Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b pb-2 border-slate-100">
          <span
            className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
            style={{ backgroundColor: primaryColor }}
          >
            3
          </span>
          <span>6대 핵심 영역 진단 현황 (준비도 vs 시급성)</span>
        </h3>

        <div className="space-y-3">
          {result.topics.map((topic, idx) => {
            const isUrgent = topic.urgencyScore >= 4;
            const isLowReadiness = topic.readinessScore <= 2;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    {idx + 1}. {topic.topic}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isUrgent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        시급성 높음
                      </span>
                    )}
                    {isLowReadiness && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        준비 필요
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500 block mb-0.5">준비도: {topic.readinessScore}/5</span>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(topic.readinessScore / 5) * 100}%`,
                          backgroundColor: primaryColor,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">시급성: {topic.urgencyScore}/5</span>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-rose-500"
                        style={{ width: `${(topic.urgencyScore / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed text-[11px]">
                  {topic.comment}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Top 3 Priorities Strategy */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b pb-2 border-slate-100">
          <span
            className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
            style={{ backgroundColor: primaryColor }}
          >
            4
          </span>
          <span>최우선 해결 과제 Top 3 전략 브리핑</span>
        </h3>

        <div className="space-y-3">
          {result.topPriorities.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span
                  className="px-2.5 py-0.5 rounded text-[11px] font-bold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  우선순위 {item.rank || idx + 1}
                </span>
                <span className="text-xs text-rose-600 font-bold">
                  집중 관리 과제
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {item.topic}
              </h4>
              <p className="text-slate-700 leading-relaxed text-xs">
                {item.reason}
              </p>
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                💡 상담 권고: 구체적인 실행 계획 및 가족과의 의사소통 필요
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Three-Step Reflection Questions (Interactive Mobile Accordion/Tabs) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between border-b pb-2 border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
            <span>5. 3단계 심층 자각 질문지 (Fact · Emotion · Action)</span>
          </h3>
        </div>

        <p className="text-xs text-slate-600">
          상담 전문가와 내담자가 함께 마주 앉아 깊이 있게 자각하고 성찰할 수 있는 3단계 질문입니다.
        </p>

        {/* Tab switcher for 3 reflection topics */}
        <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
          {result.reflectionQuestions.map((rq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveQuestionTab(idx)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                activeQuestionTab === idx
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              주제 {idx + 1}
            </button>
          ))}
        </div>

        {/* Active reflection question card */}
        {result.reflectionQuestions[activeQuestionTab] && (
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <span
              className="text-xs font-bold block"
              style={{ color: primaryColor }}
            >
              [자각 주제 {activeQuestionTab + 1}] {result.reflectionQuestions[activeQuestionTab].topic}
            </span>

            {/* Fact question */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
              <span
                className="text-[11px] font-bold block mb-1"
                style={{ color: primaryColor }}
              >
                ① 현실 인식 질문 (Fact & Finance)
              </span>
              <p className="text-slate-800 leading-relaxed font-medium">
                &ldquo;{result.reflectionQuestions[activeQuestionTab].realityQuestion}&rdquo;
              </p>
            </div>

            {/* Emotion question */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
              <span
                className="text-[11px] font-bold block mb-1"
                style={{ color: accentColor }}
              >
                ② 감정 · 의미 질문 (Emotion & Value)
              </span>
              <p className="text-slate-800 leading-relaxed font-medium">
                &ldquo;{result.reflectionQuestions[activeQuestionTab].emotionQuestion}&rdquo;
              </p>
            </div>

            {/* Action question */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
              <span className="text-[11px] font-bold text-emerald-800 block mb-1">
                ③ 행동 전환 질문 (Action & Habit)
              </span>
              <p className="text-slate-800 leading-relaxed font-medium">
                &ldquo;{result.reflectionQuestions[activeQuestionTab].actionQuestion}&rdquo;
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 8. Four-Step Action Roadmap */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b pb-2 border-slate-100">
          <span
            className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
            style={{ backgroundColor: primaryColor }}
          >
            6
          </span>
          <span>공무원 소득 크레바스 극복 4단계 액션 로드맵</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1.5">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded text-white block w-fit"
              style={{ backgroundColor: primaryColor }}
            >
              1단계: 점검
            </span>
            <h4 className="font-bold text-slate-900">퇴직 3년 전: 현금흐름 시뮬레이션</h4>
            <ul className="text-slate-600 text-[11px] space-y-1 list-disc pl-4">
              <li>공무원연금공단 예상연금액 및 개시월 공식 확인</li>
              <li>소득 크레바스 기간 월 필수 고정지출액 산출</li>
            </ul>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1.5">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded text-white block w-fit"
              style={{ backgroundColor: primaryColor }}
            >
              2단계: 방어
            </span>
            <h4 className="font-bold text-slate-900">퇴직 1년 전: 비상예비자금 및 건보료</h4>
            <ul className="text-slate-600 text-[11px] space-y-1 list-disc pl-4">
              <li>소득 공백기 최소 1~2년 치 생활비 MMF·CMA 확보</li>
              <li>건강보험 임의계속가입(지역가입자 폭탄 방지) 사전신청</li>
            </ul>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1.5">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded text-white block w-fit"
              style={{ backgroundColor: accentColor }}
            >
              3단계: 설계
            </span>
            <h4 className="font-bold text-slate-900">퇴직 6개월 전: 가교소득 및 파트타임</h4>
            <ul className="text-slate-600 text-[11px] space-y-1 list-disc pl-4">
              <li>전문성 연계 가교 일자리 및 사회공헌활동 탐색</li>
              <li>퇴직소득 IRP 계좌 이전 및 연금수령 절세전략</li>
            </ul>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1.5">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded text-white block w-fit"
              style={{ backgroundColor: accentColor }}
            >
              4단계: 실천
            </span>
            <h4 className="font-bold text-slate-900">퇴직 후 1년 내: 일상 재구조화</h4>
            <ul className="text-slate-600 text-[11px] space-y-1 list-disc pl-4">
              <li>배우자 및 가족과 주간 가계부·활동 시간표 공유</li>
              <li>신체활동 루틴 구축 및 분기별 재무점검</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 9. Signatures Card with Official Seal */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b pb-2 border-slate-100">
          상담 전문가 확인 및 공식 서명
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="border border-slate-300 p-3.5 rounded-xl bg-slate-50/50 text-center">
            <span className="text-[11px] text-slate-500 block mb-1">내담자 (확인)</span>
            <p className="font-bold text-slate-900 text-sm mb-3">
              {form.clientName || '내담자'} (서명 또는 인)
            </p>
            <div className="border-b border-dashed border-slate-400 w-32 mx-auto" />
          </div>

          <div className="border border-slate-300 p-3.5 rounded-xl bg-slate-50/50 text-center relative overflow-hidden">
            <span className="text-[11px] text-slate-500 block mb-1">컨설팅 주관 (상담 전문가)</span>
            <p className="font-bold text-slate-900 text-sm mb-3">
              표성일 대표 / Career Captain Pyo (인)
            </p>
            <div className="border-b border-dashed border-slate-400 w-32 mx-auto" />

            {/* Seal Graphic */}
            <div
              className="absolute right-4 top-3 w-12 h-12 rounded-full border-2 border-dashed flex flex-col items-center justify-center rotate-12 opacity-90 select-none pointer-events-none"
              style={{ borderColor: sealColor, color: sealColor }}
            >
              <span className="text-[8px] font-black leading-none">LCDS</span>
              <span className="text-[10px] font-black leading-tight">표성일</span>
              <span className="text-[7px] font-bold leading-none">印</span>
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <p className="font-bold text-slate-700">
            © 2026 라이프 앤 커리어 디자인 스쿨 (Life & Career Design School) - Career Captain Pyo
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            본 진단 리포트는 공무원의 건강한 퇴직 후 생애설계를 돕기 위한 1:1 전문 대화 촉진용 문서입니다.
          </p>
        </div>
      </div>

      {/* 10. Sticky Bottom Actions on Mobile */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-300 shadow-xl space-y-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isGeneratingPdf}
            style={{ backgroundColor: primaryColor }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer min-h-[44px]"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>A4 PDF 생성 중...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>📄 공식 2쪽 A4 PDF 다운로드</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onDownloadHtml}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all cursor-pointer min-h-[44px]"
          >
            <FileCode className="w-4 h-4 text-emerald-700" />
            <span>🌐 HTML 파일 다운로드</span>
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 text-xs">
          <button
            type="button"
            onClick={onPrint}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer min-h-[38px]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>브라우저 인쇄창</span>
          </button>
          <button
            type="button"
            onClick={onSwitchToA4Fit}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer min-h-[38px]"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>A4 원본 실물보기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
