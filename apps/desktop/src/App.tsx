import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  SafeAreaView,
} from "react-native";
import { invoke } from "@tauri-apps/api/core";
import reactLogo from "./assets/react.svg";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Tauri + React Native</Text>

      <View style={styles.logoRow}>
        <Image
          source={{ uri: "/vite.svg" }}
          style={styles.logo}
          alt="Vite logo"
        />
        <Image
          source={{ uri: "/tauri.svg" }}
          style={styles.logo}
          alt="Tauri logo"
        />
        <Image
          source={{ uri: reactLogo }}
          style={styles.logo}
          alt="React logo"
        />
      </View>

      <Text style={styles.subtitle}>
        Click on the Tauri, Vite, and React logos to learn more.
      </Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter a name..."
          value={name}
          onChangeText={setName}
        />
        <Pressable style={styles.button} onPress={greet}>
          <Text style={styles.buttonText}>Greet</Text>
        </Pressable>
      </View>

      {greetMsg ? <Text style={styles.message}>{greetMsg}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  logoRow: {
    flexDirection: "row",
    gap: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
  formContainer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    minWidth: 200,
    color: "#333",
  },
  button: {
    backgroundColor: "#3498db",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  message: {
    fontSize: 16,
    color: "#27ae60",
    textAlign: "center",
    fontWeight: "500",
  },
});

export default App;
