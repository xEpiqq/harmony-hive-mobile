"use client";

import { createContext, useEffect, useState, useContext } from "react";
import { UserContext } from "./UserContext";

export const StateContext = createContext({ songs: [] });

export default function StateContextProvider({ children }) {
  const { user } = useContext(UserContext);
  const [choirId, setChoirId] = useState("UwQHIotvN12tEj63Hgjw");
  const [songId, setSongId] = useState();
  const [messagingChannel, setMessagingChannel] = useState();

  useEffect(() => {
    if (user && user.choir_selected) {
      setChoirId(user.choir_selected);
    }
  }, [user]);

  useEffect(() => {
    setSongId(undefined);
    setMessagingChannel(undefined);
  }, [choirId]);

  return (
    <StateContext.Provider
      value={{
        choirId,
        setChoirId,
        songId,
        setSongId,
        messagingChannel,
        setMessagingChannel,
      }}
    >
      {children}
    </StateContext.Provider>
  );
}
