import { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from "react-native";

import AudioPlayer from "@/components/AudioPlayer";
import MusicSheets from "@/components/MusicSheets";
import { GrayArrow } from "../../assets/images";

export default function SongScreen({ handleBackPress, scrollX, screenWidth }) {
  return (
    <View className="flex flex-col h-full">
      <TouchableOpacity
        onPress={handleBackPress}
        style={{
          position: "absolute",
          flex: 1,
          top: 20,
          left: 10,
          zIndex: 1,
        }}
      >
        <Image
          source={GrayArrow}
          style={{ width: 20, height: 20, opacity: 0.7 }}
        />
      </TouchableOpacity>
      <MusicSheets scrollX={scrollX} screenWidth={screenWidth} />

      {/* THe bottom of the screen should be FFCE00 */}
      <SafeAreaView
        style={{ backgroundColor: "#FFCE00", width: "100%" }}
        edges={["bottom"]}
      >
        <View className="w-full h-16 flex justify-center bg-[#FFCE00]">
          <AudioPlayer />
        </View>
      </SafeAreaView>
    </View>
  );
}
