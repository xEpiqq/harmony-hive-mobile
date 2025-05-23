import "../global.css";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";

import ChoirContextProvider from "@/contexts/ChoirContext";
import StateContextProvider from "@/contexts/StateContext";
import UserContextProvider from "@/contexts/UserContext";

// Keep the splash screen visible while we fetch resources
export default function Layout() {
  SplashScreen.preventAutoHideAsync();

  return (
    <UserContextProvider>
      <StateContextProvider>
        <ChoirContextProvider>
          <Slot />
        </ChoirContextProvider>
      </StateContextProvider>
    </UserContextProvider>
  );
}
