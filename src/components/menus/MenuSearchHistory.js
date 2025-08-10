import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from "react-native";
import { Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AutoCompleteInput from "../AutoCompleteInput";
import { extractStationsFromRoutes } from "../../services/stationService";
import { useSelector } from "react-redux";
import { selectAuthToken } from "../../redux/slices/authSlice";
import api from "../../services/api";

// ==== Helpers: decode JWT ====
function base64UrlDecode(input = "") {
  try {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (base64.length % 4)) % 4;
    const padded = base64 + "=".repeat(padLen);
    if (typeof atob === "function") {
      const bin = atob(padded);
      let str = "";
      for (let i = 0; i < bin.length; i++) str += String.fromCharCode(bin.charCodeAt(i));
      try { return decodeURIComponent(escape(str)); } catch { return str; }
    } else if (typeof Buffer !== "undefined") {
      return Buffer.from(padded, "base64").toString("utf8");
    }
  } catch {}
  return "";
}
function decodeJwtPayload(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try { return JSON.parse(base64UrlDecode(parts[1])); } catch { return null; }
}
function getUserIdFromToken(token) {
  const p = decodeJwtPayload(token);
  return p?.userId || p?.id || p?.sub || p?.uid || p?.user_id || null;
}

// Tách from/to từ tên tuyến (ví dụ "A - B" hoặc "A→B")
function parseFromTo(routeName = "") {
  const s = String(routeName).trim();
  if (!s) return { from: "—", to: "—" };
  const parts = s.split(/\s*-\s*|→/).map(x => x.trim()).filter(Boolean);
  if (parts.length >= 2) return { from: parts[0], to: parts[parts.length - 1] };
  return { from: s, to: s };
}

export default function MenuSearchHistory({ onConfirm, savedPlaces = [], portalHostName }) {
  const token = useSelector(selectAuthToken);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [stationSuggestions, setStationSuggestions] = useState([]);

  const [recent, setRecent] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [recentError, setRecentError] = useState("");

  useEffect(() => {
    extractStationsFromRoutes().then(setStationSuggestions);
  }, []);

  // Fetch “chuyến đi gần đây”
  useEffect(() => {
    const fetchRecents = async () => {
      const userId = getUserIdFromToken(token);
      if (!token || !userId) {
        setRecent([]);
        return;
      }
      try {
        setLoadingRecent(true);
        setRecentError("");
        const res = await api.get(`/tickets/user/${userId}/tickets`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const arr = Array.isArray(res.data) ? res.data : res.data?.items || res.data?.data || [];
        const sorted = [...arr].sort(
          (a, b) => new Date(b.IssuedAt).getTime() - new Date(a.IssuedAt).getTime()
        );
        const mapped = sorted
          .map(t => {
            const p = parseFromTo(t.RouteName || "");
            return { ...p, key: `${p.from}__${p.to}` };
          })
          .filter((item, idx, self) => self.findIndex(x => x.key === item.key) === idx)
          .slice(0, 4)
          .map(({ from, to }) => ({ from, to }));
        setRecent(mapped);
      } catch (e) {
        setRecentError(e?.response?.data?.message || "Không tải được chuyến gần đây.");
        setRecent([]);
      } finally {
        setLoadingRecent(false);
      }
    };
    fetchRecents();
  }, [token]);

  const handleConfirm = () => {
    if (!from || !to) {
      alert("Vui lòng nhập đầy đủ điểm bắt đầu và điểm đến");
      return;
    }
    onConfirm?.(from, to);
  };

  // Header cho FlatList: 2 input + saved places + trạng thái recent
  const ListHeader = useMemo(() => (
    <View style={styles.headerBox}>
      
      <Text style={styles.title}>Điểm đến của bạn</Text>

      <View style={styles.inputRow}>
        <Icon name="map-marker-outline" size={20} color="#00B050" />
        <View style={styles.inputFlex}>
          <AutoCompleteInput
            label="Chọn điểm bắt đầu"
            value={from}
            onChange={setFrom}
            suggestions={stationSuggestions}
            onSelect={setFrom}
            portalHostName={portalHostName}  // <<< quan trọng
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <Icon name="map-marker" size={20} color="#00B050" />
        <View style={styles.inputFlex}>
          <AutoCompleteInput
            label="Bạn đang muốn đi đâu?"
            value={to}
            onChange={setTo}
            suggestions={stationSuggestions}
            onSelect={setTo}
            portalHostName={portalHostName}  // <<< quan trọng
          />
        </View>
      </View>

      <Text style={styles.section}>Chuyến đi gần đây</Text>
      {loadingRecent ? (
        <View style={{ paddingVertical: 8 }}>
          <ActivityIndicator />
        </View>
      ) : recentError ? (
        <Text style={{ color: "red", marginBottom: 8 }}>{recentError}</Text>
      ) : recent.length === 0 ? (
        <Text style={{ color: "#666", marginBottom: 8 }}>Chưa có dữ liệu.</Text>
      ) : null}

      {/* Địa điểm đã lưu */}
      {Array.isArray(savedPlaces) && savedPlaces.length > 0 && (
        <>
          <Text style={styles.section}>Địa điểm đã lưu</Text>
          <View style={styles.savedRow}>
            {savedPlaces.map((item, idx) => (
              <TouchableOpacity
                key={`${item.label}-${idx}`}
                style={styles.savedBtn}
                onPress={() => setFrom(item.label)}
              >
                <Icon name={item.icon || "bookmark"} size={20} color="#00B050" />
                <Text style={styles.savedLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  ), [from, to, stationSuggestions, loadingRecent, recentError, savedPlaces, portalHostName]);

  const renderRecentItem = ({ item, index }) => (
    <TouchableOpacity
      key={`${item.from}-${item.to}-${index}`}
      style={styles.recentItem}
      onPress={() => {
        setFrom(item.from);
        setTo(item.to);
      }}
      activeOpacity={0.8}
    >
      <Icon name="history" color="white" size={24} />
      <View style={{ marginLeft: 10 }}>
        <Text style={styles.recentFrom}>{item.from}</Text>
        <Text style={styles.recentTo}>{item.to}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={recent}
      renderItem={renderRecentItem}
      keyExtractor={(item, idx) => `${item.from}-${item.to}-${idx}`}
      ListHeaderComponent={ListHeader}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      initialNumToRender={8}
      windowSize={7}
      removeClippedSubviews
      ListFooterComponent={
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Xác nhận lựa chọn</Text>
        </TouchableOpacity>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "white", padding: 16, borderRadius: 16,},
  headerBox: {},
  title: { fontSize: 16, fontWeight: "600", marginBottom: 12, textAlign: "center" },
  inputRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  inputFlex: { flex: 1, marginLeft: 8 },
  section: { marginTop: 16, fontWeight: "500", fontSize: 14, color: "#333", marginBottom: 8 },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A8F0C6",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  recentFrom: { fontWeight: "bold", fontSize: 14 },
  recentTo: { fontSize: 13, color: "#555" },
  savedRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  savedBtn: { alignItems: "center", paddingVertical: 8, paddingHorizontal: 14, backgroundColor: "#f5f5f5", borderRadius: 12 },
  savedLabel: { marginTop: 4, fontSize: 12, color: "#00B050" },
  confirmBtn: {
    backgroundColor: "#00B050",
    borderRadius: 8,
    marginTop: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
});
