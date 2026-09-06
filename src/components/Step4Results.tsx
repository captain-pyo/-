import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle,
  ArrowRight,
  MessageCircle,
  Compass,
  Heart,
  Zap,
} from 'lucide-react';
import { DiagnosisResult, ConsultationForm } from '../types';

interface Step4ResultsProps {
  result: DiagnosisResult;
  form: ConsultationForm;
  onViewReport: () => void;
  onEditInputs: () => void;
  onReset: () => void;
}

export const Step4Results: React.FC<Step4ResultsProps> = ({
  result,
  form,
  onViewReport,
  onEditInputs,
  onReset,
}) => {
  const [expandedTopicIdx, setExpandedTopicIdx] = useState<number | null>(0);

  const toggleTopic = (idx: number) => {
    setExpandedTopicIdx(expandedTopicIdx === idx ? null : idx);
  };

  const renderScoreBadge = (score: number | null, type: 'readiness' | 'urgency') => {
    if (score === null || score === 0 || score === undefined) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
          판단 보류
        </span>
      );
    }

    if (type === 'readiness') {
      const labels = ['', '준비없음', '관심단계', '부분준비', '상당준비', '충분준비'];
      const bg =
        score <= 2
          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
          : score === 3
          ? 'bg-slate-800 text-slate-300 border-slate-700'
          : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 font-bold';
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${bg}`}>
          <span>{score}점</span>
          <span className="text-[11px] font-normal opacity-85">({labels[score]})</span>
        </span>
      );
    } else {
      const labels = ['', '낮음', '보통', '중요', '시급', '최우선'];
      const bg =
        score >= 4
          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]'
          : score === 3
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          : 'bg-slate-800 text-slate-400 border-slate-700';
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${bg}`}>
          <span>{score}점</span>
          <span className="text-[11px] font-normal opacity-85">({labels[score]})</span>
        </span>
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              STEP 04 RESULT
            </span>
            <span className="text-xs text-slate-400">
              내담자: <strong className="text-white">{form.clientName || '공무원 내담자'}</strong>{form.gender ? ` (${form.gender})` : ''}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            소득 크레바스 종합 진단 및 전략 분석
          </h2>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={onEditInputs}
            className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors cursor-pointer text-center min-h-[42px] flex items-center justify-center"
          >
            입력정보 수정
          </button>
          <button
            type="button"
            id="btn-go-to-report-top"
            onClick={onViewReport}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-slate-950 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer min-h-[42px]"
          >
            <FileText className="w-4 h-4 text-slate-950" />
            <span>상담 리포트 보기 (5단계)</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
          </button>
        </div>
      </div>

      {/* 1. 한눈에 보는 진단 카드 */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm sm:text-base font-extrabold tracking-tight">
              1. 한눈에 보는 진단 요약
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            신뢰도: <strong className="text-cyan-300 font-bold">{result.summary.confidence}</strong>
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 소득 공백기간 */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-1">
              예상 소득 크레바스 기간
            </span>
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-cyan-400 shrink-0" />
              <p className="text-xl sm:text-2xl font-extrabold text-white">
                {result.summary.gapPeriod}
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              * 퇴직 시점부터 공무원연금 수령 개시 전까지의 무소득(또는 소득 급감) 구간입니다.
            </p>
          </div>

          {/* 크레바스 유형 */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
              내담자 맞춤 크레바스 유형
            </span>
            <p className="text-xl sm:text-2xl font-extrabold text-cyan-300">
              {result.summary.crevasseType}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              내담자의 자산, 퇴직금, 생활비, 가족부담 및 근로의향을 종합한 유형입니다.
            </p>
          </div>

          {/* 현재 핵심 과제 */}
          <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs font-bold text-cyan-400 block mb-1.5">
              현재 핵심 과제
            </span>
            <p className="text-sm font-medium text-slate-200 leading-relaxed">
              {result.summary.mainIssue}
            </p>
          </div>

          {/* 가장 큰 불확실성 */}
          <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs font-bold text-amber-400 block mb-1.5">
              가장 큰 불확실성
            </span>
            <p className="text-sm font-medium text-slate-200 leading-relaxed">
              {result.summary.majorUncertainty}
            </p>
          </div>
        </div>

        {result.situationSummary && (
          <div className="px-6 pb-6 pt-1 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-400 block mb-2">
              상황 요약 (내담자 눈높이 해설)
            </span>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              {result.situationSummary}
            </p>
          </div>
        )}
      </div>

      {/* 4. Top 3 상담 주제 강조 영역 */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-6 backdrop-blur-md">
        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base sm:text-lg font-extrabold text-white">
            가장 시급한 상담 주제 Top 3
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {result.topPriorities.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-950/70 hover:bg-slate-950 rounded-xl border border-slate-800 hover:border-cyan-500/40 p-5 transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold flex items-center justify-center">
                  0{item.rank || idx + 1}
                </span>
                <h4 className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                  {item.topic}
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {item.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. 자각 질문 카드 (상담사용 3단계 질문지) */}
      <div className="bg-slate-900/90 rounded-2xl border-2 border-cyan-500/40 shadow-2xl p-6 sm:p-8 backdrop-blur-md">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <MessageCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base sm:text-lg font-extrabold text-white">
              상담사용 3단계 자각 질문지 (Fact · Emotion · Action)
            </h3>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            * 평가나 추궁 없이 편안한 톤으로 읽어주세요
          </span>
        </div>

        <div className="space-y-6">
          {result.reflectionQuestions.map((q, idx) => (
            <div
              key={idx}
              className="bg-slate-950/70 rounded-xl border border-slate-800 p-5"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <span className="px-3 py-0.5 text-xs font-mono font-bold rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  TOPIC {idx + 1}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  {q.topic}
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {/* 현실 인식 질문 (Fact) */}
                <div className="bg-slate-900/90 p-4 rounded-xl border border-cyan-500/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-1.5">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <span>현실 인식 질문 (Fact · 객관화)</span>
                  </div>
                  <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed pl-1">
                    &ldquo;{q.realityQuestion}&rdquo;
                  </p>
                </div>

                {/* 감정·의미 질문 (Emotion) */}
                <div className="bg-slate-900/90 p-4 rounded-xl border border-amber-500/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1.5">
                    <Heart className="w-4 h-4 text-amber-400" />
                    <span>감정·의미 질문 (Emotion · 불안 및 가치 자각)</span>
                  </div>
                  <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed pl-1">
                    &ldquo;{q.emotionQuestion}&rdquo;
                  </p>
                </div>

                {/* 행동 전환 질문 (Action) */}
                <div className="bg-slate-900/90 p-4 rounded-xl border border-blue-500/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400 mb-1.5">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span>행동 전환 질문 (Action · 구체적 실행 연결)</span>
                  </div>
                  <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed pl-1">
                    &ldquo;{q.actionQuestion}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. 준비도 대시보드 (테이블 형태) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              2. 6대 극복 영역별 준비도 및 시급성 대시보드
            </h3>
            <p className="text-xs text-slate-400">
              준비도와 시급성을 종합하여 상담 우선순위를 판단합니다.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-300">
                <th className="py-3 px-4 font-semibold">극복 주제</th>
                <th className="py-3 px-4 font-semibold text-center w-28">현재 준비도</th>
                <th className="py-3 px-4 font-semibold text-center w-28">상담 시급성</th>
                <th className="py-3 px-4 font-semibold hidden md:table-cell">첫 실행 행동</th>
                <th className="py-3 px-4 font-semibold text-right w-20">상세</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {result.topics.map((topic, idx) => (
                <tr
                  key={idx}
                  onClick={() => toggleTopic(idx)}
                  className="hover:bg-slate-850/60 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-medium text-white">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-slate-800 text-cyan-400 border border-slate-700 text-xs flex items-center justify-center shrink-0 font-mono font-bold">
                        {idx + 1}
                      </span>
                      <span>{topic.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {renderScoreBadge(topic.readinessScore, 'readiness')}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {renderScoreBadge(topic.urgencyScore, 'urgency')}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-300 hidden md:table-cell truncate max-w-xs">
                    {topic.firstAction}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      className="text-xs text-slate-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
                    >
                      {expandedTopicIdx === idx ? '닫기' : '보기'}
                      {expandedTopicIdx === idx ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. 주제 상세 카드 (아코디언 형태) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white">
              3. 극복 주제별 심층 분석 및 실행 가이드
            </h3>
            <p className="text-xs text-slate-400">
              각 주제를 클릭하면 왜 중요한지, 구체적 실행방향, 방치 시 리스크 및 첫 행동을 확인할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {result.topics.map((topic, idx) => {
            const isExpanded = expandedTopicIdx === idx;
            return (
              <div
                key={idx}
                className="border border-slate-800 rounded-xl overflow-hidden transition-all bg-slate-950/60"
              >
                <button
                  type="button"
                  onClick={() => toggleTopic(idx)}
                  className="w-full px-5 py-4 bg-slate-950/80 hover:bg-slate-900 flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white">
                      {topic.name}
                    </span>
                    <div className="hidden sm:flex items-center gap-2">
                      {renderScoreBadge(topic.readinessScore, 'readiness')}
                      {renderScoreBadge(topic.urgencyScore, 'urgency')}
                    </div>
                  </div>
                  <div className="text-slate-400">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-5 bg-slate-900/90 border-t border-slate-800 space-y-4 text-xs sm:text-sm">
                    {/* 왜 중요한가 */}
                    <div>
                      <span className="font-bold text-cyan-300 block mb-1.5">
                        ① 왜 이 내담자에게 중요한가? (입력 근거)
                      </span>
                      <p className="text-slate-300 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                        {topic.reason}
                      </p>
                    </div>

                    {/* 실행방향 2~3개 */}
                    <div>
                      <span className="font-bold text-cyan-300 block mb-1.5">
                        ② 구체적 실행방향
                      </span>
                      <ul className="space-y-1.5 pl-1">
                        {topic.actions.map((act, aIdx) => (
                          <li key={aIdx} className="flex items-start gap-2 text-slate-300">
                            <span className="text-cyan-400 font-bold">•</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* 방치 시 리스크 */}
                      <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl">
                        <span className="font-bold text-rose-300 block mb-1 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                          ③ 방치 시 예상 리스크
                        </span>
                        <p className="text-rose-200 text-xs leading-relaxed">
                          {topic.risk}
                        </p>
                      </div>

                      {/* 가장 먼저 해볼 작은 행동 */}
                      <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-xl">
                        <span className="font-bold text-cyan-300 block mb-1 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                          ④ 가장 먼저 해볼 작은 행동 (첫 발자국)
                        </span>
                        <p className="text-cyan-100 font-medium text-xs leading-relaxed">
                          {topic.firstAction}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. 상담 진행 가이드 */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-6 backdrop-blur-md">
        <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-slate-800">
          <Compass className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base sm:text-lg font-extrabold text-white">
            6. 표준 상담 진행 4단계 가이드
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          내담자의 대화 분위기와 반응에 따라 유연하게 순서를 조율할 수 있습니다.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {result.counselingGuide.map((step, idx) => (
            <div
              key={idx}
              className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex items-start gap-2.5"
            >
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-xs font-medium text-slate-200 leading-normal">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 7. 진단 신뢰도 및 추가 확인사항 */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              7. 진단 신뢰도 및 추가 확인 필요사항
            </h3>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
            진단 신뢰도: <span className="text-cyan-300 font-bold">{result.summary.confidence}</span>
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed">
          {result.summary.confidenceReason}
        </p>

        {result.additionalInformationNeeded?.length > 0 && (
          <div>
            <span className="text-xs font-bold text-cyan-400 block mb-2">
              다음 상담 시 추가 확인하면 좋은 정보:
            </span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              {result.additionalInformationNeeded.map((info, idx) => (
                <li key={idx} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span>{info}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-800">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={onEditInputs}
            className="flex-1 sm:flex-none px-4 py-3 text-sm font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors cursor-pointer text-center min-h-[44px] flex items-center justify-center"
          >
            ← 입력정보 수정
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex-1 sm:flex-none px-4 py-3 text-sm font-medium text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors cursor-pointer text-center min-h-[44px] flex items-center justify-center"
          >
            새로운 상담 시작
          </button>
        </div>

        <button
          type="button"
          id="btn-go-to-report"
          onClick={onViewReport}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all text-sm sm:text-base cursor-pointer min-h-[44px]"
        >
          <FileText className="w-5 h-5 text-slate-950" />
          <span>상담 리포트 보기 (5단계)</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>
    </div>
  );
};
