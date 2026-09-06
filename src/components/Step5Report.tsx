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
  Smartphone,
  Monitor,
  Maximize2,
  ZoomIn,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { DiagnosisResult, ConsultationForm } from '../types';
import { MobileReadingView } from './MobileReadingView';

interface Step5ReportProps {
  result: DiagnosisResult;
  form: ConsultationForm;
  onBackToResult: () => void;
  onEditInputs: () => void;
  onReset: () => void;
}

// 3 Professional Consulting Styles
type ReportTemplate = 'executive-navy' | 'heritage-green' | 'modern-cobalt';

interface TemplateConfig {
  id: ReportTemplate;
  name: string;
  badge: string;
  primary: string;
  primaryBg: string;
  secondaryBg: string;
  cardBg: string;
  cardBorder: string;
  headerBorder: string;
  accent: string;
  accentBg: string;
  accentText: string;
  badgeBg: string;
  tableHeadBg: string;
  tableHeadText: string;
  sealColor: string;
}

const TEMPLATES: Record<ReportTemplate, TemplateConfig> = {
  'executive-navy': {
    id: 'executive-navy',
    name: '신뢰의 네이비 (공공·행정 기관 표준형)',
    badge: '정부·공공 표준',
    primary: '#0f2942', // Deep Navy
    primaryBg: '#f8fafc',
    secondaryBg: '#f1f5f9',
    cardBg: '#ffffff',
    cardBorder: '#cbd5e1',
    headerBorder: '#0f2942',
    accent: '#0284c7', // Sky Blue accent
    accentBg: '#e0f2fe',
    accentText: '#0369a1',
    badgeBg: '#0f2942',
    tableHeadBg: '#1e293b',
    tableHeadText: '#ffffff',
    sealColor: '#0f2942',
  },
  'heritage-green': {
    id: 'heritage-green',
    name: '안정의 세이지 그린 (연금·복지 전문형)',
    badge: '연금·복지 특화',
    primary: '#144133', // Deep Forest Pine
    primaryBg: '#f6f9f7',
    secondaryBg: '#edf4f0',
    cardBg: '#ffffff',
    cardBorder: '#cbdcd4',
    headerBorder: '#144133',
    accent: '#15803d', // Rich Emerald
    accentBg: '#dcfce7',
    accentText: '#166534',
    badgeBg: '#144133',
    tableHeadBg: '#193f33',
    tableHeadText: '#ffffff',
    sealColor: '#144133',
  },
  'modern-cobalt': {
    id: 'modern-cobalt',
    name: '품격의 코발트 (프리미엄 금융·경영형)',
    badge: '프리미엄 자산',
    primary: '#1e1b4b', // Deep Indigo Slate
    primaryBg: '#faf5ff',
    secondaryBg: '#f3e8ff',
    cardBg: '#ffffff',
    cardBorder: '#d8b4fe',
    headerBorder: '#4338ca',
    accent: '#6366f1', // Indigo Accent
    accentBg: '#ede9fe',
    accentText: '#4338ca',
    badgeBg: '#312e81',
    tableHeadBg: '#2e1065',
    tableHeadText: '#ffffff',
    sealColor: '#312e81',
  },
};

