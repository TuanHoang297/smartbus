import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TextInput as RNTextInput,
  Alert,
  Image,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);

  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const otpRefs = useRef([]);

  const handleSendCode = () => {
    if (!phoneOrEmail) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại hoặc email.");
      return;
    }
    setStep(2);
  };

  const handleConfirmOTP = () => {
    const fullCode = otp.join("");
    if (fullCode.length < 5) {
      Alert.alert("Lỗi", "Vui lòng nhập đủ mã xác thực.");
      return;
    }
    setStep(3);
  };

  const handleResetPassword = () => {
    if (!password || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ mật khẩu.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu không khớp.");
      return;
    }
    Alert.alert("Thành công", "Mật khẩu đã được cập nhật.");
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1750842738/logobus_vxihzk.png",
        }}
        style={styles.logo}
      />

      {step === 1 && (
        <>
          <Text style={styles.title}>Đặt lại mật khẩu</Text>
          <Text style={styles.subtitle}>
            Nhập số điện thoại được liên kết với tài khoản của bạn.
          </Text>

          <Text style={styles.label}>Số điện thoại hoặc Email</Text>
          <TextInput
            value={phoneOrEmail}
            onChangeText={setPhoneOrEmail}
            mode="outlined"
            style={styles.input}
            outlineColor="#00B050"
            activeOutlineColor="#00B050"
          />

          <Button
            mode="contained"
            onPress={handleSendCode}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            Gửi mã bảo mật
          </Button>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.title}>Nhập mã bảo mật</Text>
          <Text style={styles.subtitle}>
            Chúng tôi đã gửi mã gồm 5 chữ số đến {phoneOrEmail}
          </Text>

          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <RNTextInput
                key={index}
                ref={(ref) => (otpRefs.current[index] = ref)}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => {
                  const newOtp = [...otp];
                  newOtp[index] = text;
                  setOtp(newOtp);
                  if (text && index < 4) {
                    otpRefs.current[index + 1]?.focus();
                  }
                }}
              />
            ))}
          </View>

          <Button
            mode="contained"
            onPress={handleConfirmOTP}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            Xác nhận mã
          </Button>
        </>
      )}

      {step === 3 && (
        <>
          <Text style={styles.title}>Tạo mật khẩu</Text>
          <Text style={styles.subtitle}>
            Tạo mật khẩu mới cho tài khoản của bạn
          </Text>

          <Text style={styles.label}>Mật khẩu mới</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
            outlineColor="#00B050"
            activeOutlineColor="#00B050"
          />

          <Text style={styles.label}>Xác nhận mật khẩu</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
            outlineColor="#00B050"
            activeOutlineColor="#00B050"
          />

          <Button
            mode="contained"
            onPress={handleResetPassword}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            Xác nhận
          </Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  logo: {
    width: 80,
    height: 60,
    alignSelf: "center",
    marginBottom: 24,
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
  label: {
    color: "#333",
    marginBottom: 4,
    fontSize: 14,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#00B050",
    borderRadius: 8,
    marginTop: 12,
  },
  buttonLabel: {
    color: "white",
    fontWeight: "bold",
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  otpInput: {
    width: 55,
    height: 55,
    backgroundColor: "#F4F4F4",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 22,
    borderColor: "#ccc",
    borderWidth: 1,
  },
});
