import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
} from "react-native";
import { LadyWalkingByPhone, HarmonyHiveText } from "../../../assets/images";

import ActionButton from "@/components/ActionButton";
import InputField from "@/components/InputField";
import { GrayArrow } from "../../../assets/images";
import firestore from "@react-native-firebase/firestore";

import { useState } from "react";

export default function StarterCode({ navigation, route }) {
  const [onboardingCode, setOnboardingCode] = useState("");
  const [onboardError, setOnboardError] = useState("");

  const codeEntered = async () => {
    try {
      const querySnapshot = await firestore()
        .collection("choirs")
        .where("code", "==", onboardingCode)
        .get();

      if (querySnapshot.empty) {
        setOnboardError("Wrong code, sorry!");
      } else {
        const choirDoc = querySnapshot.docs[0];
        const choirName = choirDoc.data().name;
        const choirUid = choirDoc.id;
        navigation.push("CreateAccount", {
          ...route.params,
          onboardingCode,
          choirName,
          choirUid,
        });
        setOnboardError("");
      }
    } catch (error) {
      console.error("Error fetching choirs:", error);
      setOnboardError("An error occurred while checking the code.");
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: "white" }}>
      <KeyboardAvoidingView>
        <View className="flex w-full h-full bg-white items-center justify-between px-4 pt-16">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="flex items-center absolute left-2 p-2 top-10"
          >
            <Image className="h-[15px] w-[18px]" source={GrayArrow} />
          </TouchableOpacity>
          <View className="flex w-full justify-center items-center">
            <Image className="w-44 h-44 mt-16" source={LadyWalkingByPhone} />
            <Image className="w-52 h-8 mt-2" source={HarmonyHiveText} />
            <Text className="text-slate-400 px-20 text-center text-xl mt-2 mb-4">
              Almost done. Enter your choir code below to join!
            </Text>
            <InputField
              placeholder="Choir Membership Code"
              value={onboardingCode}
              onChangeText={setOnboardingCode}
              maxLength={6}
            />
            <Text className="text-red-400 px-20 text-center text-md mt-2">
              {onboardError}
            </Text>
          </View>
          <ActionButton
            text="CONTINUE"
            onPress={codeEntered}
            disabled={!onboardingCode}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
