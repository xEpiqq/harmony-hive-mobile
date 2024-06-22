"use client";
import auth from "@react-native-firebase/auth";
import React, { useEffect, useState } from "react";
import { createContext } from "react";

export const UserContext = createContext({ plzwork: "false" });

export default function UserProvider({ children }) {
  const [user, setUser] = useState();

  function onAuthStateChanged(user) {
    setUser(user);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
