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
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import auth from "@react-native-firebase/auth";
import { UserContext } from "@/contexts/UserContext";
import { StateContext } from "@/contexts/StateContext";
import { SafeAreaView } from "react-native-safe-area-context";
import auth from "@react-native-firebase/auth";
import { appleAuth } from "@invertase/react-native-apple-authentication";

function Profile() {
  const user = useContext(UserContext);
  const state = useContext(StateContext);
  const navigation = useNavigation();
  const [newChoirCode, setNewChoirCode] = useState("");
  const [joinChoirError, setJoinChoirError] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(user.displayName);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [deleteError, setDeleteError] = useState("");

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

  async function revokeSignInWithAppleToken() {
    // Check if the user is signed in with Apple
    if (auth().currentUser.providerData[0].providerId !== "apple.com") {
      console.log("User is not signed in with Apple");
      return;
    }
    // Get an authorizationCode from Apple
    const { authorizationCode } = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.REFRESH,
    });

    // Ensure Apple returned an authorizationCode
    if (!authorizationCode) {
      throw new Error(
        "Apple Revocation failed - no authorizationCode returned"
      );
    }

    // Revoke the token
    return auth().revokeToken(authorizationCode);
  }

  const handleDeleteAccount = async () => {
    revokeSignInWithAppleToken();
    if (confirmationText === `delete ${user.displayName}'s account`) {
      try {
        const userAuth = auth().currentUser;
        await userAuth.delete();
        navigation.navigate("Starter");
      } catch (error) {
        console.error("Error deleting account: ", error);
        setDeleteError(
          "Failed to delete account (signin must be very recent--try signing out, signing in again, and deleting)"
        );
      }
    } else {
      setDeleteError("Confirmation text is incorrect.");
    }
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
            source={
              user.photoURL
                ? { uri: user.photoURL }
                : require("../../public/defaultavatar.png")
            }
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

        {/* Delete account subtext */}
        <TouchableOpacity
          onPress={() => setShowDeleteModal(true)}
          style={{ position: "absolute", bottom: 16, right: 16 }}
        >
          <Text style={{ color: "red", fontSize: 12 }}>Delete Account</Text>
        </TouchableOpacity>

        {/* Delete account modal */}
        <Modal
          transparent={false}
          visible={showDeleteModal}
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <View className="w-full h-full bg-white p-20 flex justify-center">
              <Text
                style={{ fontSize: 18, fontWeight: "bold", marginBottom: 4 }}
              >
                Confirm Account Deletion
              </Text>
              <Text className="text-red-500">deletion can't be undone</Text>
              <Text style={{ marginBottom: 16 }}>
                Type "delete {user.displayName}'s account" to confirm account
                deletion.
              </Text>
              <TextInput
                value={confirmationText}
                onChangeText={setConfirmationText}
                placeholder={`delete ${user.displayName}'s account`}
                style={{
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginBottom: 16,
                }}
              />
              {deleteError ? (
                <Text style={{ color: "red", marginBottom: 8 }}>
                  {deleteError}
                </Text>
              ) : null}
              <TouchableOpacity
                onPress={handleDeleteAccount}
                style={{
                  backgroundColor: "red",
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Delete Account
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                style={{
                  backgroundColor: "#d1d5db",
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    color: "#000000",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default Profile;
