import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

export default function RegisterSuccessScreen() {
  const navigation = useNavigation();

  const handleStart = () => {
    navigation.navigate("Home"); // Hoặc trang chính bạn muốn
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
      <Text style={styles.subtitle}>
        Bây giờ chúng tôi luôn đồng hành {"\n"}cùng bạn, bất kể bạn đi đâu.
      </Text>

      <Button
        mode="contained"
        onPress={handleStart}
        style={styles.button}
        labelStyle={{ color: "black", fontWeight: "200" }}
      >
        Lên kế hoạch cho chuyến đi của bạn
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#00B050",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logo: {
    marginTop:100,
    width: 160,
    height: 160,
    marginBottom: 30,
  },
 
  subtitle: {
    color: "black",
    fontSize: 20,
    fontWeight:"600",
    textAlign: "center",
    marginBottom: 252,
  },
  button: {
    backgroundColor: "white",
    borderRadius: 8,
    padding:8
  },
});
