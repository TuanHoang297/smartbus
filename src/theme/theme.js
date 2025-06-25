import { MD3LightTheme as DefaultTheme } from "react-native-paper";

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#00B050", // xanh lá SmartBus
    secondary: "#FFC107", // vàng
    background: "#F9F9F9",
    surface: "#FFFFFF",
    onPrimary: "white",
    onSurface: "#333",
    outline: "#cccccc",
  },
};
