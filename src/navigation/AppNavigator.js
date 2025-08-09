import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

// Auth screens
import {
  SplashScreen,
  WelcomeScreen,
  LoginScreen,
  RegisterScreen,
  AvatarScreen,
  OTPVerificationScreen,
  RegisterSuccessScreen,
  ForgotPasswordScreen,
  AddPaymentMethodScreen,
} from "../screens/auth";



// Home screen (placeholder)
import HomeScreen from "../screens/home/HomeScreen"; // Tạm thời nếu bạn có màn hình chính
import NotificationPanel from "../components/NotificationPanel";
import { RouteLookupScreen } from "../screens/home";
import RouteDetailScreen from "../components/routes/RouteDetailScreen";
import { BuyTicketScreen, MyTicketScreen, TicketDetailScreen } from "../screens/ticket";
import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import PaymentWebViewScreen from "../screens/payment/PaymentWebViewScreen";
import TrackingTransportInfo from "../components/menus/TrackingTransportInfo";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        {/* Auth flow */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="AvatarScreen" component={AvatarScreen} />
        <Stack.Screen name="AddPaymentMethod" component={AddPaymentMethodScreen} />
        <Stack.Screen name="OTPVerificationScreen" component={OTPVerificationScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="RegisterSuccess" component={RegisterSuccessScreen} />
        <Stack.Screen name="NotificationPanel" component={NotificationPanel} />

        {/* Main app (placeholder) */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="RouteLookup" component={RouteLookupScreen} />
        <Stack.Screen name="RouteDetail" component={RouteDetailScreen} />

        <Stack.Screen name="TrackingTransportInfo" component={TrackingTransportInfo} options={{ headerShown: false, presentation: "modal", }} />

        <Stack.Screen name="TicketsScreen" component={MyTicketScreen} />
        <Stack.Screen name="BuyTicketScreen" component={BuyTicketScreen} />
        <Stack.Screen name="PaymentWebViewScreen" component={PaymentWebViewScreen} />
        <Stack.Screen name="TicketDetail" component={TicketDetailScreen} options={{ headerShown: false }} />

        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
