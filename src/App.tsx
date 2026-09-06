import React, { useState } from 'react';
import { Header } from './components/Header';
import { FirstScreen } from './components/FirstScreen';
import { Step1BasicInfo } from './components/Step1BasicInfo';
import { Step2FinanceInfo } from './components/Step2FinanceInfo';
import { Step3DiagnosisLoading } from './components/Step3DiagnosisLoading';
import { Step4Results } from './components/Step4Results';
import { Step5Report } from './components/Step5Report';
import { FooterPolicy } from './components/FooterPolicy';
import { ConsultationForm, DiagnosisResult, emptyForm } from './types';
import { generateSmartFallbackDiagnosis } from './utils/fallbackDiagnosis';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 = Intro, 1 = Step 1, 2 = Step 2, 3 = Step 3 (Loading), 4 = Step 4, 5 = Step 5
  const [form, setForm] = useState<ConsultationForm>(emptyForm);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Gemini API Key in session state only (Never stored in localStorage/DB)
  const [apiKey, setApiKey] = useState<string>('');
  const [isKeyVerified, setIsKeyVerified] = useState<boolean>(false);

  const handleFieldChange = (field: keyof ConsultationForm, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLoadSample = (sample: ConsultationForm) => {
    setForm(sample);
    setCurrentStep(1);
  };

  const handleResetRequest = () => {
    if (currentStep === 0) {
      setForm(emptyForm);
      setResult(null);
      return;
    }
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    setForm(emptyForm);
    setResult(null);
    setCurrentStep(0);
    setErrorNotice(null);
    setShowResetConfirm(false);
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  const handleStartDiagnosis = async () => {
    setIsLoading(true);
    setErrorNotice(null);
    setCurrentStep(3); // Show Step 3 Loading view

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          ...form,
          apiKey: apiKey || undefined,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.error || `진단 서버 응답 오류 (${response.status})`);
      }

      const data = await response.json();
      if (!data || !data.summary) {
        throw new Error('올바르지 않은 진단 결과 포맷입니다.');
      }

      setResult(data);
      setCurrentStep(4);
    } catch (err: any) {
      console.warn('Diagnosis API notice:', err.message);
      // Seamlessly fall back to smart local diagnostic engine so the counselor is never stranded in front of a client
      const fallback = generateSmartFallbackDiagnosis(form);
      setResult(fallback);
      setCurrentStep(4);
      setErrorNotice(
        `AI 실시간 분석 안내: ${err.message || '서버 응답 지연'}. 내장 진단 엔진을 통해 분석 결과를 정상 도출하였습니다.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D18] flex flex-col font-sans text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header with 5-step progress indicator */}
      <Header
        currentStep={currentStep}
        onStepClick={(step) => {
          if (step === 3 && isLoading) return;
          setCurrentStep(step);
        }}
        onReset={handleResetRequest}
        canNavigateToResult={result !== null}
        isKeyVerified={isKeyVerified}
        onApiKeyClick={() => {
          if (currentStep !== 0) {
            setCurrentStep(0);
          }
          setTimeout(() => {
            document.getElementById('section-api-key')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {errorNotice && (
          <div className="no-print max-w-4xl mx-auto mt-4 px-4">
            <div className="bg-amber-950/40 border border-amber-500/40 text-amber-200 px-4 py-3 rounded-xl text-xs flex items-center justify-between shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{errorNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorNotice(null)}
                className="text-amber-400 font-bold ml-2 hover:underline cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        )}

        {currentStep === 0 && (
          <FirstScreen
            onStart={() => setCurrentStep(1)}
            onLoadSample={handleLoadSample}
            apiKey={apiKey}
            isKeyVerified={isKeyVerified}
            onKeyVerified={(key) => {
              setApiKey(key);
              setIsKeyVerified(true);
            }}
            onKeyReset={() => {
              setApiKey('');
              setIsKeyVerified(false);
            }}
          />
        )}

        {currentStep === 1 && (
          <Step1BasicInfo
            form={form}
            onChange={handleFieldChange}
            onNext={() => setCurrentStep(2)}
            onBackToIntro={() => setCurrentStep(0)}
          />
        )}

        {currentStep === 2 && (
          <Step2FinanceInfo
            form={form}
            onChange={handleFieldChange}
            onBack={() => setCurrentStep(1)}
            onSubmit={handleStartDiagnosis}
            isLoading={isLoading}
          />
        )}

        {currentStep === 3 && <Step3DiagnosisLoading />}

        {currentStep === 4 && result && (
          <Step4Results
            result={result}
            form={form}
            onViewReport={() => setCurrentStep(5)}
            onEditInputs={() => setCurrentStep(2)}
            onReset={handleResetRequest}
          />
        )}

        {currentStep === 5 && result && (
          <Step5Report
            result={result}
            form={form}
            onBackToResult={() => setCurrentStep(4)}
            onEditInputs={() => setCurrentStep(2)}
            onReset={handleResetRequest}
          />
        )}
      </main>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="no-print fixed inset-0 z-50 bg-[#070D18]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-700 text-slate-100">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>새로운 상담 시작 (데이터 초기화)</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              현재 입력된 내담자 정보와 진단 결과가 즉시 영구 삭제되며 처음 화면으로 되돌아갑니다. 새로운 상담을 시작하시겠습니까?
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={cancelReset}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg cursor-pointer transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                id="btn-confirm-reset"
                onClick={confirmReset}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-md cursor-pointer transition-all"
              >
                초기화 및 새 상담 시작
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Policy and Disclaimer */}
      <FooterPolicy />
    </div>
  );
}
