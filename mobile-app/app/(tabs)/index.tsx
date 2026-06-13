import React, { useState } from "react";
import { View, Text, TextInput, Button, FlatList } from "react-native";
import axios from "axios";

export default function HomeScreen() {
  const [title, setTitle] = useState("");
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const getRecommendations = async () => {
    try {
      const response = await axios.post(
        "http://192.168.0.2:5000/api/recommend",
        {
          title,
          top_n: 5,
        }
      );

      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={{ padding: 40 }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>
        🎬 Movie Recommender
      </Text>

      <TextInput
        placeholder="Enter movie..."
        value={title}
        onChangeText={setTitle}
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 10,
        }}
      />

      <Button title="Get Recommendations" onPress={getRecommendations} />

      <FlatList
        data={recommendations}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={{ marginTop: 10 }}>{item}</Text>
        )}
      />
    </View>
  );
}