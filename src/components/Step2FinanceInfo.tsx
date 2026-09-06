import React from 'react';
import {
  Coins,
  Wallet,
  Users,
  Compass,
  Activity,
  MessageSquare,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { ConsultationForm } from '../types';

interface Step2FinanceInfoProps {
  form: ConsultationForm;
  onChange: (field: keyof ConsultationForm, value: any) => void;
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const assetOptions = ['없음', '적음', '보통', '비교적 충분'];

const debtOptions = ['주택담보대출', '신용대출', '기타 대출', '부채없음'];

const expenseRanges = [
  '200만원 미만',
  '200~300만원',
  '300~400만원',
  '400~500만원',
  '500만원 이상',
  '잘 모르겠음',
];

const retirementPlanOptions = [
  '재취업 적극희망',
  '기회있으면 재취업',
  '공직경험 활용 자문·강의 관심',
  '창업·1인사업 관심',
  '부업·프리랜서 관심',
  '봉사·사회공헌 관심',
  '당분간 휴식 희망',
  '아직 계획없음',
  '기타',
];

export const Step2FinanceInfo: React.FC<Step2FinanceInfoProps> = ({
  form,
  onChange,
  onBack,
  onSubmit,
  isLoading,
}) => {
  const toggleDebt = (debt: string) => {
    let newDebts = [...form.debts];
    if (debt === '부채없음') {
      newDebts = newDebts.includes('부채없음') ? [] : ['부채없음'];
    } else {
      newDebts = newDebts.filter((d) => d !== '부채없음');
      if (newDebts.includes(debt)) {
        newDebts = newDebts.filter((d) => d !== debt);
      } else {
        newDebts.push(debt);
      }
    }
    onChange('debts', newDebts);
  };

  const togglePlan = (plan: string) => {
    let newPlans = [...form.retirementPlans];
    if (newPlans.includes(plan)) {
      newPlans = newPlans.filter((p) => p !== plan);
    } else {
      newPlans.push(plan);
    }
    onChange('retirementPlans', newPlans);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6 text-slate-100">
      {/* Step Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            STEP 02
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            재정·퇴직정보 및 라이프스타일 진단 입력
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          50~60대 내담자와 편안하게 대화하며 개략적인 수치와 선호도를 체크합니다. 과도하게 정밀한 금액보다는 대략적인 구조 파악이 핵심입니다.
        </p>
      </div>

      {/* B. 연금 정보 카드 */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-5 sm:p-7 backdrop-blur-md">
        <div className="flex items-center gap-3 pb-3 mb-5 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">B. 공무원연금 및 정기 수입원</h3>
            <p className="text-xs text-slate-400">
              * 공무원연금 예상 개시 시점과 보유 공·사적 연금 상태 (연금 수급 가능 여부를 시스템이 임의로 왜곡하지 않습니다)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label htmlFor="pensionStartDate" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
              공무원연금 예상 개시 시점
            </label>
            <input
              type="text"
              id="pensionStartDate"
              value={form.pensionStartDate}
              onChange={(e) => onChange('pensionStartDate', e.target.value)}
              placeholder="예: 2032년 1월 또는 만 64세 (공단 조회 기준)"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 bg-slate-950/70 text-white placeholder-slate-500 transition-all"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              1996년 이후 임용자는 출생연도에 따라 만 60~65세 단계적 개시
            </p>
          </div>

          <div>
            <label htmlFor="expectedMonthlyPension" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
              예상 월 연금액
            </label>
            <input
              type="text"
              id="expectedMonthlyPension"
              value={form.expectedMonthlyPension}
              onChange={(e) => onChange('expectedMonthlyPension', e.target.value)}
              placeholder="예: 약 270만원 또는 250~300만원"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 bg-slate-950/70 text-white placeholder-slate-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
              예상 월 연금액 인지도
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['정확히 알고 있음', '대략 알고 있음', '잘 모름'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange('pensionAwareness', opt)}
                  className={`py-2 px-2 text-xs rounded-xl border text-center transition-all cursor-pointer ${
                    form.pensionAwareness === opt
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold ring-1 ring-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
              개인연금 보유 여부 (연금저축/IRP 등)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['있음(연금저축/IRP 등)', '없음', '잘 모름'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange('hasPersonalPension', opt)}
                  className={`py-2 px-2 text-xs rounded-xl border text-center transition-all cursor-pointer ${
                    form.hasPersonalPension === opt
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold ring-1 ring-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {opt.includes('(') ? '있음(IRP 등)' : opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
              국민연금 또는 다른 공적연금 여부
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['있음', '없음', '잘 모름'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange('hasNationalPension', opt)}
                  className={`py-2 px-2 text-xs rounded-xl border text-center transition-all cursor-pointer ${
                    form.hasNationalPension === opt
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold ring-1 ring-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="otherRegularIncome" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
              기타 정기 소득원 <span className="text-xs font-normal text-slate-400">(선택)</span>
            </label>
            <input
              type="text"
              id="otherRegularIncome"
              value={form.otherRegularIncome}
              onChange={(e) => onChange('otherRegularIncome', e.target.value)}
              placeholder="예: 배우자 연금, 임대수입, 배당 등 (없으면 빈칸)"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 bg-slate-950/70 text-white placeholder-slate-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* C. 현재 재정 상황 카드 */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-5 sm:p-7 backdrop-blur-md">
        <div className="flex items-center gap-3 pb-3 mb-5 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">C. 현재 재산 및 지출 규모</h3>
            <p className="text-xs text-slate-400">
              * 개략적인 구간으로 파악 (정밀한 자산조회가 아니므로 대략적인 느낌으로 체크합니다)
            </p>
          </div>
        </div>

        {/* Assets Matrix */}
        <div className="mb-6">
          <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
            자산 수준 평가
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 금융자산 */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-cyan-300 block mb-2">1. 금융자산 (예적금/투자자산)</span>
              <div className="grid grid-cols-4 gap-1.5">
                {assetOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onChange('assetFinancial', opt)}
                    className={`py-2 px-1 text-xs rounded-lg text-center transition-all cursor-pointer ${
                      form.assetFinancial === opt
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* 부동산 */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-cyan-300 block mb-2">2. 부동산 (거주주택 등)</span>
              <div className="grid grid-cols-4 gap-1.5">
                {assetOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onChange('assetRealEstate', opt)}
                    className={`py-2 px-1 text-xs rounded-lg text-center transition-all cursor-pointer ${
                      form.assetRealEstate === opt
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* 기타자산 */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-cyan-300 block mb-2">3. 기타 자산 (수익형 등)</span>
              <div className="grid grid-cols-4 gap-1.5">
                {assetOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onChange('assetOther', opt)}
                    className={`py-2 px-1 text-xs rounded-lg text-center transition-all cursor-pointer ${
                      form.assetOther === opt
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* 퇴직금/퇴직수당 예상액 */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-cyan-300 block mb-2">4. 퇴직금·퇴직수당 예상액</span>
              <div className="grid grid-cols-4 gap-1.5">
                {assetOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onChange('assetSeverance', opt)}
                    className={`py-2 px-1 text-xs rounded-lg text-center transition-all cursor-pointer ${
                      form.assetSeverance === opt
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Debts */}
        <div className="mb-6">
          <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
            부채 상황 (해당 항목 모두 선택)
          </label>
          <div className="flex flex-wrap gap-2">
            {debtOptions.map((debt) => {
              const isSelected = form.debts.includes(debt);
              return (
                <button
                  key={debt}
                  type="button"
                  onClick={() => toggleDebt(debt)}
                  className={`py-2 px-3.5 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold ring-1 ring-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {debt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Expected Monthly Expense */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
            예상 월 필수 생활비 (퇴직 후 목표/현재 기준)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {expenseRanges.map((exp) => (
              <button
                key={exp}
                type="button"
                onClick={() => onChange('expectedMonthlyExpense', exp)}
                className={`py-2.5 px-2 text-xs rounded-xl border text-center transition-all cursor-pointer ${
                  form.expectedMonthlyExpense === exp
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold ring-1 ring-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                {exp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* D. 가족·생활 정보 카드 */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-5 sm:p-7 backdrop-blur-md">
        <div className="flex items-center gap-3 pb-3 mb-5 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">D. 가족 및 부양 부담</h3>
            <p className="text-xs text-slate-400">
              배우자 경제활동, 자녀 결혼/학자금 및 부모 부양 등 가족 지원 변수
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
              배우자 유무 및 경제활동
            </label>
            <select
              value={form.spouseStatus}
              onChange={(e) => onChange('spouseStatus', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 bg-slate-950/70 text-white"
            >
              <option value="">선택해주세요</option>
              <option value="배우자 있음(경제활동 중)">배우자 있음 (경제활동 중)</option>
              <option value="배우자 있음(경제활동 안 함)">배우자 있음 (경제활동 안 함)</option>
              <option value="배우자 없음(사별/이혼/미혼)">배우자 없음 (사별/이혼/미혼)</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
              부양가족 여부
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['있음', '없음'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange('hasDependents', opt)}
                  className={`py-2 px-3 text-xs sm:text-sm rounded-xl border text-center transition-all cursor-pointer min-h-[42px] ${
                    form.hasDependents === opt
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold ring-1 ring-cyan-400'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
              자녀 경제지원 여부
            </label>
            <select
              value={form.childSupport}
              onChange={(e) => onChange('childSupport', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 bg-slate-950/70 text-white"
            >
              <option value="">선택해주세요</option>
              <option value="결혼/학자금 등 지원 필요">결혼/학자금 등 목돈 지원 필요</option>
              <option value="일부 생활비 지원">일부 생활비 지원 중</option>
              <option value="지원 불필요(독립)">지원 불필요 (독립 완료)</option>
              <option value="해당 없음">해당 없음</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
              부모 부양 여부
            </label>
            <select
              value={form.parentSupport}
              onChange={(e) => onChange('parentSupport', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 bg-slate-950/70 text-white"
            >
              <option value="">선택해주세요</option>
              <option value="정기 부양/동거">정기 부양비 지원 또는 동거 중</option>
              <option value="간헐적 지원">의료비 등 간헐적 지원</option>
              <option value="부양 부담 없음">부양 부담 없음</option>
              <option value="해당 없음">해당 없음</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
              주거 형태
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['자가', '전세', '월세', '기타'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange('housingType', opt)}
                  className={`py-2 px-2 text-xs rounded-xl border text-center transition-all cursor-pointer ${
                    form.housingType === opt
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold ring-1 ring-cyan-400'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="familyFinancialBurden" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
            가족 재정 부담 사항 <span className="text-xs font-normal text-slate-400">(자유 입력)</span>
          </label>
          <input
            type="text"
            id="familyFinancialBurden"
            value={form.familyFinancialBurden}
            onChange={(e) => onChange('familyFinancialBurden', e.target.value)}
            placeholder="현재 가족재정에서 가장 부담되는 부분 (예: 자녀 결혼 지원, 부모님 간병비 등)"
            className="w-full px-3.5 py-2.5 text-sm border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 bg-slate-950/70 text-white placeholder-slate-500"
          />
        </div>
      </div>

      {/* E. 퇴직 후 활동 및 가교일자리 계획 */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-5 sm:p-7 backdrop-blur-md">
        <div className="flex items-center gap-3 pb-3 mb-5 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">E. 퇴직 후 활동 및 가교일자리 계획</h3>
            <p className="text-xs text-slate-400">
              * 퇴직 후 희망하는 활동이나 방향 (복수 선택 가능)
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
            관심 및 희망 계획 <span className="text-xs font-normal text-slate-400">(해당 항목 모두 선택)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {retirementPlanOptions.map((plan) => {
              const isChecked = form.retirementPlans.includes(plan);
              return (
                <button
                  key={plan}
                  type="button"
                  onClick={() => togglePlan(plan)}
                  className={`p-2.5 rounded-xl border text-left text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
                    isChecked
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-medium ring-1 ring-cyan-400'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center text-xs shrink-0 ${
                      isChecked ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold' : 'border-slate-700'
                    }`}
                  >
                    {isChecked && '✓'}
                  </span>
                  <span className="truncate">{plan}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="desiredActivities" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
            퇴직 후 하고 싶은 일이나 생각해본 활동 <span className="text-xs font-normal text-slate-400">(자유 입력)</span>
          </label>
          <input
            type="text"
            id="desiredActivities"
            value={form.desiredActivities}
            onChange={(e) => onChange('desiredActivities', e.target.value)}
            placeholder="예: 공직 경험 활용 행정사무 자문, 주말 텃밭, 지역 복지관 자원봉사 등"
            className="w-full px-3.5 py-2.5 text-sm border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 bg-slate-950/70 text-white placeholder-slate-500"
          />
        </div>
      </div>

      {/* F. 근로 지속 가능성 카드 */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-5 sm:p-7 backdrop-blur-md">
        <div className="flex items-center gap-3 pb-3 mb-5 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">F. 근로 지속 가능성 및 건강 인식</h3>
            <p className="text-xs text-slate-400">
              건강 상태 인식, 희망 근로 기간 및 선호하는 업무 강도
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
              건강 상태 자기인식
            </label>
            <select
              value={form.healthPerception}
              onChange={(e) => onChange('healthPerception', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 bg-slate-950/70 text-white"
            >
              <option value="">선택해주세요</option>
              <option value="매우 양호">매우 양호 (활력 넘침)</option>
              <option value="양호">양호 (일상생활 및 근로 지장 없음)</option>
              <option value="보통">보통 (만성질환 관리 중)</option>
              <option value="근로 지속 약간 부담">근로 지속 약간 부담</option>
              <option value="근로 지속 큰 부담">근로 지속 큰 부담 (휴식 필요)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
              희망 근로 기간
            </label>
            <select
              value={form.desiredWorkDuration}
              onChange={(e) => onChange('desiredWorkDuration', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 bg-slate-950/70 text-white"
            >
              <option value="">선택해주세요</option>
              <option value="퇴직 후 1~2년">퇴직 후 1~2년</option>
              <option value="퇴직 후 3~5년">퇴직 후 3~5년</option>
              <option value="퇴직 후 5~10년">퇴직 후 5~10년</option>
              <option value="건강이 허락하는 한 계속">건강이 허락하는 한 계속</option>
              <option value="근로 희망하지 않음">근로 희망하지 않음</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
              근로 강도 선호
            </label>
            <select
              value={form.workIntensityPreference}
              onChange={(e) => onChange('workIntensityPreference', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 bg-slate-950/70 text-white"
            >
              <option value="">선택해주세요</option>
              <option value="현재와 비슷한 수준 (주 5일 전일제)">현재와 비슷한 수준 (주 5일 전일제)</option>
              <option value="주 3~4일 또는 파트타임">주 3~4일 또는 파트타임</option>
              <option value="주 1~2일 또는 유연근무">주 1~2일 또는 유연근무</option>
              <option value="단기 프로젝트/자문 위주">단기 프로젝트/자문 위주</option>
              <option value="경제활동 원하지 않음">경제활동 원하지 않음</option>
            </select>
          </div>
        </div>
      </div>

      {/* G. 내담자의 현재 고민 카드 (핵심) */}
      <div className="bg-slate-900/90 rounded-2xl border-2 border-cyan-500/50 shadow-2xl p-5 sm:p-7 backdrop-blur-md">
        <div className="flex items-center gap-3 pb-3 mb-4 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.5)]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">G. 내담자의 현재 고민 및 최우선 질문</h3>
              <span className="px-2.5 py-0.5 text-xs rounded-full bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/30">
                상담사 경청 핵심
              </span>
            </div>
            <p className="text-xs text-slate-400">
              상담사가 대화 중 파악한 내담자의 심리적 불안과 핵심 관심사를 기록합니다.
            </p>
          </div>
        </div>

        <div className="mb-2">
          <label htmlFor="clientConcerns" className="block text-xs sm:text-sm font-bold text-cyan-300 mb-2">
            질문: &ldquo;현재 퇴직 이후를 생각할 때 가장 걱정되거나 마음에 걸리는 것은 무엇입니까?&rdquo;
          </label>
          <textarea
            id="clientConcerns"
            rows={4}
            value={form.clientConcerns}
            onChange={(e) => onChange('clientConcerns', e.target.value)}
            placeholder="상담사가 대화 내용을 그대로 입력할 수 있습니다.&#10;예: '퇴직 후 연금 개시까지 3년 동안 소득이 완전히 끊기는데 아직 둘째 대학 등록금과 생활비가 가장 걱정됩니다. 30년간 행정직만 해와서 밖에서 어떤 일을 할 수 있을지 막막합니다.'"
            className="w-full p-3.5 text-sm border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 bg-slate-950/80 text-white placeholder-slate-500 leading-relaxed"
          />
        </div>
        <p className="text-xs text-slate-400">
          * 이 내용은 인공지능이 <strong className="text-cyan-300">우선순위 Top 3 및 맞춤형 자각 질문</strong>을 도출하는 핵심 판단 근거로 활용됩니다.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors cursor-pointer min-h-[46px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← 이전: 기본정보 수정</span>
        </button>

        <button
          type="button"
          id="btn-run-diagnosis"
          disabled={isLoading}
          onClick={onSubmit}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all text-sm sm:text-base cursor-pointer min-h-[46px]"
        >
          <Sparkles className="w-5 h-5 text-slate-950" />
          <span>소득 크레바스 정밀 진단 시작하기</span>
        </button>
      </div>
    </div>
  );
};
