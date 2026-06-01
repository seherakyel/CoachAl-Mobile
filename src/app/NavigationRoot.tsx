import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DashboardScreen } from "../screens/DashboardScreen";
import { CvAnalysisScreen } from "../screens/CvAnalysisScreen";
import { CvParsedResultScreen } from "../screens/CvParsedResultScreen";
import { AlignmentResultScreen } from "../screens/AlignmentResultScreen";
import { InterviewHubScreen } from "../screens/InterviewHubScreen";
import { ClassicInterviewScreen } from "../screens/ClassicInterviewScreen";
import { QuizInterviewScreen } from "../screens/QuizInterviewScreen";
import { InterviewOutcomeScreen } from "../screens/InterviewOutcomeScreen";
import { ReportsHubScreen } from "../screens/ReportsHubScreen";
import { FeedbackReportScreen } from "../screens/FeedbackReportScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import type {
  AnalyzeParamList,
  InterviewParamList,
  MainTabParamList,
  ReportsParamList,
} from "./navigationTypes";
import { CoachColors } from "../theme/coachTheme";
import { CoachTabBar } from "../components/chrome/CoachTabBar";

const Tab = createBottomTabNavigator<MainTabParamList>();
const AnalyzeStack = createNativeStackNavigator<AnalyzeParamList>();
const InterviewStack = createNativeStackNavigator<InterviewParamList>();
const ReportsStack = createNativeStackNavigator<ReportsParamList>();

function renderCoachTabBar(props: BottomTabBarProps) {
  return <CoachTabBar {...props} />;
}

function AnalyzeNavigator() {
  return (
    <AnalyzeStack.Navigator>
      <AnalyzeStack.Screen name="CvAnalysisHome" component={CvAnalysisScreen} options={{ headerShown: false }} />
      <AnalyzeStack.Screen name="CvParsedResult" component={CvParsedResultScreen} options={{ headerShown: false }} />
      <AnalyzeStack.Screen name="AlignmentResult" component={AlignmentResultScreen} options={{ headerShown: false }} />
    </AnalyzeStack.Navigator>
  );
}

function InterviewNavigator() {
  return (
    <InterviewStack.Navigator>
      <InterviewStack.Screen name="InterviewHub" component={InterviewHubScreen} options={{ headerShown: false }} />
      <InterviewStack.Screen name="ClassicInterview" component={ClassicInterviewScreen} options={{ title: "Klasik sınav" }} />
      <InterviewStack.Screen name="QuizInterview" component={QuizInterviewScreen} options={{ title: "Teknik quiz" }} />
      <InterviewStack.Screen name="InterviewOutcome" component={InterviewOutcomeScreen} options={{ title: "Sonuç" }} />
    </InterviewStack.Navigator>
  );
}

function ReportsNavigator() {
  return (
    <ReportsStack.Navigator>
      <ReportsStack.Screen name="ReportsHub" component={ReportsHubScreen} options={{ headerShown: false }} />
      <ReportsStack.Screen name="FeedbackReport" component={FeedbackReportScreen} options={{ headerShown: false }} />
    </ReportsStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={renderCoachTabBar}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={DashboardScreen} options={{ tabBarLabel: "Panel" }} />
      <Tab.Screen name="CvAnalysis" component={AnalyzeNavigator} options={{ tabBarLabel: "CV Analizi" }} />
      <Tab.Screen name="Interviews" component={InterviewNavigator} options={{ tabBarLabel: "Mülakatlar" }} />
      <Tab.Screen name="Reports" component={ReportsNavigator} options={{ tabBarLabel: "Raporlar" }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: "Profil" }} />
    </Tab.Navigator>
  );
}

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: CoachColors.background,
    primary: CoachColors.primary,
    card: CoachColors.surfaceCard,
    text: CoachColors.onSurface,
    border: CoachColors.outlineVariant,
  },
};

export function NavigationRoot() {
  return (
    <NavigationContainer theme={navTheme}>
      <MainTabs />
    </NavigationContainer>
  );
}
