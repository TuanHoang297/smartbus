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
import { useNavigation } from "@react-navigation/native";
import RegisterStepper from "../../components/RegisterStepper";

export default function OTPVerificationScreen() {
  const navigation = useNavigation();
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    if (/^\d$/.test(text) || text === "") {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      if (text && index < 4) {
        inputs.current[index + 1]?.focus();
      }
    }
  };

  const handleSubmit = () => {
    const fullCode = otp.join("");
    if (fullCode.length < 5) {
      Alert.alert("Thiếu mã", "Vui lòng nhập đủ mã xác nhận.");
      return;
    }
    console.log("OTP đã nhập:", fullCode);
    navigation.navigate("RegisterSuccess");
  };

  const handleResend = () => {
    Alert.alert("Thông báo", "Đã gửi lại mã xác nhận.");
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
        Chúng tôi đã gửi cho bạn mã xác nhận vào số điện thoại 0912345678
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
        marginLeft:120

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
    width: 52,
    height: 58,
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
