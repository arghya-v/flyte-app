import { searchFlights } from "@/api/searchFlights";
import { useState } from "react";
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    width: "100%", // now allowed
  },
});

export default function Index() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");
  const [infants, setInfants] = useState("0");
  const [serviceClass, setServiceClass] = useState("economy");

  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setFlights([]);

    try {
      const data = await searchFlights({
        origin,
        destination,
        date,
        returnDate: returnDate || undefined,
        adults: parseInt(adults),
        children: parseInt(children),
        infants: parseInt(infants),
        serviceClass,
      });
      setFlights(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>Flight Search</Text>

      <TextInput value={origin} onChangeText={setOrigin} placeholder="Origin (e.g. JFK)" style={styles.input} placeholderTextColor="#888"/>
      <TextInput value={destination} onChangeText={setDestination} placeholder="Destination (e.g. LHR)" style={styles.input} placeholderTextColor="#888"/>
      <TextInput value={date} onChangeText={setDate} placeholder="Departure Date (YYYY-MM-DD)" style={styles.input} placeholderTextColor="#888"/>
      <TextInput value={returnDate} onChangeText={setReturnDate} placeholder="Return Date (optional)" style={styles.input} placeholderTextColor="#888"/>
      <TextInput value={adults} onChangeText={setAdults} placeholder="Adults" keyboardType="numeric" style={styles.input} placeholderTextColor="#888"/>
      <TextInput value={children} onChangeText={setChildren} placeholder="Children" keyboardType="numeric" style={styles.input} placeholderTextColor="#888"/>
      <TextInput value={infants} onChangeText={setInfants} placeholder="Infants" keyboardType="numeric" style={styles.input} />
      <TextInput value={serviceClass} onChangeText={setServiceClass} placeholder="Class (economy/business/etc)" style={styles.input} placeholderTextColor="#888"/>

      <Button title="Search Flights" onPress={handleSearch} />

      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
      {error ? <Text style={{ marginTop: 20, color: "red" }}>{error}</Text> : null}

      {flights.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Results:</Text>
          {flights.map((f, i) => (
            <View key={f.id || i} style={flightCardStyle}>
              <Text>Flight ID: {f.id}</Text>
              <Text>Price: {f.price?.total} {f.price?.currency}</Text>
              <Text>Duration: {f.itineraries?.[0]?.duration}</Text>
              <Text>
                From: {f.itineraries?.[0]?.segments?.[0]?.departure?.iataCode} → To: {f.itineraries?.[0]?.segments?.[0]?.arrival?.iataCode}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}


const flightCardStyle = {
  padding: 10,
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 8,
  marginBottom: 10,
};
