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

  console.log(songId);

  if (!songId) {
    console.log("EJECT");
    return null;
  }

  return (
    <View className="-mt-16">
      <FlatList
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={song.satb_sheets}
        renderItem={({ index }) => {
          const image = song.satb_sheets[index];
          console.log(image);
          return (
            <View
              style={{
                width: screenWidth,
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={{
                  uri: image,
                  method: "GET",
                }}
                style={{ width: 500, height: 500 }}
              />
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
