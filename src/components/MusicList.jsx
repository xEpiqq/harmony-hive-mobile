import { Images } from "../../public/index";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  FlatList,
} from "react-native";

import {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  useContext,
} from "react";
import { StateContext } from "@/contexts/StateContext";
import { ChoirContext } from "@/contexts/ChoirContext";
import CherryBlossomBackground from "./CherryBlossomBackground";

export default function MusicSheets({
  lastOpened,
  formatDate,
  choirName,
  scrollX,
  onViewableItemsChanged,
}) {
  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 50,
    }),
    []
  );
  const spinValue = useRef(new Animated.Value(0)).current;
  const choir = useContext(ChoirContext);
  const songs = choir.songs;

  const state = useContext(StateContext);

  function hashStringToNumber(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 30000,
        useNativeDriver: true,
      }),
      { iterations: -1 }
    ).start();
  }, [spinValue]);

  const spin = useMemo(
    () =>
      spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "7000deg"],
      }),
    [spinValue]
  );

  const renderItem = useCallback(
    ({ item: song }) => (
      <>
        <Text className="bg-white font-thin">{choirName}</Text>
        <View
          key={song.songId}
          className="w-screen h-screen flex items-center justify-center bg-white -mt-36"
        >
          <TouchableOpacity onPress={() => state.setSongId(song.songId)}>
            {/* Check if the last opened date is valid */}
            {lastOpened && (
              <Text className="bg-white font-thin">
                Last Opened:{" "}
                {song.lastOpened ? formatDate(song.lastOpened) : "NEVER..."}
              </Text>
            )}
            <View className="relative flex items-center justify-center">
              <CherryBlossomBackground
                seed={hashStringToNumber(song.name)}
                className="absolute w-screen h-16 -z-10"
              />
              <Animated.Image
                source={require("../../public/musicdisk.png")}
                style={{
                  width: 120,
                  height: 120,
                  transform: [{ rotate: spin }],
                }}
              />
            </View>
            <Text className="text-center font-bold mt-5 text-5xl">
              {song.name.toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </>
    ),
    [lastOpened, formatDate, spin]
  );

  return (
    <FlatList
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      data={songs}
      renderItem={renderItem}
      keyExtractor={(item) => item.songId}
      contentContainerStyle={{ flexGrow: 1 }}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false }
      )}
    />
  );
}
