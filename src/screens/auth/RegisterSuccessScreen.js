import React from "react";
import {
  View,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

export default function RegisterSuccessScreen() {
  const navigation = useNavigation();

  const handleStart = () => {
    navigation.navigate("Home");
  };

  return (
    <ImageBackground
      source={{
        uri: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1750842962/vnmap_kizr55.png",
      }}
      style={styles.background}
      resizeMode="contain"
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        <Image
          source={{
            uri: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1750842738/logobus_vxihzk.png",
          }}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.heading}>
          Đăng ký <Text style={styles.bold}>thành công</Text>
        </Text>

        <Text style={styles.subText}>
          Bây giờ chúng tôi luôn đồng hành {"\n"}cùng bạn, bất kể bạn đi đâu.
        </Text>

        <Button
          mode="contained"
          onPress={handleStart}
          style={styles.startBtn}
          labelStyle={{ color: "#00B050", fontWeight: "bold" }}
        >
          Lên kế hoạch cho chuyến đi
        </Button>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#00B050",
    opacity: 0.85,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
  },
  heading: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  bold: {
    fontWeight: "bold",
  },
  subText: {
    color: "black",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
  },
  startBtn: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 20,
  },
});
