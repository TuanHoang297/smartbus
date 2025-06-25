import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Text, Button, Avatar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import RegisterStepper from "../../components/RegisterStepper";

export default function AvatarScreen() {
  const navigation = useNavigation();
  const [avatarUri, setAvatarUri] = useState(null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Quyền truy cập", "Bạn cần cho phép ứng dụng truy cập ảnh.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    console.log("Avatar đã chọn:", avatarUri);
    navigation.navigate("AddPaymentMethod");
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={{
          uri: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1750842738/logobus_vxihzk.png",
        }}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Stepper Indicator */}
     <RegisterStepper step={2} />

      {/* Heading */}
      <Text style={styles.title}>Ảnh đại diện</Text>
      <Text style={styles.subtitle}>
        Điền một số thông tin về bạn để tạo tài khoản mới.
      </Text>

      {/* Avatar Upload */}
      <TouchableOpacity onPress={pickImage} style={styles.avatarBorder}>
        <View style={styles.avatarWrapper}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <Avatar.Icon
              icon="image-outline"
              size={64}
              color="#666"
              style={{ backgroundColor: "transparent" }}
            />
          )}
        </View>
      </TouchableOpacity>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <Button
          mode="outlined"
          onPress={handleNext}
          style={[styles.button, styles.skipBtn]}
          labelStyle={{ color: "#00B050", fontWeight: "bold" }}
        >
          Bỏ qua
        </Button>
        <Button
          mode="contained"
          onPress={handleNext}
          style={[styles.button, styles.continueBtn]}
          labelStyle={{ color: "white", fontWeight: "bold" }}
        >
          Tiếp tục
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 80,
    height: 60,
    marginBottom: 16,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#111",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 32,
  },
  avatarBorder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    borderColor: "#00B050",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 150,
  },
  avatarWrapper: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 75,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  skipBtn: {
    borderColor: "#00B050",
  },
  continueBtn: {
    backgroundColor: "#00B050",
  },
});
