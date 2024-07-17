import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import auth from "@react-native-firebase/auth";
import { UserContext } from "@/contexts/UserContext";
import { StateContext } from "@/contexts/StateContext";
import { SafeAreaView } from "react-native-safe-area-context";

function Profile() {
  const user = useContext(UserContext);
  const state = useContext(StateContext);
  const navigation = useNavigation();
  const [newChoirCode, setNewChoirCode] = useState("");
  const [joinChoirError, setJoinChoirError] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(user.displayName);

  const handleChoirSelect = async (choirId) => {
    state.setChoirId(choirId);
  };

  const handleJoinChoir = async () => {
    const joinChoirResponse = await user.joinChoir(newChoirCode);
    setNewChoirCode("");
    if (joinChoirResponse) {
      setJoinChoirError(joinChoirResponse.message);
      return;
    }
  };

  const handleSignOut = async () => {
    await auth().signOut();
    // navigation.navigate("Starter");
  };

  const handleSaveDisplayName = async () => {
    await user.updateDisplayName(newDisplayName);
    setEditingName(false);
  };

  const renderChoirItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleChoirSelect(item.id)}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        backgroundColor: item.id === state.choirId ? "#e0f2fe" : "transparent",
      }}
    >
      <Text style={{ color: "#1f2937" }}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ width: "100%", height: "100%", backgroundColor: "white" }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Profile info */}
        <View style={{ alignItems: "center", marginTop: 32 }}>
          <Image
            source={{ uri: user.photoURL }}
            style={{ width: 96, height: 96, borderRadius: 48 }}
          />
          {editingName ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 16,
              }}
            >
              <TextInput
                value={newDisplayName}
                onChangeText={setNewDisplayName}
                style={{
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginRight: 8,
                }}
              />
              <TouchableOpacity onPress={handleSaveDisplayName}>
                <Text style={{ color: "#3b82f6", fontWeight: "bold" }}>
                  Save
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setEditingName(false)}
                style={{ marginLeft: 8 }}
              >
                <Text style={{ color: "red", fontWeight: "bold" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={{ fontSize: 24, fontWeight: "bold", marginTop: 16 }}>
                {user.displayName}
              </Text>
              <TouchableOpacity onPress={() => setEditingName(true)}>
                <Text style={{ color: "#3b82f6", marginTop: 8 }}>Edit</Text>
              </TouchableOpacity>
            </>
          )}
          <Text style={{ color: "#6b7280" }}>{user.email}</Text>
        </View>

        {/* Choirs section */}
        <View style={{ marginTop: 32 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              paddingHorizontal: 16,
              marginBottom: 8,
            }}
          >
            Choirs
          </Text>
          {user.choirsJoined.length > 0 ? (
            <FlatList
              data={user.choirsJoined}
              renderItem={renderChoirItem}
              keyExtractor={(item) => item.id}
            />
          ) : (
            <Text
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                color: "#6b7280",
              }}
            >
              No choirs joined
            </Text>
          )}
        </View>

        {/* Join new choir */}
        <View style={{ marginTop: 32, paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
            Join New Choir
          </Text>
          <TextInput
            value={newChoirCode}
            onChangeText={setNewChoirCode}
            placeholder="Enter choir code"
            style={{
              borderWidth: 1,
              borderColor: "#d1d5db",
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginBottom: 8,
            }}
          />
          {joinChoirError ? (
            <Text style={{ color: "red", marginBottom: 8 }}>
              {joinChoirError}
            </Text>
          ) : null}
          <TouchableOpacity
            onPress={handleJoinChoir}
            style={{
              backgroundColor: "#3b82f6",
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Join Choir
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign out button */}
        <TouchableOpacity
          style={{
            backgroundColor: "#3b82f6",
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            marginTop: 32,
            marginHorizontal: 16,
          }}
          onPress={handleSignOut}
        >
          <Text
            style={{
              color: "#ffffff",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Sign Out
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default Profile;
