import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";
import { theme } from "./src/theme/theme";
import AppNavigator from "./src/navigation/AppNavigator";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./src/redux/store";
import { loadAuthFromStorage } from "./src/redux/slices/authSlice";

function AppContent() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authError = useSelector(state => state.auth.error);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await dispatch(loadAuthFromStorage());
        setLoading(false);
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
        setLoading(false);
      }
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

  if (error || authError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 20 }}>
          Có lỗi xảy ra: {error || authError}
        </Text>
        <Text style={{ textAlign: 'center' }}>
          Vui lòng khởi động lại ứng dụng
        </Text>
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
