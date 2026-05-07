import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { DashboardScreen } from "../screens/DashboardScreen";
import { CvAnalysisScreen } from "../screens/CvAnalysisScreen";
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

const Tab = createBottomTabNavigator<MainTabParamList>();
const AnalyzeStack = createNativeStackNavigator<AnalyzeParamList>();
const InterviewStack = createNativeStackNavigator<InterviewParamList>();
const ReportsStack = createNativeStackNavigator<ReportsParamList>();

function AnalyzeNavigator() {
  return (
    <AnalyzeStack.Navigator>
      <AnalyzeStack.Screen name="CvAnalysisHome" component={CvAnalysisScreen} options={{ headerShown: false }} />
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
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: CoachColors.primary,
        tabBarInactiveTintColor: CoachColors.slate500,
        tabBarStyle: {
          borderTopColor: CoachColors.slate100,
          backgroundColor: CoachColors.surfaceContainerLowest,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          title: "Panel",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="view-dashboard-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="CvAnalysis"
        component={AnalyzeNavigator}
        options={{
          title: "CV Analizi",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="file-document-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Interviews"
        component={InterviewNavigator}
        options={{
          title: "Mülakatlar",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="microphone-message" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsNavigator}
        options={{
          title: "Raporlar",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="chart-box-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Ayarlar",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="cog-outline" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: CoachColors.background,
    primary: CoachColors.primaryContainer,
    card: CoachColors.surfaceContainerLowest,
    text: CoachColors.onSurface,
    border: CoachColors.slate100,
  },
};

export function NavigationRoot() {
  return (
    <NavigationContainer theme={navTheme}>
      <MainTabs />
    </NavigationContainer>
  );
}
