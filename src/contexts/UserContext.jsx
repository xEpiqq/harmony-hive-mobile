"use client";
import auth from "@react-native-firebase/auth";
import React, { useEffect, useState } from "react";
import { createContext } from "react";
import useUserData from "@/lib/userData";

export const UserContext = createContext({ plzwork: "false" });

export default function UserProvider({ children }) {
  const [user, setUser] = useState();
  const userData = useUserData(user);

  function onAuthStateChanged(user) {
    setUser(user);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  console.log("userData", userData);


  return <UserContext.Provider value={userData}>{children}</UserContext.Provider>;
}
