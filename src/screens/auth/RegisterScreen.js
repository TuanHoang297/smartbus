import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { Text, TextInput, Button, Checkbox } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import RegisterStepper from "../../components/RegisterStepper";

export default function RegisterScreen() {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    phone: "",
    acceptTerms: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    const { username, password, phone, acceptTerms } = formData;

    if (!username || !password || !phone) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (!acceptTerms) {
      Alert.alert("Thông báo", "Bạn cần chấp nhận điều khoản.");
      return;
    }

    setLoading(true);
    try {
      console.log("Đăng ký gửi lên:", formData);
      setLoading(false);
      navigation.navigate("AvatarScreen");
    } catch (error) {
      setLoading(false);
      Alert.alert("Lỗi", "Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={{
          uri: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1750842738/logobus_vxihzk.png",
        }}
        style={styles.logo}
      />

      {/* Indicator */}
     <RegisterStepper step={1} />

      <Text style={styles.title}>Thông tin đăng kí</Text>
      <Text style={styles.subtitle}>Điền thông tin đăng kí xuống phía dưới</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tên đăng nhập</Text>
        <TextInput
          mode="outlined"
          value={formData.username}
          onChangeText={(text) => handleChange("username", text)}
          left={<TextInput.Icon icon="account" />}
          style={styles.input}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Mật khẩu</Text>
        <TextInput
          mode="outlined"
          secureTextEntry
          value={formData.password}
          onChangeText={(text) => handleChange("password", text)}
          left={<TextInput.Icon icon="lock" />}
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
        Đăng kí
      </Button>
    </ScrollView>
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
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ddd",
  },
  line: {
    width: 24,
    height: 2,
    backgroundColor: "#ddd",
    marginHorizontal: 4,
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
