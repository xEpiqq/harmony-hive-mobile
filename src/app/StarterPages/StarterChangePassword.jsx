import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  SafeAreaView,
} from "react-native";

import auth from "@react-native-firebase/auth";

import { useState } from "react";

import ActionButton from "@/components/ActionButton";
import InputField from "@/components/InputField";

export default function StarterChangePassword({ navigation }) {
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const resetPassword = async () => {
    try {
      await auth().sendPasswordResetEmail(resetEmail);
      Alert.alert("Password Reset", "Password reset email sent!", [
        { text: "OK" },
      ]);
      closeModal();
    } catch (error) {
      if (error.code === "auth/invalid-email") {
        setResetError("Invalid email address.");
      } else if (error.code === "auth/user-not-found") {
        setResetError("No user found with this email address.");
      } else {
        setResetError("Failed to send reset email.");
      }
      console.error(error);
    }
    setResetEmail("");
  };

  return (
    <SafeAreaView style={{ backgroundColor: "white" }}>
      <KeyboardAvoidingView>
        <View className="flex h-full w-full bg-white items-center justify-between px-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-5 h-auto flex items-center absolute mt-12 left-2"
          >
            <Text className="text-4xl font-light">×</Text>
          </TouchableOpacity>
          <View className="flex-1 mt-44 w-full items-center">
            <View className="w-full items-center">
              <Text className="text-xl mb-4">Reset Password</Text>
              <InputField
                placeholder="Enter your email"
                value={resetEmail}
                onChangeText={setResetEmail}
              />
              {resetError ? (
                <Text className="text-red-500 mt-2">{resetError}</Text>
              ) : null}
            </View>
          </View>
          <ActionButton
            text="SEND RESET EMAIL"
            onPress={resetPassword}
            disabled={!resetEmail}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
