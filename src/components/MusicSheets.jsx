import React, { useRef, useContext, useEffect, useState } from "react";
import { View, Image, FlatList, Animated, StyleSheet } from "react-native";
import { ChoirContext } from "@/contexts/ChoirContext";
import { StateContext } from "@/contexts/StateContext";

export default function MusicSheets({ screenWidth, scrollX }) {
  const choir = useContext(ChoirContext);
  const state = useContext(StateContext);
  const songId = state.songId;
  const song = choir.songs.find((s) => s.songId === songId);
  const [loadedIndexes, setLoadedIndexes] = useState([0]);

  const prefetchImage = (url) => {
    Image.prefetch(url);
  };

  useEffect(() => {
    if (song && song.satb_sheets.length > 0) {
      // Preload the first image initially
      prefetchImage(song.satb_sheets[1]);
    }
  }, [song]);

  const handleScroll = (event) => {
    const currentIndex = Math.floor(
      event.nativeEvent.contentOffset.x / screenWidth
    );

    // If the next image is within the array and not yet loaded, prefetch it
    if (
      currentIndex + 1 < song.satb_sheets.length &&
      !loadedIndexes.includes(currentIndex + 1)
    ) {
      prefetchImage(song.satb_sheets[currentIndex + 1]);
      setLoadedIndexes([...loadedIndexes, currentIndex + 1]);
    }

    // Update the scroll position
    scrollX.setValue(event.nativeEvent.contentOffset.x);
  };

  if (!songId) {
    console.log("EJECT");
    return null;
  }

  return (
    <View style={styles.container} className="h-full w-full">
      <FlatList
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={song.satb_sheets}
        renderItem={({ item }) => {
          return (
            <View style={[styles.imageContainer, { width: screenWidth }]}>
              <Image
                source={{ uri: item }}
                style={styles.image}
                resizeMode="contain" // Ensure the whole image is shown
              />
            </View>
          );
        }}
        keyExtractor={(item, index) => index.toString()}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  imageContainer: {
    padding: 4,
    height: '100%',
    justifyContent: 'center', // Center the image within the container
    alignItems: 'center', // Center the image within the container
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
