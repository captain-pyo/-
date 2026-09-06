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
    name: '클래식 이그제큐티브 (맥킨지 / 전략컨설팅 스타일)',
    badge: 'Executive Navy',
    primary: '#0F2744',
    primaryBg: '#0F2744',
    secondaryBg: '#F8FAFC',
    cardBg: '#FFFFFF',
    cardBorder: '#CBD5E1',
    headerBorder: '#0F2744',
    accent: '#B45309', // Deep Amber Gold
    accentBg: '#FEF3C7',
    accentText: '#92400E',
    badgeBg: '#0F2744',
    tableHeadBg: '#0F2744',
    tableHeadText: '#FFFFFF',
    sealColor: '#991B1B',
  },
  'heritage-green': {
    id: 'heritage-green',
    name: '프리미엄 헤리티지 (공무원 연금 / 헤리티지 스타일)',
    badge: 'Heritage Green',
    primary: '#1B4332',
    primaryBg: '#1B4332',
    secondaryBg: '#FAF9F6',
    cardBg: '#FFFFFF',
    cardBorder: '#E5E1DA',
    headerBorder: '#1B4332',
    accent: '#C87941', // Warm Terracotta
    accentBg: '#FBECE2',
    accentText: '#A8531C',
    badgeBg: '#1B4332',
    tableHeadBg: '#1B4332',
    tableHeadText: '#FFFFFF',
    sealColor: '#A82D2D',
  },
  'modern-cobalt': {
    id: 'modern-cobalt',
    name: '모던 파이낸셜 (PB 센터 / 금융자산 스타일)',
    badge: 'Modern Financial',
    primary: '#1E3A8A',
    primaryBg: '#1E3A8A',
    secondaryBg: '#F1F5F9',
    cardBg: '#FFFFFF',
    cardBorder: '#CBD5E1',
    headerBorder: '#1E3A8A',
    accent: '#0284C7', // Vivid Cobalt Sky
    accentBg: '#E0F2FE',
    accentText: '#0369A1',
    badgeBg: '#1E3A8A',
    tableHeadBg: '#1E3A8A',
    tableHeadText: '#FFFFFF',
    sealColor: '#DC2626',
  },
};

