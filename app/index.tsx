import { searchFlights } from "@/api/searchFlights";
import { Ionicons } from "@expo/vector-icons"; // ✅ Expo vector icons
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function Index() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [serviceClass, setServiceClass] = useState("Economy");
  const [flightType, setFlightType] = useState("One-way");

  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isReturnPickerVisible, setReturnPickerVisible] = useState(false);
  const [passengerModalVisible, setPassengerModalVisible] = useState(false);

  const totalPassengers = adults + children + infants;

  const handleSearch = async () => {
  setLoading(true);
  setError("");
  setFlights([]);

  try {
    const data = await searchFlights({
      origin: origin || "",
      destination: destination || "",
      date: date ? date.toISOString().split("T")[0] : "",
      returnDate:
        flightType === "Round-trip" && returnDate
          ? returnDate.toISOString().split("T")[0]
          : "",
      adults,
      children,
      infants,
      serviceClass: serviceClass || "Economy",
    });
    setFlights(data);
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, padding: 20, backgroundColor: "#0B0B1A" }}
    >
      <View style={styles.card}>
        {/* Flight type dropdown */}
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholder}
          selectedTextStyle={styles.selected}
          data={[
            { label: "One-way", value: "One-way" },
            { label: "Round-trip", value: "Round-trip" },
          ]}
          labelField="label"
          valueField="value"
          value={flightType}
          onChange={(item) => setFlightType(item.value)}
          renderRightIcon={() => (
            <Ionicons name="chevron-down" size={18} color="#aaa" /> // ✅ fixed
          )}
        />

        {/* Service class dropdown */}
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholder}
          selectedTextStyle={styles.selected}
          data={[
            { label: "Economy", value: "Economy" },
            { label: "Premium Economy", value: "Premium Economy" },
            { label: "Business", value: "Business" },
            { label: "First", value: "First" },
          ]}
          labelField="label"
          valueField="value"
          value={serviceClass}
          onChange={(item) => setServiceClass(item.value)}
          renderRightIcon={() => (
            <Ionicons name="chevron-down" size={18} color="#aaa" /> // ✅ fixed
          )}
        />

        {/* Passengers */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setPassengerModalVisible(true)}
        >
          <Text style={styles.selected}>
            <Ionicons name="people-outline" size={16} color="#aaa" />{" "}
            {totalPassengers} passenger{totalPassengers > 1 ? "s" : ""}
          </Text>
        </TouchableOpacity>

        {/* Origin input */}
        <Text style={styles.label}>From</Text>
        <TextInput
          value={origin}
          onChangeText={setOrigin}
          placeholder="From (IATA code)"
          placeholderTextColor="#888"
          style={styles.input}
        />

        {/* Destination input */}
        <Text style={styles.label}>To</Text>
        <TextInput
          value={destination}
          onChangeText={setDestination}
          placeholder="To (IATA code)"
          placeholderTextColor="#888"
          style={styles.input}
        />

        {/* Departure date */}
        <Text style={styles.label}>Departure</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setDatePickerVisible(true)}
        >
          <Text style={styles.selected}>
            <Ionicons name="calendar-outline" size={16} color="#aaa" />{" "}
            {date ? date.toDateString() : "Select departure date"}
          </Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={(d) => {
            setDate(d);
            setDatePickerVisible(false);
          }}
          onCancel={() => setDatePickerVisible(false)}
        />

        {/* Return date (round-trip only) */}
        {flightType === "Round-trip" && (
          <>
            <Text style={styles.label}>Return</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setReturnPickerVisible(true)}
            >
              <Text style={styles.selected}>
                <Ionicons name="calendar-outline" size={16} color="#aaa" />{" "}
                {returnDate ? returnDate.toDateString() : "Select return date"}
              </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isReturnPickerVisible}
              mode="date"
              onConfirm={(d) => {
                setReturnDate(d);
                setReturnPickerVisible(false);
              }}
              onCancel={() => setReturnPickerVisible(false)}
            />
          </>
        )}

        {/* Search button */}
        <TouchableOpacity style={styles.button} onPress={handleSearch}>
          <Ionicons name="search" size={18} color="#fff" style={{ marginRight: 6 }} />{" "}
          <Text style={styles.buttonText}>Search Flights</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
      {error ? <Text style={{ marginTop: 20, color: "red" }}>{error}</Text> : null}
      {flights.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10, color: "#fff" }}>
            Results:
          </Text>
          {flights.map((f, i) => (
            <View key={f.id || i} style={styles.flightCard}>
              <Text style={{ color: "#fff" }}>Flight ID: {f.id}</Text>
              <Text style={{ color: "#fff" }}>
                Price: {f.price?.total} {f.price?.currency}
              </Text>
              <Text style={{ color: "#fff" }}>
                Duration: {f.itineraries?.[0]?.duration}
              </Text>
              <Text style={{ color: "#fff" }}>
                From: {f.itineraries?.[0]?.segments?.[0]?.departure?.iataCode} → To:{" "}
                {f.itineraries?.[0]?.segments?.[0]?.arrival?.iataCode}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Passenger modal */}
      <Modal
        transparent
        visible={passengerModalVisible}
        animationType="fade"
        onRequestClose={() => setPassengerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {[
              { label: "Adults", value: adults, setter: setAdults, min: 1 },
              { label: "Children", value: children, setter: setChildren, min: 0 },
              { label: "Infants", value: infants, setter: setInfants, min: 0 },
            ].map((p) => (
              <View style={styles.passengerRow} key={p.label}>
                <Text style={styles.label}>{p.label}</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => p.setter(Math.max(p.min, p.value - 1))}
                  >
                    <Text style={styles.counterText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.selected}>{p.value}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => p.setter(p.value + 1)}
                  >
                    <Text style={styles.counterText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={[styles.button, { marginTop: 10 }]}
              onPress={() => setPassengerModalVisible(false)}
            >
              <Text style={styles.buttonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0E0A27",
    padding: 16,
    borderRadius: 12,
  },
  dropdown: {
    height: 48,
    backgroundColor: "#0D112F",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#222",
    justifyContent: "center",
  },
  input: {
    height: 48,
    backgroundColor: "#0D112F",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#222",
    color: "#fff",
  },
  label: {
    color: "#aaa",
    fontSize: 13,
    marginBottom: 4,
  },
  placeholder: {
    fontSize: 14,
    color: "#888",
  },
  selected: {
    fontSize: 14,
    color: "#fff",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4202B4",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  flightCard: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#1A1630",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#0D112F",
    padding: 20,
    borderRadius: 12,
    margin: 20,
  },
  passengerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  counterBtn: {
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginHorizontal: 6,
  },
  counterText: {
    color: "#fff",
    fontSize: 18,
  },
});
