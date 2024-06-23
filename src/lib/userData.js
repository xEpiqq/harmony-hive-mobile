import { useState, useEffect, useContext } from "react";
import firestore from "@react-native-firebase/firestore";

export default function useUserData(user) {
  const [choirsJoined, setChoirsJoined] = useState([]);
  const [displayName, setDisplayName] = useState(null);
  const [email, setEmail] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);
  const [uid, setUID] = useState(null);
  const [channels, setChannels] = useState({});

  useEffect(() => {
    if (!user) return;
    const userRef = firestore().collection("users").doc(user.uid);
    const unsubscribe = userRef.onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        let choirData = [];
        let choirsJoined = [];
        // get the names of all choirs
        if (data.choirs_joined) {
          choirsJoined = data.choirs_joined;
          const choirPromises = data.choirs_joined.map(async (choirId) => {
            const choirDoc = await firestore()
              .collection("choirs")
              .doc(choirId)
              .get();
            if (choirDoc.exists) {
              return {
                id: choirDoc.id,
                name: choirDoc.data().name,
              };
            }
            return null;
          });

          Promise.all(choirPromises).then((choirs) => {
            setChoirsJoined(choirs.filter((choir) => choir !== null));
          });

          if (data.messaging_channels) {
            setChannels(data.messaging_channels);
          }
        }
      }
    });

    setDisplayName(user.displayName);
    setEmail(user.email);
    setPhotoURL(user.photoURL);
    setUID(user.uid);

    return unsubscribe;
  }, [user]);

  const joinChoir = async (newChoirCode) => {
    try {
      const choirSnapshot = await firestore()
        .collection("choirs")
        .where("code", "==", newChoirCode)
        .get();
      if (choirSnapshot.empty) {
        return { message: "Choir code not found" };
      }

      const choirDoc = choirSnapshot.docs[0];
      const choirId = choirDoc.id;

      // Fetch the Main channel ID
      const channelsSnapshot = await firestore()
        .collection("choirs")
        .doc(choirId)
        .collection("channels")
        .where("name", "==", "Main")
        .get();

      let mainChannelId = '';
      if (!channelsSnapshot.empty) {
        mainChannelId = channelsSnapshot.docs[0].id;
      }

      await firestore()
        .collection("users")
        .doc(user.uid)
        .update({
          choirs_joined: firestore.FieldValue.arrayUnion(choirId),
          [`messaging_channels.${choirId}`]: {
            Main: mainChannelId,
          },
        });

      console.log("Choir joined and messaging_channels updated!");
    } catch (error) {
      console.log("Error joining choir:", error);
      return error;
    }
  };

  const updateDisplayName = async (newDisplayName) => {
    try {
      await firestore().collection("users").doc(user.uid).update({
        displayName: newDisplayName,
      });
      setDisplayName(newDisplayName);
    } catch (error) {
      console.log("Error updating display name:", error);
      return error;
    }
  };

  return {
    choirsJoined,
    displayName,
    email,
    photoURL,
    uid,
    channels,
    joinChoir,
    updateDisplayName,
  };
}