export const Step5Report: React.FC<Step5ReportProps> = ({
  result,
  form,
  onBackToResult,
  onEditInputs,
  onReset,
}) => {
  // Report view modes: 'print-preview' (A4 2-page fixed) vs 'mobile-reading' (responsive flow)
  const [viewMode, setViewMode] = useState<'print' | 'mobile'>('print');
  const [template, setTemplate] = useState<ReportTemplate>('executive-navy');
  const [isCounselorOpen, setIsCounselorOpen] = useState(false);
  const [isPromptCopied, setIsPromptCopied] = useState(false);
  const [zoomMode, setZoomMode] = useState<'fit' | 'actual'>('fit');
  const [scale, setScale] = useState<number>(1);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Editable counselor and institutional fields
  const [counselorName, setCounselorName] = useState<string>('홍길동 수석전문관');
  const [counselorAffiliation, setCounselorAffiliation] = useState<string>(
    '공무원연금공단 퇴직지원센터 / 퇴직연금종합상담실'
  );
  const [counselorPhone, setCounselorPhone] = useState<string>('02-560-2000 (직통 2114)');
  const [counselorAdvice, setCounselorAdvice] = useState<string>(
    result.overallOpinion ||
      '내담자께서는 퇴직 후 연금 개시까지 안정적인 가교소득 확보와 조기 건강보험 자격 관리가 시급합니다. 본 보고서에 제안된 4대 실천과제를 분기별로 점검하시길 권고합니다.'
  );

  const reportContainerRef = useRef<HTMLDivElement>(null);
  const t = TEMPLATES[template];

  // Document metadata
  const reportDate = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}년 ${String(d.getMonth() + 1).padStart(2, '0')}월 ${String(d.getDate()).padStart(2, '0')}일`;
  }, []);

  const documentNo = useMemo(() => {
    const d = new Date();
    const dateNum = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    return `KGEP-CREV-${dateNum}-${Math.floor(1000 + Math.random() * 9000)}`;
  }, []);

  // Responsive scale calculation for the 210mm A4 canvas in preview container
  useEffect(() => {
    const updateScale = () => {
      if (zoomMode === 'actual') {
        setScale(1);
        return;
      }
      if (!reportContainerRef.current) return;
      const containerWidth = reportContainerRef.current.clientWidth;
      const a4WidthPx = (210 / 25.4) * 96; // 793.7px
      if (containerWidth < a4WidthPx + 32) {
        const nextScale = (containerWidth - 32) / a4WidthPx;
        setScale(Math.max(0.42, Math.min(nextScale, 1)));
      } else {
        setScale(1);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [zoomMode, viewMode]);

  // Handle native browser print
  const handlePrint = () => {
    if (viewMode === 'mobile') {
      setViewMode('print');
      setTimeout(() => window.print(), 200);
    } else {
      window.print();
    }
  };

  // High Quality A4 2-Page PDF Generation via jsPDF & html2canvas
  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      setStatusMessage({ type: 'info', text: '고화질 A4 2페이지 PDF를 조판 및 렌더링 중입니다...' });

      const page1Element = document.getElementById('report-page-1');
      const page2Element = document.getElementById('report-page-2');

      if (!page1Element || !page2Element) {
        throw new Error('보고서 출력 요소를 찾을 수 없습니다.');
      }

      // Render Page 1 and Page 2 at 2x crisp print scale
      const canvasOpts = {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      };

      const canvas1 = await html2canvas(page1Element, canvasOpts);
      const canvas2 = await html2canvas(page2Element, canvasOpts);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const a4Width = 210;
      const a4Height = 297;

      // Add Page 1 (Strictly fitted to A4 without overflow)
      const img1 = canvas1.toDataURL('image/jpeg', 0.98);
      pdf.addImage(img1, 'JPEG', 0, 0, a4Width, a4Height, undefined, 'FAST');

      // Add Page 2 (Strictly fitted to A4 without overflow)
      pdf.addPage();
      const img2 = canvas2.toDataURL('image/jpeg', 0.98);
      pdf.addImage(img2, 'JPEG', 0, 0, a4Width, a4Height, undefined, 'FAST');

      // Guarantee that exactly 2 pages exist in the PDF document
      while (pdf.getNumberOfPages() > 2) {
        pdf.deletePage(pdf.getNumberOfPages());
      }

      const safeName =
        (form.clientName || '내담자').replace(/[/\\?%*:|"<>]/g, '').trim() ||
        '내담자';
      const filename = `소득크레바스_진단보고서_${safeName}_${t.badge}.pdf`;
      pdf.save(filename);

      setStatusMessage({
        type: 'success',
        text: `✓ "${filename}" 파일 다운로드가 완료되었습니다.`,
      });
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      console.error('PDF generation error:', err);
      setStatusMessage({
        type: 'error',
        text: 'PDF 변환 중 오류가 발생했습니다. 브라우저 인쇄(Ctrl+P) 기능을 이용해 PDF로 저장해주세요.',
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Copy full professional prompt for consultation
  const handleCopyPrompt = () => {
    const promptText = `
[공무원 소득 크레바스 전문 상담 기록]
문서번호: ${documentNo}
진단일자: ${reportDate}
내담자: ${form.clientName || '내담자'} (${form.currentAge || '미입력'}세, ${form.gender || '미입력'})
직급/경력: ${form.rankPosition || '미지정'} / 재직 ${form.serviceYears || '0'}년
퇴직예정일: ${form.retirementDate || '미입력'}
연금개시일: ${form.pensionStartDate || '미입력'}
소득공백기간: ${result.summary.gapPeriod} (${result.summary.crevasseType})

[진단결과 요약]
- 핵심 쟁점: ${result.summary.mainIssue}
- 주요 불확실성: ${result.summary.majorUncertainty}
- 진단 신뢰도: ${result.summary.confidence} (${result.summary.confidenceReason})

