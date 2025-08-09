import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Navbar from "../../components/Navbar";
import BottomNavigationBar from "../../components/BottomNavigation";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectAuthToken } from "../../redux/slices/authSlice";
import api from "../../services/api";
import * as ImagePicker from "expo-image-picker";

// Cloudinary
const CLOUDINARY_CLOUD_NAME = "dkfykdjlm";
const CLOUDINARY_UPLOAD_PRESET = "smartbus";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const token = useSelector(selectAuthToken);

  // route.params: { userId, initialData: { username, fullName, phoneNumber, email, url_avatar } }
  const { userId, initialData } = route.params ?? {};

  const defaultState = useMemo(
    () => ({
      username: initialData?.username ?? "",
      fullName: initialData?.fullName ?? "",
      phoneNumber: initialData?.phoneNumber ?? "",
      email: initialData?.email ?? "",
      url_avatar: initialData?.url_avatar ?? "https://i.pravatar.cc/200?img=3",
    }),
    [initialData]
  );

  const [form, setForm] = useState(defaultState);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false); // NEW: trạng thái upload

  // Modal nhập URL avatar
  const [avatarUrlModalVisible, setAvatarUrlModalVisible] = useState(false);
  const [tempAvatarUrl, setTempAvatarUrl] = useState(form.url_avatar);

  // Modal chọn nguồn avatar
  const [pickerModalVisible, setPickerModalVisible] = useState(false);

  const hasChanges =
    form.fullName !== defaultState.fullName ||
    form.phoneNumber !== defaultState.phoneNumber ||
    form.email !== defaultState.email ||
    form.url_avatar !== defaultState.url_avatar;

  const onChange = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const validate = () => {
    if (!userId) return Alert.alert("Lỗi", "Thiếu userId."), false;
    if (!form.fullName.trim()) return Alert.alert("Lỗi", "Họ và Tên không được để trống."), false;
    if (!/^[0-9]{9,11}$/.test(form.phoneNumber.trim())) return Alert.alert("Lỗi", "Số điện thoại không hợp lệ."), false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return Alert.alert("Lỗi", "Email không hợp lệ."), false;
    if (!/^https?:\/\/.+/i.test(form.url_avatar)) return Alert.alert("Lỗi", "URL avatar phải là http/https hợp lệ."), false;
    if (!token) return Alert.alert("Lỗi", "Bạn chưa đăng nhập."), false;
    return true;
  };

  const onSave = async () => {
    if (!validate()) return;
    if (uploading) { // NEW
      Alert.alert("Đang tải ảnh", "Vui lòng đợi upload ảnh hoàn tất rồi lưu.");
      return;
    }
    try {
      setSubmitting(true);

      // ĐÚNG key theo backend
      const body = {
        FullName: form.fullName.trim(),
        PhoneNumber: form.phoneNumber.trim(),
        Email: form.email.trim(),
        ImageUrl: form.url_avatar.trim(),
      };

      const res = await api.put(`/users/${userId}`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("PUT /users response:", res?.data);

      Alert.alert("Thành công", "Cập nhật hồ sơ thành công!");
      navigation.goBack();
    } catch (e) {
      console.log("PUT /users error:", e?.response?.data || e?.message);
      const msg = e?.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại.";
      Alert.alert("Lỗi", String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  // === Upload helpers ===
  const requestMediaPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Quyền bị từ chối", "Bạn cần cho phép truy cập thư viện ảnh để chọn ảnh.");
      return false;
    }
    return true;
  };

  const uploadToCloudinary = async (localUri) => {
    const formData = new FormData();
    formData.append("file", { uri: localUri, type: "image/jpeg", name: "avatar.jpg" });
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: "POST", body: formData });
    const text = await res.text();
    if (!res.ok) {
      let msg = text;
      try { msg = JSON.parse(text)?.error?.message || text; } catch {}
      throw new Error(msg);
    }
    const data = JSON.parse(text);
    return data.secure_url;
  };

  const pickFromLibrary = async () => {
    try {
      setPickerModalVisible(false);
      const ok = await requestMediaPermission();
      if (!ok) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled) return;
      const localUri = result.assets?.[0]?.uri;
      if (!localUri) return;

      setUploading(true); // NEW
      const url = await uploadToCloudinary(localUri);
      onChange("url_avatar", url);
      Alert.alert("Thành công", "Đã tải ảnh lên Cloudinary (chưa lưu).");
    } catch (err) {
      console.log("pickFromLibrary error:", err);
      Alert.alert("Upload thất bại", String(err?.message || err));
    } finally {
      setUploading(false); // NEW
    }
  };

  const openAvatarUrlModal = () => {
    setPickerModalVisible(false);
    setTempAvatarUrl(form.url_avatar);
    setAvatarUrlModalVisible(true);
  };

  const saveAvatarUrlManual = () => {
    if (!/^https?:\/\/.+/i.test(tempAvatarUrl)) {
      Alert.alert("Lỗi", "URL avatar phải là http/https hợp lệ.");
      return;
    }
    onChange("url_avatar", tempAvatarUrl.trim());
    setAvatarUrlModalVisible(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <Navbar showBack />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 160 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header + Avatar */}
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
                  source={{ uri: form.url_avatar }}
                  style={styles.avatar}
                  // defaultSource chỉ có tác dụng cho ảnh tĩnh; giữ nguyên cũng không sao
                />
                <TouchableOpacity
                  style={styles.cameraIconWrapper}
                  onPress={() => setPickerModalVisible(true)}
                >
                  <Ionicons name="camera" size={16} color="#000" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.editText}>
              Chỉnh sửa hồ sơ của bạn bên dưới
            </Text>
          </View>
        </LinearGradient>

        {/* Form */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Tên người dùng</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color="#888" />
            <TextInput style={styles.input} value={form.username} editable={false} />
          </View>

          <Text style={styles.label}>Họ và Tên</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color="#888" />
            <TextInput
              style={styles.input}
              value={form.fullName}
              onChangeText={(t) => onChange("fullName", t)}
              placeholder="Nhập họ và tên"
            />
          </View>

          <Text style={styles.label}>Số điện thoại</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={18} color="#888" />
            <TextInput
              style={styles.input}
              value={form.phoneNumber}
              onChangeText={(t) => onChange("phoneNumber", t)}
              keyboardType="phone-pad"
              placeholder="Nhập số điện thoại"
            />
          </View>

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color="#888" />
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={(t) => onChange("email", t)}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Nhập email"
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer Save */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            ((!hasChanges || submitting || uploading) && { opacity: 0.6 })
          ]}
          onPress={onSave}
          activeOpacity={0.8}
          disabled={!hasChanges || submitting || uploading} // NEW: disable khi đang upload
        >
          {submitting ? (
            <ActivityIndicator />
          ) : (
            <>
              {uploading ? <ActivityIndicator color="#fff" /> : <Ionicons name="save-outline" size={18} color="#fff" />}
              <Text style={styles.saveText}>
                {uploading ? "Đang tải ảnh..." : "Lưu thay đổi"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <BottomNavigationBar
        activeTab="account"
        onTabPress={(key) => {
          if (key === "map") navigation.navigate("Home");
          else if (key === "search") navigation.navigate("RouteLookup");
          else if (key === "tickets") navigation.navigate("TicketsScreen");
        }}
      />

      <Modal
        visible={pickerModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.actionSheet}>
            <Text style={styles.sheetTitle}>Cập nhật ảnh đại diện</Text>
            <TouchableOpacity style={styles.sheetBtn} onPress={pickFromLibrary}>
              <Ionicons name="images-outline" size={18} color="#111" />
              <Text style={styles.sheetBtnText}>Chọn từ thư viện</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetBtn} onPress={openAvatarUrlModal}>
              <Ionicons name="link-outline" size={18} color="#111" />
              <Text style={styles.sheetBtnText}>Nhập URL ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sheetBtn, { justifyContent: "center" }]}
              onPress={() => setPickerModalVisible(false)}
            >
              <Text style={[styles.sheetBtnText, { fontWeight: "700" }]}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={avatarUrlModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAvatarUrlModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cập nhật URL Avatar</Text>
            <TextInput
              style={styles.modalInput}
              value={tempAvatarUrl}
              onChangeText={setTempAvatarUrl}
              placeholder="https://..."
              autoCapitalize="none"
              keyboardType="url"
            />
            <View style={{ alignItems: "center", marginTop: 12 }}>
              {!!tempAvatarUrl && /^https?:\/\/.+/i.test(tempAvatarUrl) ? (
                <Image source={{ uri: tempAvatarUrl }} style={{ width: 80, height: 80, borderRadius: 40 }} />
              ) : (
                <Text style={{ color: "#888", fontSize: 12 }}>Nhập URL hợp lệ để xem preview</Text>
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancel]}
                onPress={() => setAvatarUrlModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSave]}
                onPress={saveAvatarUrlManual}
              >
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff" },
  headerSection: {
    paddingTop: 10,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: "center",
  },
  avatarWrapper: { marginTop: 20, alignItems: "center" },
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
  formSection: { paddingHorizontal: 20, paddingTop: 24 },
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
  input: { flex: 1, fontSize: 14, marginLeft: 10, color: "#000" },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 72,
    paddingHorizontal: 20,
  },
  saveButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#1a7f2e",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  // Modal chung
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },

  // Action sheet
  actionSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    gap: 8,
  },
  sheetTitle: { fontSize: 16, fontWeight: "700", textAlign: "center", marginBottom: 4 },
  sheetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#f6f6f6",
  },
  sheetBtnText: { fontSize: 14, fontWeight: "600", color: "#111" },

  // Modal nhập URL
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 24,
  },
  modalTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalActions: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalCancel: { backgroundColor: "#f2f2f2" },
  modalSave: { backgroundColor: "#1a7f2e" },
  modalBtnText: { color: "#111", fontWeight: "600" },
});
