import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  KeyboardAvoidingView,
  Modal,
  Animated,
  VirtualizedList,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import { format } from "date-fns";
import DocumentPicker from "react-native-document-picker";
import storage from "@react-native-firebase/storage";
import Tts from "react-native-tts";
import EmojiPicker from "rn-emoji-keyboard";
import { UserContext } from "@/contexts/UserContext";
import { SafeAreaView } from "react-native-safe-area-context";
import SvgXml from "react-native-svg";
import microphoneSvg from "../../public/microphoneSvg.svg";
import sendSvgGray from "../../public/sendSvgGray.svg";
import sendSvgWhite from "../../public/sendSvgWhite.svg";
import happyFaceSvg from "../../public/happyFaceSvg.svg";
import { ChoirContext } from "@/contexts/ChoirContext";
import { StateContext } from "@/contexts/StateContext";

function ChatScreen({ onBack, prefetchMessages }) {
  const user = useContext(UserContext);
  const state = useContext(StateContext);
  const choir = useContext(ChoirContext);
  const [messages, setMessages] = useState(prefetchMessages);
  const [inputText, setInputText] = useState("");
  const [showIcons, setShowIcons] = useState(false);
  const [emojiKeyboard, setEmojiKeyboard] = useState(false);
  const [reactionMessageId, setReactionMessageId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingImages, setLoadingImages] = useState({});
  const [choirId, setChoirId] = useState(null);
  const [currentChannel, setCurrentChannel] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentChannelName, setCurrentChannelName] = useState("");
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const flatListRef = useRef(null);

  useEffect(() => {
    setChoirId(state.choirId);
    if (state.choirId && user.channels) {
      const channelsForChoir = user.channels[state.choirId];

      if (channelsForChoir) {
        if (channelsForChoir["Main"]) {
          setCurrentChannel(channelsForChoir["Main"]);
          setCurrentChannelName("Main");
        } else {
          console.log("No 'Main' channel found for choirId:", state.choirId);
        }
      } else {
        console.log(`No channels found for choirId: ${state.choirId}`);
      }
    }
  }, [state.choirId, user.channels]);

  useEffect(() => {
    if (choirId && currentChannel) {
      // check if the user is in any channels
      if (
        !user.channels ||
        !user.channels[choirId] ||
        !user.channels[choirId][currentChannel]
      ) {
        return;
      }
      const unsubscribe = firestore()
        .collection("choirs")
        .doc(choirId)
        .collection("channels")
        .doc(currentChannel)
        .collection("messages")
        .orderBy("createdAt", "desc")
        .onSnapshot((snapshot) => {
          const fetchedMessages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMessages(fetchedMessages);
        });

      return () => unsubscribe();
    }
  }, [choirId, currentChannel]);

  const handleSendMessage = async () => {
    if (inputText.trim() !== "" || selectedFile) {
      const tempMessageId = Date.now().toString();
      const messageData = {
        id: tempMessageId,
        message: inputText.trim(),
        createdAt: new Date(),
        user: {
          id: user.uid,
          name: user.displayName || user.email,
          avatar: user.photoURL || "https://via.placeholder.com/150",
        },
        temp: true,
      };

      setInputText("");
      setSelectedFile(null);

      try {
        const messageRef = await firestore()
          .collection("choirs")
          .doc(state.choirId)
          .collection("channels")
          .doc(currentChannel)
          .collection("messages")
          .add({
            message: inputText.trim(),
            createdAt: firestore.FieldValue.serverTimestamp(),
            user: {
              id: user.uid,
              name: user.displayName || user.email,
              avatar: user.photoURL || "https://via.placeholder.com/150",
            },
          });

        if (selectedFile) {
          uploadFile(selectedFile, messageRef.id);
        }
      } catch (error) {
        console.log("Error sending message:", error);
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== tempMessageId)
        );
      }
    }
  };

  const handleFileUpload = async () => {
    try {
      const pickedFile = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });
      if (!pickedFile || !pickedFile.uri) {
        console.log("No file selected");
        return;
      }
      setSelectedFile(pickedFile);
    } catch (error) {
      console.log("Error selecting file:", error);
    }
  };

  const handleTextToSpeech = () => Tts.speak(inputText);

  const handleNewReaction = (messageId) => {
    setEmojiKeyboard(Platform.OS === "ios");
    setReactionMessageId(messageId);
  };

  const handleEmojiReaction = async (emojiObject, messageId) => {
    try {
      const messageRef = firestore()
        .collection("choirs")
        .doc(choirId)
        .collection("channels")
        .doc(currentChannel)
        .collection("messages")
        .doc(messageId);

      const messageDoc = await messageRef.get();
      const reactions = messageDoc.data().reactions || {};
      const userReactions = reactions[user.uid] || [];
      const updatedUserReactions = userReactions.includes(emojiObject.emoji)
        ? userReactions
        : [...userReactions, emojiObject.emoji];

      await messageRef.update({
        [`reactions.${user.uid}`]: updatedUserReactions,
      });
    } catch (error) {
      console.log("Error adding reaction:", error);
    }
  };

  const handleNormalEmoji = (emojiObject) => {
    setEmojiKeyboard(false);
    setInputText((prev) => prev + emojiObject.emoji);
  };

  const handleRemoveReaction = async (messageId, emoji) => {
    try {
      const messageRef = firestore()
        .collection("choirs")
        .doc(choirId)
        .collection("channels")
        .doc(currentChannel)
        .collection("messages")
        .doc(messageId);

      const messageDoc = await messageRef.get();
      const reactions = messageDoc.data().reactions || {};
      const userReaction = reactions[user.uid] || [];
      const updatedReactions = userReaction.filter((e) => e !== emoji);

      await messageRef.update({ [`reactions.${user.uid}`]: updatedReactions });
    } catch (error) {
      console.log("Error removing reaction:", error);
    }
  };

  const uploadFile = async (file, messageId) => {
    try {
      setLoadingImages((prevState) => ({ ...prevState, [messageId]: true }));

      const { uri, name, type } = file;
      const reference = storage().ref(`choirs/${choirId}/files/${name}`);
      await reference.putFile(uri);
      const downloadURL = await reference.getDownloadURL();

      await firestore()
        .collection("choirs")
        .doc(choir.choirId)
        .collection("channels")
        .doc(currentChannel)
        .collection("messages")
        .doc(messageId)
        .update({ file: { name, type, url: downloadURL } });

      setLoadingImages((prevState) => ({ ...prevState, [messageId]: false }));
    } catch (error) {
      console.log("Error uploading file:", error);
    }
  };

  const renderItem = ({ item, index }) => {
    const previousItem =
      index < messages.length - 1 ? messages[index + 1] : null;
    const isSameUser = previousItem && item.user.id === previousItem.user.id;
    const showProfilePicture =
      !isSameUser ||
      (previousItem &&
        item.createdAt &&
        previousItem.createdAt &&
        (item.createdAt.toDate
          ? item.createdAt.toDate()
          : item.createdAt
        ).getTime() -
          (previousItem.createdAt.toDate
            ? previousItem.createdAt.toDate()
            : previousItem.createdAt
          ).getTime() >
          10 * 60 * 1000);

    const handleReactionPress = (emoji, messageId) => {
      const userReactions = item.reactions
        ? item.reactions[user.uid] || []
        : [];
      if (userReactions.includes(emoji)) {
        handleRemoveReaction(messageId, emoji);
      } else {
        setReactionMessageId(messageId);
        handleEmojiReaction({ emoji }, messageId);
      }
    };

    const createdAtDate = item.createdAt
      ? item.createdAt.toDate
        ? item.createdAt.toDate()
        : item.createdAt
      : new Date();

    return (
      <View className="flex-row items-start px-4">
        {showProfilePicture && (
          <Image
            source={{ uri: item.user.avatar }}
            className="w-9 h-9 rounded-xl"
          />
        )}
        <View
          className={`rounded-xl w-full ${showProfilePicture ? "" : "ml-9"}`}
        >
          {showProfilePicture && (
            <View className="flex-row items-center gap-2 pl-4">
              <Text className="text-sm font-semibold">{item.user.name}</Text>
              <Text className="text-xs text-gray-400">
                {format(createdAtDate, "hh:mm a")}
              </Text>
            </View>
          )}
          <TouchableOpacity
            onLongPress={() => handleNewReaction(item.id)}
            className="w-full"
          >
            <Text
              className={`text-base text-gray-800 px-4 pb-2 ${
                item.temp ? "opacity-50" : ""
              }`}
            >
              {item.message}
            </Text>
          </TouchableOpacity>
          {item.file &&
            (item.file.type.startsWith("image/") ? (
              loadingImages[item.id] ? (
                <View className="w-48 h-48 bg-gray-200 rounded-lg mt-2" />
              ) : (
                <Image
                  source={{ uri: item.file.url }}
                  className="w-48 h-48 rounded-lg mt-2"
                  resizeMode="cover"
                />
              )
            ) : (
              <Text className="text-gray-600 px-4 pb-2">{item.file.name}</Text>
            ))}
          <View className="flex-row items-center px-4 pb-2">
            {Object.entries(
              Object.entries(item.reactions || {}).reduce(
                (acc, [userId, reaction]) => {
                  const emojis = Array.isArray(reaction)
                    ? reaction
                    : [reaction];
                  emojis.forEach((emoji) => {
                    acc[emoji] = acc[emoji] || { count: 0, userIds: [] };
                    acc[emoji].count++;
                    if (!acc[emoji].userIds.includes(userId)) {
                      acc[emoji].userIds.push(userId);
                    }
                  });
                  return acc;
                },
                {}
              )
            )
              .sort(([, a], [, b]) => b.count - a.count)
              .map(([emoji, { userIds, count }]) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => handleReactionPress(emoji, item.id)}
                  className={`flex-row items-center space-x-1 rounded-full px-2 py-1 ${
                    userIds.includes(user.uid) ? "bg-blue-100" : ""
                  }`}
                >
                  <Text>{emoji}</Text>
                  {count > 1 && <Text className="text-xs">{count}</Text>}
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </View>
    );
  };

  const toggleModal = () => {
    if (isModalVisible) {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsModalVisible(false));
    } else {
      setIsModalVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleChannelSelect = (channelName, channelId) => {
    setCurrentChannel(channelId);
    setCurrentChannelName(channelName);
    toggleModal(); // Close the modal after selection
  };

  return (
    <SafeAreaView
      style={{ width: "100%", height: "100%", backgroundColor: "white" }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-row items-center justify-between p-6 border-b border-gray-300">
          <TouchableOpacity onPress={onBack}>
            <Text className="text-lg text-blue-600">Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleModal}>
            <Text className="text-xl font-bold">#{currentChannelName}</Text>
          </TouchableOpacity>
          <View className="w-8" />
        </View>

        <VirtualizedList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          className="flex-1 min-h-0"
          inverted
          getItemCount={(data) => (data ? data.length : 0)}
          getItem={(data, index) => (data ? data[index] : null)}
        />

        <View
          className={`flex w-full h-14 justify-center ${
            showIcons ? "flex-col h-12" : "flex-row items-center px-2"
          } rounded-t-xl border-t border-r border-l border-[#d6d6d6]`}
        >
          {!showIcons && (
            <TouchableOpacity onPress={handleFileUpload}>
              <View className="w-9 h-9 flex items-center justify-center bg-[#eeeeee] rounded-full">
                <SvgXml
                  className="h-4 w-4 text-[#585858]"
                  xml={microphoneSvg}
                />
              </View>
            </TouchableOpacity>
          )}

          {showIcons && (
            <View className="flex-row justify-center flex w-full mt-1">
              <View className="bg-[#d3d3d3] h-[2px] w-10 rounded-xl" />
            </View>
          )}

          <TextInput
            className="flex-1 rounded-xl px-4 placeholder:opacity-[0.8] text-[#1c1c1c] font-medium"
            placeholder={`Message #${currentChannelName}`}
            value={inputText}
            onChangeText={setInputText}
            onFocus={() => setShowIcons(true)}
            onBlur={() => setShowIcons(false)}
          />

          {!showIcons && (
            <TouchableOpacity onPress={handleTextToSpeech}>
              <View className="w-7 h-7 flex items-center justify-center rounded-full">
                <SvgXml className="w-5 h-5" xml={microphoneSvg} />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {showIcons && (
          <View className="flex-row items-center flex w-full h-9 justify-between px-2">
            <View className="flex flex-row gap-2">
              <TouchableOpacity onPress={handleFileUpload}>
                <View className="w-8 h-8 flex items-center justify-center bg-[#eeeeee] rounded-full">
                  <SvgXml
                    className="h-4 w-4 text-[#585858]"
                    xml={microphoneSvg}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setEmojiKeyboard(true)}>
                <View className="w-8 h-8 flex justify-center items-center rounded-full">
                  <SvgXml className="w-5 h-5" xml={happyFaceSvg} />
                </View>
              </TouchableOpacity>

              <EmojiPicker
                onEmojiSelected={handleNormalEmoji}
                open={emojiKeyboard}
                onClose={() => setEmojiKeyboard(false)}
              />
            </View>
            <TouchableOpacity onPress={handleSendMessage}>
              <View
                className="w-8 h-8 flex justify-center items-center rounded-full"
                style={{
                  backgroundColor: inputText ? "#ffcc04" : "transparent",
                }}
              >
                <SvgXml
                  className="w-5 h-5"
                  xml={inputText ? sendSvgWhite : sendSvgGray}
                />
              </View>
            </TouchableOpacity>
          </View>
        )}

        <EmojiPicker
          onEmojiSelected={handleEmojiReaction}
          open={emojiKeyboard}
          onClose={() => setEmojiKeyboard(false)}
        />
      </KeyboardAvoidingView>

      <Modal visible={isModalVisible} animationType="none" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
          <Animated.View
            style={{
              transform: [{ translateX: slideAnim }],
              position: "absolute",
              left: 0,
              top: 0,
              width: "80%",
              height: "100%",
              backgroundColor: "white",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            {user.channels.length > 0 ? (
              <View style={{ padding: 16 }}>
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}
                >
                  Select Channel
                </Text>
                {Object.entries(user.channels[state.choirId]).map(
                  ([channelName, channelId]) => (
                    <TouchableOpacity
                      key={channelId}
                      onPress={() =>
                        handleChannelSelect(channelName, channelId)
                      }
                      style={{ paddingVertical: 8 }}
                    >
                      <Text style={{ fontSize: 16 }}>{channelName}</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            ) :
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>
                  No Channels
                </Text>
                <Text style={{ fontSize: 16 }}>
                  You are not a member of any channels
                </Text>
              </View>
            }
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default ChatScreen;