[6대 영역 준비도 점수]
${result.topics.map((tp) => `- ${tp.name}: ${tp.readinessScore ?? '판단보류'}/5점 (${tp.riskLevel} 위험)`).join('\n')}

[상담관 권고사항]
${counselorAdvice}
    `.trim();

    navigator.clipboard.writeText(promptText).then(() => {
      setIsPromptCopied(true);
      setTimeout(() => setIsPromptCopied(false), 3000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Navigation & Mode Switches (Hidden during Print) */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToResult}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
              title="진단 상세 화면으로 복귀"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              진단결과로
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  A4 2페이지 공식 보고서
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  {documentNo}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5 flex items-center gap-2">
                공무원 소득 크레바스 정밀진단 컨설팅 보고서
              </h2>
            </div>
          </div>

          {/* Action Buttons: Print, PDF Download, Counselor Signature */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            <button
              onClick={() => setIsCounselorOpen(!isCounselorOpen)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              상담관 정보 편집
            </button>

            <button
              onClick={handleCopyPrompt}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
            >
              {isPromptCopied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">복사 완료!</span>
                </>
              ) : (
                <>
                  <FileCode className="w-3.5 h-3.5 text-blue-400" />
                  상담전문 복사
                </>
              )}
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {isGeneratingPdf ? 'PDF 생성중...' : 'A4 PDF 다운로드'}
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
            >
              <Printer className="w-4 h-4" />
              지금 바로 인쇄 (Ctrl+P)
            </button>
          </div>
        </div>

        {/* View Mode & Template Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 text-xs">
          {/* Template Choices */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">보고서 서식:</span>
            <div className="inline-flex rounded-lg p-0.5 bg-slate-800 border border-slate-700">
              {(Object.keys(TEMPLATES) as ReportTemplate[]).map((tmplKey) => {
                const conf = TEMPLATES[tmplKey];
                const isSelected = template === tmplKey;
                return (
                  <button
                    key={tmplKey}
                    onClick={() => setTemplate(tmplKey)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {conf.badge}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode Switch: Mobile-friendly vs Fixed A4 */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg p-0.5 bg-slate-800 border border-slate-700">
              <button
                onClick={() => setViewMode('print')}
                className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                  viewMode === 'print'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                A4 규격 미리보기
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                  viewMode === 'mobile'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                모바일 정독 모드
              </button>
            </div>

            {viewMode === 'print' && (
              <button
                onClick={() => setZoomMode(zoomMode === 'fit' ? 'actual' : 'fit')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 border border-slate-700"
                title="화면 크기에 맞추기 / 100% 원본 크기"
              >
                {zoomMode === 'fit' ? (
                  <>
                    <Maximize2 className="w-3 h-3" />
                    <span>화면맞춤({Math.round(scale * 100)}%)</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className="w-3 h-3" />
                    <span>100% 원본</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Status Toast Message */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                : statusMessage.type === 'error'
                  ? 'bg-rose-950/80 border-rose-500/40 text-rose-200'
                  : 'bg-blue-950/80 border-blue-500/40 text-blue-200'
            }`}
          >
            {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {statusMessage.type === 'info' && <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Counselor Signature & Advice Drawer */}
        {isCounselorOpen && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                전문 상담관 직인 및 자문기관 정보 설정
              </h4>
              <span className="text-[11px] text-slate-400">
                * 입력된 내용은 출력 보고서 하단 직인란에 자동 반영됩니다.
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">상담관 성명 및 직책</label>
                <input
                  type="text"
                  value={counselorName}
                  onChange={(e) => setCounselorName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">소속 기관 / 상담센터</label>
                <input
                  type="text"
                  value={counselorAffiliation}
                  onChange={(e) => setCounselorAffiliation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">상담센터 대표 연락처</label>
                <input
                  type="text"
                  value={counselorPhone}
                  onChange={(e) => setCounselorPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                상담관 종합 소견 및 권고사항 (제2쪽 전문의견란에 인쇄)
              </label>
              <textarea
                rows={2}
                value={counselorAdvice}
                onChange={(e) => setCounselorAdvice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-cyan-500 outline-none resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mode A: Mobile-Friendly Reading View (Continuous Scroll) */}
      {viewMode === 'mobile' && (
        <div className="no-print">
          <MobileReadingView
            result={result}
            form={form}
            counselorName={counselorName}
            counselorAffiliation={counselorAffiliation}
            counselorAdvice={counselorAdvice}
            reportDate={reportDate}
            documentNo={documentNo}
          />
        </div>
      )}

      {/* Mode B: A4 Strict 2-Page Printing Canvas (Always visible for print, wrapped for preview) */}
      <div
        ref={reportContainerRef}
        className={`${viewMode === 'mobile' ? 'hidden print:block' : 'block'} w-full flex flex-col items-center gap-10 print:gap-0 print:block print:w-full print:m-0 print:p-0`}
      >
        {/* Page 1 Guide Tag (Only on screen preview) */}
        <div className="no-print flex items-center justify-between w-full max-w-[210mm] px-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-bold text-slate-300">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            [제 1 쪽] 기본 인적정보 &amp; 6대 생활영역별 크레바스 정밀평가표
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            A4 210 × 297mm 규격 • Page 1 of 2
          </span>
        </div>

        {/* Page 1 Responsive Scaler Wrapper */}
        <div
          className="print-page-wrapper w-full flex justify-center overflow-hidden transition-all duration-200"
          style={{
            height: zoomMode === 'fit' && scale < 1 ? `${Math.round(297 * scale)}mm` : 'auto',
          }}
        >
          <div
            className="print-page-scaled origin-top"
            style={{
              transform: zoomMode === 'fit' && scale < 1 ? `scale(${scale})` : undefined,
              width: '210mm',
            }}
          >
            {/* ============================================================ */}
            {/* ========================= PAGE 1 =========================== */}
            {/* ============================================================ */}
            <div
              id="report-page-1"
              className="bg-white shadow-2xl ring-1 ring-slate-900/10 print:shadow-none print:ring-0 w-[210mm] min-h-[297mm] h-[297mm] max-h-[297mm] print:h-[296mm] print:min-h-[296mm] print:max-h-[296mm] print:m-0 p-[12mm] sm:p-[13mm] pb-[10mm] print:pb-[8mm] flex flex-col justify-between relative box-border overflow-hidden avoid-break break-keep text-slate-800"
            >
          {/* Top Decorative Color Accent Bar */}
          <div
            className="h-2 w-full absolute top-0 left-0"
            style={{ backgroundColor: t.primary }}
          />

          <div className="flex-1 flex flex-col justify-between pt-1">
            {/* 1. Header & Metadata Bar */}
            <div>
              <div className="flex items-start justify-between border-b pb-3" style={{ borderColor: t.headerBorder }}>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider text-white"
                      style={{ backgroundColor: t.badgeBg }}
                    >
                      공식 상담 진단서
                    </span>
                    <span className="text-[11px] font-semibold tracking-wider text-slate-500">
                      [ 제 1 쪽 / 총 2 쪽 ]
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {documentNo}
                    </span>
                  </div>
                  <h1
                    className="text-2xl font-black tracking-tight mt-1"
                    style={{ color: t.primary }}
                  >
                    공무원 소득 크레바스 다영역 종합 진단서
                  </h1>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    퇴직과 연금 개시 사이 소득 공백 구간의 6대 생활설계 위험도 정밀 분석
                  </p>
                </div>

                {/* Institution & Seal Stamp in Header */}
                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-800">
                        {counselorAffiliation.split('/')[0] || '공무원연금공단'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        진단일자: {reportDate}
                      </div>
                    </div>
                    {/* Official Seal Mock Graphic */}
                    <div
                      className="w-11 h-11 rounded-full border-2 flex items-center justify-center p-0.5 text-center select-none shadow-sm"
                      style={{ borderColor: t.sealColor, color: t.sealColor }}
                    >
                      <div className="w-full h-full rounded-full border border-dashed flex flex-col items-center justify-center leading-none text-[8px] font-extrabold p-0.5">
                        <span>상담</span>
                        <span className="text-[9px]">인증</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Client & Crevasse Horizon Core Profile (Summary Box) */}
              <div
                className="mt-3 rounded-xl p-3 border"
                style={{ backgroundColor: t.primaryBg, borderColor: t.cardBorder }}
              >
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Left: Client Demographics */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-700">
                      <User className="w-3.5 h-3.5" style={{ color: t.accent }} />
                      <span>내담자 기본 인적사항 및 직무 이력</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] bg-white p-2 rounded-lg border border-slate-200/80">
                      <div className="text-slate-500">성명 / 성별:</div>
                      <div className="font-bold text-slate-900">
                        {form.clientName || '내담자'} ({form.gender || '미기재'}, {form.currentAge || '미기재'}세)
                      </div>
                      <div className="text-slate-500">소속 / 직급:</div>
                      <div className="font-bold text-slate-900">
                        {form.rankPosition || '일반직 공무원'} ({form.serviceYears || '20'}년 재직)
                      </div>
                      <div className="text-slate-500">퇴직 예정일:</div>
                      <div className="font-bold text-slate-900">
                        {form.retirementDate || '2026년 12월'}
                      </div>
                      <div className="text-slate-500">연금 개시일:</div>
                      <div className="font-bold text-slate-900" style={{ color: t.accent }}>
                        {form.pensionStartDate || '2030년 01월'}
                      </div>
                    </div>
                  </div>

                  {/* Right: Crevasse Core Impact Metrics */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-700">
                      <Clock className="w-3.5 h-3.5" style={{ color: t.accent }} />
                      <span>소득 크레바스(소득 공백기) 핵심 지표</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                        <div className="text-[10px] text-slate-500 font-medium">공백 기간</div>
                        <div className="text-xs font-black text-rose-600 mt-0.5">
                          {result.summary.gapPeriod || '3년 1개월'}
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                        <div className="text-[10px] text-slate-500 font-medium">월 예상 부족액</div>
                        <div className="text-xs font-black text-rose-600 mt-0.5">
                          {form.expectedMonthlyExpense || '약 250만'}원
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                        <div className="text-[10px] text-slate-500 font-medium">유형 판정</div>
                        <div className="text-[11px] font-bold text-slate-800 mt-0.5 truncate" title={result.summary.crevasseType}>
                          {result.summary.crevasseType?.slice(0, 8) || '복합 공백형'}
                        </div>
                      </div>
                    </div>
                    {/* Bottom Alert Pill */}
                    <div className="text-[10px] text-slate-600 bg-white/70 px-2 py-1 rounded border border-slate-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-700">진단 신뢰도:</span>
                      <span className="font-bold text-emerald-700">{result.summary.confidence} ({result.summary.confidenceReason})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. 6 Topics Comprehensive Readiness Table (Detailed 6 Rows) */}
              <div className="mt-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" style={{ color: t.primary }} />
                    6대 생활설계 네트워크 크레바스 다영역 정밀 진단표
                  </h3>
                  <span className="text-[10px] text-slate-500">
                    * 5점 만점 기준 점검 (3점 미만: 집중 관리 대상)
                  </span>
                </div>

                <div className="border rounded-lg overflow-hidden" style={{ borderColor: t.cardBorder }}>
                  <table className="w-full text-left border-collapse text-[10.5px]">
                    <thead>
                      <tr style={{ backgroundColor: t.tableHeadBg, color: t.tableHeadText }}>
                        <th className="py-1.5 px-2.5 font-bold w-[18%]">진단 영역</th>
                        <th className="py-1.5 px-2 font-bold w-[12%] text-center">준비도 점수</th>
                        <th className="py-1.5 px-2 font-bold w-[12%] text-center">위험도 판정</th>
                        <th className="py-1.5 px-2.5 font-bold w-[30%]">잠재 리스크 및 핵심 취약점</th>
                        <th className="py-1.5 px-2.5 font-bold w-[28%]">맞춤형 실천 전략</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {result.topics.map((topic, idx) => {
                        const isHighRisk = topic.riskLevel === '심각' || topic.riskLevel === '높음';
                        const score = topic.readinessScore;
                        return (
                          <tr
                            key={idx}
                            className={`transition-colors ${
                              isHighRisk ? 'bg-rose-50/40 font-medium' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                            }`}
                          >
                            <td className="py-1.5 px-2.5 font-bold text-slate-900">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{
                                    backgroundColor: isHighRisk
                                      ? '#e11d48'
                                      : score && score >= 4
                                        ? '#10b981'
                                        : '#f59e0b',
                                  }}
                                />
                                {topic.name}
                              </div>
                            </td>
                            <td className="py-1.5 px-2 text-center font-bold">
                              {score !== null ? (
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                                    score <= 2
                                      ? 'bg-rose-100 text-rose-800'
                                      : score <= 3
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {score} / 5점
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px]">보류</span>
                              )}
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <span
                                className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                                  topic.riskLevel === '심각'
                                    ? 'bg-red-600 text-white'
                                    : topic.riskLevel === '높음'
                                      ? 'bg-rose-100 text-rose-800 font-extrabold'
                                      : topic.riskLevel === '보통'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {topic.riskLevel}
                              </span>
                            </td>
                            <td className="py-1.5 px-2.5 text-slate-700 leading-snug">
                              <div className="line-clamp-2" title={topic.reasoning}>
                                {topic.reasoning || topic.counselorPoints || '현행 준비 수준 분석 중'}
                              </div>
                            </td>
                            <td className="py-1.5 px-2.5 text-slate-700 leading-snug">
                              <div className="line-clamp-2 font-medium" style={{ color: t.accentText }}>
                                {topic.countermeasure || '전문 상담관과의 세부 실행안 조율 요망'}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. Cross-Domain Crevasse Synergies (연계 리스크 박스) */}
              <div
                className="mt-3.5 rounded-xl p-3 border"
                style={{ backgroundColor: t.secondaryBg, borderColor: t.cardBorder }}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 mb-1">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                  <span>다영역 복합 연쇄 위험 (Crevasse Domino Effect) 분석</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10.5px]">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-800 text-[11px] mb-0.5">
                      ① 재무 × 가족 연계
                    </div>
                    <p className="text-slate-600 leading-snug">
                      소득 공백기 자녀 결혼·학자금 지출 중첩 시 비상자금 급격 고갈 위험
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-800 text-[11px] mb-0.5">
                      ② 일 × 사회적 관계
                    </div>
                    <p className="text-slate-600 leading-snug">
                      퇴직 후 직함 부재 및 평일 시간표 공백에 따른 정서적 고립 및 자존감 저하
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-800 text-[11px] mb-0.5">
                      ③ 건강 × 행정 제도
                    </div>
                    <p className="text-slate-600 leading-snug">
                      지역가입자 전환에 따른 건강보험료 급등(임의계속가입 사전 신청 필수)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Page 1 Footer Note */}
            <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[9.5px] text-slate-500">
              <div>
                발행기관: {counselorAffiliation} • 고객센터: {counselorPhone}
              </div>
              <div className="font-bold text-slate-700">
                [ 1 / 2 쪽 ] (다음 쪽에 맞춤형 실천 로드맵 및 3단계 자각질문 계속) ➔
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>

        {/* Page 2 Guide Tag (Only on screen preview) */}
        <div className="no-print flex items-center justify-between w-full max-w-[210mm] px-2 text-xs text-slate-400 mt-2">
          <span className="flex items-center gap-1.5 font-bold text-slate-300">
            <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
            [제 2 쪽] 3대 우선순위 자각질문 &amp; 전문 상담관 로드맵
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            A4 210 × 297mm 규격 • Page 2 of 2
          </span>
        </div>

        {/* Page 2 Responsive Scaler Wrapper */}
        <div
          className="print-page-wrapper w-full flex justify-center overflow-hidden transition-all duration-200"
          style={{
            height: zoomMode === 'fit' && scale < 1 ? `${Math.round(297 * scale)}mm` : 'auto',
          }}
        >
          <div
            className="print-page-scaled origin-top"
            style={{
              transform: zoomMode === 'fit' && scale < 1 ? `scale(${scale})` : undefined,
              width: '210mm',
            }}
          >
            {/* ============================================================ */}
            {/* ========================= PAGE 2 =========================== */}
            {/* ============================================================ */}
            <div
              id="report-page-2"
              className="bg-white shadow-2xl ring-1 ring-slate-900/10 print:shadow-none print:ring-0 w-[210mm] min-h-[297mm] h-[297mm] max-h-[297mm] print:h-[296mm] print:min-h-[296mm] print:max-h-[296mm] print:m-0 p-[12mm] sm:p-[13mm] pb-[10mm] print:pb-[8mm] flex flex-col justify-between relative box-border overflow-hidden avoid-break break-keep text-slate-800"
            >
          {/* Top Decorative Color Accent Bar */}
          <div
            className="h-2 w-full absolute top-0 left-0"
            style={{ backgroundColor: t.primary }}
          />

          <div className="flex-1 flex flex-col justify-between pt-1">
            {/* Header: Page 2 Indicator */}
            <div>
              <div className="flex items-start justify-between border-b pb-2" style={{ borderColor: t.headerBorder }}>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider text-white"
                      style={{ backgroundColor: t.badgeBg }}
                    >
                      실행 및 자문 편
                    </span>
                    <span className="text-[11px] font-semibold tracking-wider text-slate-500">
                      [ 제 2 쪽 / 총 2 쪽 ]
                    </span>
                  </div>
                  <h2 className="text-xl font-black tracking-tight mt-0.5" style={{ color: t.primary }}>
                    단계별 실행 로드맵 및 3단계 자각질문(Self-Awareness)
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700">
                    내담자: {form.clientName || '내담자'} 귀하
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono">
                    문서번호: {documentNo}
                  </div>
                </div>
              </div>

              {/* 1. 3 Self-Awareness Deep Questions (현실인식, 감정의미, 행동전환) */}
              <div className="mt-3">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 mb-1.5">
                  <HelpCircle className="w-3.5 h-3.5" style={{ color: t.accent }} />
                  <span>소득 크레바스 극복을 위한 3대 핵심 자기성찰(Self-Awareness) 질문</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {/* Question 1: 현실인식 */}
                  <div
                    className="p-2.5 rounded-lg border flex flex-col justify-between"
                    style={{ backgroundColor: t.primaryBg, borderColor: t.cardBorder }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-900">
                          Step 1. 현실 인식
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold">재무·일정</span>
                      </div>
                      <div className="font-extrabold text-slate-900 text-[11px] leading-tight mb-1">
                        "연금 개시일까지 매달 발생하는 순부족액의 정확한 원천은 어디인가?"
                      </div>
                      <p className="text-[10px] text-slate-600 leading-snug">
                        퇴직급여 일시금 소진 속도와 가교소득(재취업/소일거리)의 현실적 기대치를 분리하여 숫자로 직면하십시오.
                      </p>
                    </div>
                    <div className="mt-2 pt-1 border-t border-slate-200 text-[9.5px] font-medium text-blue-800">
                      권고: 최소 3년치 비상 생활비 버퍼 통장 분리
                    </div>
                  </div>

                  {/* Question 2: 감정의미 */}
                  <div
                    className="p-2.5 rounded-lg border flex flex-col justify-between"
                    style={{ backgroundColor: t.primaryBg, borderColor: t.cardBorder }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900">
                          Step 2. 감정·의미
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold">관계·정체성</span>
                      </div>
                      <div className="font-extrabold text-slate-900 text-[11px] leading-tight mb-1">
                        "공직의 직함이 사라진 첫 월요일 아침, 나는 누구로 어디에 있을 것인가?"
                      </div>
                      <p className="text-[10px] text-slate-600 leading-snug">
                        퇴직 후 사회적 인정 욕구와 시간표 상실을 채울 '작은 역할'과 가족과의 새로운 거리두기를 사전 합의해야 합니다.
                      </p>
                    </div>
                    <div className="mt-2 pt-1 border-t border-slate-200 text-[9.5px] font-medium text-emerald-800">
                      권고: 주 3일 이상 루틴화된 외부 활동처 사전 구축
                    </div>
                  </div>

                  {/* Question 3: 행동전환 */}
                  <div
                    className="p-2.5 rounded-lg border flex flex-col justify-between"
                    style={{ backgroundColor: t.primaryBg, borderColor: t.cardBorder }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-100 text-purple-900">
                          Step 3. 행동 전환
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold">당월 실행</span>
                      </div>
                      <div className="font-extrabold text-slate-900 text-[11px] leading-tight mb-1">
                        "이번 달, 내가 당장 통제할 수 있는 소비 습관 한 가지는 무엇인가?"
                      </div>
                      <p className="text-[10px] text-slate-600 leading-snug">
                        막연한 절약 대신 통신비, 모임 회비, 차량 유지비 등 고정지출 1개 항목을 이번 주에 구체적으로 재조정하십시오.
                      </p>
                    </div>
                    <div className="mt-2 pt-1 border-t border-slate-200 text-[9.5px] font-medium text-purple-800">
                      권고: 퇴직 6개월 전 고정비 20% 사전 감축 시뮬레이션
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. 4-Stage Action Checklist Roadmap */}
              <div className="mt-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5" style={{ color: t.primary }} />
                    시기별 공무원 소득 크레바스 실천 로드맵 (Action Roadmap)
                  </h3>
                  <span className="text-[10px] text-slate-500">
                    * 퇴직 D-Day 역산 맞춤 일정표
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                  {/* Stage 1: D-1년 이상 */}
                  <div className="p-2.5 rounded-lg border bg-white border-slate-200">
                    <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                      <span className="text-cyan-700 font-extrabold">1단계: 퇴직 1년 전 (기반 구축)</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">준비기</span>
                    </div>
                    <ul className="space-y-1 text-slate-600 list-disc list-inside">
                      <li>공무원연금공단 내 예상퇴직급여 및 연금개시일 공식 조회 확인</li>
                      <li>퇴직 후 가계 필수생활비 산출 및 불필요한 고정지출 1차 다이어트</li>
                      <li>배우자 및 가족과 퇴직 후 생활계획 및 주거 형태 공동 합의</li>
                    </ul>
                  </div>

                  {/* Stage 2: D-6개월 */}
                  <div className="p-2.5 rounded-lg border bg-white border-slate-200">
                    <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                      <span className="text-blue-700 font-extrabold">2단계: 퇴직 6개월 전 (제도·행정)</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">조율기</span>
                    </div>
                    <ul className="space-y-1 text-slate-600 list-disc list-inside">
                      <li>국민건강보험공단 방문하여 지역가입자 보험료 모의계산 및 비교</li>
                      <li>건강보험 <span className="font-bold text-slate-800">임의계속가입(최장 36개월)</span> 신청 일정 캘린더 등록</li>
                      <li>가교일자리 및 재취업 네트워크 탐색 (사회공헌 일자리 센터 접촉)</li>
                    </ul>
                  </div>

                  {/* Stage 3: D-Day ~ 3개월 */}
                  <div className="p-2.5 rounded-lg border bg-white border-slate-200">
                    <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                      <span className="text-emerald-700 font-extrabold">3단계: 퇴직 직후 ~ 3개월 (연착륙)</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">적응기</span>
                    </div>
                    <ul className="space-y-1 text-slate-600 list-disc list-inside">
                      <li>퇴직일시금/명예퇴직수당의 IRP 계좌 이체 및 세액공제 최적화</li>
                      <li>퇴직 후 100일간의 '월요 루틴' 실행 (운동, 도서관, 자원봉사 등)</li>
                      <li>퇴직 직후 과도한 목돈 투자 및 창업 유혹 엄격 차단 (최소 6개월 보류)</li>
                    </ul>
                  </div>

                  {/* Stage 4: 공백기 유지 */}
                  <div className="p-2.5 rounded-lg border bg-white border-slate-200">
                    <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                      <span className="text-purple-700 font-extrabold">4단계: 공백기 유지 (연금개시 직전)</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">완성기</span>
                    </div>
                    <ul className="space-y-1 text-slate-600 list-disc list-inside">
                      <li>월 100~150만 원 수준의 파트타임 가교소득 안착 점검</li>
                      <li>매년 1회 정기 건강검진 및 실손의료보험 갱신 관리</li>
                      <li>연금 수령 개시 3개월 전 급여수급계좌 지정 및 최종 세금 정산</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 3. Counselor's Official Advice & Institutional Signature Box */}
              <div
                className="mt-3.5 rounded-xl p-3.5 border relative"
                style={{ backgroundColor: t.primaryBg, borderColor: t.cardBorder }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs" style={{ color: t.primary }}>
                    <Award className="w-4 h-4" />
                    <span>전문 은퇴설계상담관 종합 소견 및 심층 권고사항</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    담당 상담관: {counselorName}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-800 leading-relaxed min-h-[52px]">
                  {counselorAdvice}
                </div>

                {/* Official Certification Signature Bar */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-extrabold text-slate-900 text-[11.5px]">
                      {counselorAffiliation}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      본 진단서는 공무원연금법 및 공공 퇴직설계 표준 가이드라인에 근거하여 작성되었습니다.
                    </div>
                  </div>

                  {/* Red Certified Official Stamp (한국 공공기관 직인 스타일) */}
                  <div className="flex items-center gap-3">
                    <div className="text-right leading-tight">
                      <div className="text-[10px] text-slate-400 font-mono">발행인 직인</div>
                      <div className="text-[11px] font-bold text-slate-800">{counselorName}</div>
                    </div>
                    <div
                      className="w-12 h-12 rounded border-2 border-red-600 flex items-center justify-center p-0.5 select-none rotate-[-2deg] shadow-sm bg-white"
                      title="공무원 퇴직설계 상담 직인"
                    >
                      <div className="w-full h-full border border-red-500 flex flex-col items-center justify-center text-red-600 font-black leading-none text-[8.5px]">
                        <span>공무원</span>
                        <span>은퇴상담</span>
                        <span className="text-[7.5px] mt-0.5">인증관인</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Page 2 Bottom Footer Note */}
            <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[9.5px] text-slate-400">
              <div>
                * 본 보고서는 내담자의 자발적 설문 입력을 바탕으로 산출된 상담 지원용 자료입니다.
              </div>
              <div className="font-bold text-slate-600">
                [ 2 / 2 쪽 (최종) ]
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
