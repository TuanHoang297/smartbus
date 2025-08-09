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
  const latestUrlRef = useRef("");
  const successUrlRef = useRef(null); // nhớ URL success khi đã điều hướng tới đó

  const source = useMemo(() => {
    if (html) return { html };
    if (payUrl) return { uri: payUrl };
    return null;
  }, [html, payUrl]);

  const goTickets = (orderCode, url) => {
    if (seenRef.current) return;
    seenRef.current = true;

    navigation.reset({
      index: 0,
      routes: [{ name: "TicketsScreen", params: { orderCode, meta, url } }],
    });
  };

  // Khi URL thay đổi, ghi lại URL; nếu là success thì đánh dấu
  const handleNavChange = (navState) => {
    const url = navState?.url || "";
    latestUrlRef.current = url;

    if (isPayOSSuccessUrl(url)) {
      successUrlRef.current = url;
      // Không navigate ở đây; chờ trang success load xong (onLoadEnd / progress=1)
    }
  };

  // Khi một trang kết thúc load, nếu đó là success → điều hướng
  const handleLoadEnd = () => {
    setLoading(false);
    const url = latestUrlRef.current;

    if (isPayOSSuccessUrl(url)) {
      const code = getOrderCode(url);
      // (Tùy backend) thêm một nhịp nhỏ để đảm bảo server đã tạo vé xong
      setTimeout(() => goTickets(code, url), 300);
    }
  };

  // Có thể dùng thêm onLoadProgress để chắc chắn đã 100%
  const handleLoadProgress = ({ nativeEvent }) => {
    const { progress, url } = nativeEvent || {};
    latestUrlRef.current = url || latestUrlRef.current;

    if (progress === 1 && isPayOSSuccessUrl(latestUrlRef.current)) {
      const code = getOrderCode(latestUrlRef.current);
      setTimeout(() => goTickets(code, latestUrlRef.current), 0);
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
        // ❌ KHÔNG chặn success nữa
        // onShouldStartLoadWithRequest={handleShouldStart}
        onNavigationStateChange={handleNavChange}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={handleLoadEnd}
        onLoadProgress={handleLoadProgress}
        setSupportMultipleWindows={false}
        startInLoadingState
        renderLoading={() => (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator />
          </View>
        )}
      />
      {loading && (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
}
