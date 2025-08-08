import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

export default function AutoCompleteInput({ label, value, onChange, suggestions, onSelect }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filtered, setFiltered] = useState([]);

  const handleChange = (text) => {
    onChange(text);
    if (text.length > 1) {
      const matches = suggestions.filter(s =>
        s.toLowerCase().includes(text.toLowerCase())
      );
      setFiltered(matches);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  return (
    <View>
      <TextInput
        value={value}
        onChangeText={handleChange}
        placeholder={label}
        mode="outlined"
        style={{ backgroundColor: 'white' }}
      />
      {showSuggestions && (
        <View style={styles.suggestionBox}>
          {filtered.map((item, idx) => (
            <TouchableOpacity key={idx} onPress={() => {
              onSelect(item);
              setShowSuggestions(false);
            }}>
              <Text style={styles.suggestionItem}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  suggestionBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 4,
    paddingVertical: 4,
    maxHeight: 150,
  },
  suggestionItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
});
