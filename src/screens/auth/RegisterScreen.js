import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, TextInput, Button, Checkbox } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import RegisterStepper from "../../components/RegisterStepper";
import { sendOtp } from "../../redux/slices/authSlice";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    acceptTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    const { fullName, email, password, phone, acceptTerms } = formData;

    if (!fullName || !email || !password || !phone) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ tất cả các trường.");
      return;
    }

    if (!acceptTerms) {
      Alert.alert("Thông báo", "Bạn cần chấp nhận điều khoản.");
      return;
    }

    setLoading(true);
    try {
      await dispatch(sendOtp(email)).unwrap();

      setLoading(false);
      Alert.alert("Thành công", "Mã OTP đã được gửi. Vui lòng kiểm tra email.");

      navigation.navigate("OTPVerificationScreen", {
        email,
        password,
        phone,
        fullName,
      });
    } catch (error) {
      setLoading(false);
      Alert.alert("Lỗi", error?.message || "Không thể gửi mã OTP.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={{
            uri: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1750842738/logobus_vxihzk.png",
          }}
          style={styles.logo}
        />

        <RegisterStepper step={1} />

        <Text style={styles.title}>Thông tin đăng kí</Text>
        <Text style={styles.subtitle}>Điền thông tin đăng kí xuống phía dưới</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tên người dùng</Text>
          <TextInput
            mode="outlined"
            value={formData.fullName}
            onChangeText={(text) => handleChange("fullName", text)}
            left={<TextInput.Icon icon="account" />}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            mode="outlined"
            value={formData.email}
            onChangeText={(text) => handleChange("email", text)}
            left={<TextInput.Icon icon="email" />}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            mode="outlined"
            secureTextEntry={!showPassword}
            value={formData.password}
            onChangeText={(text) => handleChange("password", text)}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword((prev) => !prev)}
              />
            }
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            mode="outlined"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(text) => handleChange("phone", text)}
            left={<TextInput.Icon icon="phone" />}
            style={styles.input}
          />
        </View>

        <View style={styles.row}>
          <Checkbox
            status={formData.acceptTerms ? "checked" : "unchecked"}
            onPress={() => handleChange("acceptTerms", !formData.acceptTerms)}
            color="#00B050"
          />
          <Text style={styles.checkboxLabel}>
            Tôi chấp nhận các Điều khoản và Chính sách bảo mật
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          style={styles.button}
          labelStyle={{ fontWeight: "bold" }}
        >
          Gửi mã xác nhận
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  logo: {
    width: 80,
    height: 60,
    alignSelf: "center",
    marginBottom: 16,
    resizeMode: "contain",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
    color: "#333",
  },
  input: {
    backgroundColor: "white",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: "#333",
  },
  button: {
    backgroundColor: "#00B050",
    borderRadius: 8,
    paddingVertical: 6,
  },
});
