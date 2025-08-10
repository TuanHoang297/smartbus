import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";
import { theme } from "./src/theme/theme";
import AppNavigator from "./src/navigation/AppNavigator";
import { Provider, useDispatch } from "react-redux";
import { store } from "./src/redux/store";
import { loadAuthFromStorage } from "./src/redux/slices/authSlice";

function AppContent() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await dispatch(loadAuthFromStorage());
      setLoading(false);
    };
    initAuth();
  }, [dispatch]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AppContent />
        </PaperProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
