export type AnalyzeParamList = {
  CvUpload: undefined;
  CompanyTarget: undefined;
  AlignmentResult: { resultId?: string } | undefined;
  FeedbackReport: { sessionId?: string | null; alignmentId?: string | null } | undefined;
};

export type InterviewParamList = {
  InterviewHub: undefined;
  ClassicInterview: undefined;
  QuizInterview: undefined;
  InterviewOutcome: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Analiz: { screen?: keyof AnalyzeParamList; params?: AnalyzeParamList[keyof AnalyzeParamList] } | undefined;
  Mulakat: { screen?: keyof InterviewParamList; params?: InterviewParamList[keyof InterviewParamList] } | undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
};
