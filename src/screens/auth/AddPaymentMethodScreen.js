import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import RegisterStepper from "../../components/RegisterStepper"; 

export default function AddPaymentMethodScreen() {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddCard = () => {
    Alert.alert("Thông báo", "Thẻ đã được thêm thành công (demo)");
    console.log("Thông tin thẻ:", formData);
  };

  const handleNext = async () => {
    const { cardNumber, expiry, cvv } = formData;
    if (!cardNumber || !expiry || !cvv) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ thông tin.");
      return;
    }

    setLoading(true);
    try {
      console.log("Thêm thẻ:", formData);
      setLoading(false);
      navigation.navigate("OTPVerificationScreen");
    } catch (error) {
      setLoading(false);
      Alert.alert("Lỗi", "Không thể thêm thẻ. Thử lại sau.");
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
      <RegisterStepper step={3} />

      <Text style={styles.title}>Thêm phương thức thanh toán</Text>
      <Text style={styles.subtitle}>
        Kết nối thẻ ngân hàng hoặc thẻ tín dụng của bạn.
      </Text>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Thẻ Visa</Text>

      <View style={styles.cardIcons}>
        <Image
          source={{ uri: "https://img.icons8.com/color/48/mastercard-logo.png" }}
          style={styles.cardIcon}
        />
        <Image
          source={{ uri: "https://img.icons8.com/color/48/visa.png" }}
          style={styles.cardIcon}
        />
        <Image
          source={{ uri: "https://img.icons8.com/color/48/discover.png" }}
          style={styles.cardIcon}
        />
      </View>

      <TextInput
        placeholder="0000 0000 0000 0000"
        value={formData.cardNumber}
        onChangeText={(text) => handleChange("cardNumber", text)}
        keyboardType="number-pad"
        mode="outlined"
        style={styles.input}
      />
      <View style={styles.row}>
        <TextInput
          placeholder="MM/YYYY"
          value={formData.expiry}
          onChangeText={(text) => handleChange("expiry", text)}
          mode="outlined"
          style={[styles.input, { flex: 1, marginRight: 8 }]}
        />
        <TextInput
          placeholder="CVV"
          value={formData.cvv}
          onChangeText={(text) => handleChange("cvv", text)}
          mode="outlined"
          secureTextEntry
          keyboardType="number-pad"
          style={[styles.input, { flex: 1, marginLeft: 8 }]}
        />
      </View>

      <View style={styles.divider} />

      <Button
        mode="contained"
        onPress={handleNext}
        loading={loading}
        disabled={loading}
        style={styles.nextButton}
        labelStyle={{ color: "white", fontWeight: "bold" }}
      >
        Tiếp tục
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flexGrow: 1,
    padding: 24,
  },
   logo: {
    width: 80,
    height: 60,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop:50,
    marginLeft:120
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    textAlign: "center",
    color: "#555",
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#00B050",
    marginVertical: 12,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },
  cardIcons: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },
  cardIcon: {
    width: 40,
    height: 28,
    resizeMode: "contain",
  },
  input: {
    marginBottom: 12,
    backgroundColor: "white",
  },
  row: {
    flexDirection: "row",
  },
  nextButton: {
    backgroundColor: "#00B050",
    borderRadius: 8,
    marginTop: 20,
  },
});
