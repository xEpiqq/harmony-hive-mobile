import { useState, useEffect } from "react";

import firestore from "@react-native-firebase/firestore";

export default function useChoir(choirId) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState(null);
  const [members, setMembers] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [choirCode, setChoirCode] = useState(null);
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    if (!choirId) return;
    let unsubscribeList = [];
    const choirRef = firestore().collection("choirs").doc(choirId);
    unsubscribeList.push(
      choirRef.onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data();
          setName(data.name);
          const calendarCollection = choirRef.collection("calendar");
          const calendarQuery = calendarCollection. orderBy("date", "asc")
          unsubscribeList.push(
            calendarQuery.onSnapshot((calendarSnapshot) => {
              const calendar = [];
              calendarSnapshot.forEach((doc) => {
                calendar.push({ ...doc.data(), eventId: doc.id });
              });
              setCalendar(calendar);
            })
          );
          setChoirCode(data.code);

          const songCollection = choirRef.collection("songs");
          const songQuery = songCollection.orderBy("name", "asc");
          unsubscribeList.push(
            songQuery.onSnapshot((songSnapshot) => {
              const songs = [];
              songSnapshot.forEach((doc) => {
                songs.push({ ...doc.data(), songId: doc.id });
              });
              setSongs(songs);
            })
          );

          const memberCollection = choirRef.collection("members");
          const memberQuery = memberCollection.orderBy("name", "asc");
          unsubscribeList.push(
            memberQuery.onSnapshot((memberSnapshot) => {
              const members = [];
              memberSnapshot.forEach((doc) => {
                members.push({ ...doc.data(), memberId: doc.id });
              });
              setMembers(members);
            })
          );

          const channelCollection = choirRef.collection("channels");
          const channelQuery = channelCollection.orderBy("name", "asc");
          unsubscribeList.push(
            channelQuery.onSnapshot((channelSnapshot) => {
              const channels = [];
              channelSnapshot.forEach((doc) => {
                channels.push({ ...doc.data(), channelId: doc.id });
              });
              setChannels(channels);
            })
          );
          setLoading(false);
        } else {
          setError("Choir not found");
          setLoading(false);
        }
      })
    );

    return () => {
      unsubscribeList.forEach((unsubscribe) => unsubscribe());
    };
  }, [choirId]);

  return {
    songs,
    loading,
    error,
    name,
    members,
    calendar,
    choirCode,
    channels,
  };
}
