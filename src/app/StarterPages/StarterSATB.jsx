import { View, Text, TouchableOpacity, Image } from "react-native";
import {
  SingingBird,
  GrayArrow,
  HarmonyHiveText,
} from "../../../assets/images";

import ActionButton from "@/components/ActionButton";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StarterSATB({ navigation, route }) {
  return (
    <SafeAreaView style={{ backgroundColor: "white" }}>
      <View className="flex h-full bg-white items-center px-4 pt-16 relative">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="flex items-center absolute left-2 p-2 top-10"
        >
          <Image className="h-[15px] w-[18px]" source={GrayArrow} />
        </TouchableOpacity>
        <View className="flex justify-center items-center">
          <Image className="w-44 h-44 mt-16" source={SingingBird} />
          <Image className="w-52 h-8 mt-2" source={HarmonyHiveText} />
          <Text className="text-slate-400 px-20 text-center text-xl mt-2">
            Let's begin... which part do you sing?
          </Text>
        </View>
        <View className="w-full flex flex-col gap-y-3.5 justify-end mb-3 mt-20">
          {["soprano", "alto", "tenor", "bass"].map((part) => (
            <ActionButton
              key={part}
              text={part.toUpperCase()}
              onPress={() => navigation.push("Name", { ...route.params, part })}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
