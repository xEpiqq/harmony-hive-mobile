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
    console.log("onAuthStateChanged");
    setUser(user);

    
  }

  useEffect(() => {
    console.log("Userdata changed");
    console.log(userData);
  }, [userData]);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);


  return <UserContext.Provider value={userData}>{children}</UserContext.Provider>;
}
