import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import RegisterStepper from "../../components/RegisterStepper";
import { useDispatch } from "react-redux";
import { register, sendOtp } from "../../redux/slices/authSlice";

export default function OTPVerificationScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();
  const { email, password, phone, fullName } = route.params;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (text, index) => {
    if (/^[0-9]$/.test(text) || text === "") {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      if (text && index < 5) {
        inputs.current[index + 1]?.focus();
      }
    }
  };

  const handleSubmit = async () => {
    const fullCode = otp.join("");
    if (fullCode.length < 6) {
      Alert.alert("Thiếu mã", "Vui lòng nhập đủ mã xác nhận (6 số).");
      return;
    }

    try {
      setLoading(true);
      await dispatch(
        register({
          email,
          password,
          fullName,
          phoneNumber: phone,
          otp: fullCode,
        })
      ).unwrap();

      setLoading(false);
      Alert.alert("Thành công", "Tạo tài khoản thành công.");
      navigation.navigate("RegisterSuccess");
    } catch (error) {
      setLoading(false);
      Alert.alert("Lỗi", error?.message || "Xác nhận OTP thất bại.");
    }
  };

  const handleResend = async () => {
    try {
      await dispatch(sendOtp(email)).unwrap();
      Alert.alert("Thành công", "Mã OTP đã được gửi lại.");
    } catch (error) {
      Alert.alert("Lỗi", error?.message || "Không thể gửi lại mã OTP.");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1750842738/logobus_vxihzk.png",
        }}
        style={styles.logo}
        resizeMode="contain"
      />
      <RegisterStepper step={4} />

      <Text style={styles.title}>Nhập mã xác nhận</Text>
      <Text style={styles.subtitle}>
        Chúng tôi đã gửi mã xác nhận đến email:{"\n"}
        <Text style={{ fontWeight: "bold" }}>{email}</Text>
      </Text>

      <View style={styles.otpRow}>
        {otp.map((value, index) => (
          <RNTextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            style={styles.otpInput}
            value={value}
            onChangeText={(text) => handleChange(text, index)}
            keyboardType="number-pad"
            maxLength={1}
          />
        ))}
      </View>

      <Text style={styles.smallText}>Bạn chưa nhận được mã?</Text>

      <TouchableOpacity onPress={handleResend}>
        <Text style={styles.resendLink}>Gửi lại mã</Text>
      </TouchableOpacity>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={styles.button}
        labelStyle={{ color: "white", fontWeight: "bold" }}
      >
        Xác nhận tài khoản
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    justifyContent: "center",
  },
  logo: {
    width: 80,
    height: 60,
    marginBottom: 16,
    marginLeft: 120,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#000",
  },
  subtitle: {
    textAlign: "center",
    color: "#333",
    marginBottom: 28,
    fontSize: 14,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    color: "#000",
  },
  smallText: {
    textAlign: "center",
    color: "#444",
    marginTop: 4,
  },
  resendLink: {
    textAlign: "center",
    color: "#00B050",
    fontWeight: "bold",
    marginBottom: 250,
    marginTop: 2,
  },
  button: {
    backgroundColor: "#00B050",
    borderRadius: 8,
    paddingVertical: 6,
  },
});
