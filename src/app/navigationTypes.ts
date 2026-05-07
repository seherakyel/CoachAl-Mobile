export type AnalyzeParamList = {
  CvAnalysisHome: undefined;
  AlignmentResult: { resultId?: string } | undefined;
};

export type InterviewParamList = {
  InterviewHub: undefined;
  ClassicInterview: undefined;
  QuizInterview: undefined;
  InterviewOutcome: undefined;
};

export type ReportsParamList = {
  ReportsHub: undefined;
  FeedbackReport: { alignmentId?: string; sessionId?: string | null } | undefined;
};

export type MainTabParamList = {
  Home: undefined;
  CvAnalysis:
    | undefined
    | {
        screen?: keyof AnalyzeParamList;
        params?: AnalyzeParamList[keyof AnalyzeParamList];
      };
  Interviews:
    | undefined
    | {
        screen?: keyof InterviewParamList;
        params?: InterviewParamList[keyof InterviewParamList];
      };
  Reports:
    | undefined
    | {
        screen?: keyof ReportsParamList;
        params?: ReportsParamList[keyof ReportsParamList];
      };
  Settings: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
};
