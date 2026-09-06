import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Printer,
  RotateCcw,
  ArrowLeft,
  Edit3,
  Loader2,
  CheckCircle2,
  Download,
  FileCode,
  AlertCircle,
  HelpCircle,
  Award,
  Layers,
  Calendar,
  User,
  Clock,
  FileText,
  TrendingDown,
  ShieldCheck,
  CheckSquare,
  Sparkles,
  PhoneCall,
  ExternalLink,
  ChevronRight,
  Info,
  Brain,
  Quote,
  MessageCircleQuestion,
  Lightbulb,
  HeartHandshake
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FormState, DiagnosisResult } from '../types';
import {
  CREVASSE_CATEGORIES,
  calculateCrevassePeriod,
  calculateMonthlyGap,
  calculateTotalCrevasseShortfall,
  generateAIPrompt,
  getPriorityCategoryLabel,
  PENSION_START_AGES
} from '../utils/crevasseLogic';

interface Props {
  data: FormState;
  result: DiagnosisResult | null;
  onReset: () => void;
  onBackToEdit: () => void;
  onRecalculate?: () => void;
  isLoading?: boolean;
}

export const Step5Report: React.FC<Props> = ({
  data,
  result,
  onReset,
  onBackToEdit,
  onRecalculate,
  isLoading = false
}) => {
  const [counselorName, setCounselorName] = useState('전문 은퇴설계 상담관');
  const [counselorOrg, setCounselorOrg] = useState('공무원 연금·은퇴설계 연구센터');
  const [counselorNote, setCounselorNote] = useState(
    '귀하의 소득 크레바스 진단 결과, 조기 지출 구조조정 및 소득 공백기 전용 비상예비자금 확보가 최우선 실행 과제입니다. 2차 심층 재무 대면 설계를 적극 권장합니다.'
  );
  const [customGoal, setCustomGoal] = useState('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showCounselorModal, setShowCounselorModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const reportContainerRef = useRef<HTMLDivElement>(null);
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);

  const currentDateStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}년 ${String(d.getMonth() + 1).padStart(2, '0')}월 ${String(d.getDate()).padStart(2, '0')}일`;
  }, []);

  const crevasseYears = useMemo(() => calculateCrevassePeriod(data.birthYear, data.retirementAge), [data.birthYear, data.retirementAge]);
  const pensionAge = useMemo(() => {
    if (data.birthYear <= 1952) return 60;
    if (data.birthYear <= 1956) return 61;
    if (data.birthYear <= 1960) return 62;
    if (data.birthYear <= 1964) return 63;
    if (data.birthYear <= 1968) return 64;
    return 65;
  }, [data.birthYear]);

  const monthlyGap = useMemo(() => calculateMonthlyGap(data.targetLivingCost, data.bridgeIncome), [data.targetLivingCost, data.bridgeIncome]);
  const totalShortfall = useMemo(() => calculateTotalCrevasseShortfall(monthlyGap, crevasseYears), [monthlyGap, crevasseYears]);

  const finalChecklists = useMemo(() => {
    const base = result?.actionChecklist || [];
    if (base.length > 0) return base;
    return [
      { id: '1', title: '퇴직 전 고정지출 20% 긴급 감축 계획 수립', category: '재무', urgency: '즉시 실행' },
      { id: '2', title: '크레바스 공백기 징검다리 일자리(월 150만 목표) 탐색', category: '일/경력', urgency: '퇴직 1년 전' },
      { id: '3', title: '국민건강보험 피부양자 유지 또는 임의계속가입 사전 비교', category: '건강/제도', urgency: '퇴직 6개월 전' },
      { id: '4', title: '부부 공동 지출 합의 및 은퇴 후 생활비 분담 규칙 정립', category: '가족/관계', urgency: '상시' }
    ];
  }, [result?.actionChecklist]);

  const sortedCategories = useMemo(() => {
    const list = [...CREVASSE_CATEGORIES];
    return list.map(cat => {
      const isPriority = result?.priorityCategories?.includes(cat.id);
      return {
        ...cat,
        isPriority,
        riskScore: isPriority ? 85 : 45
      };
    }).sort((a, b) => (b.isPriority ? 1 : 0) - (a.isPriority ? 1 : 0));
  }, [result?.priorityCategories]);

  // 브라우저 기본 인쇄 (완벽한 2장 A4 강제)
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
  };

  // 고화질 PDF 2장 다운로드
  const handleDownloadPdf = async () => {
    if (!page1Ref.current || !page2Ref.current) return;
    setIsDownloadingPdf(true);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const a4Width = 210;
      const a4Height = 297;

      const canvasOptions = {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      };

      const canvas1 = await html2canvas(page1Ref.current, canvasOptions);
      const canvas2 = await html2canvas(page2Ref.current, canvasOptions);

      // 1쪽 추가 (A4 규격에 1:1 완벽 정합)
      const img1 = canvas1.toDataURL('image/jpeg', 0.98);
      pdf.addImage(img1, 'JPEG', 0, 0, a4Width, a4Height, undefined, 'FAST');

      // 2쪽 추가 (A4 규격에 1:1 완벽 정합)
      pdf.addPage();
      const img2 = canvas2.toDataURL('image/jpeg', 0.98);
      pdf.addImage(img2, 'JPEG', 0, 0, a4Width, a4Height, undefined, 'FAST');

      // 총 페이지 수를 엄격히 2페이지로 고정
      while (pdf.getNumberOfPages() > 2) {
        pdf.deletePage(pdf.getNumberOfPages());
      }

      pdf.save(`소득크레바스_상담진단보고서_${data.name || '공무원'}_${new Date().toISOString().slice(0, 10)}.pdf`);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('PDF 생성 실패:', err);
      alert('PDF 생성 중 오류가 발생했습니다. 브라우저 인쇄(Ctrl+P) 기능을 이용해주세요.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleCopyPrompt = () => {
    const prompt = generateAIPrompt(data, result);
    navigator.clipboard.writeText(prompt);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-16">
      {/* 상단 컨트롤 바 (인쇄 시 숨김) */}
      <div className="no-print bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToEdit}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            진단 수정
          </button>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              최종 종합 진단 보고서 (총 2페이지)
            </h2>
            <p className="text-xs text-slate-400">
              A4 규격(210×297mm) 2장 정합 완료 • 인쇄 시 빈 페이지 발생 없음
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowCounselorModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition border border-slate-700"
          >
            <Edit3 className="w-4 h-4 text-cyan-400" />
            상담관 소견 입력
          </button>
          <button
            onClick={handleCopyPrompt}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition border border-slate-700"
          >
            <FileCode className="w-4 h-4 text-emerald-400" />
            {copySuccess ? '복사 완료!' : 'AI 프롬프트 복사'}
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {isDownloadingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : downloadSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            PDF 파일 다운로드
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-xl transition shadow-lg shadow-cyan-500/25"
          >
            <Printer className="w-4 h-4" />
            인쇄 / PDF 저장 (Ctrl+P)
          </button>
        </div>
      </div>

      {/* 상담관 입력 모달 */}
      {showCounselorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 no-print">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-cyan-400" />
              상담관 정보 및 종합 소견 수정
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-slate-400 mb-1">상담관 성명</label>
                <input
                  type="text"
                  value={counselorName}
                  onChange={(e) => setCounselorName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">소속 기관 / 부서</label>
                <input
                  type="text"
                  value={counselorOrg}
                  onChange={(e) => setCounselorOrg(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">상담관 종합 소견 및 권고사항</label>
                <textarea
                  rows={4}
                  value={counselorNote}
                  onChange={(e) => setCounselorNote(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCounselorModal(false)}
                className="px-4 py-2 text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl"
              >
                보고서에 반영 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 보고서 출력 본체 (인쇄 루트) */}
      <div id="report-print-root" ref={reportContainerRef} className="flex flex-col items-center gap-8 print:block print:w-full print:m-0 print:p-0">
        
        {/* ==========================================
            제 1 페이지 (기본현황 + 크레바스 다영역 진단)
            ========================================== */}
        <div className="print-page-wrapper w-full flex justify-center">
          <div
            id="report-page-1"
            ref={page1Ref}
            className="bg-white text-slate-900 w-[210mm] h-[297mm] max-h-[297mm] print:h-[295mm] print:max-h-[295mm] p-[12mm] pb-[8mm] flex flex-col justify-between shadow-2xl print:shadow-none box-border relative overflow-hidden"
          >
            {/* 상단 헤더 */}
            <div>
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded tracking-wider">
                      상담 진단 보고서
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold tracking-wider">
                      [ 제 1 쪽 / 총 2 쪽 ]
                    </span>
                  </div>
                  <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-1">
                    공무원 소득 크레바스 다영역 정밀 진단서
                  </h1>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800">{counselorOrg}</div>
                  <div className="text-[11px] text-slate-500">진단일자: {currentDateStr}</div>
                </div>
              </div>

              {/* 1. 기본 인적 및 재무 크레바스 개요 */}
              <div className="mt-3.5 bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-xs font-black text-slate-800 mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-600" />
                  기본 인적사항 및 은퇴 일정
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-white border border-slate-200 rounded p-2">
                    <div className="text-[10px] text-slate-500">성명 / 성별</div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">
                      {data.name || '미입력'} ({data.gender === 'female' ? '여' : '남'})
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded p-2">
                    <div className="text-[10px] text-slate-500">출생 / 퇴직예정</div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">
                      {data.birthYear}년생 ({data.retirementAge}세)
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded p-2">
                    <div className="text-[10px] text-slate-500">연금 개시 연령</div>
                    <div className="text-xs font-bold text-blue-600 mt-0.5">
                      만 {pensionAge}세 개시
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded p-2">
                    <div className="text-[10px] text-red-600 font-bold">소득 공백 기간</div>
                    <div className="text-xs font-black text-red-700 mt-0.5">
                      {crevasseYears}년 ({crevasseYears * 12}개월)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                  <div className="bg-white border border-slate-200 rounded p-2">
                    <div className="text-[10px] text-slate-500">퇴직 후 희망 생활비</div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">
                      월 {data.targetLivingCost}만 원
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded p-2">
                    <div className="text-[10px] text-slate-500">공백기 예상 가교소득</div>
                    <div className="text-xs font-bold text-emerald-600 mt-0.5">
                      월 {data.bridgeIncome}만 원
                    </div>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 rounded p-2">
                    <div className="text-[10px] text-rose-600 font-bold">총 예상 부족액 (단순 누적)</div>
                    <div className="text-xs font-black text-rose-700 mt-0.5">
                      약 {totalShortfall > 0 ? `${Math.round(totalShortfall / 10000)}억 ${(totalShortfall % 10000).toLocaleString()}만` : '0'} 원
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. 6대 영역별 크레바스 위험도 평가 */}
              <div className="mt-3.5">
                <div className="text-xs font-black text-slate-900 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-600" />
                    6대 생활설계 네트워크 크레바스 다영역 진단표
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    * AI 연계 심층 복합 취약도 분석
                  </span>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden text-left">
                  <table className="w-full text-[11px]">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                      <tr>
                        <th className="py-1.5 px-3 w-[18%]">진단 영역</th>
                        <th className="py-1.5 px-3 w-[15%] text-center">집중관리</th>
                        <th className="py-1.5 px-3 w-[37%]">주요 잠재 리스크</th>
                        <th className="py-1.5 px-3 w-[30%]">핵심 처방 및 권고</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {sortedCategories.map((cat, idx) => (
                        <tr key={cat.id} className={cat.isPriority ? 'bg-amber-50/60 font-medium' : 'bg-white'}>
                          <td className="py-1.5 px-3 font-bold text-slate-900">
                            {cat.title}
                          </td>
                          <td className="py-1.5 px-3 text-center">
                            {cat.isPriority ? (
                              <span className="inline-block bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                최우선
                              </span>
                            ) : (
                              <span className="inline-block bg-slate-200 text-slate-600 text-[9px] px-1.5 py-0.5 rounded">
                                일반
                              </span>
                            )}
                          </td>
                          <td className="py-1.5 px-3 text-slate-600">
                            {cat.summary}
                          </td>
                          <td className="py-1.5 px-3 text-slate-800">
                            {cat.questions[0]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. AI 기반 종합 진단평 및 핵심 요약 */}
              <div className="mt-3.5 bg-cyan-50/50 border border-cyan-200 rounded-lg p-3">
                <div className="text-xs font-black text-cyan-950 mb-1 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-cyan-600" />
                  AI 기반 종합 위험 평가 및 진단 소견
                </div>
                <p className="text-[11px] leading-relaxed text-slate-700 text-justify">
                  {result?.overallReview ||
                    `귀하는 퇴직 후 연금 수령까지 총 ${crevasseYears}년간의 소득 공백(월 약 ${monthlyGap}만 원)이 발생할 것으로 예상됩니다. 특히 재무적 충격뿐 아니라 퇴직 후 사회적 고립감, 직업 정체성 상실 등의 비재무적 크레바스가 복합적으로 작용할 수 있으므로 조기 대처가 시급합니다.`}
                </p>
              </div>
            </div>

            {/* 제 1쪽 하단 푸터 */}
            <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-[10px] text-slate-400">
              <div>공무원 소득 크레바스 진단 상담 도우미 시스템</div>
              <div className="font-bold text-slate-600">제 1 쪽 (계속 ➔ 2쪽)</div>
            </div>
          </div>
        </div>

        {/* ==========================================
            제 2 페이지 (자각질문 3단계 + 실행 로드맵)
            ========================================== */}
        <div className="print-page-wrapper w-full flex justify-center">
          <div
            id="report-page-2"
            ref={page2Ref}
            className="bg-white text-slate-900 w-[210mm] h-[297mm] max-h-[297mm] print:h-[295mm] print:max-h-[295mm] p-[12mm] pb-[8mm] flex flex-col justify-between shadow-2xl print:shadow-none box-border relative overflow-hidden"
          >
            <div>
              {/* 상단 헤더 */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded tracking-wider">
                      실행 및 상담 연계
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold tracking-wider">
                      [ 제 2 쪽 / 총 2 쪽 ]
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-950 tracking-tight mt-1">
                    3단계 자기자각 질문 및 맞춤형 실행 로드맵
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800">{data.name || '공무원'} 귀하</div>
                  <div className="text-[11px] text-slate-500">진단결과 연계표</div>
                </div>
              </div>

              {/* 1. 3대 우선순위 자각 질문 */}
              <div className="mt-3.5">
                <div className="text-xs font-black text-slate-900 mb-2 flex items-center gap-1.5">
                  <MessageCircleQuestion className="w-3.5 h-3.5 text-blue-600" />
                  퇴직 전 스스로에게 던져야 할 3대 심층 자각 질문
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {/* 질문 1: 현실 인식 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
                    <div>
                      <span className="inline-block bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded mb-1.5">
                        1단계: 현실 인식
                      </span>
                      <h4 className="text-[11px] font-bold text-slate-900 mb-1">
                        "실제 숫자로 마주한 나의 공백은 얼마인가?"
                      </h4>
                      <p className="text-[10px] text-slate-600 leading-relaxed">
                        막연한 낙관을 버리고, ${crevasseYears}년간 총 약 ${Math.round(totalShortfall / 10000)}억 원의 누적 부족액을 어떤 자산으로 메울 것인지 수치로 직면해야 합니다.
                      </p>
                    </div>
                    <div className="mt-2 text-[9px] text-blue-700 bg-blue-50 p-1.5 rounded font-medium">
                      점검: 고정비 감축안 & 비상예비자금
                    </div>
                  </div>

                  {/* 질문 2: 감정과 의미 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
                    <div>
                      <span className="inline-block bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded mb-1.5">
                        2단계: 감정과 의미
                      </span>
                      <h4 className="text-[11px] font-bold text-slate-900 mb-1">
                        "직함을 벗은 나는 매일 아침 어디로 갈 것인가?"
                      </h4>
                      <p className="text-[10px] text-slate-600 leading-relaxed">
                        공무원이라는 사회적 위치가 사라졌을 때 찾아올 상실감을 수용하고, 나만의 하루 시간표와 존엄성을 지킬 활동을 마련해야 합니다.
                      </p>
                    </div>
                    <div className="mt-2 text-[9px] text-purple-700 bg-purple-50 p-1.5 rounded font-medium">
                      점검: 평일 루틴 & 가족과의 소통
                    </div>
                  </div>

                  {/* 질문 3: 행동 전환 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
                    <div>
                      <span className="inline-block bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded mb-1.5">
                        3단계: 행동 전환
                      </span>
                      <h4 className="text-[11px] font-bold text-slate-900 mb-1">
                        "이번 달 내가 즉시 시작할 작은 변화는 무엇인가?"
                      </h4>
                      <p className="text-[10px] text-slate-600 leading-relaxed">
                        퇴직 직전이 아닌 지금 당장 가계부 고정지출 10% 다이어트와 건강보험 피부양자 자격 점검 등 구체적 1보를 내딛어야 합니다.
                      </p>
                    </div>
                    <div className="mt-2 text-[9px] text-emerald-700 bg-emerald-50 p-1.5 rounded font-medium">
                      점검: 당월 실천 과제 즉각 등록
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. 단계별 맞춤 실행 체크리스트 */}
              <div className="mt-3.5">
                <div className="text-xs font-black text-slate-900 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-cyan-600" />
                    단계별 권고 실천 로드맵 (체크리스트)
                  </span>
                </div>
                <div className="space-y-1.5">
                  {finalChecklists.slice(0, 4).map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/70"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded border border-slate-400 bg-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                          {index + 1}
                        </div>
                        <span className="text-xs font-semibold text-slate-800">
                          {item.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-bold text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded">
                          {item.urgency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. 전문 상담관 최종 소견 */}
              <div className="mt-3.5 bg-slate-50 border border-slate-300 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    전문 상담관 종합 소견 및 권고사항
                  </span>
                  <span className="text-[11px] font-bold text-slate-700">
                    상담관: {counselorName} (서명 / 인)
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-700 bg-white border border-slate-200 rounded p-2.5 text-justify">
                  {counselorNote}
                </p>
              </div>

              {/* 4. 유관기관 상담 및 지원 창구 안내 */}
              <div className="mt-3 bg-slate-100/70 border border-slate-200 rounded-lg p-2.5">
                <div className="text-[10px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <PhoneCall className="w-3 h-3 text-slate-500" />
                  주요 공무원 퇴직 지원 및 연금 상담 창구
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-600 text-center">
                  <div className="bg-white p-1 rounded border border-slate-200">
                    공무원연금공단 콜센터 <span className="font-bold text-slate-800">1588-4321</span>
                  </div>
                  <div className="bg-white p-1 rounded border border-slate-200">
                    국민건강보험공단 <span className="font-bold text-slate-800">1577-1000</span>
                  </div>
                  <div className="bg-white p-1 rounded border border-slate-200">
                    신중년 일자리 희망센터 <span className="font-bold text-slate-800">1350</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 제 2쪽 하단 푸터 */}
            <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-[10px] text-slate-400">
              <div>본 보고서는 공무원 은퇴설계 상담 지원 목적으로 작성되었습니다.</div>
              <div className="font-bold text-slate-900">제 2 쪽 (최종) [끝]</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
