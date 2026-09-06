export interface ConsultationForm {
  // A. 기본정보
  clientName: string;
  gender: '남성' | '여성' | '';
  currentAge: string;
  employmentStatus: '재직중' | '퇴직예정' | '이미퇴직' | '';
  retirementDate: string;
  rankPosition: string;
  jobCategory: string;
  serviceYears: string;

  // B. 연금 정보
  pensionStartDate: string;
  expectedMonthlyPension: string;
  pensionAwareness: '정확히 알고 있음' | '대략 알고 있음' | '잘 모름' | '';
  hasNationalPension: '있음' | '없음' | '잘 모름' | '';
  hasPersonalPension: '있음(연금저축/IRP 등)' | '없음' | '잘 모름' | '';
  otherRegularIncome: string;

  // C. 현재 재정 상황
  assetFinancial: string;
  assetRealEstate: string;
  assetOther: string;
  assetSeverance: string;
  debts: string[];
  expectedMonthlyExpense: string;

  // D. 가족·생활 정보
  spouseStatus: string;
  hasDependents: '있음' | '없음' | '';
  childSupport: string;
  parentSupport: string;
  housingType: '자가' | '전세' | '월세' | '기타' | '';
  familyFinancialBurden: string;

  // E. 퇴직 후 계획
  retirementPlans: string[];
  desiredActivities: string;

  // F. 근로 지속 가능성
  healthPerception: string;
  desiredWorkDuration: string;
  workIntensityPreference: string;

  // G. 클라이언트의 현재 고민
  clientConcerns: string;
}

export interface DiagnosisSummary {
  gapPeriod: string;
  crevasseType: string;
  mainIssue: string;
  majorUncertainty: string;
  confidence: '높음' | '보통' | '제한적' | string;
  confidenceReason: string;
}

export interface DiagnosisTopic {
  name: string;
  readinessScore: number | null; // 1~5 or null (판단 보류)
  urgencyScore: number | null; // 1~5 or null (판단 보류)
  reason: string;
  actions: string[];
  risk: string;
  firstAction: string;
}

export interface TopPriority {
  rank: number;
  topic: string;
  reason: string;
}

export interface ReflectionQuestion {
  topic: string;
  realityQuestion: string;
  emotionQuestion: string;
  actionQuestion: string;
}

export interface DiagnosisResult {
  summary: DiagnosisSummary;
  situationSummary?: string;
  topics: DiagnosisTopic[];
  topPriorities: TopPriority[];
  reflectionQuestions: ReflectionQuestion[];
  counselingGuide: string[];
  additionalInformationNeeded: string[];
}

export const emptyForm: ConsultationForm = {
  clientName: '',
  gender: '',
  currentAge: '',
  employmentStatus: '',
  retirementDate: '',
  rankPosition: '',
  jobCategory: '',
  serviceYears: '',

  pensionStartDate: '',
  expectedMonthlyPension: '',
  pensionAwareness: '',
  hasNationalPension: '',
  hasPersonalPension: '',
  otherRegularIncome: '',

  assetFinancial: '',
  assetRealEstate: '',
  assetOther: '',
  assetSeverance: '',
  debts: [],
  expectedMonthlyExpense: '',

  spouseStatus: '',
  hasDependents: '',
  childSupport: '',
  parentSupport: '',
  housingType: '',
  familyFinancialBurden: '',

  retirementPlans: [],
  desiredActivities: '',

  healthPerception: '',
  desiredWorkDuration: '',
  workIntensityPreference: '',

  clientConcerns: '',
};
