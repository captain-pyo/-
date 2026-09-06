import { ConsultationForm, DiagnosisResult } from '../types';

export function generateSmartFallbackDiagnosis(form: ConsultationForm): DiagnosisResult {
  // Calculate gap period
  let gapMonths = 36; // default 3 years
  let gapPeriodText = "예상 소득 크레바스: 약 36개월 (퇴직 후 연금 개시까지)";

  if (form.retirementDate && form.pensionStartDate) {
    gapPeriodText = `예상 소득 크레바스: 퇴직(${form.retirementDate})부터 연금개시(${form.pensionStartDate})까지 공백`;
  } else if (!form.pensionStartDate) {
    gapPeriodText = "정확한 기간 산출을 위해 연금 개시 시점 확인 필요";
  }

  // Crevasse Type determination
  let crevasseType = "현금흐름조정형";
  if (form.debts?.length && form.debts.includes("주택담보대출") && form.childSupport?.includes("지원")) {
    crevasseType = "가족부담동반형 (자녀지원·부채상환 병행)";
  } else if (form.retirementPlans?.includes("재취업 적극희망")) {
    crevasseType = "재취업연계형 (공직경력 민간활용)";
  } else if (form.assetFinancial === "비교적 충분" && form.assetSeverance === "비교적 충분") {
    crevasseType = "단기완충형 (자산 완충력 보유)";
  } else {
    crevasseType = "장기대응형 (지출 슬림화 및 단계적 소득발굴)";
  }

  const clientName = form.clientName || "클라이언트";

  return {
    summary: {
      gapPeriod: gapPeriodText,
      crevasseType,
      mainIssue: `${form.clientConcerns ? form.clientConcerns.slice(0, 60) + '...' : '퇴직 후 소득 중단에 대비한 안정적 비상자금 마련 및 월 고정지출 구조조정'}`,
      majorUncertainty: "연금 개시 전까지 생활비 지출 수준과 재취업 및 부업 소득의 현실적 발생 여부",
      confidence: form.pensionStartDate && form.expectedMonthlyExpense ? "높음" : "보통",
      confidenceReason: "퇴직 시점 및 대략적 연금·생활비 정보가 입력되어 구조 분석이 가능하나, 공단 조회 확정치에 대한 보완이 권장됩니다."
    },
    situationSummary: `${clientName}님은 퇴직 시점부터 공무원연금 수령 전까지 약 ${gapMonths}개월 내외의 소득 공백이 예상되는 상황입니다. 현재 가족 부양 및 부채 현황을 고려할 때 퇴직수당과 기존 자산의 소진 속도를 제어하고, 공직 경력을 활용한 현실적인 징검다리 일자리를 모색하는 것이 최우선 과제입니다.`,
    topics: [
      {
        name: "퇴직 후 현금흐름 설계",
        readinessScore: 2,
        urgencyScore: 5,
        reason: "연금 개시 전까지 고정 생활비와 필수 지출을 방어할 유동성 점검이 가장 시급함",
        actions: [
          "퇴직 후 3년간 월 필수 생활비와 재량 지출 항목 구분 정리",
          "퇴직수당 및 비상예금의 월별 인출 계획(버퍼 계좌) 분리"
        ],
        risk: "현금흐름 계획 부재 시 초기 1~2년 내 퇴직수당이 급격히 소진되어 불안 심화",
        firstAction: "최근 3개월간 가계부나 카드 명세서를 통해 월 고정지출 최소 규모 확인하기"
      },
      {
        name: "공직경력 활용 및 재취업",
        readinessScore: 2,
        urgencyScore: 4,
        reason: form.retirementPlans?.includes("재취업") ? "클라이언트가 재취업을 적극 희망하고 있어 빠른 구체화 필요" : "완전 퇴직 전 징검다리 소득원 확보 필요",
        actions: [
          "공직 수행 업무 중 민간 및 공공기관 자문, 산하기관 등 수요 분야 매핑",
          "주 2~3일 유연 근무 또는 전문 행정 자격 활용 경로 탐색"
        ],
        risk: "눈높이에 맞지 않는 구직 시도로 인한 구직 단절 및 심리적 위축",
        firstAction: "자신의 핵심 공직 경력과 자문 가능한 업무 키워드 3가지 메모해보기"
      },
      {
        name: "공적·개인연금 수령전략 점검",
        readinessScore: 3,
        urgencyScore: 4,
        reason: "공무원연금공단 정확한 예상액 및 IRP/개인연금 개시 시점 연계 필요",
        actions: [
          "공무원연금공단 내연금알아보기 시스템을 통한 정확한 수급 개시월 조회",
          "보유 개인연금의 수령 개시 연령 및 월 수령액 시뮬레이션"
        ],
        risk: "연금 수급 시점을 잘못 인지하여 예기치 못한 추가 공백 발생",
        firstAction: "공무원연금공단 홈페이지 또는 모바일 앱 로그인하여 예상 연금액 확인"
      },
      {
        name: "가족지원 및 지출 구조조정",
        readinessScore: 2,
        urgencyScore: 3,
        reason: form.familyFinancialBurden || "자녀 학자금 및 결혼 등 가족 지원 지출의 한도 설정 필요",
        actions: [
          "자녀 지원 가능 최대 한도를 사전에 합의하고 부부간 공감대 형성",
          "주거비, 보험료, 차량 유지비 등 고정비 구조조정 항목 검토"
        ],
        risk: "가족 지원 부담으로 인한 노후 안전망 훼손",
        firstAction: "배우자와 함께 퇴직 후 가족 지원 상한선에 대해 차분한 대화 시간 갖기"
      },
      {
        name: "새로운 생활방식 및 정체성 전환",
        readinessScore: 1,
        urgencyScore: 3,
        reason: "30여 년간의 공직 신분을 벗어난 후의 일상 리듬과 사회적 관계 재구축 필요",
        actions: [
          "퇴직 직후 하루 24시간의 시간표 및 주간 루틴 가상 작성",
          "직무 중심 관계에서 벗어나 취미·사회공헌 커뮤니티 탐색"
        ],
        risk: "역할 상실로 인한 퇴직 후 우울감 및 고립감",
        firstAction: "퇴직 후 평일에 매일 하고 싶은 일과 1가지(운동/산책/독서 등) 정하기"
      }
    ],
    topPriorities: [
      {
        rank: 1,
        topic: "퇴직 후 현금흐름 설계",
        reason: "소득 크레바스 기간 동안 퇴직수당 소진을 막고 매월 안정적인 생활 자금을 공급하는 최우선 토대이기 때문입니다."
      },
      {
        rank: 2,
        topic: "공직경력 활용 및 재취업",
        reason: "월 100~150만원 수준의 완충 소득만 확보되어도 크레바스 위험이 절반 이하로 대폭 경감되기 때문입니다."
      },
      {
        rank: 3,
        topic: "가족지원 및 지출 구조조정",
        reason: "클라이언트의 가장 큰 심리적 부담인 가족 지원과 생활비 규모를 사전에 현실화해야 불안이 해소되기 때문입니다."
      }
    ],
    reflectionQuestions: [
      {
        topic: "퇴직 후 현금흐름 설계",
        realityQuestion: "퇴직 다음 달부터 매월 통장에 들어오는 현금 흐름이 어떻게 변화할지 구체적으로 머릿속에 그려보신 적이 있으신가요?",
        emotionQuestion: "퇴직 후 정기 소득이 일시 중단된다는 생각을 하실 때, 가장 크게 마음에 걸리는 감정은 어떤 것입니까?",
        actionQuestion: "앞으로 3년 동안 절대 건드리지 않을 비상 생활비 규모를 정하기 위해 이번 주에 가장 먼저 확인해볼 수 있는 것은 무엇인가요?"
      },
      {
        topic: "공직경력 활용 및 재취업",
        realityQuestion: "그동안 쌓아오신 소중한 공직 경험 중에서, 민간이나 다른 조직이 가장 필요로 할 만한 역량은 무엇이라고 생각하십니까?",
        emotionQuestion: "재취업을 생각하실 때 경제적 보상 외에 사회적 역할이나 일에 대한 보람 면에서 어떤 기대를 가지고 계신가요?",
        actionQuestion: "퇴직 후 일자리 탐색을 위해 편안하게 조언을 구할 수 있는 동료나 선배 한 분에게 이번 달 안에 가볍게 연락해보실 수 있을까요?"
      },
      {
        topic: "가족지원 및 지출 구조조정",
        realityQuestion: "현재 가족을 위해 지출되는 비용 중에서 퇴직 이후에는 조금 조율하거나 줄여볼 수 있는 영역이 있을까요?",
        emotionQuestion: "가족들에게 나의 퇴직과 재정적 현실에 대해 솔직하게 이야기 나누는 데 있어 마음속 어떤 부담감이 있으신가요?",
        actionQuestion: "가족과 함께 '퇴직 후 우리 집 생활 예산'에 대해 서로 편안하게 의견을 나누는 자리를 언제쯤 마련해보면 좋을까요?"
      }
    ],
    counselingGuide: [
      "1단계: 클라이언트가 현재 가장 걱정하고 있는 마음의 불안 경청 및 공감",
      "2단계: 퇴직 시점과 연금 개시 시점 사이의 소득 공백(약 36개월) 구조를 그래프/달력으로 시각화 설명",
      "3단계: 최우선 과제(현금흐름 설계)에 대한 자각 질문으로 현재 인식 점검",
      "4단계: 재취업 및 활동 희망에 대한 생각과 감정 탐색",
      "5단계: 이번 주 내로 실행해볼 수 있는 아주 작은 행동 1가지 합의",
      "6단계: 공무원연금공단 정확한 수령 시점 및 가족 대화 확인 후 차기 상담 일정 조율"
    ],
    additionalInformationNeeded: [
      "공무원연금공단 전산 조회를 통한 정확한 연금 수급 개시 연월 및 감액 여부",
      "퇴직 시 실제 지급될 퇴직수당(명예퇴직 시 명퇴수당 포함)의 세후 수령액",
      "현재 보유 중인 주택담보대출의 거치 기간 및 월 원리금 상환 일정",
      "배우자의 국민연금 및 기타 사적연금 수령 개시 시점"
    ]
  };
}
