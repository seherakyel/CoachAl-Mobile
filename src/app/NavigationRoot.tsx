import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { DashboardScreen } from "../screens/DashboardScreen";
import { CvUploadScreen } from "../screens/CvUploadScreen";
import { CompanyTargetScreen } from "../screens/CompanyTargetScreen";
import { AlignmentResultScreen } from "../screens/AlignmentResultScreen";
import { FeedbackReportScreen } from "../screens/FeedbackReportScreen";
import { InterviewHubScreen } from "../screens/InterviewHubScreen";
import { ClassicInterviewScreen } from "../screens/ClassicInterviewScreen";
import { QuizInterviewScreen } from "../screens/QuizInterviewScreen";
import { InterviewOutcomeScreen } from "../screens/InterviewOutcomeScreen";
import type { AnalyzeParamList, InterviewParamList, MainTabParamList } from "./navigationTypes";

const Tab = createBottomTabNavigator<MainTabParamList>();
const AnalyzeStack = createNativeStackNavigator<AnalyzeParamList>();
const InterviewStack = createNativeStackNavigator<InterviewParamList>();

function AnalyzeNavigator() {
  return (
    <AnalyzeStack.Navigator>
      <AnalyzeStack.Screen name="CvUpload" component={CvUploadScreen} options={{ title: "CV yükleme" }} />
      <AnalyzeStack.Screen name="CompanyTarget" component={CompanyTargetScreen} options={{ title: "Hedef" }} />
      <AnalyzeStack.Screen name="AlignmentResult" component={AlignmentResultScreen} options={{ title: "Skor" }} />
      <AnalyzeStack.Screen name="FeedbackReport" component={FeedbackReportScreen} options={{ title: "Rapor" }} />
    </AnalyzeStack.Navigator>
  );
}

function InterviewNavigator() {
  return (
    <InterviewStack.Navigator>
      <InterviewStack.Screen name="InterviewHub" component={InterviewHubScreen} options={{ title: "Merkez" }} />
      <InterviewStack.Screen name="ClassicInterview" component={ClassicInterviewScreen} options={{ title: "Klasik" }} />
      <InterviewStack.Screen name="QuizInterview" component={QuizInterviewScreen} options={{ title: "Quiz" }} />
      <InterviewStack.Screen name="InterviewOutcome" component={InterviewOutcomeScreen} options={{ title: "Sonuç" }} />
    </InterviewStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
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
        name="Analiz"
        component={AnalyzeNavigator}
        options={{
          title: "Analiz",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="chart-box-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Mulakat"
        component={InterviewNavigator}
        options={{
          title: "Mülakat",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="microphone-message" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#ffffff",
  },
};

export function NavigationRoot() {
  return (
    <NavigationContainer theme={navTheme}>
      <MainTabs />
    </NavigationContainer>
  );
}
