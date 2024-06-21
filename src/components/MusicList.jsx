import { Images } from "../../public/index";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  FlatList,
} from "react-native";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";

export default function MusicSheets({
  songs,
  handleSelectSong,
  lastOpened,
  formatDate,
  choirName,
  screenWidth,
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
          <TouchableOpacity onPress={() => handleSelectSong(song)}>
            <Text className="bg-white font-thin">
              Last Opened:{" "}
              {lastOpened[song.songId]
                ? formatDate(lastOpened[song.songId])
                : "NEVER..."}
            </Text>
            <View className="relative flex items-center justify-center">
              <Image
                source={require("../../public/cherryblossom.png")}
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
    [handleSelectSong, lastOpened, formatDate, spin]
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
