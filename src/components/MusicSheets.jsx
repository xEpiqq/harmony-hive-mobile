import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
} from "react-native";
import { useRef, useContext } from "react";
import { ChoirContext } from "@/contexts/ChoirContext";
import { StateContext } from "@/contexts/StateContext";

export default function MusicSheets({ screenWidth, scrollX }) {
  const choir = useContext(ChoirContext);
  const state = useContext(StateContext);
  const songId = state.songId;
  const song = choir.songs.find((s) => s.songId === songId);

  const images = song.satb_sheets.map((image) => {
    return (
      <Image source={{ uri: image }} className="w-full h-full p-4 object-cover" />
    );
  });

  console.log(songId);

  if (!songId) {
    console.log("EJECT");
    return null;
  }

  return (
    <View>
      <FlatList
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={song.satb_sheets}
        renderItem={({ index }) => {
          return (
            <View
              className="w-screen p-4 h-full"
            >
              {images[index]}
            </View>
          );
        }}
        keyExtractor={(item, index) => index.toString()}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      />
    </View>
  );
}
