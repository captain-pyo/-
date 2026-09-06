import React from 'react';
import { User, Calendar, Briefcase, Award, ArrowRight, Info } from 'lucide-react';
import { ConsultationForm } from '../types';

interface Step1BasicInfoProps {
  form: ConsultationForm;
  onChange: (field: keyof ConsultationForm, value: any) => void;
  onNext: () => void;
  onBackToIntro: () => void;
}

export const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({
  form,
  onChange,
  onNext,
  onBackToIntro,
}) => {
  const commonRanks = ['3급', '4급', '5급', '6급', '교장', '교감', '교사', '기타 직급'];
  const commonJobs = ['일반행정', '교육행정/교원', '경찰/치안', '소방/방재', '사회복지', '세무/재정', '기술/시설', '연구/지도'];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 text-slate-100">
      {/* Step Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            STEP 01
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            A. 기본 인적사항 및 퇴직 일정 입력
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          내담자의 기본 직무 및 퇴직·연금 일정을 확인합니다. 정확히 모르는 항목은 빈칸으로 두셔도 진단이 가능합니다.
        </p>
      </div>

      {/* Privacy Notice Card */}
      <div className="bg-slate-900/80 border border-cyan-500/20 rounded-xl p-4 mb-6 flex items-start gap-3 text-xs text-slate-300 backdrop-blur-md shadow-sm">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-bold text-cyan-300">개인정보 안심 보장:</span> 주민등록번호, 계좌번호, 상세 주소 등 민감정보는 절대 수집하지 않습니다. 성명 입력 또한 상담 편의를 위한 선택사항(가명 가능)입니다.
        </p>
      </div>

      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-6 sm:p-8 space-y-6 backdrop-blur-md">
        {/* Name, Gender & Age */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-5">
            <label htmlFor="clientName" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
              내담자 성명 또는 호칭 <span className="text-xs font-normal text-slate-400">(선택)</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                id="clientName"
                value={form.clientName}
                onChange={(e) => onChange('clientName', e.target.value)}
                placeholder="예: 김 주무관님 또는 김○환"
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 bg-slate-950/70 text-white placeholder-slate-500 transition-all"
              />
            </div>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
              내담자 성별 <span className="text-xs font-normal text-slate-400">(선택)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['남성', '여성'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => onChange('gender', form.gender === g ? '' : g)}
                  className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all text-center cursor-pointer min-h-[42px] ${
                    form.gender === g
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold ring-1 ring-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="currentAge" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
              현재 연령 <span className="text-xs font-normal text-slate-400">(만 나이)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="currentAge"
                min="30"
                max="85"
                value={form.currentAge}
                onChange={(e) => onChange('currentAge', e.target.value)}
                placeholder="예: 58"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 bg-slate-950/70 text-white placeholder-slate-500 transition-all"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">세</span>
            </div>
          </div>
        </div>

        {/* Employment Status */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
            재직 상태
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            {[
              { val: '재직중', label: '재직중 (정년퇴직 준비)' },
              { val: '퇴직예정', label: '퇴직예정 (명퇴 등 심의중)' },
              { val: '이미퇴직', label: '이미 퇴직 (연금 개시 전 공백기)' },
            ].map((item) => (
              <button
                key={item.val}
                type="button"
                onClick={() => onChange('employmentStatus', item.val)}
                className={`py-3 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all text-center cursor-pointer min-h-[46px] flex items-center justify-center ${
                  form.employmentStatus === item.val
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold ring-1 ring-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Retirement Date & Pension Start Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label htmlFor="retirementDate" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
              퇴직 예정일 또는 실제 퇴직일
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                id="retirementDate"
                value={form.retirementDate}
                onChange={(e) => onChange('retirementDate', e.target.value)}
                placeholder="예: 2028-12-31 또는 만 60세"
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 bg-slate-950/70 text-white placeholder-slate-500 transition-all"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              * 정년퇴직 또는 명예퇴직 예정 연월
            </p>
          </div>

          <div>
            <label htmlFor="pensionStartDate" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
              공무원연금 개시일 또는 예상 시점
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                id="pensionStartDate"
                value={form.pensionStartDate}
                onChange={(e) => onChange('pensionStartDate', e.target.value)}
                placeholder="예: 2032-01 또는 만 64세 (공단 기준)"
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 bg-slate-950/70 text-white placeholder-slate-500 transition-all"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              * 퇴직일과 연금 개시일 사이의 기간이 소득 크레바스(소득 공백)입니다.
            </p>
          </div>
        </div>

        {/* Rank / Position */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="rankPosition" className="block text-xs sm:text-sm font-semibold text-slate-200">
              직급 또는 직위
            </label>
            <span className="text-xs text-slate-400">직급 버튼 클릭 또는 직접입력</span>
          </div>
          <div className="relative mb-2.5">
            <Award className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              id="rankPosition"
              value={form.rankPosition}
              onChange={(e) => onChange('rankPosition', e.target.value)}
              placeholder="예: 6급, 5급, 교장, 교감, 교사 등"
              className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 bg-slate-950/70 text-white placeholder-slate-500 transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {commonRanks.map((rk) => (
              <button
                key={rk}
                type="button"
                onClick={() => onChange('rankPosition', rk)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer border ${
                  form.rankPosition === rk
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
                }`}
              >
                {rk}
              </button>
            ))}
          </div>
        </div>

        {/* Job category & Service Years */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label htmlFor="jobCategory" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
              직렬 또는 주요 업무분야
            </label>
            <div className="relative mb-2.5">
              <Briefcase className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                id="jobCategory"
                value={form.jobCategory}
                onChange={(e) => onChange('jobCategory', e.target.value)}
                placeholder="예: 일반행정, 교육, 경찰, 소방 등"
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 bg-slate-950/70 text-white placeholder-slate-500 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {commonJobs.slice(0, 5).map((jb) => (
                <button
                  key={jb}
                  type="button"
                  onClick={() => onChange('jobCategory', jb)}
                  className="px-2.5 py-1 text-xs bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  {jb}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="serviceYears" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
              총 공직 경력
            </label>
            <div className="relative">
              <input
                type="text"
                id="serviceYears"
                value={form.serviceYears}
                onChange={(e) => onChange('serviceYears', e.target.value)}
                placeholder="예: 28년 (또는 30년 6개월)"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 bg-slate-950/70 text-white placeholder-slate-500 transition-all"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              퇴직수당 및 연금 기여 기간 참고치로 활용됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
        <button
          type="button"
          onClick={onBackToIntro}
          className="w-full sm:w-auto px-5 py-3 text-sm font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors cursor-pointer text-center min-h-[46px] flex items-center justify-center"
        >
          ← 안내 화면으로
        </button>

        <button
          type="button"
          id="btn-next-to-step2"
          onClick={onNext}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-sm font-extrabold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all cursor-pointer min-h-[46px]"
        >
          <span>다음: 재정·퇴직정보 입력 (2단계)</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>
    </div>
  );
};
