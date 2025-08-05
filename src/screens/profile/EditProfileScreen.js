import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNavigationBar from "../../components/BottomNavigation";
import Navbar from "../../components/Navbar";
import { LinearGradient } from "expo-linear-gradient";

export default function EditProfileScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Navbar showBack />

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Avatar section */}
        <LinearGradient
          colors={["#71e077ff", "#337e36ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerSection}
        >
         <View style={styles.headerSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarOuterRing}>
              <Image
                source={require("../../../assets/spiderman.png")}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.cameraIconWrapper}>
                <Ionicons name="camera" size={16} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.editText}>Chỉnh sửa hồ sơ của bạn bên dưới</Text>
        </View>
        </LinearGradient>
       

        {/* Form section */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Tên người dùng</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color="#888" />
            <TextInput style={styles.input} value="thientruong51" editable={false} />
          </View>

          <Text style={styles.label}>Họ và Tên</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color="#888" />
            <TextInput style={styles.input} value="Diệp Nguyễn Thiên Trường" />
          </View>

          <Text style={styles.label}>Số điện thoại</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={18} color="#888" />
            <TextInput style={styles.input} value="0912345678" keyboardType="phone-pad" />
          </View>

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color="#888" />
            <TextInput style={styles.input} value="thientruong99@gmail.com" />
          </View>
        </View>
      </ScrollView>

      <BottomNavigationBar
        activeTab="account"
        onTabPress={(key) => {
          if (key === "map") navigation.navigate("Home");
          else if (key === "search") navigation.navigate("RouteLookup");
          else if (key === "tickets") navigation.navigate("TicketsScreen");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  headerSection: {
    paddingTop:10,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: "center",
  },
  avatarWrapper: {
    marginTop: 20,
    alignItems: "center",
  },
  avatarOuterRing: {
    position: "relative",
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 45,
    backgroundColor: "#197419ff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
 avatar: {
    width: 80,
    height: 80,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "#000",
  },
  cameraIconWrapper: {
   position: "absolute",
    bottom: -12,
    right: 33,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
  },
  editText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginTop: 25,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 12,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
    color: "#000",
  },
});
