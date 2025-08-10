import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectAuthToken } from "../redux/slices/authSlice";

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

// Main app screens
import HomeScreen from "../screens/home/HomeScreen";
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
  const token = useSelector(selectAuthToken);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          // Nếu đã login → Main App
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="RouteLookup" component={RouteLookupScreen} />
            <Stack.Screen name="RouteDetail" component={RouteDetailScreen} />
            <Stack.Screen
              name="TrackingTransportInfo"
              component={TrackingTransportInfo}
              options={{ headerShown: false, presentation: "modal" }}
            />
            <Stack.Screen name="TicketsScreen" component={MyTicketScreen} />
            <Stack.Screen name="BuyTicketScreen" component={BuyTicketScreen} />
            <Stack.Screen name="PaymentWebViewScreen" component={PaymentWebViewScreen} />
            <Stack.Screen name="TicketDetail" component={TicketDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
            <Stack.Screen name="NotificationPanel" component={NotificationPanel} />
          </>
        ) : (
          // Chưa login → Auth Flow
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="AvatarScreen" component={AvatarScreen} />
            <Stack.Screen name="AddPaymentMethod" component={AddPaymentMethodScreen} />
            <Stack.Screen name="OTPVerificationScreen" component={OTPVerificationScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="RegisterSuccess" component={RegisterSuccessScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
