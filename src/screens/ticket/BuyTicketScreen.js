import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import Navbar from "../../components/Navbar";
import BottomNavigationBar from "../../components/BottomNavigation";
import { LinearGradient } from "expo-linear-gradient";
import { getTicketTypesForRoutes, createPayment } from "../../services/tickets.service";

// ==== Polyfill atob/btoa cho React Native (nếu thiếu) ====
import { decode as _atob, encode as _btoa } from "base-64";
if (typeof global.atob === "undefined") global.atob = _atob;
if (typeof global.btoa === "undefined") global.btoa = _btoa;

// ===== helpers =====
const formatVND = (n) => {
  if (n == null || n === "") return "—";
  const num = Number(n);
  return isNaN(num) ? String(n) : num.toLocaleString("vi-VN");
};
const makeKey = (opt, idx) =>
  `${String(opt?.routeId ?? "r")}-${String(opt?.id ?? idx)}`;

/** Giải mã JWT (base64url) để lấy payload */
const decodeJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.log("⚠️ decodeJwt error:", e);
    return null;
  }
};

// Lấy userId từ Redux (linh động theo các tên khóa có thể có) + fallback decode token
const useAuthUserId = () => {
  const u = useSelector((s) => s?.auth?.user);
  console.log("🔐 [BuyTicketScreen] Redux auth.user =", u);

  const directId = u?.id ?? u?.userId ?? u?.UserId ?? null;
  if (directId != null) {
    console.log("👤 [BuyTicketScreen] userId(direct) =", directId);
    return directId;
  }

  if (u?.token) {
    const payload = decodeJwt(u.token);
    console.log("🧾 [BuyTicketScreen] Decoded JWT payload =", payload);
    const tokenId = payload?.id ?? payload?.userId ?? null;
    if (tokenId != null) {
      console.log("👤 [BuyTicketScreen] userId(from token) =", tokenId);
      return tokenId;
    }
  }

  console.log("❓ [BuyTicketScreen] userId = null");
  return null;
};

