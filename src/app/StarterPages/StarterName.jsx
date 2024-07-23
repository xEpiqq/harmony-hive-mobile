import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
} from "react-native";
import {
  GrayArrow,
  HarmonyHiveText,
  SingingLady,
} from "../../../assets/images";

import { useState } from "react";

import ActionButton from "@/components/ActionButton";
import InputField from "@/components/InputField";

export default function StarterSATB({ navigation, route }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  return (
    <SafeAreaView style={{ backgroundColor: "white" }}>
      <KeyboardAvoidingView>
        <View className="flex h-full w-full bg-white items-center justify-between px-4 pt-16">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="flex items-center absolute left-2 top-10"
          >
            <Image className="h-[15px] w-[18px]" source={GrayArrow} />
          </TouchableOpacity>
          <View className="flex justify-center w-full items-center">
            <Image className="w-44 h-44 mt-16" source={SingingLady} />
            <Image className="w-52 h-8 mt-2" source={HarmonyHiveText} />
            <Text className="text-slate-400 px-20 text-center text-xl mt-2"></Text>
            <View className="flex gap-3 mt-4 w-full">
              <View className="flex gap-2">
                <InputField
                  className="w-10 bg-black"
                  placeholder="First name"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View className="flex gap-2">
                <InputField
                  className="w-10 bg-black"
                  placeholder="Last name"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>
          </View>
          <ActionButton
            text="CONTINUE"
            onPress={() =>
              navigation.push("Code", { ...route.params, firstName, lastName })
            }
            disabled={!firstName || !lastName}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
