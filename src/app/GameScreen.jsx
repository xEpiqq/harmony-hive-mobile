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
  Image,
  Animated,
  Dimensions,
  BackHandler,
  ActivityIndicator,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import MusicList from "@/components/MusicList";
import { UserContext } from "@/contexts/UserContext";
import { ChoirContext } from "@/contexts/ChoirContext";
import { StateContext } from "@/contexts/StateContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SongScreen from "../components/SongScreen";
import ScoreBoard from "../components/ScoreBoard";

const GameScreen = ({ setShowBottomNav }) => {
  const { width: screenWidth } = Dimensions.get("window");
  const user = useContext(UserContext);
  const choir = useContext(ChoirContext);
  const state = useContext(StateContext);
  const insets = useSafeAreaInsets();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [isLoading, setIsLoading] = useState(true);

  const formatDate = useCallback((dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }, []);

  useEffect(() => {
    setShowBottomNav(true);
  }, [setShowBottomNav]);

  useEffect(() => {
    state.setSongId(undefined);
  }, []);

  useEffect(() => {
    if (state.choirId) {
      setIsLoading(false);
    }
  }, [state.choirId]);

  useEffect(() => {
    if (state.songId) {
      setShowBottomNav(false);
    } else {
      setShowBottomNav(true);
    }
  }, [state.songId, setShowBottomNav]);

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

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar animated={true} hidden={false} barStyle="dark-content" backgroundColor="#FFDE1A" />

      <SafeAreaView
        edges={["top"]}
        style={{ width: "100%", height: "100%", backgroundColor: "white" }}
      >
        <SafeAreaView
          edges={["left", "right"]}
          style={{ width: "100%", height: "100%", backgroundColor: "white" }}
        >
          {/* {!state.songId ? (
            <ScoreBoard />
          ) : null} */}

          <View className="flex-1">
            {state.songId ? (
              <View style={{ flex: 1 }} className="bg-white">
                <SongScreen handleBackPress={handleBackPress} scrollX={scrollX} screenWidth={screenWidth} />
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
