import { ConsultationForm } from './types';

export const sampleConsultations: { title: string; desc: string; data: ConsultationForm }[] = [
  {
    title: "사례 1: 58세 6급 일반행정직 (정년퇴직 2년 전)",
    desc: "만 60세 정년퇴직 예정, 연금 개시 만 63세까지 3년(36개월) 소득 공백 예상",
    data: {
      clientName: "김○환",
      gender: "남성",
      currentAge: "58",
      employmentStatus: "재직중",
      retirementDate: "2028-12-31",
      rankPosition: "6급 주무관",
      jobCategory: "일반행정",
      serviceYears: "31년",

      pensionStartDate: "2032-01 (만 63세)",
      expectedMonthlyPension: "270만원",
      pensionAwareness: "대략 알고 있음",
      hasNationalPension: "없음",
      hasPersonalPension: "있음(연금저축/IRP 등)",
      otherRegularIncome: "없음",

      assetFinancial: "보통 (약 8천만원)",
      assetRealEstate: "비교적 충분 (자가 아파트 1채)",
      assetOther: "적음",
      assetSeverance: "보통 (명퇴수당 없음, 퇴직수당 약 6천만원 예상)",
      debts: ["주택담보대출"],
      expectedMonthlyExpense: "300~400만원",

      spouseStatus: "배우자 있음(경제활동 안 함)",
      hasDependents: "있음",
      childSupport: "결혼/학자금 등 지원 필요",
      parentSupport: "간헐적 지원",
      housingType: "자가",
      familyFinancialBurden: "둘째 자녀 대학교 마지막 학기 등록금 및 향후 결혼 비용 지원 부담",

      retirementPlans: ["재취업 적극희망", "공직경험 활용 자문·강의 관심"],
      desiredActivities: "행정사 자격증 취득 검토 및 행정 경험을 살린 비영리단체 자문 또는 행정실무 강의",

      healthPerception: "양호",
      desiredWorkDuration: "퇴직 후 3~5년",
      workIntensityPreference: "주 3~4일 또는 파트타임",

      clientConcerns: "정년퇴직 후 공무원연금 나올 때까지 3년 동안 소득이 완전히 끊깁니다. 퇴직수당으로 버티기엔 자녀 결혼 자금도 일부 도와줘야 하고 주담대 원리금도 남아 있어 불안합니다. 30년 동안 공직에만 있어서 퇴직 후 민간에서 일자리를 구할 수 있을지 걱정입니다."
    }
  },
  {
    title: "사례 2: 55세 교육공무원 (명예퇴직 고민 중)",
    desc: "자녀 독립 완료, 건강 부담으로 조기 명퇴 고민, 연금 개시까지 7~8년 장기 공백",
    data: {
      clientName: "박○영",
      gender: "여성",
      currentAge: "55",
      employmentStatus: "퇴직예정",
      retirementDate: "2027-02-28",
      rankPosition: "교사",
      jobCategory: "교육",
      serviceYears: "26년",

      pensionStartDate: "2034-03 (만 63세)",
      expectedMonthlyPension: "240만원",
      pensionAwareness: "정확히 알고 있음",
      hasNationalPension: "없음",
      hasPersonalPension: "있음(연금저축/IRP 등)",
      otherRegularIncome: "배우자 국민연금 수령 중",

      assetFinancial: "보통",
      assetRealEstate: "비교적 충분 (자가)",
      assetOther: "없음",
      assetSeverance: "비교적 충분 (명예퇴직수당 포함)",
      debts: ["부채없음"],
      expectedMonthlyExpense: "200~300만원",

      spouseStatus: "배우자 있음(경제활동 안 함)",
      hasDependents: "없음",
      childSupport: "지원 불필요(독립)",
      parentSupport: "부양 부담 없음",
      housingType: "자가",
      familyFinancialBurden: "특별한 가족 부양 부담은 없으나 연금 개시까지 기간이 길어 생활비 관리 필요",

      retirementPlans: ["봉사·사회공헌 관심", "당분간 휴식 희망", "부업·프리랜서 관심"],
      desiredActivities: "청소년 상담, 독서 및 글쓰기, 평생학습관 소규모 인문학 강의",

      healthPerception: "근로 지속 약간 부담",
      desiredWorkDuration: "퇴직 후 1~2년",
      workIntensityPreference: "주 1~2일 또는 유연근무",

      clientConcerns: "건강상 이유로 조기 명예퇴직을 진지하게 고민하고 있는데, 연금 수령 나이까지 약 7~8년이라는 긴 소득 공백이 생깁니다. 명퇴금과 개인연금으로 생활이 가능할지, 생활비를 어떻게 줄여야 할지 막막합니다."
    }
  },
  {
    title: "사례 3: 59세 공안·경찰직 (정년 1년 전, 건보료·가교일자리 탐색)",
    desc: "정년퇴직 직전, 연금 개시 만 64세까지 4년 공백, 지역건보료 폭탄 방어와 가교 일자리 준비",
    data: {
      clientName: "최○호",
      gender: "남성",
      currentAge: "59",
      employmentStatus: "재직중",
      retirementDate: "2027-12-31",
      rankPosition: "경감",
      jobCategory: "경찰/공안",
      serviceYears: "33년",

      pensionStartDate: "2032-07 (만 64세)",
      expectedMonthlyPension: "290만원",
      pensionAwareness: "정확히 알고 있음",
      hasNationalPension: "있음",
      hasPersonalPension: "있음(연금저축/IRP 등)",
      otherRegularIncome: "없음",

      assetFinancial: "보통 (약 1억원)",
      assetRealEstate: "비교적 충분 (자가 아파트 1채)",
      assetOther: "보통",
      assetSeverance: "보통 (퇴직수당 약 7천만원 예상)",
      debts: ["부채없음"],
      expectedMonthlyExpense: "250~350만원",

      spouseStatus: "배우자 있음(경제활동 안 함)",
      hasDependents: "없음",
      childSupport: "지원 불필요(독립)",
      parentSupport: "없음",
      housingType: "자가",
      familyFinancialBurden: "자녀들은 모두 취업하여 독립했으나, 직장 퇴직 후 지역건강보험료 부과 급증이 가장 큰 고민",

      retirementPlans: ["재취업 적극희망", "보안·안전관리 전문직 탐색"],
      desiredActivities: "공공기관 안전관리 자문위원, 민간시설 보안 총괄, 취미로 텃밭 가꾸기",

      healthPerception: "양호",
      desiredWorkDuration: "퇴직 후 3~5년",
      workIntensityPreference: "주 3~4일 또는 탄력근무",

      clientConcerns: "내년 말 정년퇴직인데 공무원연금은 만 64세부터 나옵니다. 4년 동안 월 300만원가량의 생활비가 들어가는데, 자가 아파트 공시지가 때문에 퇴직하자마자 건강보험료가 지역가입자로 바뀌며 월 30만원 이상 나올까 봐 걱정입니다. 퇴직 후 건강보험 임의계속가입이나 파트타임 가교 일자리를 통해 건보료를 방어하는 전략이 절실합니다."
    }
  }
];

export { emptyForm } from './types';
