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
import { UserContext } from "@/contexts/UserContext";
import { SafeAreaView } from "react-native-safe-area-context";
import SvgXml from "react-native-svg";
import sendSvgWhite from "../../public/sendSvgWhite.svg";
import { ChoirContext } from "@/contexts/ChoirContext";
import { StateContext } from "@/contexts/StateContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const defaultChannels = ["main", "soprano", "alto", "tenor", "bass"];

function ChatScreen({ onBack, prefetchMessages }) {
  const user = useContext(UserContext);
  const state = useContext(StateContext);
  const choir = useContext(ChoirContext);
  const [messages, setMessages] = useState(prefetchMessages);
  const [inputText, setInputText] = useState("");
  const [showIcons, setShowIcons] = useState(false);
  const [currentChannel, setCurrentChannel] = useState("main");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const { top, bottom } = useSafeAreaInsets();
  const flatListRef = useRef(null);

  useEffect(() => {
    const choirId = state.choirId;
    if (choirId) {
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
  }, [state.choirId, currentChannel]);

  const handleSendMessage = async () => {
    if (inputText.trim()) {
      const messageData = {
        message: inputText.trim(),
        createdAt: firestore.FieldValue.serverTimestamp(),
        user: {
          id: user.uid,
          name: user.displayName || user.email,
          avatar: user.photoURL || "https://via.placeholder.com/150",
        },
      };

      setInputText("");

      try {
        await firestore()
          .collection("choirs")
          .doc(state.choirId)
          .collection("channels")
          .doc(currentChannel)
          .collection("messages")
          .add(messageData);
      } catch (error) {
        console.log("Error sending message:", error);
      }
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
          <Text
            className={`text-base text-gray-800 px-4 pb-2 ${
              item.temp ? "opacity-50" : ""
            }`}
          >
            {item.message}
          </Text>
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

  const handleChannelSelect = (channel) => {
    setCurrentChannel(channel);
    toggleModal(); // Close the modal after selection
  };

  return (
    <>
      <SafeAreaView
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "white",
        }}
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
              <Text className="text-xl font-bold">#{currentChannel}</Text>
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
            className={`flex w-full h-16 justify-between flex-row items-center ${
              showIcons ? "h-14" : "flex-row items-center px-2"
            } rounded-t-xl border-t border-r border-l border-[#d6d6d6]`}
          >
            <TextInput
              className="flex-1 rounded-xl px-4 placeholder:opacity-[0.8] text-[#1c1c1c] font-medium"
              placeholder={`Message #${currentChannel}`}
              value={inputText}
              onChangeText={setInputText}
              onFocus={() => setShowIcons(true)}
              onBlur={() => setShowIcons(false)}
            />

            <TouchableOpacity onPress={handleSendMessage} className="pr-3">
              <View
                className="w-8 h-8 flex justify-center items-center rounded-full"
                style={{
                  backgroundColor: inputText ? "#ffcc04" : "transparent",
                  opacity: inputText ? 1 : 0.2,
                }}
              >
                <Image
                  className="w-5 h-5"
                  source={require("../../public/send.png")}
                />
              </View>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <Modal visible={isModalVisible} animationType="none" transparent>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={toggleModal}
        >
          <Animated.View
            style={{
              transform: [{ translateX: slideAnim }],
              left: 0,
              top: 0,
              width: "80%",
              height: "100%",
              backgroundColor: "white",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              paddingBottom: bottom,
              paddingTop: top,
              paddingHorizontal: 16,
              elevation: 5,
            }}
          >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 16,
                }}
              >
                Select Channel
              </Text>
              {defaultChannels.map((channel) => (
                <TouchableOpacity
                  key={channel}
                  onPress={() => handleChannelSelect(channel)}
                  style={{ paddingVertical: 8 }}
                >
                  <Text style={{ fontSize: 16 }}>{channel}</Text>
                </TouchableOpacity>
              ))}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default ChatScreen;

// old component below (just trying to make sure apple doesnt wreck us, everything removed isnt functioning yet)

// import React, { useContext, useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   Image,
//   Platform,
//   KeyboardAvoidingView,
//   Modal,
//   Animated,
//   VirtualizedList,
// } from "react-native";
// import firestore from "@react-native-firebase/firestore";
// import { format } from "date-fns";
// import { UserContext } from "@/contexts/UserContext";
// import { SafeAreaView } from "react-native-safe-area-context";
// import SvgXml from "react-native-svg";
// import sendSvgWhite from "../../public/sendSvgWhite.svg";
// import { ChoirContext } from "@/contexts/ChoirContext";
// import { StateContext } from "@/contexts/StateContext";

// const defaultChannels = ["main", "soprano", "alto", "tenor", "bass"];

// function ChatScreen({ onBack, prefetchMessages }) {
//   const user = useContext(UserContext);
//   const state = useContext(StateContext);
//   const choir = useContext(ChoirContext);
//   const [messages, setMessages] = useState(prefetchMessages);
//   const [inputText, setInputText] = useState("");
//   const [showIcons, setShowIcons] = useState(false);
//   const [currentChannel, setCurrentChannel] = useState("main");
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const slideAnim = useRef(new Animated.Value(-300)).current;
//   const flatListRef = useRef(null);

//   useEffect(() => {
//     const choirId = state.choirId;
//     if (choirId) {
//       const unsubscribe = firestore()
//         .collection("choirs")
//         .doc(choirId)
//         .collection("channels")
//         .doc(currentChannel)
//         .collection("messages")
//         .orderBy("createdAt", "desc")
//         .onSnapshot((snapshot) => {
//           const fetchedMessages = snapshot.docs.map((doc) => ({
//             id: doc.id,
//             ...doc.data(),
//           }));
//           setMessages(fetchedMessages);
//         });

//       return () => unsubscribe();
//     }
//   }, [state.choirId, currentChannel]);

//   const handleSendMessage = async () => {
//     if (inputText.trim()) {
//       const messageData = {
//         message: inputText.trim(),
//         createdAt: firestore.FieldValue.serverTimestamp(),
//         user: {
//           id: user.uid,
//           name: user.displayName || user.email,
//           avatar: user.photoURL || "https://via.placeholder.com/150",
//         },
//       };

//       setInputText("");

//       try {
//         await firestore()
//           .collection("choirs")
//           .doc(state.choirId)
//           .collection("channels")
//           .doc(currentChannel)
//           .collection("messages")
//           .add(messageData);
//       } catch (error) {
//         console.log("Error sending message:", error);
//       }
//     }
//   };

//   const renderItem = ({ item, index }) => {
//     const previousItem =
//       index < messages.length - 1 ? messages[index + 1] : null;
//     const isSameUser = previousItem && item.user.id === previousItem.user.id;
//     const showProfilePicture =
//       !isSameUser ||
//       (previousItem &&
//         item.createdAt &&
//         previousItem.createdAt &&
//         (item.createdAt.toDate
//           ? item.createdAt.toDate()
//           : item.createdAt
//         ).getTime() -
//           (previousItem.createdAt.toDate
//             ? previousItem.createdAt.toDate()
//             : previousItem.createdAt
//           ).getTime() >
//           10 * 60 * 1000);

//     const createdAtDate = item.createdAt
//       ? item.createdAt.toDate
//         ? item.createdAt.toDate()
//         : item.createdAt
//       : new Date();

//     return (
//       <View className="flex-row items-start px-4">
//         {showProfilePicture && (
//           <Image
//             source={{ uri: item.user.avatar }}
//             className="w-9 h-9 rounded-xl"
//           />
//         )}
//         <View
//           className={`rounded-xl w-full ${showProfilePicture ? "" : "ml-9"}`}
//         >
//           {showProfilePicture && (
//             <View className="flex-row items-center gap-2 pl-4">
//               <Text className="text-sm font-semibold">{item.user.name}</Text>
//               <Text className="text-xs text-gray-400">
//                 {format(createdAtDate, "hh:mm a")}
//               </Text>
//             </View>
//           )}
//           <Text
//             className={`text-base text-gray-800 px-4 pb-2 ${
//               item.temp ? "opacity-50" : ""
//             }`}
//           >
//             {item.message}
//           </Text>
//         </View>
//       </View>
//     );
//   };

//   const toggleModal = () => {
//     if (isModalVisible) {
//       Animated.timing(slideAnim, {
//         toValue: -300,
//         duration: 300,
//         useNativeDriver: true,
//       }).start(() => setIsModalVisible(false));
//     } else {
//       setIsModalVisible(true);
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 300,
//         useNativeDriver: true,
//       }).start();
//     }
//   };

//   const handleChannelSelect = (channel) => {
//     setCurrentChannel(channel);
//     toggleModal(); // Close the modal after selection
//   };

//   return (
//     <SafeAreaView
//       style={{ width: "100%", height: "100%", backgroundColor: "white" }}
//     >
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         className="flex-1"
//       >
//         <View className="flex-row items-center justify-between p-6 border-b border-gray-300">
//           <TouchableOpacity onPress={onBack}>
//             <Text className="text-lg text-blue-600">Back</Text>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={toggleModal}>
//             <Text className="text-xl font-bold">#{currentChannel}</Text>
//           </TouchableOpacity>
//           <View className="w-8" />
//         </View>

//         <VirtualizedList
//           ref={flatListRef}
//           data={messages}
//           renderItem={renderItem}
//           keyExtractor={(item) => item.id}
//           className="flex-1 min-h-0"
//           inverted
//           getItemCount={(data) => (data ? data.length : 0)}
//           getItem={(data, index) => (data ? data[index] : null)}
//         />

//         <View
//           className={`flex w-full h-14 justify-center ${
//             showIcons ? "flex-col h-12" : "flex-row items-center px-2"
//           } rounded-t-xl border-t border-r border-l border-[#d6d6d6]`}
//         >
//           <TextInput
//             className="flex-1 rounded-xl px-4 placeholder:opacity-[0.8] text-[#1c1c1c] font-medium"
//             placeholder={`Message #${currentChannel}`}
//             value={inputText}
//             onChangeText={setInputText}
//             onFocus={() => setShowIcons(true)}
//             onBlur={() => setShowIcons(false)}
//           />

//           <TouchableOpacity onPress={handleSendMessage}>
//             <View
//               className="w-8 h-8 flex justify-center items-center rounded-full"
//               style={{
//                 backgroundColor: inputText ? "#ffcc04" : "transparent",
//               }}
//             >
//               <SvgXml
//                 className="w-5 h-5"
//                 xml={sendSvgWhite}
//               />
//             </View>
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>

//       <Modal visible={isModalVisible} animationType="none" transparent>
//         <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
//           <Animated.View
//             style={{
//               transform: [{ translateX: slideAnim }],
//               position: "absolute",
//               left: 0,
//               top: 0,
//               width: "80%",
//               height: "100%",
//               backgroundColor: "white",
//               shadowColor: "#000",
//               shadowOffset: { width: 0, height: 2 },
//               shadowOpacity: 0.25,
//               shadowRadius: 3.84,
//               elevation: 5,
//             }}
//           >
//             <View style={{ padding: 16 }}>
//               <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>
//                 Select Channel
//               </Text>
//               {defaultChannels.map((channel) => (
//                 <TouchableOpacity
//                   key={channel}
//                   onPress={() => handleChannelSelect(channel)}
//                   style={{ paddingVertical: 8 }}
//                 >
//                   <Text style={{ fontSize: 16 }}>{channel}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </Animated.View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// export default ChatScreen;
