import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  FileText,
  ChevronDown,
  CheckCircle2,
  Lock,
  Award,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Compass,
  Key,
} from 'lucide-react';
import { ConsultationForm } from '../types';
import { ApiKeySection } from './ApiKeySection';

interface LandingPageProps {
  onStart: () => void;
  onLoadSample?: (sample: ConsultationForm) => void;
  apiKey?: string;
  isKeyVerified?: boolean;
  onKeyVerified?: (key: string) => void;
  onKeyReset?: () => void;
}

// 6 Core Life Design Network Domains (Cyber Constellation Model)
const sphereDomains = [
  {
    id: 1,
    name: '연금 & 현금흐름',
    enName: 'PENSION & CASHFLOW',
    color: '#38BDF8', // Cyan 400
    glowColor: 'rgba(56, 189, 248, 0.4)',
    bgCard: 'rgba(14, 165, 233, 0.08)',
    desc: '공무원연금 개시 연령(만 61~65세) 대조 및 퇴직 즉시 중단되는 정기 수입을 대체할 기초 현금흐름 안전망 점검',
    factQ: '퇴직일부터 공무원연금이 처음 입금되는 달까지 정확히 몇 개월 동안 소득이 0원입니까?',
    emotionQ: '매월 정기적으로 들어오던 월급이 끊긴 첫 달, 내 심리상태는 어떠할 것으로 예상됩니까?',
    actionQ: '연금 개시 전까지 매월 지출될 생활비를 어떤 가교 자금(예적금/퇴직수당/개인연금)에서 인출할 계획입니까?',
    nodePos: { cx: 200, cy: 95 }, // Top node
    stats: '연금개시: 만 63~65세 (최장 60개월 공백)',
  },
  {
    id: 2,
    name: '월 필수 생활비',
    enName: 'LIVING EXPENSES',
    color: '#0284C7', // Sky Blue
    glowColor: 'rgba(2, 132, 199, 0.4)',
    bgCard: 'rgba(2, 132, 199, 0.08)',
    desc: '재직 당시의 지출 규모에서 은퇴 후 필수 고정비(식비·관리비·세금)와 재량 지출을 분리하여 지출 다이어트 체질 개선',
    factQ: '숨만 쉬어도 매월 통장에서 고정적으로 빠져나가는 필수 생활비는 정확히 얼마입니까?',
    emotionQ: '퇴직 후 품위 유지비나 경조사비, 모임 비용을 줄여야 할 때 느끼는 솔직한 감정은 무엇입니까?',
    actionQ: '퇴직 6개월 전부터 은퇴 후 예상 생활비 수준에 맞춰 지출 규모를 미리 축소해보는 연습을 시작했습니까?',
    nodePos: { cx: 295, cy: 145 }, // Top-Right node
    stats: '월평균 적정비: 250만 ~ 350만 원선',
  },
  {
    id: 3,
    name: '건강보험료 방어',
    enName: 'HEALTH INSURANCE SHIELD',
    color: '#F59E0B', // Warm Amber (Matching the image's solar flare!)
    glowColor: 'rgba(245, 158, 11, 0.5)',
    bgCard: 'rgba(245, 158, 11, 0.08)',
    desc: '직장가입자에서 지역가입자 전환 시 보유 주택·자동차 공시지가로 인해 급증하는 건보료 폭탄 방어 (임의계속가입 사전 신청)',
    factQ: '자가 아파트 공시지가와 자동차 기준으로 퇴직 후 매월 고지될 지역건보료 예상액을 조회해 보셨습니까?',
    emotionQ: '소득은 없는데 매월 수십만 원의 건강보험료 고지서를 마주했을 때 재정적 압박감이 얼마나 크겠습니까?',
    actionQ: '퇴직 후 최초 고지서 수령 2개월 내 국민건강보험공단에 [임의계속가입(최장 3년)]을 신청할 준비가 되었습니까?',
    nodePos: { cx: 305, cy: 260 }, // Bottom-Right node (Solar Flare point!)
    stats: '퇴직 후 건보료 최대 2~3배 급증 위험',
  },
  {
    id: 4,
    name: '가교소득 & 일자리',
    enName: 'BRIDGE CAREER & ASSETS',
    color: '#10B981', // Emerald Teal
    glowColor: 'rgba(16, 185, 129, 0.4)',
    bgCard: 'rgba(16, 185, 129, 0.08)',
    desc: '부동산(주택연금) 활용 방안 검토 및 공직 전문성을 살린 시간제 일자리·자문·사회공헌을 통한 완충 소득 확보',
    factQ: '현재 보유한 거주 주택을 활용한 주택연금(가입가능 연령 만 55세 이상) 월 수령액을 확인하셨습니까?',
    emotionQ: '퇴직 후 작은 파트타임이나 공익 일자리를 하는 것에 대해 가족과 주변의 시선에 부담은 없습니까?',
    actionQ: '주 2~3일 가교 일자리를 통해 월 100~150만 원의 완충 소득을 만들기 위해 지금 어떤 준비를 할 수 있습니까?',
    nodePos: { cx: 200, cy: 305 }, // Bottom node
    stats: '가교소득 월 100만 원 확보 시 위험도 70% 감소',
  },
  {
    id: 5,
    name: '부채 & 가족지원',
    enName: 'DEBT & FAMILY SUPPORT',
    color: '#6366F1', // Indigo / Cobalt
    glowColor: 'rgba(99, 102, 241, 0.4)',
    bgCard: 'rgba(99, 102, 241, 0.08)',
    desc: '주택담보대출 원리금 상환 부담 및 성인 자녀 결혼·학자금, 연로하신 부모님 간병비 등 가족 지원의 한계선 설정',
    factQ: '퇴직 후에도 매월 갚아나가야 할 대출 원리금 잔액과 이자 지출 규모는 정확히 얼마입니까?',
    emotionQ: '성인 자녀의 결혼이나 독립 자금을 지원하느라 나의 노후 연금과 생활비가 희생된다면 감당할 수 있습니까?',
    actionQ: '퇴직 1년 전까지 가족(배우자·자녀)과 함께 퇴직 후 지원 가능한 재정 한계선을 명확히 공유하고 합의하셨습니까?',
    nodePos: { cx: 95, cy: 260 }, // Bottom-Left node
    stats: '퇴직 전 고금리 부채 정리 최우선',
  },
  {
    id: 6,
    name: '심리적 적응 & 루틴',
    enName: 'MINDSET & DAILY ROUTINE',
    color: '#A855F7', // Cyber Purple
    glowColor: 'rgba(168, 85, 247, 0.4)',
    bgCard: 'rgba(168, 85, 247, 0.08)',
    desc: '30년 몸담았던 공직 직함과 소속감 상실에 따른 정서적 충격 완화, 부부 생활시간 재배치 및 매일의 기상·활동 루틴 확립',
    factQ: '퇴직 후 아침 9시부터 저녁 6시까지 매일 무엇을 하며 누구를 만날지 구체적인 주간 시간표가 있습니까?',
    emotionQ: '명함과 직함이 사라진 내 자신을 온전히 마주했을 때 스스로를 어떤 사람으로 소개하고 싶습니까?',
    actionQ: '퇴직 다음 날 아침에도 규칙적으로 집을 나서 갈 수 있는 활동 공간(도서관·동호회·배움터)을 마련해 두셨습니까?',
    nodePos: { cx: 105, cy: 145 }, // Top-Left node
    stats: '공직 상실감 극복 & 은퇴 1년 차 루틴 구축',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStart,
  apiKey = '',
  isKeyVerified = false,
  onKeyVerified = () => {},
  onKeyReset = () => {},
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const activeDomain = sphereDomains[currentSlide];

  // Auto slide ticker
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sphereDomains.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sphereDomains.length) % sphereDomains.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sphereDomains.length);
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const faqs = [
    {
      q: '왜 소득 공백(크레바스)이 3~5년(또는 그 이상) 발생하나요?',
      a: '국가공무원법상 법정 정년은 만 60세인데, 2015년 개정된 공무원연금법에 따라 연금 개시 연령이 단계적으로 65세까지 연장되었기 때문입니다. 1961~1964년생은 61~62세(공백 1~2년), 1965~1968년생은 63~64세(공백 3~4년), 1969년 이후 출생 공무원은 만 65세(공백 5년 = 60개월)부터 연금을 수령합니다. 따라서 정년퇴직 후 최소 1년에서 최대 5년 동안 국가로부터 월급도 연금도 받지 못하는 완전 무소득 구간(소득 크레바스)이 발생합니다.',
    },
    {
      q: '6대 영역 밸런스 구체와 3단계 심층 자각 질문지가 실제로 어떻게 도움이 되나요?',
      a: '단순히 "돈이 부족하다"는 막연한 불안감만으로는 문제를 해결할 수 없습니다. 본 도구는 ①연금·현금흐름 ②월 필수 생활비 ③건강보험료 방어 ④가교소득 ⑤부채·가족지원 ⑥심리적 적응의 6대 핵심 영역 준비도와 시급성을 교차 진단하여 가장 먼저 해결할 우선순위를 짚어냅니다. 또한 상담 현장에서 내담자와 마주 앉아 대화할 수 있는 [현실인식 Fact] → [감정의미 Emotion] → [행동전환 Action] 3단계 질문지를 제공하여 실질적인 자각과 구체적 행동을 이끌어냅니다.',
    },
    {
      q: '금융자산이나 통장 잔액을 정확하게 모르면 진단할 수 없나요?',
      a: '전혀 문제없습니다. 본 진단 도구는 세밀한 금융상품 포트폴리오를 평가하는 것이 아니라, 퇴직 후 생계 안정성과 위험 대응력을 파악하는 것이 목적입니다. 대략적인 범위(적음/보통/충분 등) 선택만으로도 충분히 객관적이고 유의미한 6대 영역 진단과 심층 자각 질문지를 도출할 수 있습니다.',
    },
    {
      q: '진단 후 결과 보고서는 어떤 형태로 보관하거나 활용할 수 있나요?',
      a: '진단 완료 즉시 표준 A4 2페이지 규격의 공식 진단 리포트가 화면에 완성됩니다. 상단 및 하단 버튼을 통해 [📄 공식 A4 PDF 파일 다운로드]와 인터넷 없이도 브라우저에서 바로 열리는 [🌐 독립 실행형 HTML 파일]로 영구 저장할 수 있으며, 내담자 제출용 서명 및 공식 직인(Career Captain Pyo 印)이 포함되어 1:1 상담이나 기관 교육 자료로 즉시 활용 가능합니다.',
    },
    {
      q: '진단 비용이 드나요? 입력한 개인정보가 서버나 외부에 남지 않나요?',
      a: '본 진단 도구는 100% 무료이며, 금융상품 판매나 광고가 일체 배제된 순수 공익 상담 솔루션입니다. 또한 사용자가 입력한 모든 정보는 이용자의 웹 브라우저 메모리 안에서만 일시적으로 처리되며, 서버 데이터베이스에 어떠한 개인정보나 금융 데이터도 저장되지 않습니다. 상담 종료나 새로고침 시 즉시 영구 파기되므로 안심하고 활용하실 수 있습니다.',
    },
  ];

  return (
    <div className="w-full text-slate-100 bg-[#070D18] selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* ============================================================== */}
      {/* 1. HERO SECTION (Mirroring the uploaded image's composition)   */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden min-h-[620px] lg:min-h-[720px] flex items-center border-b border-white/10 pt-6 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Background Deep Glows */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 left-10 w-80 h-80 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 right-12 w-64 h-64 rounded-full bg-amber-500/10 blur-[90px] pointer-events-none" />

        {/* Right Edge "SCROLL" Indicator from the image */}
        <div className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 flex-col items-center gap-3 z-30 pointer-events-none opacity-60">
          <span className="text-[10px] font-mono tracking-[0.3em] text-slate-400 [writing-mode:vertical-rl]">
            SCROLL
          </span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-cyan-400 to-transparent relative">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 absolute top-0 -left-[2.5px] animate-bounce" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          
          {/* LEFT COLUMN: HERO TEXT & VALUE PARTNER BRANDING */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Top Sub-tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>2026 연금개정 대응 · 공직자 생애설계 공식 솔루션</span>
            </div>

            {/* Display Title in the exact style of the uploaded image */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
                Value Partner
              </h1>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-100 leading-snug tracking-tight">
                공직 30년 헌신을 넘어, 다음 30년을 함께하는<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400">
                  최고의 생애설계 파트너
                </span>를 지향합니다
              </h2>
            </div>

            {/* English Tagline from image style */}
            <p className="text-xs sm:text-sm text-cyan-400/90 font-mono tracking-wide">
              Value Partner in Leading Life Transition with Digital Precision & Strategic Diagnosis
            </p>

            {/* Core Narrative */}
            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed break-keep">
              단순한 금융상품 추천이나 수익률 계산기가 아닙니다. 
              정년퇴직과 연금 개시 사이 <strong>3~5년의 소득 공백(크레바스)</strong>을 과학적으로 방어하고, 
              <strong> 6대 영역 밸런스</strong>와 <strong>3단계 심층 자각 질문(Fact·Emotion·Action)</strong>을 통해 
              퇴직 후 30년을 지탱할 실질적 생애전략을 설계합니다.
            </p>

            {/* CTA Button in the high-tech style */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                id="btn-hero-start-diagnosis"
                onClick={onStart}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-base rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all cursor-pointer group"
              >
                <span>지금 5분 무료 정밀 진단 시작하기</span>
                <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#section-api-key"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 text-cyan-300 text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)]"
              >
                <Key className="w-4 h-4 text-cyan-400" />
                <span>{isKeyVerified ? 'API Key 승인됨' : 'Gemini Key 활성화'}</span>
              </a>

              <a
                href="#section-why-crevasse"
                className="inline-flex items-center justify-center gap-2 px-5 py-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-all cursor-pointer"
              >
                <span>소득 공백 원인</span>
                <ChevronDown className="w-4 h-4 text-cyan-400" />
              </a>
            </div>

            {/* Bottom Slide Controller (Matching the image's "01 / 04 < || >" bottom left element) */}
            <div className="pt-4 flex items-center gap-4 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg shadow-sm">
                <span className="text-cyan-400 font-bold">
                  0{activeDomain.id}
                </span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400">06</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  className="w-7 h-7 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
                  title="이전 영역"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-7 h-7 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
                  title={isPlaying ? "일시정지" : "자동재생"}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleNextSlide}
                  className="w-7 h-7 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
                  title="다음 영역"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                {activeDomain.name} ({activeDomain.enName})
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: THE DIGITAL NETWORK SPHERE (THE CENTRAL VISUAL FROM THE UPLOADED IMAGE!) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
            
            {/* The Glowing Constellation Sphere */}
            <div className="relative w-full max-w-[420px] sm:max-w-[480px] aspect-square flex items-center justify-center select-none">
              
              {/* Backlight Halo Glow */}
              <div
                className="absolute inset-4 rounded-full blur-2xl transition-all duration-700 pointer-events-none"
                style={{ backgroundColor: activeDomain.glowColor }}
              />

              {/* High-Tech Interactive SVG Network Sphere */}
              <svg
                viewBox="0 0 400 400"
                className="w-full h-full drop-shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all relative z-10"
              >
                <defs>
                  {/* Radial Gradient for central core */}
                  <radialGradient id="sphere-core" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0E2F44" stopOpacity="0.8" />
                    <stop offset="60%" stopColor="#07192C" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#040C1A" stopOpacity="1" />
                  </radialGradient>

                  {/* Solar Flare Gradient matching image horizon */}
                  <radialGradient id="solar-flare" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFF" stopOpacity="1" />
                    <stop offset="30%" stopColor="#F59E0B" stopOpacity="0.9" />
                    <stop offset="70%" stopColor="#EA580C" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Outer Cyber Grid Ring */}
                <circle
                  cx="200"
                  cy="200"
                  r="185"
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                />

                {/* Outer Orbit Path */}
                <ellipse
                  cx="200"
                  cy="200"
                  rx="180"
                  ry="75"
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="1"
                  strokeOpacity="0.4"
                  transform="rotate(-25 200 200)"
                />
                <ellipse
                  cx="200"
                  cy="200"
                  rx="180"
                  ry="75"
                  fill="none"
                  stroke="#06B6D4"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                  transform="rotate(35 200 200)"
                />

                {/* Central Sphere Planet Body */}
                <circle
                  cx="200"
                  cy="200"
                  r="135"
                  fill="url(#sphere-core)"
                  stroke="#38BDF8"
                  strokeWidth="1.5"
                  strokeOpacity="0.6"
                />

                {/* Latitude & Longitude Digital Grid Lines */}
                <ellipse cx="200" cy="200" rx="135" ry="40" fill="none" stroke="#38BDF8" strokeWidth="0.7" strokeOpacity="0.25" />
                <ellipse cx="200" cy="200" rx="135" ry="85" fill="none" stroke="#38BDF8" strokeWidth="0.7" strokeOpacity="0.25" />
                <line x1="200" y1="65" x2="200" y2="335" stroke="#38BDF8" strokeWidth="0.7" strokeOpacity="0.25" strokeDasharray="3 3" />
                <line x1="65" y1="200" x2="335" y2="200" stroke="#38BDF8" strokeWidth="0.7" strokeOpacity="0.25" strokeDasharray="3 3" />

                {/* Constellation Network Lines connecting all 6 domains */}
                {sphereDomains.map((domain, idx) => {
                  const nextDomain = sphereDomains[(idx + 1) % sphereDomains.length];
                  const crossDomain = sphereDomains[(idx + 3) % sphereDomains.length];
                  const isCurrentActive = activeDomain.id === domain.id;

                  return (
                    <g key={`lines-${domain.id}`}>
                      {/* Polygon edge */}
                      <line
                        x1={domain.nodePos.cx}
                        y1={domain.nodePos.cy}
                        x2={nextDomain.nodePos.cx}
                        y2={nextDomain.nodePos.cy}
                        stroke={isCurrentActive ? domain.color : '#38BDF8'}
                        strokeWidth={isCurrentActive ? 2 : 1}
                        strokeOpacity={isCurrentActive ? 0.9 : 0.4}
                        strokeDasharray={isCurrentActive ? 'none' : '4 3'}
                      />
                      {/* Cross constellation connection */}
                      <line
                        x1={domain.nodePos.cx}
                        y1={domain.nodePos.cy}
                        x2={crossDomain.nodePos.cx}
                        y2={crossDomain.nodePos.cy}
                        stroke="#0284C7"
                        strokeWidth="0.7"
                        strokeOpacity="0.25"
                      />
                      {/* Center hub connection */}
                      <line
                        x1={domain.nodePos.cx}
                        y1={domain.nodePos.cy}
                        x2="200"
                        y2="200"
                        stroke={domain.color}
                        strokeWidth={isCurrentActive ? 1.5 : 0.8}
                        strokeOpacity={isCurrentActive ? 0.8 : 0.3}
                      />
                    </g>
                  );
                })}

                {/* Central Core Hub */}
                <circle cx="200" cy="200" r="42" fill="#0A1628" stroke="#38BDF8" strokeWidth="2" />
                <circle cx="200" cy="200" r="36" fill="#070D18" />
                <text x="200" y="194" textAnchor="middle" fill="#38BDF8" fontSize="8" fontWeight="800" letterSpacing="0.1em">
                  VALUE PARTNER
                </text>
                <text x="200" y="208" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="800">
                  6대 영역
                </text>
                <text x="200" y="219" textAnchor="middle" fill="#94A3B8" fontSize="8" fontWeight="600">
                  생애설계 네트워크
                </text>

                {/* SOLAR FLARE EFFECT (The signature glowing orange flare from the image!) */}
                <circle cx="305" cy="260" r="35" fill="url(#solar-flare)" className="animate-pulse" />
                <circle cx="305" cy="260" r="8" fill="#FFF" />
                <circle cx="305" cy="260" r="4" fill="#F59E0B" />

                {/* Interactive Domain Nodes */}
                {sphereDomains.map((domain, index) => {
                  const isSelected = activeDomain.id === domain.id;
                  const { cx, cy } = domain.nodePos;

                  return (
                    <g
                      key={domain.id}
                      onClick={() => {
                        setCurrentSlide(index);
                        setIsPlaying(false);
                      }}
                      className="cursor-pointer transition-all duration-300 group"
                    >
                      {/* Outer Pulse Ring if selected */}
                      {isSelected && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r="22"
                          fill="none"
                          stroke={domain.color}
                          strokeWidth="1.5"
                          strokeOpacity="0.7"
                          className="animate-ping"
                        />
                      )}

                      {/* Hover / Glow Aura */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 16 : 12}
                        fill={domain.color}
                        fillOpacity={isSelected ? 0.35 : 0.15}
                        stroke={domain.color}
                        strokeWidth={isSelected ? 2 : 1}
                      />

                      {/* Solid Node Core */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 7 : 5}
                        fill={isSelected ? '#FFFFFF' : domain.color}
                        stroke="#070D18"
                        strokeWidth="1.5"
                      />

                      {/* Node Text Label */}
                      <text
                        x={cx}
                        y={cy < 200 ? cy - 16 : cy + 20}
                        textAnchor="middle"
                        fill={isSelected ? '#FFFFFF' : '#94A3B8'}
                        fontSize={isSelected ? '11' : '9.5'}
                        fontWeight={isSelected ? '800' : '600'}
                        className="pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                      >
                        {domain.name.split(' & ')[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Mobile Click Hint */}
              <div className="absolute bottom-2 text-center text-[11px] text-cyan-400/80 bg-slate-950/80 px-3 py-1 rounded-full border border-cyan-500/20 backdrop-blur-xs">
                💡 구체 위의 노드를 터치하면 해당 영역의 자각 질문을 점검할 수 있습니다
              </div>
            </div>

            {/* Dynamic Active Domain Card below Sphere */}
            <div
              className="w-full mt-4 p-5 rounded-2xl border transition-all duration-300 backdrop-blur-md relative overflow-hidden"
              style={{
                backgroundColor: activeDomain.bgCard,
                borderColor: `${activeDomain.color}40`,
                boxShadow: `0 0 25px ${activeDomain.glowColor}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full text-slate-950"
                  style={{ backgroundColor: activeDomain.color }}
                >
                  영역 0{activeDomain.id} · {activeDomain.enName}
                </span>
                <span className="text-xs font-mono text-cyan-300 font-medium">
                  {activeDomain.stats}
                </span>
              </div>

              <h3 className="text-lg font-extrabold text-white">
                {activeDomain.name}
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {activeDomain.desc}
              </p>

              {/* 3-Step Awareness Question Preview */}
              <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="font-bold text-cyan-400 mb-0.5">[Fact 현실인식]</div>
                  <div className="text-slate-300 leading-snug line-clamp-2">&ldquo;{activeDomain.factQ}&rdquo;</div>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="font-bold text-amber-400 mb-0.5">[Emotion 감정탐색]</div>
                  <div className="text-slate-300 leading-snug line-clamp-2">&ldquo;{activeDomain.emotionQ}&rdquo;</div>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="font-bold text-emerald-400 mb-0.5">[Action 행동전환]</div>
                  <div className="text-slate-300 leading-snug line-clamp-2">&ldquo;{activeDomain.actionQ}&rdquo;</div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* 4 Trust Highlights Strip */}
        <div className="max-w-7xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-xl border border-slate-800 hover:border-cyan-500/30 transition-all shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">100% 로컬 보안</div>
              <div className="text-[11px] text-slate-400">서버 저장 없음 · 즉시 파기</div>
            </div>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-xl border border-slate-800 hover:border-cyan-500/30 transition-all shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">완전 중립 진단</div>
              <div className="text-[11px] text-slate-400">금융상품 판매·광고 0%</div>
            </div>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-xl border border-slate-800 hover:border-cyan-500/30 transition-all shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">공식 A4 2쪽 리포트</div>
              <div className="text-[11px] text-slate-400">PDF·HTML 원클릭 발급</div>
            </div>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-xl border border-slate-800 hover:border-cyan-500/30 transition-all shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">현장 검증 솔루션</div>
              <div className="text-[11px] text-slate-400">공직 퇴직상담 표준 반영</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* GEMINI API KEY ACTIVATION & APPROVAL SECTION                   */}
      {/* ============================================================== */}
      <ApiKeySection
        apiKey={apiKey}
        isKeyVerified={isKeyVerified}
        onKeyVerified={onKeyVerified}
        onKeyReset={onKeyReset}
        onStartDiagnosis={onStart}
      />

      {/* ============================================================== */}
      {/* 2. WHY INCOME CREVASSE: LEGAL REASONS & 1~5 YEARS GAP EXPLAINED */}
      {/* ============================================================== */}
      <section id="section-why-crevasse" className="py-16 sm:py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-bold text-cyan-400 tracking-widest uppercase mb-2 font-mono">
            WHY INCOME CREVASSE (3~5 YEARS)?
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            왜 정년퇴직과 연금 사이에 소득 공백(크레바스)이 발생하는가?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-3 break-keep">
            법정 정년은 <strong>만 60세</strong>인데, 공무원연금 지급 개시 연령은 출생연도에 따라 단계적으로 <strong>만 65세까지 연장</strong>되었기 때문입니다.
          </p>
        </div>

        {/* Legal Schedule Table Card */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden mb-10">
          <div className="p-5 sm:p-6 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                [ 공무원연금법 개정 기준 출생연도별 연금 개시 연령 및 공백 기간 ]
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                정년퇴직(만 60세) 시점을 기준으로 한 무소득 공백기 대조표
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
              최장 5년(60개월) 무소득
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-950/40 text-slate-400 border-b border-slate-800">
                  <th className="py-3.5 px-4 font-semibold">출생 연도</th>
                  <th className="py-3.5 px-4 font-semibold">법정 정년퇴직 연령</th>
                  <th className="py-3.5 px-4 font-semibold text-cyan-300">공무원연금 지급 개시 연령</th>
                  <th className="py-3.5 px-4 font-semibold text-amber-400">정년퇴직 후 소득 공백(크레바스)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-medium">1961 ~ 1964년생</td>
                  <td className="py-3.5 px-4 text-slate-400">만 60세</td>
                  <td className="py-3.5 px-4 font-semibold text-cyan-300">만 61 ~ 62세</td>
                  <td className="py-3.5 px-4 font-bold text-slate-300">1 ~ 2년 (12~24개월)</td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors bg-cyan-950/10">
                  <td className="py-3.5 px-4 font-medium text-white">1965 ~ 1968년생</td>
                  <td className="py-3.5 px-4 text-slate-400">만 60세</td>
                  <td className="py-3.5 px-4 font-semibold text-cyan-300">만 63 ~ 64세</td>
                  <td className="py-3.5 px-4 font-bold text-amber-400">3 ~ 4년 (36~48개월) ⚠️</td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors bg-amber-950/10">
                  <td className="py-3.5 px-4 font-bold text-white">1969년생 이후 출생자</td>
                  <td className="py-3.5 px-4 text-slate-400">만 60세</td>
                  <td className="py-3.5 px-4 font-bold text-cyan-300">만 65세 (완전 적용)</td>
                  <td className="py-3.5 px-4 font-extrabold text-amber-300">5년 (60개월 완전 무소득) 🚨</td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors text-slate-400">
                  <td className="py-3.5 px-4 italic">조기·명예퇴직자 (만 53~57세)</td>
                  <td className="py-3.5 px-4">명퇴 시점</td>
                  <td className="py-3.5 px-4">만 63 ~ 65세</td>
                  <td className="py-3.5 px-4 font-semibold text-rose-400">7 ~ 10년 이상 장기 공백</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 sm:p-5 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
            <span className="font-bold text-cyan-400 shrink-0 mt-0.5">※ 핵심 결론:</span>
            <span className="leading-relaxed">
              현재 퇴직을 준비하는 50대 공무원 대다수가 <strong>최소 3년에서 최대 5년 동안 국가로부터 월급도 연금도 전혀 입금되지 않는 구간</strong>을 통과해야 합니다. 이 기간의 생활비(월 250~350만 원 기준 총 1억 2천~2억 원)와 급증하는 지역건강보험료를 사전에 정밀하게 방어하지 않으면 노후 자산이 치명적으로 훼손됩니다.
            </span>
          </div>
        </div>

        {/* Timeline Shockwaves 3-Step */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all">
            <div className="text-xs font-mono font-bold text-cyan-400 mb-2">SHOCK 01</div>
            <h3 className="text-lg font-bold text-white mb-2">최장 60개월 무소득 절벽</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              1969년생 이후 출생자는 만 60세 정년퇴직 후 만 65세까지 5년(60개월) 동안 현금흐름이 완전히 끊어집니다. 비상자금 인출 계획이 필수적입니다.
            </p>
          </div>

          <div className="bg-slate-900/60 p-6 rounded-2xl border border-amber-500/30 hover:border-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            <div className="text-xs font-mono font-bold text-amber-400 mb-2">SHOCK 02 (위험)</div>
            <h3 className="text-lg font-bold text-white mb-2">지역 건강보험료 폭탄</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              직장가입자 해제 즉시 소유 아파트 공시지가와 자동차 점수가 합산되어 매월 수십만 원의 건보료가 고지됩니다. (임의계속가입 사전 신청 필수)
            </p>
          </div>

          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all">
            <div className="text-xs font-mono font-bold text-cyan-400 mb-2">SHOCK 03</div>
            <h3 className="text-lg font-bold text-white mb-2">공직 직함 상실과 심리 충격</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              30년간 누려온 사회적 소속감과 명함이 사라지는 심리적 박탈감은 우울증으로 이어질 수 있으며, 매일의 시간표와 역할 재정의가 절실합니다.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. 3-STEP DEEP AWARENESS METHODOLOGY (FACT · EMOTION · ACTION) */}
      {/* ============================================================== */}
      <section id="section-methodology" className="py-16 sm:py-24 px-4 bg-slate-950/60 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-bold text-cyan-400 tracking-widest uppercase mb-2 font-mono">
              SIGNATURE METHODOLOGY
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              왜 3단계 심층 자각 질문(Fact·Emotion·Action)인가?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-3 break-keep">
              단순히 수치만 들이대면 내담자는 방어적이 되거나 불안감에 갇힙니다. 
              상담사와 내담자가 진정성 있게 공감하고 능동적 행동을 시작할 수 있도록 대화의 단계를 설계했습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1: Fact */}
            <div className="bg-slate-900/80 p-7 rounded-2xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold border border-cyan-500/30">
                  <span>STEP 01</span>
                  <span>[Fact] 현실 인식</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  현실 직시 및 데이터 객관화
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  모호했던 소득 공백 개월 수, 비상예비자금 부족분, 퇴직 후 지역건보료 예상액 등 객관적 숫자를 회피하지 않고 있는 그대로 마주합니다.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-cyan-300 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                &ldquo;연금 개시까지 남은 36개월 동안 매월 300만원의 필수 생활비를 어디서 충당할 것인가?&rdquo;
              </div>
            </div>

            {/* Step 2: Emotion */}
            <div className="bg-slate-900/80 p-7 rounded-2xl border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/30">
                  <span>STEP 02</span>
                  <span>[Emotion] 감정 · 가치</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  심리적 불안 수용과 삶의 의미
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  월급 단절과 30년 공직 직함 상실에 따르는 솔직한 두려움, 가족에게 짐이 되지 않으려는 마음, 퇴직 후 자존감의 원천을 깊이 탐색합니다.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-amber-300 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                &ldquo;명함이 사라진 나 자신을 마주할 때, 내 삶을 지탱해 줄 진짜 가치는 무엇인가?&rdquo;
              </div>
            </div>

            {/* Step 3: Action */}
            <div className="bg-slate-900/80 p-7 rounded-2xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  <span>STEP 03</span>
                  <span>[Action] 행동 전환</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  구체적 실행 우선순위 확립
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  걱정을 멈추고 지금 당장 실천할 수 있는 가장 작은 행동(건보료 임의계속가입 신청, 생활비 축소 연습, 가교 일자리 탐색)을 확정합니다.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-emerald-300 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                &ldquo;퇴직 전 남은 1년 동안 이번 달부터 당장 실행할 수 있는 단 하나의 행동은 무엇인가?&rdquo;
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. WHO USES THIS SOLUTION                                      */}
      {/* ============================================================== */}
      <section className="py-16 sm:py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-bold text-cyan-400 tracking-widest uppercase mb-2 font-mono">
            TARGET AUDIENCE
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            이 도구가 꼭 필요한 4가지 사용자 유형
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-2 break-keep">
            개인 퇴직 준비자부터 1:1 대면 상담 전문가, 공공기관 교육 담당자까지 신뢰하고 활용합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center justify-center font-mono font-bold text-xs">
                01
              </div>
              <h3 className="font-bold text-white text-base">
                정년퇴직 1~5년 전 공무원
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                정확한 연금 개시일까지의 공백 개월 수와 필요한 비상예비자금 규모를 사전 산출하고 방어하고 싶은 분
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-semibold text-cyan-300">
              ✓ 현금흐름 갭 & 지출 다이어트 점검
            </div>
          </div>

          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center justify-center font-mono font-bold text-xs">
                02
              </div>
              <h3 className="font-bold text-white text-base">
                명예·조기퇴직 고민 공무원
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                건강이나 개인 사정으로 조기 퇴직을 원하지만, 7~10년의 장기 소득 공백을 버틸 수 있을지 객관적으로 검증하고 싶은 분
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-semibold text-cyan-300">
              ✓ 주택연금 및 가교일자리 병행 분석
            </div>
          </div>

          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center justify-center font-mono font-bold text-xs">
                03
              </div>
              <h3 className="font-bold text-white text-base">
                퇴직설계 전문 상담사 (CFP)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                내담자와 마주 앉아 3단계 심층 질문으로 대화를 이끌고, 품격 있는 A4 2쪽 분석 리포트를 즉시 발급하고 싶은 전문가
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-semibold text-cyan-300">
              ✓ 3단계 질문지 & A4 공식 서명 리포트
            </div>
          </div>

          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center justify-center font-mono font-bold text-xs">
                04
              </div>
              <h3 className="font-bold text-white text-base">
                공공기관 연수원 교육 담당자
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                공직자 퇴직준비 워크숍이나 생애설계 집합 교육에서 교육생 전원이 직접 자가진단하고 실습할 표준 도구로 활용
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-semibold text-cyan-300">
              ✓ 설치 없이 100% 웹 브라우저 실습
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. 4-STEP STREAMLINED PROCESS                                  */}
      {/* ============================================================== */}
      <section id="section-process" className="py-16 sm:py-24 px-4 bg-slate-950/60 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-bold text-cyan-400 tracking-widest uppercase mb-2 font-mono">
              STREAMLINED PROCESS
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              단 5분, 체계적인 4단계 진단 진행 절차
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-2 break-keep">
              어려운 금융 용어나 민감한 계좌 비밀번호 입력 없이, 직관적인 선택형 문항으로 빠르게 완료됩니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all space-y-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                1
              </div>
              <h3 className="font-bold text-white text-base">
                기본 인적사항 입력
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                연령, 직급, 직종, 퇴직 예정일, 공무원연금 개시 예정 연도를 입력하여 소득 공백 기간을 자동 계산합니다. (약 2분)
              </p>
            </div>

            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all space-y-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                2
              </div>
              <h3 className="font-bold text-white text-base">
                재정 현황 및 희망 활동
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                월 필수 생활비, 자산 개략 범위, 부채 여부, 가족 부양 부담, 퇴직 후 희망하는 가교 활동을 체크합니다. (약 3분)
              </p>
            </div>

            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all space-y-3">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                3
              </div>
              <h3 className="font-bold text-white text-base">
                AI 다영역 정밀 분석
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                크레바스 위험 유형 판별, 6대 영역 준비도-시급성 매트릭스, Top 3 시급 과제를 내장 진단 엔진이 즉시 도출합니다.
              </p>
            </div>

            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all space-y-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                4
              </div>
              <h3 className="font-bold text-white text-base">
                리포트 수령 및 대화
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                3단계 자각 질문지를 통한 심층 코칭 대화 및 A4 2쪽 정규격 공식 결과 리포트(PDF/HTML)를 즉시 발급받습니다.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={onStart}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all text-sm sm:text-base cursor-pointer"
            >
              <span>지금 바로 5분 정밀 진단 시작하기</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. ETHICAL PRINCIPLES & DATA PRIVACY GUARANTEE                */}
      {/* ============================================================== */}
      <section className="py-14 sm:py-20 px-4 max-w-5xl mx-auto">
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">
                10대 상담 윤리 및 데이터 안심 보장 헌장
              </h3>
              <p className="text-xs text-slate-400">
                내담자의 존엄성과 사생활을 최우선으로 보호하는 공직 상담 원칙을 준수합니다.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300 pt-4 border-t border-slate-800">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>서버 저장 없는 100% 로컬 보안:</strong> 모든 데이터는 브라우저 내에서만 처리되며 외부 서버에 저장되지 않습니다.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>금융상품 불완전판매 0%:</strong> 특정 보험, 펀드, 투자상품 가입 권유나 판매 목적이 일체 배제된 순수 공익 솔루션입니다.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>사람을 서열화하지 않는 진단:</strong> 점수로 우열을 가리지 않으며, 내담자가 처한 현재 맥락을 존중하고 격려합니다.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>즉시 초기화 및 영구 삭제:</strong> 언제든 상단 '새로운 상담 시작'을 누르면 모든 입력값과 결과가 즉시 영구 파기됩니다.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. FAQ ACCORDION                                              */}
      {/* ============================================================== */}
      <section id="section-faq" className="py-16 sm:py-24 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-xs font-bold text-cyan-400 tracking-widest uppercase mb-2 font-mono">
            FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            자주 묻는 질문 (FAQ)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            공무원 소득 크레바스 진단 도구 이용에 대해 가장 궁금해하시는 점들을 모았습니다.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden transition-all shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <span className="font-bold text-white text-sm sm:text-base flex items-center gap-2.5">
                    <span className="text-cyan-400 font-mono font-bold text-sm">Q.</span>
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800 bg-slate-950/60">
                    <p className="pt-2">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 8. SUPERVISOR & CREDIBILITY PROFILE                          */}
      {/* ============================================================== */}
      <section className="py-12 px-4 max-w-4xl mx-auto">
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/40 text-cyan-300 flex flex-col items-center justify-center font-bold shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <span className="text-xl sm:text-2xl font-mono tracking-tight font-extrabold">LCDS</span>
            <span className="text-[9px] uppercase tracking-widest text-amber-400 font-mono">DIRECTOR</span>
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              <span>개발 및 감수 책임</span>
            </div>
            <h3 className="font-bold text-white text-base sm:text-lg">
              표성일 대표 (Career Captain Pyo)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>라이프 앤 커리어 디자인 스쿨 (Life & Career Design School) 대표</strong><br />
              대한민국 공무원 및 공공기관 재직자 생애설계, 퇴직 전직 지원 및 커리어 트랜지션 전문 디렉터. 
              수많은 공직자 퇴직 상담 현장 경험과 10대 상담 윤리 강령을 집대성하여 본 정밀 진단 시스템을 설계 및 감수하였습니다.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 9. FINAL HIGH-CONVERTING BOTTOM CTA                          */}
      {/* ============================================================== */}
      <section className="pt-8 px-4 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900 via-[#0B1A30] to-slate-950 rounded-3xl p-8 sm:p-12 text-white text-center shadow-2xl border border-cyan-500/30 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="inline-block px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-semibold">
              FOR YOUR NEXT 30 YEARS
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
              막연한 퇴직 불안을 명쾌한 실천 과제로 바꾸세요
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed break-keep">
              지금 5분의 점검으로 소득 공백의 정확한 길이와 비상자금 규모를 파악하고, 
              공식 A4 2페이지 리포트를 받아보세요. 별도 회원가입 없이 즉시 시작됩니다.
            </p>

            <div className="pt-4 flex items-center justify-center">
              <button
                type="button"
                id="btn-bottom-start-diagnosis"
                onClick={onStart}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all text-base sm:text-lg cursor-pointer min-h-[54px]"
              >
                <span>지금 5분 무료 정밀 진단 시작하기</span>
                <ArrowRight className="w-5 h-5 text-slate-950" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
