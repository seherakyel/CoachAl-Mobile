export type AnalyzeParamList = {
  CvAnalysisHome: { cvId?: string } | undefined;
  CvParsedResult: { cvId: string; fileName?: string; fromUpload?: boolean };
  AlignmentResult: { resultId?: string } | undefined;
};

export type InterviewParamList = {
  InterviewHub: undefined;
  InterviewAlignmentSetup: { mode: "classic" | "quiz" };
  ClassicInterview: { alignmentId: string };
  QuizInterview: { alignmentId: string };
  InterviewOutcome: undefined;
};

export type ReportsParamList = {
  ReportsHub: undefined;
  ExamSessionDetail: { sessionId: string };
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
