import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/slices/authSlice";

export default function LoginScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    const { email, password } = formData;
    if (!email || !password) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập email và mật khẩu.");
      return;
    }

    try {
      const result = await dispatch(login({ email, password })).unwrap();
      if (result) {
        Alert.alert("Đăng nhập thành công!");
        navigation.navigate("Home");
      }
    } catch (error) {
      Alert.alert("Đăng nhập thất bại", error?.message || "Vui lòng thử lại.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Image
            source={{
              uri: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1750842738/logobus_vxihzk.png",
            }}
            style={styles.logo}
          />
          <Text style={styles.title}>Chào mừng trở lại</Text>
          <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>

          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => handleChange("email", text)}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
          />

          <TextInput
            label="Mật khẩu"
            value={formData.password}
            onChangeText={(text) => handleChange("password", text)}
            secureTextEntry={!showPassword}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword((prev) => !prev)}
              />
            }
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={authState.status === "loading"}
            disabled={authState.status === "loading"}
            style={styles.loginBtn}
            labelStyle={{ color: "white", fontWeight: "bold" }}
          >
            Đăng nhập
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            Quên mật khẩu?
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flexGrow: 1,
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
  loginBtn: {
    backgroundColor: "#00B050",
    borderRadius: 8,
    paddingVertical: 6,
    marginTop: 10,
  },
});
