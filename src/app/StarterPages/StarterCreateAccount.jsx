import {
  AppleIcon,
  GoogleIcon,
  PasswordEye,
  PasswordEyeStrike,
} from "../../../assets/images";

import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";

import { Platform } from "react-native";
import { useState } from "react";

import firestore from "@react-native-firebase/firestore";

import { AppleButton } from "@invertase/react-native-apple-authentication";
import { appleAuth } from "@invertase/react-native-apple-authentication";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

import ActionButton from "@/components/ActionButton";
import auth from "@react-native-firebase/auth";


export default function StarterCreateAccount({ navigation, route }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(true);
  const [createAccountError, setCreateAccountError] = useState("");

  const firstName = route.params.firstName;
  const lastName = route.params.lastName;
  const choirName = route.params.choirName;
  const choirJoinUid = route.params.choirUid;
  const satbChoice = route.params.part;

  const onAppleButtonPress = async () => {
    // Add Apple Sign-In logic for Android here
    // This is an example using Firebase Authentication
    if (Platform.OS == "ios") {
      console.log("Signing in with Apple...");
      // Start the sign-in request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        // As per the FAQ of react-native-apple-authentication, the name should come first in the following array.
        // See: https://github.com/invertase/react-native-apple-authentication#faqs
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      // Ensure Apple returned a user identityToken
      if (!appleAuthRequestResponse.identityToken) {
        throw new Error("Apple Sign-In failed - no identify token returned");
      }

      console.log("creating apple credential...");

      // Create a Firebase credential from the response
      const { identityToken, nonce } = appleAuthRequestResponse;
      const appleCredential = auth.AppleAuthProvider.credential(
        identityToken,
        nonce
      );

      console.log("signing in with apple credential...");
      // Sign the user in with the credential
      await auth()
        .signInWithCredential(appleCredential)
        .then((result) => {
          const credential = result.credential;

          // Signed-in user info
          const user = result.user;

          // The signed-in user info.
          const userDocRef = firestore().collection("users").doc(user.uid);
          userDocRef.get().then((docSnapshot) => {
            if (!docSnapshot.exists) {
              // Check the fields exist
              if (!user.email) {
                setCurrentScreen(1);
                return;
              }

              // New user
              const capitalizedFirstName =
                firstName.charAt(0).toUpperCase() +
                firstName.slice(1).toLowerCase();
              const capitalizedLastName =
                lastName.charAt(0).toUpperCase() +
                lastName.slice(1).toLowerCase();

              // Fetch the Main channel ID
              firestore()
                .collection("choirs")
                .doc(choirJoinUid)
                .collection("channels")
                .where("name", "==", "Main")
                .get()
                .then((channelsSnapshot) => {
                  let mainChannelId = "";
                  if (!channelsSnapshot.empty) {
                    mainChannelId = channelsSnapshot.docs[0].id;
                  }

                  userDocRef.set({
                    choir_selected: choirJoinUid,
                    choirs_joined: [choirJoinUid],
                    email: user.email,
                    emailVerified: user.emailVerified,
                    image: user.photoURL,
                    name: `${capitalizedFirstName} ${capitalizedLastName}`,
                    part: satbChoice,
                    user_type: "student",
                    messaging_channels: {
                      [choirJoinUid]: {
                        Main: mainChannelId,
                      },
                    },
                  });
                  console.log("New user added to Firestore!");
                });
            } else {
              console.log("User already exists in Firestore.");
            }
          });
        });
      return;
    }

    const provider = new auth.OAuthProvider("apple.com");
    auth()
      .signInWithPopup(provider)
      .then((result) => {
        // Apple credential
        const credential = result.credential;

        // Signed-in user info
        const user = result.user;

        // The signed-in user info.
        const userDocRef = firestore().collection("users").doc(user.uid);
        userDocRef.get().then((docSnapshot) => {
          if (!docSnapshot.exists) {
            // New user
            const capitalizedFirstName =
              firstName.charAt(0).toUpperCase() +
              firstName.slice(1).toLowerCase();
            const capitalizedLastName =
              lastName.charAt(0).toUpperCase() +
              lastName.slice(1).toLowerCase();

            // Fetch the Main channel ID
            firestore()
              .collection("choirs")
              .doc(choirJoinUid)
              .collection("channels")
              .where("name", "==", "Main")
              .get()
              .then((channelsSnapshot) => {
                let mainChannelId = "";
                if (!channelsSnapshot.empty) {
                  mainChannelId = channelsSnapshot.docs[0].id;
                }

                userDocRef.set({
                  choir_selected: choirJoinUid,
                  choirs_joined: [choirJoinUid],
                  email: user.email,
                  emailVerified: user.emailVerified,
                  image: user.photoURL,
                  name: `${capitalizedFirstName} ${capitalizedLastName}`,
                  part: satbChoice,
                  user_type: "student",
                  messaging_channels: {
                    [choirJoinUid]: {
                      Main: mainChannelId,
                    },
                  },
                });
                console.log("New user added to Firestore!");
              });
          } else {
            console.log("User already exists in Firestore.");
          }
        });
      })
      .catch((error) => {
        console.error("Apple Sign-In Error: ", error);
        throw new Error(error);
      });
  };

  const createUserEmailPass = async () => {
    if (password !== confirmPassword) {
      setCreateAccountError("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        username,
        password
      );
      console.log("User account created & signed in!");
      const capitalizedFirstName =
        firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      const capitalizedLastName =
        lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();

      // Fetch the Main channel ID
      const channelsSnapshot = await firestore()
        .collection("choirs")
        .doc(choirJoinUid)
        .collection("channels")
        .where("name", "==", "Main")
        .get();

      let mainChannelId = "";
      if (!channelsSnapshot.empty) {
        mainChannelId = channelsSnapshot.docs[0].id;
      }

      await firestore()
        .collection("users")
        .doc(userCredential.user.uid)
        .set({
          choir_selected: choirJoinUid,
          choirs_joined: [choirJoinUid],
          email: username,
          emailVerified: false,
          image: userCredential.user.photoURL,
          name: `${capitalizedFirstName} ${capitalizedLastName}`,
          part: satbChoice,
          user_type: "student",
          messaging_channels: {
            [choirJoinUid]: {
              Main: mainChannelId,
            },
          },
        });

      console.log("User added to Firestore!");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setCreateAccountError("That email address is already in use!");
      } else if (error.code === "auth/invalid-email") {
        setCreateAccountError("That email address is invalid!");
      }
      console.error(error);
    }
  };

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(
        googleCredential
      );
      const userDocRef = firestore()
        .collection("users")
        .doc(userCredential.user.uid);
      const docSnapshot = await userDocRef.get();
      if (!docSnapshot.exists) {
        const capitalizedFirstName =
          firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
        const capitalizedLastName =
          lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();

        // Fetch the Main channel ID
        const channelsSnapshot = await firestore()
          .collection("choirs")
          .doc(choirJoinUid)
          .collection("channels")
          .where("name", "==", "Main")
          .get();

        let mainChannelId = "";
        if (!channelsSnapshot.empty) {
          mainChannelId = channelsSnapshot.docs[0].id;
        }

        await userDocRef.set({
          choir_selected: choirJoinUid,
          choirs_joined: [choirJoinUid],
          email: userCredential.user.email,
          emailVerified: userCredential.user.emailVerified,
          image: userCredential.user.photoURL,
          name: `${capitalizedFirstName} ${capitalizedLastName}`,
          part: satbChoice,
          user_type: "student",
          messaging_channels: {
            [choirJoinUid]: {
              Main: mainChannelId,
            },
          },
        });
        console.log("New user added to Firestore!");
      } else {
        console.log("User already exists in Firestore.");
      }
      return userCredential;
    } catch (error) {
      console.error("Google Sign-In Error: ", error);
      throw new Error(error);
    }
  };

  return (
    <SafeAreaView className="bg-white">
      <KeyboardAvoidingView>
        <View className="h-full w-full bg-white flex items-center">
          <View className="w-full px-4 flex justify-between flex-col h-full">
            <View className="flex gap-2 mt-32">
              <Text className="text-md font-bold flex items-center justify-center text-gray-400 mb-3 ml-2">
                Create an account to join{" "}
                <Text className="text-[#FFCE00]">{choirName}</Text>
              </Text>
              <View className="bg-[#F7F7F7] flex flex-row items-center justify-between rounded-b-xl border-gray-300 rounded-xl">
                <TextInput
                  className="p-2 pl-4 bg-[#F7F7F7] rounded-xl text-lg text-gray-700"
                  placeholder="Email Address"
                  onChangeText={setUsername}
                  value={username}
                  placeholderTextColor="rgba(0, 0, 0, 0.3)"
                  autoCapitalize="none"
                />
              </View>
              <View className="bg-[#F7F7F7] flex flex-row items-center justify-between rounded-b-xl border-gray-300 rounded-xl">
                <TextInput
                  className="p-2 pl-4 bg-[#F7F7F7] rounded-xl text-lg text-gray-700"
                  placeholder="Password"
                  onChangeText={setPassword}
                  value={password}
                  secureTextEntry={passwordVisible}
                  placeholderTextColor="rgba(0, 0, 0, 0.3)"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  <Image
                    className="w-6 h-6 mr-3 opacity-40"
                    source={passwordVisible ? PasswordEye : PasswordEyeStrike}
                  />
                </TouchableOpacity>
              </View>
              <View className="bg-[#F7F7F7] flex flex-row items-center justify-between rounded-b-xl border-gray-300 rounded-xl">
                <TextInput
                  className="p-2 pl-4 bg-[#F7F7F7] rounded-xl text-lg text-gray-700"
                  placeholder="Confirm Password"
                  onChangeText={setConfirmPassword}
                  value={confirmPassword}
                  secureTextEntry={confirmPasswordVisible}
                  placeholderTextColor="rgba(0, 0, 0, 0.3)"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() =>
                    setConfirmPasswordVisible(!confirmPasswordVisible)
                  }
                >
                  <Image
                    className="w-6 h-6 mr-3 opacity-40"
                    source={
                      confirmPasswordVisible ? PasswordEye : PasswordEyeStrike
                    }
                  />
                </TouchableOpacity>
              </View>
              {createAccountError && (
                <Text className="mt-4 text-red-500">{createAccountError}</Text>
              )}
              <ActionButton
                text="CREATE ACCOUNT"
                onPress={createUserEmailPass}
                disabled={!username || !password || !confirmPassword}
              />
            </View>
            <View>
              <View className="flex flex-row justify-between mb-4 gap-x-4">
                <TouchableOpacity
                  className="mt-4 h-12 flex flex-row justify-center items-center border flex-1 rounded-xl border-b-4 bg-white border-slate-300"
                  onPress={onGoogleButtonPress}
                >
                  <Image className="h-6 w-6 mr-2" source={GoogleIcon} />
                  <Text className="text-gray-500 text-center font-bold text-lg">
                    GOOGLE
                  </Text>
                </TouchableOpacity>

                {Platform.OS != "ios" ? (
                  <TouchableOpacity
                    className="mt-4 h-12 flex flex-row justify-center items-center border flex-1 rounded-xl border-b-4 bg-white border-slate-300"
                    onPress={onAppleButtonPress}
                  >
                    <Image className="h-6 w-6 mr-2" source={AppleIcon} />
                    <Text className="text-gray-500 text-center font-bold text-lg">
                      APPLE
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View className="mt-4 h-12 flex flex-row justify-center items-center border flex-1 p-1 rounded-xl border-b-4 bg-white border-slate-300">
                    <AppleButton
                      style={{ width: "100%", height: "100%" }}
                      buttonStyle={AppleButton.Style.WHITE}
                      buttonType={AppleButton.Type.SIGN_IN}
                      onPress={onAppleButtonPress}
                    />
                  </View>
                )}
              </View>
              <Text className="text-center text-sm text-gray-500 mb-4">
                By signing in to Harmony Hive, you agree to our Terms and
                Privacy Policy.
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
