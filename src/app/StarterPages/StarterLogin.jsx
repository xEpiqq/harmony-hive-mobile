import {
  AppleIcon,
  GoogleIcon,
  PasswordEye,
  PasswordEyeStrike,
} from "../../../assets/images";
import {
  SafeAreaView,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Image,
  Platform,
} from "react-native";
import { useState } from "react";

import { AppleButton } from "@invertase/react-native-apple-authentication";
import { appleAuth } from "@invertase/react-native-apple-authentication";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

import ActionButton from "@/components/ActionButton";
export default function StarterLogin({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [signinError, setSigninError] = useState("");

  const signinEmailPass = async () => {
    try {
      await auth().signInWithEmailAndPassword(username, password);
      console.log("User signed in!");
      // navigateToGameScreen();
    } catch (error) {
      if (error.code === "auth/too-many-requests") {
        setSigninError("Too many login attempts, try again later!");
      } else if (error.code === "auth/invalid-credential") {
        setSigninError(`Email or password isn't quite right!`);
      }
      console.error(error.code);
    }
  };

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

  const justGoogleSignin = async () => {
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
        await auth().signOut();
        console.log(
          "Signed out user because they havent created an account yet!"
        );
      }
      console.log(userCredential.user.uid);
      return userCredential;
    } catch (error) {
      console.error("Google Sign-In Error: ", error);
      throw new Error(error);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: "white" }}>
      <View className="h-full w-full bg-white flex items-center">
        <View className="w-full px-4 flex justify-between flex-col h-full">
          <View>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-5 h-auto flex items-center absolute mt-12 left-2"
            >
              <Text className="text-4xl font-light">×</Text>
            </TouchableOpacity>
            <View className="flex flex-row items-center justify-center relative mb-4 mt-36">
              <Text className="text-lg font-bold flex items-center justify-center text-gray-400">
                Enter your details
              </Text>
            </View>
            <View className="rounded-xl border border-gray-300">
              <TextInput
                placeholder="Username or email"
                value={username}
                onChangeText={setUsername}
                className="h-14 w-full bg-gray-50 px-2 rounded-xl placeholder:text-gray-700"
              />
              <View className="flex flex-row items-center justify-between rounded-b-xl">
                <TextInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={passwordVisible}
                  className="h-14 w-96 px-2 placeholder:text-gray-700"
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
            </View>
            {signinError && <Text className="mt-3">{signinError}</Text>}
            <View className="mt-4">
              <ActionButton
                text="SIGN IN"
                onPress={signinEmailPass}
                disabled={!username || !password}
              />
              <Text
                className="font-bold text-center mb-4 text-[#FFCE00] mt-4 text-lg"
                onPress={() => navigation.navigate("ResetPassword")}
              >
                FORGOT PASSWORD
              </Text>
            </View>
          </View>
          <View>
            <View className="flex flex-row justify-between mb-4 gap-x-4">
              <TouchableOpacity
                className="mt-4 h-12 flex flex-row justify-center items-center border flex-1 rounded-xl border-b-4 bg-white border-slate-300"
                onPress={justGoogleSignin}
              >
                <Image className="h-6 w-6 mr-2" source={GoogleIcon} />
                <Text className="text-gray-500 text-center font-bold text-lg">
                  GOOGLE
                </Text>
              </TouchableOpacity>

              {Platform.OS !== "ios" ? (
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
              By signing in to Harmony Hive, you agree to our Terms and Privacy
              Policy.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
