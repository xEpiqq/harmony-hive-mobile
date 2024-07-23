import { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";

import AudioPlayer from "@/components/AudioPlayer";
import MusicSheets from "@/components/MusicSheets";
import { GrayArrow } from "../../assets/images";

export default function SongScreen({ handleBackPress, scrollX, screenWidth }) {

  return (
    <View className="w-full h-full flex flex-col">
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

      <View className="w-full h-20 p-2 justify-center z-1000 ">
        <View className="w-full h-20 flex rounded-lg justify-center z-1000 bg-[#FFCE00]">
          <AudioPlayer
            // url="https://firebasestorage.googleapis.com/v0/b/harmonyhive-b4705.appspot.com/o/TUnrM8z359eWvkV6xnFY%2Fsongs%2F1rmeWWmcyiVwo0j4q399%2Faudio.mp3?alt=media&token=e9c82cee-2f73-4732-8eac-254737b0f16b" // Pass the download URL directly
          />
        </View>
      </View>
    </View>
  );
}
