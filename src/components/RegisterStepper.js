import React from "react";
import { View, StyleSheet } from "react-native";

export default function RegisterStepper({ step = 1 }) {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4].map((item, index) => (
        <React.Fragment key={item}>
          <View
            style={[
              styles.circle,
              step >= item && { backgroundColor: "#00B050" },
            ]}
          />
          {index < 3 && <View style={styles.line} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignSelf: "center",
    marginBottom: 24,
    alignItems: "center",
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ddd",
  },
  line: {
    width: 24,
    height: 2,
    backgroundColor: "#ddd",
    marginHorizontal: 4,
  },
});
