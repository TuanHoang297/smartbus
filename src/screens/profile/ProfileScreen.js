import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator, // 👈 thêm
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import Navbar from "../../components/Navbar";
import BottomNavigationBar from "../../components/BottomNavigation";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector } from "react-redux";
import { selectAuthToken } from "../../redux/slices/authSlice";
import api from "../../services/api";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";

// ==== Polyfill atob/btoa ====
import { decode as _atob, encode as _btoa } from "base-64";
if (typeof global.atob === "undefined") global.atob = _atob;
if (typeof global.btoa === "undefined") global.btoa = _btoa;

// ===== helpers =====
const CARD_WIDTH = 280;
const pad = (n) => (n < 10 ? `0${n}` : `${n}`);

const decodeJwt = (token) => {
  try {
    const base64Url = token?.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const getUserIdFromToken = (jwt) => {
  const p = decodeJwt(jwt) || {};
  return p.id || p.userId || p.uid || p.sub || p.user?._id || p.user?.id || null;
};

const endDayOfMonth = (y, m) => new Date(y, m, 0).getDate();

const formatVND = (n) => {
  if (n == null) return "";
  const num = typeof n === "number" ? n : Number(String(n).replace(/[^\d.-]/g, ""));
  return num.toLocaleString("vi-VN") + "đ";
};

const hhmm = (iso) => {
  try {
    const d = new Date(iso);
    if (isNaN(d)) return "--:--";
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "--:--";
  }
};

export default function ProfileScreen({ navigation }) {
  const token = useSelector(selectAuthToken);

  const currentMonth = new Date().getMonth() + 1; // 1..12
  const currentYear = new Date().getFullYear();
  const [month, setMonth] = useState(currentMonth);
  const [monthModalVisible, setMonthModalVisible] = useState(false);

  const [profile, setProfile] = useState(null);
  const [tickets, setTickets] = useState([]);

  const [profileLoading, setProfileLoading] = useState(false); // 👈 thêm

  const userId = useMemo(() => getUserIdFromToken(token), [token]);

  const dateRangeLabel = useMemo(() => {
    const end = endDayOfMonth(currentYear, month);
    return `01/${pad(month)} - ${pad(end)}/${pad(month)}, ${currentYear}`;
  }, [month, currentYear]);

  // ---- fetch profile by month ----
  const fetchProfile = async (selectedMonth) => {
    if (!token) {
      Alert.alert("Lỗi", "Bạn chưa đăng nhập");
      return;
    }
    if (!userId) {
      Alert.alert("Lỗi", "Không lấy được userId từ token");
      return;
    }
    try {
      setProfileLoading(true); // 👈 bật loader
      const res = await api.get(`/users/${userId}?month=${selectedMonth}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch (e) {
      console.log(e);
      Alert.alert("Lỗi", "Không tải được thông tin người dùng");
    } finally {
      setProfileLoading(false); // 👈 tắt loader
    }
  };

  // ---- fetch tickets list (map 4 fields) ----
  const fetchTickets = async () => {
    if (!token || !userId) return;
    try {
      const res = await api.get(`/tickets/user/${userId}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const arr = Array.isArray(res.data) ? res.data : res.data?.items || [];
      const mapped = arr
        .map((t) => ({
          RouteName: t.RouteName,
          Price: t.Price,
          IssuedAt: t.IssuedAt,
          TicketTypeName: t.TicketTypeName,
          id: t._id || t.id || `${t.RouteName}-${t.IssuedAt}`,
        }))
        .sort((a, b) => new Date(b.IssuedAt) - new Date(a.IssuedAt));
      setTickets(mapped);
    } catch (e) {
      console.log(e);
    }
  };

  // load khi đổi tháng / login
  useEffect(() => {
    if (token) fetchProfile(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, token]);

  useEffect(() => {
    if (token) fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // refresh khi quay lại từ EditProfileScreen
  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchProfile(month);
        fetchTickets();
      }
    }, [token, month])
  );

  return (
    <View style={{ flex: 1 }}>
      <Navbar showBack />

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Header */}
        <LinearGradient
          colors={["#71e077ff", "#337e36ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        >
          {/* 👇 khi đang load profile: show spinner thay vì avatar/tên */}
          {profileLoading ? (
            <View style={styles.headerLoading}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.headerLoadingText}>Đang tải hồ sơ…</Text>
            </View>
          ) : (
            <View style={styles.headerCard}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={
                    profile?.ImageUrl
                      ? { uri: profile.ImageUrl }
                      : require("../../../assets/spiderman.png")
                  }
                  style={styles.avatar}
                />
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    navigation.navigate("EditProfileScreen", {
                      userId,
                      initialData: {
                        username: profile?.UserName || profile?.Username || "",
                        fullName: profile?.FullName || "",
                        phoneNumber: profile?.PhoneNumber || "",
                        email: profile?.Email || "",
                        url_avatar: profile?.ImageUrl || "",
                      },
                    })
                  }
                >
                  <Feather name="edit-3" size={14} color="#000" />
                </TouchableOpacity>
              </View>
              <Text style={styles.username}>{profile?.FullName || "Chưa có tên"}</Text>
              <View style={styles.phoneContainer}>
                <Ionicons name="copy-outline" size={16} color="#4CAF50" />
                <Text style={styles.phoneText}>{profile?.PhoneNumber || "Chưa có số"}</Text>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Hành trình bạn theo dõi (kéo ngang) */}
        <View style={styles.sectionWhite}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Hành trình của bạn</Text>
              <Text style={styles.sectionDesc}>
                Nhận thông báo về những thay đổi trong lộ trình của bạn.
              </Text>
            </View>
            <TouchableOpacity style={styles.filterBtn}>
              <Text style={styles.dropdown}>Mới nhất ⌄</Text>
            </TouchableOpacity>
          </View>

          {tickets.length === 0 ? (
            <View style={styles.tripCard}>
              <Text style={{ color: "#666" }}>Chưa có vé</Text>
            </View>
          ) : (
            <View style={styles.ticketsScroller}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 16 }}
                snapToAlignment="start"
                snapToInterval={CARD_WIDTH + 12}
                decelerationRate="fast"
              >
                {tickets.map((t) => (
                  <View key={t.id} style={[styles.ticketCardH, { width: CARD_WIDTH }]}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <View style={styles.thumb} />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                          <Text style={styles.timeText}>{hhmm(t.IssuedAt)}</Text>
                          <Text style={[styles.detailText, { marginLeft: 10 }]}>
                            {t.TicketTypeName || "Vé"} • {formatVND(t.Price)}
                          </Text>
                        </View>
                        <Text style={styles.routeText} numberOfLines={1}>
                          {t.RouteName || "Tuyến không rõ"}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward-outline" size={18} color="#888" />
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Thống kê */}
        <View style={styles.sectionWhite}>
          <Text style={styles.sectionTitle}>Thống kê của bạn</Text>
          <Text style={styles.sectionDesc}>
            Nhận thông tin chi tiết về các chuyến đi của bạn.
          </Text>

          <View style={styles.kmRow}>
            <Text style={styles.kmValue}>{profile?.TotalKm ?? 0}</Text>
            <View>
              <Text style={styles.kmLabel}>km</Text>
              <Text style={styles.kmDate}>{dateRangeLabel}</Text>
            </View>

            {/* Nút chọn tháng (giữ UI cũ) */}
            <TouchableOpacity
              style={styles.monthDropdown}
              onPress={() => setMonthModalVisible(true)}
            >
              <Text style={styles.monthDropdownText}>Tháng {month} ⌄</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chỉ số thêm giữ nguyên */}
        <View style={styles.infoRow}>
          <View style={styles.infoCardGreen}>
            <Text style={styles.infoValue}>{profile?.TotalTrips ?? 0}</Text>
            <Text style={styles.infoLabel}>Số chuyến đã đi</Text>
            <Text style={styles.infoDesc}>
              Xe Bus là phương tiện bạn sử dụng nhiều nhất
            </Text>
          </View>
          <View style={styles.infoCardWhite}>
            <Text style={styles.infoValueBlack}>
              {(profile?.LongestTrip?.DistanceKm ?? 0)} km
            </Text>
            <Text style={styles.infoLabelBlack}>Chuyến đi dài nhất của bạn</Text>
            <Text style={styles.infoDescBlack}>
              {profile?.LongestTrip?.RouteName || ""}
            </Text>
          </View>
        </View>

        <View style={styles.infoCardGreenFull}>
          <Text style={styles.infoValue}>{profile?.Co2SavedKg ?? 0} KG</Text>
          <Text style={styles.infoLabel}>Giảm thiểu CO2</Text>
          <Text style={styles.infoDesc}>Tương đương với tiết kiệm 240 lít xăng</Text>
        </View>
      </ScrollView>

      {/* Modal chọn tháng */}
      <Modal
        transparent
        animationType="slide"
        visible={monthModalVisible}
        onRequestClose={() => setMonthModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Chọn tháng</Text>
            <Picker selectedValue={month} onValueChange={(v) => setMonth(v)} style={{ width: "100%" }}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <Picker.Item key={m} label={`Tháng ${m}`} value={m} />
              ))}
            </Picker>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setMonthModalVisible(false)} style={styles.modalBtn}>
                <Text style={styles.modalBtnText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  body: { backgroundColor: "#fff" },

  headerCard: {
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 15,
    paddingBottom: 15,
  },
  // 👇 style cho trạng thái loading header
  headerLoading: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  headerLoadingText: { color: "#fff", fontSize: 13 },

  avatarWrapper: {
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
  editButton: {
    position: "absolute",
    bottom: -12,
    right: 33,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
  },
  username: { color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 20 },
  phoneContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 6,
  },
  phoneText: { color: "#000", fontSize: 14, fontWeight: "500" },

  sectionWhite: { paddingHorizontal: 16, paddingTop: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  sectionDesc: { color: "#555", fontSize: 13, marginTop: 4 },
  dropdown: { fontSize: 14, color: "#555" },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: "#fff",
  },

  ticketsScroller: {
    marginLeft: 0,
    paddingLeft: 16,
  },
  ticketCardH: {
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  thumb: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#E5EDE6" },
  timeText: { fontWeight: "700", fontSize: 16 },
  detailText: { fontSize: 13, color: "#333" },
  routeText: { fontSize: 14, fontWeight: "700" },

  kmRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  kmValue: { fontSize: 28, fontWeight: "700" },
  kmLabel: { fontSize: 14, fontWeight: "600" },
  kmDate: { fontSize: 12, color: "#555" },
  monthDropdown: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
  },
  monthDropdownText: { fontSize: 13 },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  infoCardGreen: {
    backgroundColor: "#4CAF50",
    flex: 1,
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  infoCardWhite: {
    backgroundColor: "#F5F5F5",
    flex: 1,
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  infoCardGreenFull: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  infoValue: { fontSize: 20, fontWeight: "700", color: "#fff" },
  infoLabel: { fontSize: 14, fontWeight: "600", color: "#fff" },
  infoDesc: { fontSize: 12, color: "#fff" },
  infoValueBlack: { fontSize: 20, fontWeight: "700", color: "#000" },
  infoLabelBlack: { fontSize: 14, fontWeight: "600", color: "#000" },
  infoDescBlack: { fontSize: 12, color: "#000" },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  modalActions: { marginTop: 8, alignItems: "center" },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
  },
  modalBtnText: { color: "#fff", fontWeight: "600" },
});
