import React from "react";
import { Image, StyleSheet } from "react-native";

export default function SmartBusLogo({ size = 100, style }) {
  return (
    <Image
      source={{
        uri: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1750842738/logobus_vxihzk.png",
      }}
      style={[{ width: size, height: size, marginBottom: 16 }, style]}
      resizeMode="contain"
    />
  );
}