export default function BuyTicketScreen() {
  const navigation = useNavigation();
  const { params = {} } = useRoute();
  const routesParam = Array.isArray(params.routes) ? params.routes : [];
  const userId = useAuthUserId();

  useEffect(() => {
    console.log("📦 [BuyTicketScreen] route.params =", params);
  }, [params]);

  // routeIds duy nhất từ routes
  const initialRouteIdsRef = useRef(
    Array.from(new Set(routesParam.map((r) => r?.routeId).filter(Boolean)))
  );
  const routeIds = initialRouteIdsRef.current;
  console.log("🧭 [BuyTicketScreen] unique routeIds =", routeIds);

  const [loading, setLoading] = useState(true);
  const [ticketOptions, setTicketOptions] = useState([]); // [{routeId,id,title,price,raw}]
  const [selectedKeys, setSelectedKeys] = useState(new Set()); // multi-select
  const [error, setError] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const routeNameById = useMemo(() => {
    const map = new Map();
    routesParam.forEach((r) => {
      if (r?.routeId) map.set(String(r.routeId), r?.routeName || "");
    });
    return map;
  }, [routesParam]);

  const headerTitle = useMemo(() => "Chọn loại vé", []);
  const headerSub = useMemo(() => {
    if (!routesParam.length) return "";
    const segs = routesParam
      .map((r) => {
        const rid = r?.routeId ? String(r.routeId) : "—";
        const rname = r?.routeName ? String(r.routeName) : "";
        return rname ? `${rid} - ${rname}` : `${rid}`;
      })
      .filter(Boolean);

    if (segs.length === 1) return segs[0];
    const preview = segs.slice(0, 3).join(", ");
    const more = segs.length - 3;
    return more > 0 ? `${preview} +${more}` : preview;
  }, [routesParam]);

  const redirectedRef = useRef(false);
  const redirectHome = (msg) => {
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    Alert.alert("Thiếu thông tin", msg || "Vui lòng chọn tuyến/chặng trước khi mua vé.");
    console.log("↩️ [BuyTicketScreen] redirectHome, reason:", msg);
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (!routeIds.length) {
          if (mounted) {
            setTicketOptions([]);
            setSelectedKeys(new Set());
          }
          return redirectHome("Không xác định được tuyến.");
        }

        console.log("⏬ [BuyTicketScreen] fetching ticket types for routeIds:", routeIds);
        const list = await getTicketTypesForRoutes(routeIds);
        if (!mounted) return;

        console.log("✅ [BuyTicketScreen] ticket types raw list:", list);
        if (!Array.isArray(list) || list.length === 0) {
          setTicketOptions([]);
          setSelectedKeys(new Set());
          return redirectHome("Không tìm thấy loại vé cho tuyến đã chọn.");
        }

        const seen = new Set();
        const normalized = list.filter((o, i) => {
          const k = makeKey(o, i);
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });

        console.log("🧹 [BuyTicketScreen] ticket types normalized:", normalized);
        setTicketOptions(normalized);
        setSelectedKeys(new Set());
      } catch (e) {
        console.error("💥 [BuyTicketScreen] getTicketTypesForRoutes error:", e?.response?.data || e);
        setError("Không tải được loại vé. Vui lòng thử lại.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Nhóm options theo routeId để render "Tuyến XX" -> các loại vé
  const groupedByRoute = useMemo(() => {
    const groups = new Map();
    for (let i = 0; i < ticketOptions.length; i++) {
      const o = ticketOptions[i];
      const rid = String(o?.routeId ?? "—");
      if (!groups.has(rid)) groups.set(rid, []);
      groups.get(rid).push({ ...o, __idx: i });
    }
    const grouped = Array.from(groups.entries())
      .sort(([a], [b]) => String(a).localeCompare(String(b)))
      .map(([rid, opts]) => ({ routeId: rid, options: opts }));
    console.log("📚 [BuyTicketScreen] groupedByRoute:", grouped);
    return grouped;
  }, [ticketOptions]);

  const toggleSelect = (key) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      console.log("✅ [BuyTicketScreen] selectedKeys now:", Array.from(next));
      return next;
    });
  };

  const handleConfirm = () => {
    if (!selectedKeys.size || checkoutLoading) {
      console.log(
        "⏸️ [BuyTicketScreen] handleConfirm blocked. selectedKeys.size:",
        selectedKeys.size,
        "checkoutLoading:",
        checkoutLoading
      );
      return;
    }

    // Gom các vé đã chọn -> danh sách Items
    const selectedTickets = [];
    ticketOptions.forEach((o, i) => {
      const key = makeKey(o, i);
      if (selectedKeys.has(key)) {
        const chosenRoute =
          routesParam.find((r) => String(r?.routeId) === String(o?.routeId)) || null;
        selectedTickets.push({
          ticketType: o.raw, // { TicketTypeId, TicketName, Price, ... }
          ticketUI: o,       // { routeId, id, title, price, ... }
          route: chosenRoute // { routeId, routeName, ... }
        });
      }
    });

    console.log("🧾 [BuyTicketScreen] selectedTickets:", selectedTickets);
    if (!selectedTickets.length) return;

    console.log("🔑 [BuyTicketScreen] userId (final) =", userId);
    if (!userId) {
      Alert.alert("Thiếu thông tin", "Không xác định được người dùng. Vui lòng đăng nhập lại.");
      console.log("❌ [BuyTicketScreen] Missing userId. Abort payment.");
      return;
    }

    // Chuẩn hoá payload mới: { UserId, Items: [{ RouteId, TicketTypeId }] }
    // Đồng thời loại bỏ item thiếu dữ liệu & dedupe theo (RouteId, TicketTypeId)
    const seenPair = new Set();
    const Items = selectedTickets
      .map((t) => {
        const RouteId = String(t?.ticketUI?.routeId ?? t?.route?.routeId ?? "");
        const TicketTypeId = Number(
          t?.ticketType?.TicketTypeId ?? t?.ticketUI?.id ?? 0
        );
        return { RouteId, TicketTypeId };
      })
      .filter((it) => it.RouteId && it.TicketTypeId > 0)
      .filter((it) => {
        const k = `${it.RouteId}#${it.TicketTypeId}`;
        if (seenPair.has(k)) return false;
        seenPair.add(k);
        return true;
      });

    const payload = {
      UserId: Number(userId),
      Items,
    };

    if (!Items.length) {
      Alert.alert("Thiếu dữ liệu vé", "Không xác định được RouteId / TicketTypeId.");
      console.log("❌ [BuyTicketScreen] invalid Items payload.", payload);
      return;
    }

    console.log("📤 [BuyTicketScreen] create-payment payload:", payload);

    (async () => {
      try {
        setCheckoutLoading(true);
        const res = await createPayment(payload);
        console.log("✅ [BuyTicketScreen] createPayment response:", res);

        // ✅ ƯU TIÊN checkoutUrl (PayOS)
        const checkoutUrl =
          res?.checkoutUrl ||
          res?.data?.checkoutUrl ||
          res?.data?.data?.checkoutUrl ||
          null;

        // Fallback các field cũ (tuỳ backend)
        const payUrl =
          res?.paymentUrl || res?.url || res?.redirectUrl || res?.data?.paymentUrl || null;
        const html = res?.html || res?.data?.html || null;

        console.log("🔗 [BuyTicketScreen] checkoutUrl:", checkoutUrl);
        console.log("🔗 [BuyTicketScreen] payUrl:", payUrl);
        console.log("🧩 [BuyTicketScreen] has html:", !!html);

        const meta = { selections: selectedTickets, userId: Number(userId) };

        if (checkoutUrl) {
          const navParams = { payUrl: checkoutUrl, html: null, returnUrl: null, meta };
          console.log("➡️ [BuyTicketScreen] navigate PaymentWebViewScreen with:", navParams);
          navigation.navigate("PaymentWebViewScreen", navParams);
          return;
        }

        if (!payUrl && !html) {
          Alert.alert("Tạo thanh toán", "Không tìm thấy URL/HTML thanh toán từ server.");
          console.log("❌ [BuyTicketScreen] Missing checkoutUrl/payUrl/html in response.");
          return;
        }

        const navParams = { payUrl, html, returnUrl: null, meta };
        console.log("➡️ [BuyTicketScreen] navigate PaymentWebViewScreen with:", navParams);
        navigation.navigate("PaymentWebViewScreen", navParams);
      } catch (e) {
        console.error("💥 [BuyTicketScreen] create-payment error:", e?.response?.data || e);
        Alert.alert("Lỗi thanh toán", "Không tạo được yêu cầu thanh toán. Vui lòng thử lại.");
      } finally {
        setCheckoutLoading(false);
      }
    })();
  };

  const selectedCount = selectedKeys.size;

  return (
    <View style={{ flex: 1 }}>
      <Navbar showBack />

      <View style={{ position: "relative", marginBottom: 30 }}>
        <LinearGradient
          colors={["#71e077ff", "#337e36ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        >
          <Text style={styles.headerTitle}>Chọn loại vé</Text>
          {!!headerSub && <Text style={styles.headerSub}>{headerSub}</Text>}
        </LinearGradient>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8, color: "#666" }}>Đang tải loại vé…</Text>
        </View>
      ) : error ? (
        <View style={{ padding: 16 }}>
          <Text style={{ color: "red" }}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.groupTitle}>Loại vé</Text>

          {groupedByRoute.map(({ routeId, options }) => {
            const routeName = routeNameById.get(String(routeId)) || "";
            return (
              <View key={`group-${routeId}`} style={styles.routeGroup}>
                <Text style={styles.routeGroupHeader}>
                  Xe bus số {routeId}
                  {routeName ? ` • ${routeName}` : ""}
                </Text>

                {options.map((opt) => {
                  const key = makeKey(opt, opt.__idx);
                  const checked = selectedKeys.has(key);
                  return (
                    <TouchableOpacity
                      key={key}
                      onPress={() => toggleSelect(key)}
                      style={styles.optionRow}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.routeBadge}>Tuyến: {opt.routeId ?? "—"}</Text>
                        <Text style={styles.optionTitle}>{opt.title}</Text>
                        <Text style={styles.optionDescription}>
                          Giá vé: {formatVND(opt.price)} VND
                        </Text>
                      </View>
                      <Ionicons
                        name={checked ? "checkbox" : "square-outline"}
                        size={22}
                        color={checked ? "#4CAF50" : "#aaa"}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, (!selectedCount || checkoutLoading) && { opacity: 0.6 }]}
          disabled={!selectedCount || checkoutLoading}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>
            {checkoutLoading
              ? "Đang tạo thanh toán…"
              : selectedCount
              ? `Tiếp tục (${selectedCount})`
              : "Chọn Loại vé"}
          </Text>
        </TouchableOpacity>
      </View>

      <BottomNavigationBar
        activeTab="tickets"
        onTabPress={(key) => {
          if (key === "map") navigation.navigate("Home");
          else if (key === "search") navigation.navigate("RouteLookup");
          else if (key === "account") navigation.navigate("Account");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: "#4CAF50",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 50,
    position: "relative",
    zIndex: 1,
  },
  headerTitle: { color: "#000", fontSize: 20, fontWeight: "700" },
  headerSub: { marginTop: 6, color: "#000", fontSize: 14, opacity: 0.8 },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { backgroundColor: "#fff", padding: 16, paddingBottom: 120 },

  groupTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },

  routeGroup: { marginBottom: 18 },
  routeGroupHeader: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: "#2e7d32",
  },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  routeBadge: { fontSize: 12, color: "#2e7d32", marginBottom: 2 },
  optionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  optionDescription: { fontSize: 14, color: "#666" },

  footer: { position: "absolute", bottom: 100, left: 16, right: 16 },
  confirmButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonText: { color: "#000", fontSize: 16, fontWeight: "600" },
});
