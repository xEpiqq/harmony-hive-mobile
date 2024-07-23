import { View, Text, Image } from "react-native";

export default function ScoreBoard() {
  return (
    <View className="flex-row relative justify-between px-4 py-3 items-center bg-[#FFDE1A] border-b-4 border-[#FFCE00]">
      <View className="flex-row items-center">
        <Image
          source={require("../../assets/images/graphics/honey-comb.png")}
          className="h-10 w-10"
        />
        <Text className="text-white ml-2 font-bold">1</Text>
      </View>
      <View className="flex-row items-center">
        <Text className="text-white mx-2 font-bold">2356</Text>
        <Image
          source={require("../../assets/images/graphics/honey-comb.png")}
          className="h-6 w-6"
        />
      </View>
      <View className="flex-row items-center">
        <Text className="text-white mr-2 font-bold">5</Text>
        <Image
          source={require("../../assets/images/graphics/honey-comb.png")}
          className="h-6 w-6"
        />
      </View>
    </View>
  );
}
