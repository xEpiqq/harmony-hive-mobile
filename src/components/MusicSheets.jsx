import { View, Text, TouchableOpacity, Image, FlatList, Animated } from "react-native";


export default function MusicSheets({
  songs,
  handleSelectSong,
  lastOpened,
  formatDate,
  scrollX,
  spinValue,
  setSpinValue,
  setMusicSelected,
  onViewableItemsChanged,
  spin,
  scrollViewRef,
  screenWidth,
}) {
  return (
    <View className="-mt-16">
      <FlatList
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={[...Array(17).keys()]} // Dummy data array to render 17 items
        renderItem={({ index }) => {
          const images = [
            require("../../public/Is He Worthy-01.png"),
            require("../../public/Is He Worthy-02.png"),
            require("../../public/Is He Worthy-03.png"),
            require("../../public/Is He Worthy-04.png"),
            require("../../public/Is He Worthy-05.png"),
            require("../../public/Is He Worthy-06.png"),
            require("../../public/Is He Worthy-07.png"),
            require("../../public/Is He Worthy-08.png"),
            require("../../public/Is He Worthy-09.png"),
            require("../../public/Is He Worthy-10.png"),
            require("../../public/Is He Worthy-11.png"),
            require("../../public/Is He Worthy-12.png"),
            require("../../public/Is He Worthy-13.png"),
            require("../../public/Is He Worthy-14.png"),
            require("../../public/Is He Worthy-15.png"),
            require("../../public/Is He Worthy-16.png"),
            require("../../public/Is He Worthy-17.png"),
            require("../../public/Is He Worthy-18.png"),
            require("../../public/Is He Worthy-19.png"),
          ];
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
                source={images[index]}
                style={{ width: screenWidth, height: "100%" }}
                resizeMode="contain"
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
