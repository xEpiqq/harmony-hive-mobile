import { SafeAreaView } from "react-native-safe-area-context";
import { HarmonyHiveText, HoneyComb } from "../../../assets/images";
import { View, Text, TouchableOpacity, Image } from "react-native";

const ActionButton = ({ text, onPress, disabled }) => (
  <TouchableOpacity
    className={`h-14 w-full flex justify-center rounded-xl border-b-4 ${
      disabled ? "bg-gray-300 border-gray-400" : "bg-[#FFDE1A] border-[#FFCE00]"
    }`}
    onPress={onPress}
    disabled={disabled}
  >
    <Text className="text-white text-center text-md font-bold">{text}</Text>
  </TouchableOpacity>
);

export default function StarterWelcome({ navigation }) {
  return (
    <SafeAreaView style={{ backgroundColor: "white", flex: 1 }}>
      <View className="flex h-full bg-white items-center justify-between px-4">
        <View className="flex flex-1 justify-center h-full items-center">
          <Image className="w-28 h-28" source={HoneyComb} />
          <Image className="w-52 h-8 mt-2" source={HarmonyHiveText} />
          <Text className="text-slate-400 px-20 text-center text-xl mt-2">
            Tell your teacher you practiced without lying.
          </Text>
        </View>
        <View className="w-full flex flex-col gap-y-3.5 justify-end">
          <ActionButton
            text="GET STARTED"
            onPress={() => navigation.push("SATB")}
          />
          <TouchableOpacity
            className="h-14 w-full flex justify-center rounded-xl border-b-4"
            onPress={() => navigation.push("Login")}
            style={{ backgroundColor: "#FFA700", borderColor: "#FFA700" }}
          >
            <Text className="text-white text-center text-md font-bold">
              I ALREADY HAVE AN ACCOUNT
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
