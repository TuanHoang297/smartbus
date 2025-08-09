import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

/**
 * @param {Function} callback 
 */
export function useRefreshOnFocus(callback) {
  useFocusEffect(
    useCallback(() => {
      callback();
    }, [callback])
  );
}
