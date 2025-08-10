import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,
  Dimensions,
  UIManager,
  findNodeHandle,
  Pressable,
} from "react-native";
import { TextInput, Portal } from "react-native-paper";

export default function AutoCompleteInput({
  label,
  value,
  onChange,
  suggestions = [],
  onSelect,
  portalHostName,          // <-- hostName từ RouteSearch -> MenuSearchHistory
  itemHeight = 44,
  maxDropdownHeight = 260,
  inputProps = {},
  style,
}) {
  const [visible, setVisible] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const wrapperRef = useRef(null);

  const filtered = useMemo(() => {
    const v = (value || "").trim().toLowerCase();
    if (v.length <= 1) return [];
    return suggestions.filter(s => String(s).toLowerCase().includes(v));
  }, [value, suggestions]);

  const measureAnchor = () => {
    const node = findNodeHandle(wrapperRef.current);
    if (!node) return;
    UIManager.measureInWindow(node, (x, y, w, h) => setAnchor({ x, y, w, h }));
  };

  const open = () => {
    measureAnchor();
    setVisible(true);
  };
  const close = () => setVisible(false);

  const handleChange = (text) => {
    onChange?.(text);
    if ((text || "").length > 1) open();
    else close();
  };

  const handleSelect = (item) => {
    onSelect?.(item);
    close();
  };

  const screenH = Dimensions.get("window").height;
  const top = anchor.y + anchor.h + 4;
  const bottomSpace = screenH - top - 16;
  const ddHeight = Math.min(maxDropdownHeight, Math.max(140, bottomSpace));

  return (
    <View collapsable={false} ref={wrapperRef} style={[styles.root, style]}>
      <TextInput
        value={value}
        onChangeText={handleChange}
        placeholder={label}
        mode="outlined"
        style={styles.input}
        onFocus={() => {
          if ((value || "").length > 1 && filtered.length > 0) open();
        }}
        // onBlur={close} // nếu muốn blur là đóng
        {...inputProps}
      />

      {visible && filtered.length > 0 && (
        <Portal hostName={portalHostName || undefined}>
          {/* overlay toàn màn để tap ra ngoài đóng dropdown */}
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />

          {/* dropdown đặt theo toạ độ input */}
          <View
            pointerEvents="box-none"
            style={{
              position: "absolute",
              top,
              left: anchor.x,
              width: anchor.w,
              maxHeight: ddHeight,
              zIndex: 10000,
            }}
          >
            <View style={styles.dropdownBox}>
              <FlatList
                data={filtered}
                keyExtractor={(item, idx) => `${item}-${idx}`}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleSelect(item)} activeOpacity={0.7}>
                    <Text
                      style={[styles.item, { height: itemHeight, lineHeight: itemHeight - 12 }]}
                      numberOfLines={1}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                keyboardShouldPersistTaps="always"
                initialNumToRender={10}
                windowSize={7}
                removeClippedSubviews={Platform.OS === "android"}
                getItemLayout={(_, index) => ({
                  length: itemHeight,
                  offset: itemHeight * index,
                  index,
                })}
                showsVerticalScrollIndicator
                bounces={false}
              />
            </View>
          </View>
        </Portal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { position: "relative", zIndex: 1 },
  input: { backgroundColor: "white" },
  dropdownBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden",
    ...Platform.select({
      android: { elevation: 12 },
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
    }),
  },
  item: {
    paddingHorizontal: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
});
