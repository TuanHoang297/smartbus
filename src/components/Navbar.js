import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { IconButton, Badge } from "react-native-paper";

export default function Navbar({ showBack = false, avatarUrl }) {
  const navigation = useNavigation();

  const fallbackAvatar =
    "https://res.cloudinary.com/dkfykdjlm/image/upload/v1750849062/default-avatar_dgjf0v.png";

  return (
    <View style={styles.container}>
      <View style={styles.left}>
  {showBack && (
    <IconButton
      icon="chevron-left"
      size={28}
      iconColor="#00B050"
      style={styles.backButton}
      containerColor="white"
      onPress={() => navigation.goBack()}
    />
  )}
  <TouchableOpacity onPress={() => navigation.navigate("Home")}>
    <Image
      source={{
        uri: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1750842738/logobus_vxihzk.png",
      }}
      style={styles.logo}
      resizeMode="contain"
    />
  </TouchableOpacity>
</View>


      <View style={styles.right}>
        <View>
          <IconButton
            icon="bell-outline"
            iconColor="#00B050"
            containerColor="white"
            size={24}
            style={styles.iconWrapper}
onPress={() => navigation.navigate("NotificationPanel")}
          />
          <Badge style={styles.badge} size={8} />
        </View>

        <TouchableOpacity style={styles.avatarWrapper}>
          <Image
            source={{ uri: avatarUrl || fallbackAvatar }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#00B050",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 6,
  },
  logo: {
    width: 120,
    height: 40,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    marginRight: 6,
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#00B050",
  },
  avatarWrapper: {
    backgroundColor: "#000",
    borderRadius: 24,
    padding: 6,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
