import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { Text, TextInput, Button, Checkbox } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: false,
  });
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "YOUR_ANDROID_CLIENT_ID_HERE",
    iosClientId: "YOUR_IOS_CLIENT_ID_HERE",
    expoClientId: "YOUR_EXPO_CLIENT_ID_HERE",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      Alert.alert("Đăng nhập Google thành công");
      navigation.navigate("Home");
    }
  }, [response]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    const { username, password } = formData;
    if (!username || !password) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đủ tài khoản và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      setLoading(false);
      navigation.navigate("Home");
    } catch (e) {
      setLoading(false);
      Alert.alert("Đăng nhập thất bại", "Sai thông tin đăng nhập.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{
            uri: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1750842738/logobus_vxihzk.png",
          }}
          style={styles.logo}
        />
        <Text style={styles.title}>Chào mừng trở lại</Text>
        <Text style={styles.subtitle}>Truy cập tài khoản của bạn</Text>

       <View style={{ marginBottom: 12 }}>
  <Text style={styles.inputLabel}>Tên đăng nhập</Text>
  <TextInput
    value={formData.username}
    onChangeText={(text) => handleChange("username", text)}
    mode="outlined"
    style={styles.input}
    left={<TextInput.Icon icon="account" />}
  />
</View>

<View style={{ marginBottom: 12 }}>
  <Text style={styles.inputLabel}>Mật khẩu</Text>
  <TextInput
    value={formData.password}
    onChangeText={(text) => handleChange("password", text)}
    secureTextEntry
    mode="outlined"
    style={styles.input}
    left={<TextInput.Icon icon="lock" />}
    right={<TextInput.Icon icon="eye" />}
  />
</View>


        <View style={styles.row}>
          <Checkbox
            status={formData.remember ? "checked" : "unchecked"}
            onPress={() => handleChange("remember", !formData.remember)}
            color="#00B050"
          />
          <Text style={styles.remember}>Ghi nhớ đăng nhập</Text>
          <TouchableOpacity
            style={{ marginLeft: "auto" }}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.link}>Quên mật khẩu?</Text>
          </TouchableOpacity>
        </View>

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.loginBtn}
          labelStyle={{ color: "white", fontWeight: "bold" }}
        >
          Đăng nhập
        </Button>

        <Text style={styles.or}>Hoặc đăng nhập bằng</Text>

        <Button
          mode="outlined"
          icon="facebook"
          onPress={() => Alert.alert("Demo", "Đăng nhập Facebook")}
          style={styles.socialBtn}
          textColor="#4267B2"
        >
          Facebook
        </Button>

        <Button
          mode="outlined"
          icon="google"
          onPress={() => promptAsync()}
          style={styles.socialBtn}
          disabled={!request}
        >
          Google
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 24,
  },
  logo: {
    width: 65,
    height: 50,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "white",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  remember: {
    fontSize: 14,
    color: "#333",
  },
  link: {
    fontSize: 14,
    color: "#333",
    textDecorationLine: "underline",
  },
  loginBtn: {
    backgroundColor: "#00B050",
    borderRadius: 8,
    paddingVertical: 6,
    marginBottom: 20,
  },
  or: {
    textAlign: "center",
    color: "#888",
    marginBottom: 10,
  },
  socialBtn: {
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
  },
});
