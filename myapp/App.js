import { StatusBar } from 'expo-status-bar';
import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, Button, ActivityIndicator } from "react-native";
import * as Location from "expo-location";

const GOOGLE_MAPS_API_KEY = ''; // Google APIキーを設定する

export default function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    setErrorMessage(""); // エラーメッセージをリセット

    try {
      // 位置情報の権限を取得
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMessage("Location permission not granted");
        setLoading(false);
        return;
      }

      // 現在の位置を取得
      let location = await Location.getCurrentPositionAsync({});
      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;

      // Google Places APIにリクエストを送る
      const radius = 1000; // 半径1km
      const type = 'restaurant'; // レストランを検索
      const openNow = true; // 現在開いている店舗のみ
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&opennow=${openNow}&key=${GOOGLE_MAPS_API_KEY}`;
      console.log(url);

      // APIリクエストを送る
      const response = await fetch(url);
      const data = await response.json();

      if (data.results) {
        // open_now が true の店舗のみフィルタリング
        const openRestaurants = data.results.filter(item => item.opening_hours && item.opening_hours.open_now);
        setRestaurants(openRestaurants);
      } else {
        setErrorMessage("No results found");
      }
    } catch (error) {
      setErrorMessage("Failed to get location or fetch data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Search Restaurants" onPress={handleSearch} />

      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {errorMessage ? (
        <Text style={styles.error}>{errorMessage}</Text>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.details}>{item.vicinity}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  error: {
    color: "red",
    fontSize: 18,
    textAlign: "center",
    marginTop: 10,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  details: {
    fontSize: 14,
    color: "#555",
  },
});