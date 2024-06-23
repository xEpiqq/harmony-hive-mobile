import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
  useMemo,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
  Dimensions,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import MusicList from "@/components/MusicList";

import { ChoirContext } from "@/contexts/ChoirContext";
import { StateContext } from "@/contexts/StateContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SongScreen from "../components/SongScreen";

const GameScreen = ({ setIsLoading, setShowBottomNav }) => {
  const { width: screenWidth } = Dimensions.get("window");

  const choir = useContext(ChoirContext);
  const state = useContext(StateContext);
  const insets = useSafeAreaInsets();

  const scrollX = useRef(new Animated.Value(0)).current;

  const formatDate = useCallback((dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }, []);

  useEffect(() => {
    setIsLoading(false);
    state.setSongId(undefined);
  }, []);

  const paginationDots = useMemo(
    () =>
      choir.songs.map((_, index) => {
        const inputRange = [
          (index - 1) * screenWidth,
          index * screenWidth,
          (index + 1) * screenWidth,
        ];
        const dotOpacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: "clamp",
        });
        return (
          <Animated.View
            key={index}
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: "#7d7d7d",
              marginHorizontal: 4,
              opacity: dotOpacity,
            }}
          />
        );
      }),
    [scrollX, choir.songs]
  );

  const handleBackPress = useCallback(() => {
    if (state.songId) {
      state.setSongId(undefined);
      setShowBottomNav(true);
      return true;
    }
    return false;
  }, [state.songId, setShowBottomNav]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (handleBackPress()) {
          return true;
        }
        return false;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [handleBackPress])
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        edges={["top"]}
        style={{ width: "100%", height: "100%", backgroundColor: "#FFCE00" }}
      >
        <SafeAreaView
          edges={["left", "right"]}
          style={{ width: "100%", height: "100%", backgroundColor: "white" }}
        >
          {!state.songId ? (
            <>
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
            </>
          ) : null}

          <View className="flex-1">
            {state.songId ? (
              <View style={{ flex: 1 }} className="bg-white">
                {true && (
                  <SongScreen handleBackPress={handleBackPress} scrollX={scrollX} screenWidth={screenWidth} />
                )}
              </View>
            ) : (
              <>
                <Text className="bg-white font-thin">{choir.choirName}</Text>
                <MusicList scrollX={scrollX} formatDate={formatDate} />

                <View className="flex-row justify-center p-4 bg-white">
                  {paginationDots}
                </View>
              </>
            )}
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default GameScreen;
