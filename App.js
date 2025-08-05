import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Provider as PaperProvider } from "react-native-paper";
import { theme } from "./src/theme/theme";

import AppNavigator from "./src/navigation/AppNavigator";

import { Provider } from "react-redux";
import { store } from "./src/redux/store";

// ⚠️ Nếu bạn dùng CartContext sau này, mở lại dòng dưới
// import { CartProvider } from "./src/context/CartContext";

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          {/* <CartProvider> */}
          <AppNavigator />
          {/* </CartProvider> */}
        </PaperProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
