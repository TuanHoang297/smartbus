// screens/payment/PaymentWebViewScreen.js
import React, { useMemo, useRef, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation, useRoute } from "@react-navigation/native";

const isPayOSSuccessUrl = (url = "") =>
  /\/api\/PayOS\/success/i.test(url) && /[?&]orderCode=/.test(url);

const getOrderCode = (url = "") => {
  const m = url.match(/[?&]orderCode=([^&]+)/);
  return m ? decodeURIComponent(m[1]) : null;
};

export default function PaymentWebViewScreen() {
  const navigation = useNavigation();
  const { params = {} } = useRoute();
  const { payUrl, html, meta } = params || {};
  const [loading, setLoading] = useState(true);
  const seenRef = useRef(false);

  const source = useMemo(() => {
    if (html) return { html };
    if (payUrl) return { uri: payUrl };
    return null;
  }, [html, payUrl]);

  const goTickets = (orderCode, url) => {
    if (seenRef.current) return;
    seenRef.current = true;

    // ✅ Stack của bạn có route "TicketsScreen" → reset thẳng về đó
    navigation.reset({
      index: 0,
      routes: [{ name: "TicketsScreen", params: { orderCode, meta, url } }],
    });
  };

  // Chặn trang success trước khi WebView tải (tránh màn trắng in JSON)
  const handleShouldStart = (request) => {
    const url = request?.url || "";
    if (isPayOSSuccessUrl(url)) {
      const code = getOrderCode(url);
      setTimeout(() => goTickets(code, url), 0);
      return false; // CHẶN không cho WebView tải trang success
    }
    return true;
  };

  // Fallback nếu có redirect đã tải xong
  const handleNavChange = (navState) => {
    const url = navState?.url || "";
    if (isPayOSSuccessUrl(url)) {
      const code = getOrderCode(url);
      goTickets(code, url);
    }
  };

  if (!source) {
    Alert.alert("Thiếu dữ liệu", "Không có URL/HTML thanh toán.");
    navigation.goBack();
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={source}
        originWhitelist={["*"]}
        onShouldStartLoadWithRequest={handleShouldStart}
        onNavigationStateChange={handleNavChange}
        setSupportMultipleWindows={false}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        startInLoadingState
        renderLoading={() => (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator />
          </View>
        )}
      />
      {loading && (
        <View style={{
          position: "absolute", left: 0, right: 0, top: 0, bottom: 0,
          alignItems: "center", justifyContent: "center"
        }}>
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
}
