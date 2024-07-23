import { View, Text, Image } from "react-native";

export default function ScoreBoard() {
  return (
    <View className="flex-row relative justify-between px-4 py-3 items-center bg-[#FFCE00]">
      <View className="flex-row items-center">
        <Image
          source={require("../../public/honeycomb.png")}
          className="h-10 w-10"
        />
        <Text className="text-white ml-2">1</Text>
      </View>
      <View className="flex-row items-center">
        <Text className="text-white mx-2">2356</Text>
        <Image
          source={require("../../public/honeycomb.png")}
          className="h-6 w-6"
        />
      </View>
      <View className="flex-row items-center">
        <Text className="text-white mr-2">5</Text>
        <Image
          source={require("../../public/honeycomb.png")}
          className="h-6 w-6"
        />
      </View>
    </View>
  );
}