export const Step5Report: React.FC<Step5ReportProps> = ({
  result: rawResult,
  form,
  onBackToResult,
  onEditInputs,
  onReset,
}) => {
  // Guarantee that the term '은퇴' is 100% replaced with '퇴직' throughout the report
  const result = useMemo(() => {
    if (!rawResult) return rawResult;
    try {
      const sanitized = JSON.stringify(rawResult).replace(/은퇴/g, '퇴직');
      return JSON.parse(sanitized) as DiagnosisResult;
    } catch {
      return rawResult;
    }
  }, [rawResult]);

  const [currentTemplate, setCurrentTemplate] =
    useState<ReportTemplate>('executive-navy');
  const [zoomMode, setZoomMode] = useState<'fit' | 'actual' | 'mobile-summary'>('fit');
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scale =
    viewportWidth < 840
      ? Math.min(1, Math.max(0.36, (viewportWidth - 28) / 794))
      : 1;

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const t = TEMPLATES[currentTemplate];

  const todayStr = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const docId = `LCDS-CRV-${new Date().getFullYear()}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;

  // 1. Direct High-Resolution 2-Page PDF Generation
  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setStatusMessage({
      type: 'info',
      text: '고화질 2페이지 PDF 보고서를 생성하고 있습니다. 잠시만 기다려주세요...',
    });

    const previousZoom = zoomMode;
    if (zoomMode !== 'actual') {
      setZoomMode('actual');
      await new Promise((resolve) => setTimeout(resolve, 80));
    }

    try {
      const page1El = document.getElementById('report-page-1');
      const page2El = document.getElementById('report-page-2');

      if (!page1El || !page2El) {
        throw new Error('리포트 요소를 찾을 수 없습니다.');
      }

      // Page 1 Capture
      const canvas1 = await html2canvas(page1El, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const p1 = clonedDoc.getElementById('report-page-1');
          if (p1) {
            p1.style.width = '210mm';
            p1.style.minWidth = '210mm';
            p1.style.maxWidth = '210mm';
            p1.style.boxSizing = 'border-box';
          }
        },
      });

      // Page 2 Capture
      const canvas2 = await html2canvas(page2El, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const p2 = clonedDoc.getElementById('report-page-2');
          if (p2) {
            p2.style.width = '210mm';
            p2.style.minWidth = '210mm';
            p2.style.maxWidth = '210mm';
            p2.style.boxSizing = 'border-box';
          }
        },
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const a4Width = 210;
      const a4Height = 297;

      // Add Page 1
      const img1 = canvas1.toDataURL('image/jpeg', 0.95);
      const h1 = (canvas1.height * a4Width) / canvas1.width;
      if (h1 > a4Height) {
        const scale = a4Height / h1;
        const scaledW = a4Width * scale;
        pdf.addImage(img1, 'JPEG', (a4Width - scaledW) / 2, 0, scaledW, a4Height);
      } else {
        pdf.addImage(img1, 'JPEG', 0, 0, a4Width, h1);
      }

      // Add Page 2
      pdf.addPage();
      const img2 = canvas2.toDataURL('image/jpeg', 0.95);
      const h2 = (canvas2.height * a4Width) / canvas2.width;
      if (h2 > a4Height) {
        const scale = a4Height / h2;
        const scaledW = a4Width * scale;
        pdf.addImage(img2, 'JPEG', (a4Width - scaledW) / 2, 0, scaledW, a4Height);
      } else {
        pdf.addImage(img2, 'JPEG', 0, 0, a4Width, h2);
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
      setTimeout(() => {
        setStatusMessage((prev) => (prev?.type === 'success' ? null : prev));
      }, 6000);
    } catch (err) {
      console.error('PDF Generation failed:', err);
      setStatusMessage({
        type: 'error',
        text: 'PDF 직접 생성 중 오류가 발생했습니다. 브라우저 인쇄창 열기(Ctrl+P)를 이용해 주세요.',
      });
    } finally {
      setIsGeneratingPdf(false);
      if (previousZoom !== 'actual') {
        setZoomMode(previousZoom);
      }
    }
  };

  // 2. Browser Print (Fallback to PDF if restricted)
  const handlePrint = () => {
    try {
      const isIframe = window.self !== window.top;
      if (isIframe) {
        setStatusMessage({
          type: 'info',
          text: '미리보기 iframe 환경에서는 브라우저 보안에 의해 인쇄 창이 제한될 수 있습니다. [PDF 저장]을 누르시면 고화질 PDF 파일이 바로 다운로드됩니다.',
        });
      }
      window.print();
    } catch (e) {
      console.warn('window.print failed:', e);
      handleDownloadPdf();
    }
  };

  // 3. Standalone HTML Export
  const handleDownloadHtml = () => {
    const page1El = document.getElementById('report-page-1');
    const page2El = document.getElementById('report-page-2');
    if (!page1El || !page2El) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>공무원 소득 크레바스 종합 진단 리포트 - ${form.clientName || '내담자'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      @page { size: 210mm 297mm; margin: 0; }
      html, body { width: 210mm !important; margin: 0 !important; padding: 0 !important; background: #ffffff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .page-break { page-break-before: always !important; break-before: page !important; height: 0 !important; margin: 0 !important; padding: 0 !important; border: none !important; }
      .avoid-break { page-break-inside: avoid !important; break-inside: avoid !important; }
      .no-print { display: none !important; }
      #report-page-2 { page-break-before: always !important; break-before: page !important; }
    }
    body { font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; background: #f1f5f9; margin: 0; padding: 24px 0; }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: center; margin-bottom: 24px;">
    <button onclick="window.print()" style="background: ${t.primary}; color: white; border: none; padding: 12px 28px; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
      🖨️ 지금 바로 인쇄 / PDF 저장 (Ctrl + P)
    </button>
  </div>
  <div style="max-width: 210mm; margin: 0 auto; display: flex; flex-direction: column; gap: 32px;">
    ${page1El.outerHTML}
    ${page2El.outerHTML}
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 500);
    };
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `소득크레바스_진단리포트_${(form.clientName || '내담자').trim()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setStatusMessage({
      type: 'success',
      text: '✓ 단독 HTML 파일이 다운로드되었습니다. 더블클릭하여 열면 언제든 최고 화질로 즉시 인쇄할 수 있습니다.',
    });
    setTimeout(() => {
      setStatusMessage((prev) => (prev?.type === 'success' ? null : prev));
    }, 6000);
  };

  return (
    <div className="py-6 px-4">
      {/* ============================================================== */}
      {/* 1. TOP ACTION TOOLBAR (Hidden in Print)                         */}
      {/* ============================================================== */}
      <div className="no-print max-w-5xl mx-auto mb-6 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 backdrop-blur-md text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Back & Reset actions */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onBackToResult}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-colors cursor-pointer min-h-[40px]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>상담결과 대시보드</span>
            </button>
            <button
              type="button"
              onClick={onEditInputs}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-colors cursor-pointer min-h-[40px]"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>입력정보 수정</span>
            </button>
            <button
              type="button"
              onClick={onReset}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl transition-colors cursor-pointer min-h-[40px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>새 상담</span>
            </button>
          </div>

          {/* Export & Print actions */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              id="btn-print-report"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 disabled:opacity-60 text-slate-950 font-extrabold text-xs sm:text-sm bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all cursor-pointer min-h-[42px]"
              title="A4 2페이지 규격 PDF 다운로드"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>PDF 생성 중...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-slate-950" />
                  <span>📄 고화질 PDF 다운로드</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="btn-download-html"
              onClick={handleDownloadHtml}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 bg-slate-950 border border-slate-700 rounded-xl transition-all cursor-pointer min-h-[42px] shadow-xs"
              title="브라우저에서 바로 열리는 단독 인쇄용 HTML 파일 다운로드"
            >
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>🌐 HTML 파일 저장</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              title="브라우저 인쇄창 열기 (Ctrl+P)"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-colors cursor-pointer min-h-[42px]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>인쇄창</span>
            </button>
          </div>
        </div>

        {/* Professional Template Selector (Setting) */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>전문 보고서 양식 셋팅 (3종 템플릿):</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(TEMPLATES) as ReportTemplate[]).map((key) => {
              const tmpl = TEMPLATES[key];
              const isSelected = currentTemplate === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCurrentTemplate(key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                    isSelected
                      ? 'text-white border-cyan-400/80 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-bold'
                      : 'text-slate-400 bg-slate-950 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                  style={{
                    backgroundColor: isSelected ? tmpl.primary : undefined,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: tmpl.accent }}
                  />
                  <span>{tmpl.badge}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Device & Zoom Mode Selector (Mobile & Tablet Optimization) */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>화면 최적화 보기 모드:</span>
            {scale < 1 && (
              <span className="text-[11px] font-mono font-normal text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
                자동 맞춤: {Math.round(scale * 100)}%
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setZoomMode('fit')}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[36px] border ${
                zoomMode === 'fit'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>📐 화면 맞춤 (권장)</span>
            </button>

            <button
              type="button"
              onClick={() => setZoomMode('actual')}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[36px] border ${
                zoomMode === 'actual'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>🔍 100% 원본 (가로 스크롤)</span>
            </button>

            <button
              type="button"
              onClick={() => setZoomMode('mobile-summary')}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[36px] border ${
                zoomMode === 'mobile-summary'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>📱 모바일 전용 카드뷰</span>
            </button>
          </div>
        </div>
      </div>

      {/* Optional dropdown panel for standalone HTML export */}
      {showOptions && (
        <div className="no-print max-w-5xl mx-auto mb-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              <strong>단독 인쇄용 HTML 저장:</strong> 웹 브라우저에서 언제든 깨끗하게 열고 벡터 해상도로 즉시 인쇄(Ctrl+P)할 수 있는 독립 실행 파일입니다.
            </span>
          </div>
          <button
            type="button"
            onClick={handleDownloadHtml}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-medium border border-slate-200 rounded-lg cursor-pointer shrink-0 transition-colors shadow-sm"
          >
            HTML 파일 받기
          </button>
        </div>
      )}

      {/* Status Notice Banner */}
      {statusMessage && (
        <div
          className={`no-print max-w-5xl mx-auto mb-4 p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-3 transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer shrink-0"
          >
            닫기
          </button>
        </div>
      )}

      {/* Actual Size Horizontal Scroll Tip for Mobile/Tablet */}
      {zoomMode === 'actual' && viewportWidth < 840 && (
        <div className="no-print max-w-5xl mx-auto mb-4 p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-2 shadow-xs">
          <span>
            👉 <strong>100% 원본 크기 모드:</strong> 실제 A4 인쇄 규격 크기입니다. 좌우로 부드럽게 스크롤하여 큰 글씨로 읽으실 수 있습니다. 전체 화면에 한눈에 맞추려면 상단의 <strong>[화면 맞춤]</strong>을 누르세요.
          </span>
          <button
            type="button"
            onClick={() => setZoomMode('fit')}
            className="px-2.5 py-1 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg shrink-0 cursor-pointer"
          >
            화면 맞춤 전환
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. DEDICATED MOBILE CARD VIEW (Active when zoomMode === 'mobile-summary') */}
      {/* ============================================================== */}
      {zoomMode === 'mobile-summary' && (
        <MobileReadingView
          result={result}
          form={form}
          primaryColor={t.primary}
          accentColor={t.accent}
          accentBg={t.accentBg}
          accentText={t.accentText}
          sealColor={t.sealColor}
          todayStr={todayStr}
          docId={docId}
          onDownloadPdf={handleDownloadPdf}
          onDownloadHtml={handleDownloadHtml}
          onPrint={handlePrint}
          isGeneratingPdf={isGeneratingPdf}
          onSwitchToA4Fit={() => setZoomMode('fit')}
        />
      )}

      {/* ============================================================== */}
      {/* 3. PRINTABLE REPORT DOCUMENT (A4 2-PAGE PROFESSIONAL LAYOUT)   */}
      {/* ============================================================== */}
      <div
        className={`max-w-[210mm] mx-auto space-y-8 print:space-y-0 text-slate-800 overflow-x-auto print:overflow-visible ${
          zoomMode === 'mobile-summary' ? 'hidden print:block' : ''
        }`}
      >
        {/* Page 1 Sheet Label (Screen Only) */}
        <div className="no-print flex items-center justify-between px-2 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: t.primary }}
            />
            <span className="font-bold text-slate-800">
              [ 제 1 쪽 / 총 2 쪽 ] 기본 현황 및 소득 크레바스 다영역 진단
            </span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            A4 규격 (210mm × 297mm)
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
              className="bg-white shadow-2xl ring-1 ring-slate-900/10 print:shadow-none print:ring-0 w-[210mm] min-h-[297mm] h-[297mm] max-h-[297mm] p-[12mm] sm:p-[13mm] pb-[10mm] flex flex-col justify-between relative box-border overflow-hidden avoid-break break-keep text-slate-800"
              style={{ width: '210mm', height: '297mm', minHeight: '297mm', maxHeight: '297mm' }}
            >
          {/* Top Decorative Color Accent Bar */}
          <div
            className="h-2 w-full absolute top-0 left-0"
            style={{ backgroundColor: t.primary }}
          />

          <div className="flex-1 flex flex-col justify-between pt-1">
            {/* 1. Header & Metadata Bar */}
            <div>
              <div className="flex justify-between items-center pb-2 mb-2.5 border-b border-slate-200 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-0.5 rounded font-mono font-bold text-white text-[10px] tracking-wider"
                    style={{ backgroundColor: t.primary }}
                  >
                    대외비 · 상담용
                  </span>
                  <span className="font-mono text-slate-400">문서번호: {docId}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>
                    상담일자: <strong className="text-slate-800">{todayStr}</strong>
                  </span>
                  <span className="text-slate-300">|</span>
                  <span>
                    주관: <strong>라이프 앤 커리어 디자인 스쿨 (LCDS)</strong>
                  </span>
                </div>
              </div>

              {/* Title & Organization Subtitle */}
              <div className="flex justify-between items-end mb-3">
                <div>
                  <span
                    className="text-[11px] font-bold tracking-wider uppercase block mb-0.5"
                    style={{ color: t.accent }}
                  >
                    대한민국 공무원 퇴직 생애설계 전문 진단 리포트
                  </span>
                  <h1
                    className="text-2xl font-black tracking-tight leading-tight"
                    style={{ color: t.primary }}
                  >
                    공무원 소득 크레바스(Income Crevasse) 종합 진단 리포트
                  </h1>
                </div>
                <div className="text-right text-[11px] text-slate-600 shrink-0 pl-3">
                  <p className="font-medium text-slate-500">담당 컨설턴트</p>
                  <p className="font-bold text-slate-900 text-xs">
                    표성일 대표 / Career Captain Pyo
                  </p>
                </div>
              </div>

              {/* Client Profile Summary Table */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 mb-3 text-xs grid grid-cols-4 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">내담자</span>
                  <strong className="text-slate-900 text-sm">
                    {form.clientName || '내담자'}
                  </strong>{' '}
                  <span className="text-slate-600 text-[11px]">
                    {[form.gender, form.rankPosition].filter(Boolean).length > 0 &&
                      `(${[form.gender, form.rankPosition].filter(Boolean).join(' · ')})`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">생년월일 / 재직상태</span>
                  <strong className="text-slate-800">
                    {form.currentAge ? `${form.currentAge}세` : '미입력'} / {form.employmentStatus || '재직중'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">퇴직 예정일</span>
                  <strong className="text-slate-800">
                    {form.retirementDate || '미정'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">공무원연금 개시 예정일</span>
                  <strong className="text-slate-800" style={{ color: t.accent }}>
                    {form.pensionStartDate || '미정'}
                  </strong>
                </div>
              </div>
            </div>

            {/* 2. [Visual Infographic] Income Crevasse Timeline Bar */}
            <div className="mb-3 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5" style={{ color: t.accent }} />
                  <span>1. 소득 크레바스(소득 공백기) 생애주기 구간 분석</span>
                </span>
                <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                  예상 소득 공백: {result.summary.gapPeriod}
                </span>
              </div>

              {/* Timeline diagram */}
              <div className="grid grid-cols-12 gap-1 text-[11px] text-center my-1.5">
                <div className="col-span-3 bg-slate-200 text-slate-700 py-2 rounded font-semibold flex flex-col justify-center">
                  <span className="font-bold">① 공직 재직기</span>
                  <span className="text-[10px] text-slate-500">정규 급여 수령</span>
                </div>
                <div
                  className="col-span-6 py-2 rounded text-white font-bold flex flex-col justify-center shadow-sm relative"
                  style={{ backgroundColor: t.primary }}
                >
                  <span className="text-xs font-bold">
                    ② 소득 크레바스 (소득 공백 구간)
                  </span>
                  <span className="text-[10px] opacity-90 font-normal">
                    급여 중단 ── [생활비 인출 / 건보료 지역전환] ──▶ 연금 개시
                  </span>
                </div>
                <div className="col-span-3 bg-emerald-100 text-emerald-800 py-2 rounded font-semibold flex flex-col justify-center border border-emerald-300">
                  <span className="font-bold">③ 연금 수령기</span>
                  <span className="text-[10px] text-emerald-700 font-medium">공무원연금 개시</span>
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                <span>퇴직 시점 ({form.retirementDate || '퇴직일'})</span>
                <span className="font-semibold text-rose-600">
                  ※ 소득 공백기에는 가교 소득 및 건강보험 임의계속가입(보험료 급증 방지) 사전 준비 필수
                </span>
                <span>연금 개시 ({form.pensionStartDate || '개시일'})</span>
              </div>
            </div>

            {/* 3. Key Diagnostics 4 Cards */}
            <div className="mb-3">
              <h2
                className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 border-b pb-1"
                style={{ color: t.primary, borderColor: t.cardBorder }}
              >
                <span
                  className="w-4 h-4 rounded text-white text-[10px] flex items-center justify-center font-bold"
                  style={{ backgroundColor: t.primary }}
                >
                  2
                </span>
                <span>한눈에 보는 현재 진단 핵심 요약</span>
              </h2>

              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-500 font-bold block mb-0.5">
                    소득 공백기간
                  </span>
                  <span
                    className="font-black text-sm block"
                    style={{ color: t.primary }}
                  >
                    {result.summary.gapPeriod}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    퇴직~연금개시 공백
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-500 font-bold block mb-0.5">
                    크레바스 유형
                  </span>
                  <span className="font-bold text-slate-900 text-xs block truncate">
                    {result.summary.crevasseType}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    가족·부채·자산 구조
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-500 font-bold block mb-0.5">
                    현재 핵심 과제
                  </span>
                  <span className="font-semibold text-slate-800 text-xs block truncate">
                    {result.summary.mainIssue}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    최우선 해결 목표
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-500 font-bold block mb-0.5">
                    진단 신뢰도
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="font-bold text-sm"
                      style={{ color: t.primary }}
                    >
                      {result.summary.confidence}
                    </span>
                    <span
                      className="text-[9px] px-1.5 py-0.2 rounded font-medium"
                      style={{
                        backgroundColor: t.accentBg,
                        color: t.accentText,
                      }}
                    >
                      검증 완료
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 truncate block">
                    {result.summary.confidenceReason || '데이터 정밀 반영'}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Executive Summary Situation Box */}
            <div className="mb-3">
              <h2
                className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 border-b pb-1"
                style={{ color: t.primary, borderColor: t.cardBorder }}
              >
                <span
                  className="w-4 h-4 rounded text-white text-[10px] flex items-center justify-center font-bold"
                  style={{ backgroundColor: t.primary }}
                >
                  3
                </span>
                <span>내담자 상황 정밀 종합 진단서 (Executive Brief)</span>
              </h2>
              <div
                className="p-2.5 rounded-lg border text-xs leading-relaxed"
                style={{
                  backgroundColor: t.secondaryBg,
                  borderColor: t.cardBorder,
                }}
              >
                <p className="text-slate-800 mb-1 font-medium leading-relaxed">
                  {result.situationSummary ||
                    `${form.clientName || '내담자'}님은 퇴직 후 공무원연금 개시 시점까지 약 ${result.summary.gapPeriod}의 소득 공백이 예상되며, 현재 준비 상태와 가족 부양 여건을 감안할 때 '${result.summary.crevasseType}'에 해당합니다.`}
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-slate-200/80 text-slate-600">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-slate-800">· 자산 및 지출:</span>
                    <span>예상 월 생활비 {form.expectedMonthlyExpense || '산정 필요'}, 퇴직금 및 예비자금 분할 운용 핵심</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-slate-800">· 건강보험 & 부채:</span>
                    <span>퇴직 후 지역가입자 전환 방어(임의계속가입 신청) 및 고정 대출비용 통제 필수</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. 6 Topics Readiness & Urgency Matrix Table */}
            <div className="mb-3">
              <h2
                className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 border-b pb-1"
                style={{ color: t.primary, borderColor: t.cardBorder }}
              >
                <span
                  className="w-4 h-4 rounded text-white text-[10px] flex items-center justify-center font-bold"
                  style={{ backgroundColor: t.primary }}
                >
                  4
                </span>
                <span>6대 극복 주제별 준비도 · 시급성 종합 진단표</span>
              </h2>

              <table className="w-full text-left border-collapse text-[11px] border border-slate-200 rounded overflow-hidden">
                <thead>
                  <tr
                    className="text-white text-[11px]"
                    style={{ backgroundColor: t.primary }}
                  >
                    <th className="py-1.5 px-3 font-semibold w-40">극복 주제</th>
                    <th className="py-1.5 px-2 font-semibold text-center w-24">준비도 현황</th>
                    <th className="py-1.5 px-2 font-semibold text-center w-24">상담 시급성</th>
                    <th className="py-1.5 px-3 font-semibold">핵심 진단 근거 및 첫 실행 행동</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {result.topics.slice(0, 6).map((tp, idx) => {
                    const rScore = tp.readinessScore || 2;
                    const uScore = tp.urgencyScore || 4;
                    return (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                        <td className="py-1.5 px-3 font-bold text-slate-900">
                          {idx + 1}. {tp.name}
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          <div className="inline-flex items-center gap-1">
                            <span className="font-semibold text-xs text-slate-800">
                              {tp.readinessScore ? `${tp.readinessScore}/5` : '보류'}
                            </span>
                            {/* Visual mini bar */}
                            <div className="w-10 h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                              <div
                                className="h-full bg-emerald-600 rounded-full"
                                style={{ width: `${(rScore / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          <div className="inline-flex items-center gap-1">
                            <span className="font-bold text-xs" style={{ color: t.accent }}>
                              {tp.urgencyScore ? `${tp.urgencyScore}/5` : '보류'}
                            </span>
                            <div className="w-10 h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  backgroundColor: t.accent,
                                  width: `${(uScore / 5) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-1.5 px-3 text-slate-700 leading-tight">
                          <span className="font-medium text-slate-900 block truncate">
                            {tp.reason}
                          </span>
                          <span className="text-[10px] font-semibold" style={{ color: t.accent }}>
                            ↳ 첫 행동: {tp.firstAction}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 6. Top 3 Priorities Strategy Brief */}
            <div className="mb-1">
              <h2
                className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 border-b pb-1"
                style={{ color: t.primary, borderColor: t.cardBorder }}
              >
                <span
                  className="w-4 h-4 rounded text-white text-[10px] flex items-center justify-center font-bold"
                  style={{ backgroundColor: t.primary }}
                >
                  5
                </span>
                <span>최우선 해결 과제 Top 3 전략 브리핑</span>
              </h2>

              <div className="grid grid-cols-3 gap-2.5 text-xs">
                {result.topPriorities.map((item, idx) => (
                  <div
                    key={idx}
                    className="border p-2 rounded-lg flex flex-col justify-between"
                    style={{
                      backgroundColor: t.cardBg,
                      borderColor: t.cardBorder,
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                          style={{ backgroundColor: t.primary }}
                        >
                          우선순위 {item.rank || idx + 1}
                        </span>
                        <span className="text-[10px] text-rose-600 font-semibold">
                          집중관리
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-xs mb-0.5">
                        {item.topic}
                      </h3>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {item.reason}
                      </p>
                    </div>
                    <div className="mt-1.5 pt-1 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
                      상담 권고: 맞춤 세부 실행안 확정 필요
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Page 1 Bottom Watermark & Page Number */}
          <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
            <span>라이프 앤 커리어 디자인 스쿨 (LCDS) 퇴직설계연구소</span>
            <span>대외비 · 소득 크레바스 진단 리포트 — 1 / 2 쪽</span>
          </div>
        </div>
      </div>
    </div>

        {/* ============================================================ */}
        {/* ================= PAGE BREAK FOR PRINT ===================== */}
        {/* ============================================================ */}
        <div className="page-break no-print py-4 flex items-center justify-center gap-4 text-xs text-slate-500 font-medium select-none">
          <div className="h-px bg-slate-300 flex-1" />
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-300 rounded-full shadow-xs text-slate-700">
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span className="font-semibold text-slate-800">1페이지 완료</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">A4 규격 구분선</span>
            <span className="text-slate-300">|</span>
            <span className="font-semibold text-slate-800">2페이지 시작</span>
          </div>
          <div className="h-px bg-slate-300 flex-1" />
        </div>

        {/* Page 2 Sheet Label (Screen Only) */}
        <div className="no-print flex items-center justify-between px-2 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: t.primary }}
            />
            <span className="font-bold text-slate-800">
              [ 제 2 쪽 / 총 2 쪽 ] 3단계 심층 자각 질문지 및 실행 로드맵
            </span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            A4 규격 (210mm × 297mm)
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
              className="bg-white shadow-2xl ring-1 ring-slate-900/10 print:shadow-none print:ring-0 w-[210mm] min-h-[297mm] h-[297mm] max-h-[297mm] p-[12mm] sm:p-[13mm] pb-[10mm] flex flex-col justify-between relative box-border overflow-hidden avoid-break break-keep text-slate-800 print:break-before-page"
              style={{ width: '210mm', height: '297mm', minHeight: '297mm', maxHeight: '297mm' }}
            >
          {/* Top Decorative Color Accent Bar */}
          <div
            className="h-2 w-full absolute top-0 left-0"
            style={{ backgroundColor: t.primary }}
          />

          <div className="flex-1 flex flex-col justify-between pt-1">
            {/* Top Running Header */}
            <div>
              <div className="flex justify-between items-center pb-2 mb-2.5 border-b border-slate-200 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400">문서번호: {docId}</span>
                  <span className="text-slate-300">|</span>
                  <span className="font-medium text-slate-700">
                    내담자: <strong>{form.clientName || '내담자'}</strong>
                    {form.gender && ` (${form.gender})`}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-600">
                  공무원 퇴직설계 컨설팅 보고서 (2 / 2 쪽)
                </div>
              </div>

              {/* 5. Reflection Question Matrix (Top 3 x 3 Dimensions) */}
              <div className="mb-3">
                <h2
                  className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 border-b pb-1"
                  style={{ color: t.primary, borderColor: t.cardBorder }}
                >
                  <span
                    className="w-4 h-4 rounded text-white text-[10px] flex items-center justify-center font-bold"
                    style={{ backgroundColor: t.primary }}
                  >
                    6
                  </span>
                  <span>LCDS 3단계 자각 질문지 (상담사-내담자 핵심 대화문)</span>
                </h2>

                <div className="space-y-2 text-xs">
                  {result.reflectionQuestions.map((rq, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg p-2.5"
                      style={{
                        backgroundColor: t.secondaryBg,
                        borderColor: t.cardBorder,
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="font-bold text-xs flex items-center gap-1"
                          style={{ color: t.primary }}
                        >
                          <Sparkles className="w-3.5 h-3.5" style={{ color: t.accent }} />
                          <span>[자각 주제 {idx + 1}] {rq.topic}</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          상담 심층 대화 가이드
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span
                            className="text-[10px] font-bold block mb-0.5"
                            style={{ color: t.primary }}
                          >
                            ① 현실 인식 질문 (Fact & Finance)
                          </span>
                          <p className="text-[11px] text-slate-800 leading-snug">
                            &ldquo;{rq.realityQuestion}&rdquo;
                          </p>
                        </div>

                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span
                            className="text-[10px] font-bold block mb-0.5"
                            style={{ color: t.accent }}
                          >
                            ② 감정 · 의미 질문 (Emotion & Value)
                          </span>
                          <p className="text-[11px] text-slate-800 leading-snug">
                            &ldquo;{rq.emotionQuestion}&rdquo;
                          </p>
                        </div>

                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-[10px] font-bold text-emerald-800 block mb-0.5">
                            ③ 행동 전환 질문 (Action & Habit)
                          </span>
                          <p className="text-[11px] text-slate-800 leading-snug">
                            &ldquo;{rq.actionQuestion}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. 4-Step Crevasse Action Roadmap */}
              <div className="mb-3">
                <h2
                  className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 border-b pb-1"
                  style={{ color: t.primary, borderColor: t.cardBorder }}
                >
                  <span
                    className="w-4 h-4 rounded text-white text-[10px] flex items-center justify-center font-bold"
                    style={{ backgroundColor: t.primary }}
                  >
                    7
                  </span>
                  <span>공무원 소득 크레바스 극복 4단계 액션 로드맵 (Action Roadmap)</span>
                </h2>

                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg flex flex-col justify-between">
                    <div>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white block w-fit mb-1"
                        style={{ backgroundColor: t.primary }}
                      >
                        STEP 1. 유동성 확보
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs mb-0.5">
                        비상자금 분리 운용
                      </h4>
                      <p className="text-[10px] text-slate-600 leading-tight">
                        최소 6~12개월분 생활비 별도 통장 격리 및 불요불급 고정지출 20% 긴급 감축
                      </p>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1.5 block font-medium">
                      시점: 퇴직 D-6개월
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg flex flex-col justify-between">
                    <div>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white block w-fit mb-1"
                        style={{ backgroundColor: t.primary }}
                      >
                        STEP 2. 제도 리스크 방어
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs mb-0.5">
                        건보료 임의계속가입
                      </h4>
                      <p className="text-[10px] text-slate-600 leading-tight">
                        지역가입자 건보료 급증 방지(최대 36개월 적용) 및 퇴직수당 IRP 분할 인출
                      </p>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1.5 block font-medium">
                      시점: 퇴직 직후 14일 내
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg flex flex-col justify-between">
                    <div>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white block w-fit mb-1"
                        style={{ backgroundColor: t.primary }}
                      >
                        STEP 3. 가교소득 창출
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs mb-0.5">
                        가교 일자리 파이프라인
                      </h4>
                      <p className="text-[10px] text-slate-600 leading-tight">
                        공직 전문성 기반 시간제·자문·공공일자리로 월 100~150만원 결손 소득 보완
                      </p>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1.5 block font-medium">
                      시점: 공백기 1~2년차
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg flex flex-col justify-between">
                    <div>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white block w-fit mb-1"
                        style={{ backgroundColor: t.primary }}
                      >
                        STEP 4. 연금 최적 연계
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs mb-0.5">
                        공무원연금 수령 개시
                      </h4>
                      <p className="text-[10px] text-slate-600 leading-tight">
                        공무원연금 안정적 수령 돌입, 주택연금 및 개인연금 분산 포트폴리오 완성
                      </p>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1.5 block font-medium">
                      시점: 연금 개시 시점
                    </span>
                  </div>
                </div>
              </div>

              {/* 7. Counseling Guide & Next-Step Requirements */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* 5-Step Process */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
                  <h3
                    className="font-bold text-xs mb-1.5 flex items-center gap-1"
                    style={{ color: t.primary }}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>상담 진행 프로세스 (권장 흐름)</span>
                  </h3>
                  <div className="space-y-1 text-[11px] text-slate-700">
                    {result.counselingGuide.slice(0, 5).map((g, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5"
                          style={{ backgroundColor: t.primary }}
                        >
                          {idx + 1}
                        </span>
                        <span className="leading-snug">{g}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Session Document Checklist */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
                  <h3
                    className="font-bold text-xs mb-1.5 flex items-center gap-1"
                    style={{ color: t.primary }}
                  >
                    <CheckSquare className="w-3.5 h-3.5" style={{ color: t.accent }} />
                    <span>차기 상담 필수 확인 서류 리스트</span>
                  </h3>
                  <div className="space-y-1 text-[11px] text-slate-700">
                    {result.additionalInformationNeeded.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="font-bold" style={{ color: t.primary }}>
                          ☑
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 8. Formal Signature & Official Seal Stamp Section */}
            <div className="pt-2 border-t-2 border-slate-900 avoid-break">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-900">
                  8. 상담 확인 및 공식 서명 날인란
                </span>
                <span className="text-[10px] text-slate-500">
                  본 상담 리포트의 내용을 공유받고 상호 확인하였음을 증명합니다.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto mb-2 text-xs">
                {/* Client Signature Box */}
                <div className="border border-slate-300 p-2.5 rounded-lg bg-slate-50/50 text-center relative">
                  <span className="text-[10px] text-slate-500 block mb-0.5 font-medium">
                    내담자 (확인)
                  </span>
                  <p className="font-bold text-slate-900 text-sm mb-2.5">
                    {form.clientName || '내담자'} (서명 또는 인)
                  </p>
                  <div className="border-b border-dashed border-slate-400 w-32 mx-auto" />
                </div>

                {/* Consultant Signature Box with Official Red Stamp Seal */}
                <div className="border border-slate-300 p-2.5 rounded-lg bg-slate-50/50 text-center relative overflow-hidden">
                  <span className="text-[10px] text-slate-500 block mb-0.5 font-medium">
                    컨설팅 주관 (상담 전문가)
                  </span>
                  <p className="font-bold text-slate-900 text-sm mb-2.5">
                    표성일 대표 / Career Captain Pyo (인)
                  </p>
                  <div className="border-b border-dashed border-slate-400 w-32 mx-auto" />

                  {/* Red Inkan/Seal Graphic */}
                  <div
                    className="absolute right-3 top-2 w-12 h-12 rounded-full border-2 border-dashed flex flex-col items-center justify-center rotate-12 opacity-90 select-none pointer-events-none"
                    style={{ borderColor: t.sealColor, color: t.sealColor }}
                  >
                    <span className="text-[8px] font-black leading-none">LCDS</span>
                    <span className="text-[10px] font-black leading-tight">표성일</span>
                    <span className="text-[7px] font-bold leading-none">印</span>
                  </div>
                </div>
              </div>

              {/* Legal Disclaimer & Copyright */}
              <div className="text-center text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                <p className="font-bold text-slate-700">
                  © 2026 라이프 앤 커리어 디자인 스쿨 (Life & Career Design School) - Career Captain Pyo
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  본 진단 리포트는 공무원의 건강한 퇴직 후 생애설계를 돕기 위한 1:1 전문 대화 촉진용 문서이며, 금융투자상품의 매매 권유가 아닙니다.
                </p>
              </div>
            </div>
          </div>

          {/* Page 2 Bottom Watermark & Page Number */}
          <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
            <span>대한민국 공무원 퇴직설계 전문 솔루션 · LCDS</span>
            <span>대외비 · 소득 크레바스 진단 리포트 — 2 / 2 쪽</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* ============================================================== */}
  {/* 4. FINAL ACTION & DOWNLOAD CARD (At the very bottom of report) */}
  {/* ============================================================== */}
  <div className="no-print max-w-5xl mx-auto mt-8 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-md space-y-5">
    <div className="border-b border-slate-200 pb-3">
      <div className="flex items-center gap-2.5">
        <span
          className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-sm shrink-0"
          style={{ backgroundColor: t.primary }}
        >
          ✓
        </span>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            2페이지 전문 진단 보고서 검토 완료: 파일 다운로드 및 인쇄
          </h3>
          <p className="text-xs text-slate-500">
            상담 결과를 보관하거나 내담자에게 즉시 전달할 수 있도록 원하는 파일 형식을 선택하세요.
          </p>
        </div>
      </div>
    </div>

    {/* 2 Big Primary Download Options */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* PDF Card */}
      <div className="p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-600 bg-slate-50/70 hover:bg-emerald-50/30 transition-all flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2 py-0.5 rounded text-white bg-rose-600">
              PDF 문서 (.pdf)
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              A4 2페이지 정규격
            </span>
          </div>
          <h4 className="font-bold text-slate-900 text-sm sm:text-base">
            📄 공식 A4 PDF 파일 다운로드
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            모든 PC 및 스마트폰에서 바로 열람·인쇄 가능하며, 카카오톡 또는 이메일로 내담자에게 공식 상담 결과지로 전달하기 가장 적합합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          style={{ backgroundColor: t.primary }}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer min-h-[44px]"
        >
          {isGeneratingPdf ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>A4 PDF 생성 중...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>공식 A4 PDF 다운로드 받기</span>
            </>
          )}
        </button>
      </div>

      {/* HTML Card */}
      <div className="p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-600 bg-slate-50/70 hover:bg-emerald-50/30 transition-all flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2 py-0.5 rounded text-white bg-emerald-700">
              웹 인쇄용 (.html)
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              100% 벡터 해상도
            </span>
          </div>
          <h4 className="font-bold text-slate-900 text-sm sm:text-base">
            🌐 단독 인쇄용 HTML 파일 다운로드
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            별도의 프로그램 없이 웹 브라우저(크롬, 엣지, 사파리)에서 바로 열리며, 원본 벡터 그래픽 그대로 언제든 [Ctrl+P] 단축키로 최고 화질 인쇄가 가능합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadHtml}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer min-h-[44px]"
        >
          <FileCode className="w-4 h-4 text-emerald-700" />
          <span>단독 HTML 파일 다운로드 받기</span>
        </button>
      </div>
    </div>

    {/* Output format explanation callout */}
    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
      <span className="font-bold text-slate-800 flex items-center gap-1.5">
        <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
        <span>현재 출력 형태 안내</span>
      </span>
      <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
        <li><strong>화면 출력:</strong> 대한민국 공무원 퇴직설계 표준 2페이지 A4 규격(210mm × 297mm) 실물 비율로 화면에 즉시 렌더링됩니다.</li>
        <li><strong>PDF 출력:</strong> 1페이지(내담자 프로필·크레바스 분석·6대 영역 진단)와 2페이지(Top 3 우선순위·3단계 자각질문·4단계 로드맵·공식 직인 서명)가 페이지 밀림 없이 정확히 2장의 A4 PDF로 분할 저장됩니다.</li>
        <li><strong>HTML 출력:</strong> 단독 실행 파일 하나에 모든 스타일과 서식이 내장되어 있어 인터넷이 연결되지 않은 오프라인 환경에서도 완벽히 열리고 즉시 인쇄됩니다.</li>
      </ul>
    </div>

    {/* Quick Navigation Footer */}
    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onBackToResult}
          className="inline-flex items-center gap-1 px-3 py-2 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>4단계 상담결과로 돌아가기</span>
        </button>
        <button
          type="button"
          onClick={onEditInputs}
          className="inline-flex items-center gap-1 px-3 py-2 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>입력정보 수정</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>브라우저 인쇄창 (Ctrl+P)</span>
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 px-3 py-2 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>새 상담 시작</span>
        </button>
      </div>
    </div>
  </div>
</div>
  );
};


