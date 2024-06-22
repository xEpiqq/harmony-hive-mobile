import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, BackHandler, Alert, Modal } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

GoogleSignin.configure({
  webClientId: '41274838584-680c8sgq16fojgeq7nla5j6foioqq46p.apps.googleusercontent.com',
});

const screens = {
  START: 0,
  SATB: 1,
  NAME: 2,
  CODE: 3,
  CREATE_ACCOUNT: 4,
  JOIN_CHOIR: 5,
  LOGIN: 6,
};

const InputField = ({ placeholder, value, onChangeText, secureTextEntry, maxLength }) => (
  <TextInput
    className="bg-gray-100 rounded-lg text-gray-500 placeholder:text-gray-300 w-64 h-12 pl-3"
    placeholder={placeholder}
    onChangeText={onChangeText}
    value={value}
    secureTextEntry={secureTextEntry}
    placeholderTextColor="rgba(0, 0, 0, 0.3)"
    autoCapitalize="none"
    maxLength={maxLength}
  />
);

const ActionButton = ({ text, onPress, disabled }) => (
  <TouchableOpacity
    className={`h-14 w-full flex justify-center rounded-xl border-b-4 ${
      disabled ? 'bg-gray-300 border-gray-400' : 'bg-[#FFDE1A] border-[#FFCE00]'
    }`}
    onPress={onPress}
    disabled={disabled}
  >
    <Text className="text-white text-center text-md font-bold">{text}</Text>
  </TouchableOpacity>
);

function Starter() {
  const [currentScreen, setCurrentScreen] = useState(screens.START);
  const [login, setLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [onboardingCode, setOnboardingCode] = useState('');
  const [onboardError, setOnboardError] = useState('');
  const [createAccountError, setCreateAccountError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signinError, setSigninError] = useState('');
  const [choirJoinName, setChoirJoinName] = useState('');
  const [choirJoinUid, setChoirJoinUid] = useState('');
  const [satbChoice, setSatbChoice] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);
    


  const nextScreen = () => setCurrentScreen(currentScreen + 1);
  const prevScreen = () => currentScreen > 0 && setCurrentScreen(currentScreen - 1);

  const handleSatbChoice = (choice) => {
    setSatbChoice(choice);
    nextScreen();
  };

  const codeEntered = async () => {
    try {
      const querySnapshot = await firestore()
        .collection('choirs')
        .where('code', '==', onboardingCode)
        .get();

      if (querySnapshot.empty) {
        setOnboardError('Wrong code, sorry!');
      } else {
        const choirDoc = querySnapshot.docs[0];
        const choirName = choirDoc.data().name;
        const choirUid = choirDoc.id;
        setChoirJoinUid(choirUid);
        setChoirJoinName(choirName);
        nextScreen();
        setOnboardError('');
      }
    } catch (error) {
      console.error('Error fetching choirs:', error);
      setOnboardError('An error occurred while checking the code.');
    }
  };

  const signinEmailPass = async () => {
    try {
      await auth().signInWithEmailAndPassword(username, password);
      console.log('User signed in!');
    } catch (error) {
      if (error.code === 'auth/too-many-requests') {
        setSigninError('Too many login attempts, try again later!');
      } else if (error.code === 'auth/invalid-credential') {
        setSigninError(`Email or password isn't quite right!`);
      }
      console.error(error.code);
    }
  };

  const createUserEmailPass = async () => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(username, password);
      console.log('User account created & signed in!');
      const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      const capitalizedLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
      await firestore()
        .collection('users')
        .doc(userCredential.user.uid)
        .set({
          choir_selected: choirJoinUid,
          choirs_joined: [choirJoinUid],
          email: username,
          emailVerified: false,
          image: userCredential.user.photoURL,
          name: `${capitalizedFirstName} ${capitalizedLastName}`,
          part: satbChoice,
          user_type: 'student',
        });
      console.log('User added to Firestore!');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setCreateAccountError('That email address is already in use!');
      } else if (error.code === 'auth/invalid-email') {
        setCreateAccountError('That email address is invalid!');
      }
      console.error(error);
    }
  };

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const userDocRef = firestore().collection('users').doc(userCredential.user.uid);
      const docSnapshot = await userDocRef.get();
      if (!docSnapshot.exists) {
        const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
        const capitalizedLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
        await userDocRef.set({
          choir_selected: choirJoinUid,
          choirs_joined: [choirJoinUid],
          email: userCredential.user.email,
          emailVerified: userCredential.user.emailVerified,
          image: userCredential.user.photoURL,
          name: `${capitalizedFirstName} ${capitalizedLastName}`,
          part: satbChoice,
          user_type: 'student',
        });
        console.log('New user added to Firestore!');
      } else {
        console.log('User already exists in Firestore.');
      }
      return userCredential;
    } catch (error) {
      console.error('Google Sign-In Error: ', error);
      throw new Error(error);
    }
  };

  const justGoogleSignin = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const userDocRef = firestore().collection('users').doc(userCredential.user.uid);
      const docSnapshot = await userDocRef.get();
      if (!docSnapshot.exists) {
        await auth().signOut();
        console.log('Signed out user because they havent created an account yet!');
      }
      console.log(userCredential.user.uid);
      return userCredential;
    } catch (error) {
      console.error('Google Sign-In Error: ', error);
      throw new Error(error);
    }
  };

  const resetPassword = async () => {
    try {
      await auth().sendPasswordResetEmail(resetEmail);
      Alert.alert('Password Reset', 'Password reset email sent!', [{ text: 'OK' }]);
      closeModal();
    } catch (error) {
      if (error.code === 'auth/invalid-email') {
        setResetError('Invalid email address.');
      } else if (error.code === 'auth/user-not-found') {
        setResetError('No user found with this email address.');
      } else {
        setResetError('Failed to send reset email.');
      }
      console.error(error);
    }
    setResetEmail('');
  };
  

  useEffect(() => {
    const backAction = () => {
      if (currentScreen === screens.LOGIN) {
        setCurrentScreen(screens.START);
        return true;
      } else if (currentScreen > screens.START) {
        prevScreen();
        return true;
      } else {
        Alert.alert("Hold on!", "Are you sure you want to exit?", [
          {
            text: "Cancel",
            onPress: () => null,
            style: "cancel"
          },
          { text: "YES", onPress: () => BackHandler.exitApp() }
        ]);
        return true;
      }
    };
  
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
  
    return () => backHandler.remove();
  }, [currentScreen]);
  

  const renderScreen = () => {
    switch (currentScreen) {
      case screens.SATB:
        return (
          <View className="flex h-full bg-white items-center px-4 pt-16">
            <TouchableOpacity onPress={prevScreen} className="flex items-center absolute left-2 top-10">
              <Image className="h-[15px] w-[18px]" source={require('../../public/grayarrow.png')} />
            </TouchableOpacity>
            <View className="flex justify-center items-center">
              <Image className="w-44 h-44 mt-16" source={require('../../public/1.png')} />
              <Image className="w-52 h-8 mt-2" source={require('../../public/logo.png')} />
              <Text className="text-slate-400 px-20 text-center text-xl mt-2">Let's begin... which part do you sing?</Text>
            </View>
            <View className="w-full flex flex-col gap-y-3.5 justify-end mb-3 mt-20">
              {['soprano', 'alto', 'tenor', 'bass'].map((part) => (
                <ActionButton key={part} text={part.toUpperCase()} onPress={() => handleSatbChoice(part)} />
              ))}
            </View>
          </View>
        );
      case screens.NAME:
        return (
          <View className="flex h-full bg-white items-center justify-between px-4 pt-16">
            <TouchableOpacity onPress={prevScreen} className="flex items-center absolute left-2 top-10">
              <Image className="h-[15px] w-[18px]" source={require('../../public/grayarrow.png')} />
            </TouchableOpacity>
            <View className="flex justify-center items-center">
              <Image className="w-44 h-44 mt-16" source={require('../../public/2.png')} />
              <Image className="w-52 h-8 mt-2" source={require('../../public/logo.png')} />
              <Text className="text-slate-400 px-20 text-center text-xl mt-2">And what's your name?</Text>
              <View className="flex gap-3 mt-4">
                <View className="flex gap-2">
                  <InputField className="w-10 bg-black" placeholder="First name" value={firstName} onChangeText={setFirstName} />
                </View>
                <View className="flex gap-2">
                  <InputField className="" placeholder="Last name" value={lastName} onChangeText={setLastName} />
                </View>
              </View>
            </View>
            <ActionButton text="CONTINUE" onPress={nextScreen} disabled={!firstName || !lastName} />
          </View>
        );
      case screens.CODE:
        return (
          <View className="flex h-full bg-white items-center justify-between px-4 pt-16">
            <TouchableOpacity onPress={prevScreen} className="flex items-center absolute left-2 top-10">
              <Image className="h-[15px] w-[18px]" source={require('../../public/grayarrow.png')} />
            </TouchableOpacity>
            <View className="flex justify-center items-center">
              <Image className="w-44 h-44 mt-16" source={require('../../public/4.png')} />
              <Image className="w-52 h-8 mt-2" source={require('../../public/logo.png')} />
              <Text className="text-slate-400 px-20 text-center text-xl mt-2 mb-4">Almost done. Enter your choir code below to join!</Text>
              <InputField placeholder="Choir Membership Code" value={onboardingCode} onChangeText={setOnboardingCode} maxLength={6} />
              <Text className="text-red-400 px-20 text-center text-md mt-2">{onboardError}</Text>
            </View>
            <ActionButton text="CONTINUE" onPress={codeEntered} disabled={!onboardingCode} />
          </View>
        );
        case screens.CREATE_ACCOUNT:
          return (
            <View className="h-full w-full bg-white flex items-center">
              <View className="w-full px-4 flex justify-between flex-col h-full">
                <TouchableOpacity onPress={prevScreen} className="flex items-center absolute left-2 top-3">
                  <Image className="h-[15px] w-[18px]" source={require('../../public/grayarrow.png')} />
                </TouchableOpacity>
                <View className="flex gap-2 mt-12">
                  <View className="flex flex-row items-center justify-center relative mb-4 mt-16">
                    <Text className="text-lg font-bold flex items-center justify-center text-gray-400">Joining {choirJoinName}... create an account</Text>
                  </View>
                  <InputField placeholder="Email Address" value={username} onChangeText={setUsername} />
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
                    <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                      <Image
                        className="w-6 h-6 mr-3 opacity-40"
                        source={passwordVisible ? require('../../public/password_eye.png') : require('../../public/password_eye_strike.png')}
                      />
                    </TouchableOpacity>
                  </View>
                  {createAccountError && <Text className="mt-4 text-red-500">{createAccountError}</Text>}
                  <ActionButton text="CREATE ACCOUNT" onPress={createUserEmailPass} disabled={!username || !password} />
                  <Text className="font-bold text-center mb-4 text-[#FFCE00] mt-4 text-lg">FORGOT PASSWORD</Text>
                </View>
                <View>
                  <View className="flex flex-row justify-between mb-4 gap-x-4">
                    <TouchableOpacity
                      className="mt-4 gap-x-1 h-12 flex flex-row justify-center items-center border flex-1 rounded-xl border-b-4 bg-white border-slate-300"
                      onPress={onGoogleButtonPress}
                    >
                      <Image className="h-6 w-6" source={require('../../public/google.png')} />
                      <Text className="text-gray-500 text-center font-bold text-lg flex items-center justify-center">GOOGLE</Text>
                    </TouchableOpacity>
                  </View>
                  <Text className="text-center text-sm text-gray-500 mb-4">
                    By signing in to Harmony Hive, you agree to our Terms and Privacy Policy.
                  </Text>
                </View>
              </View>
            </View>
          );
        
      case screens.JOIN_CHOIR:
        return (
          <View className="flex h-full bg-white items-center justify-between px-4">
            <TouchableOpacity onPress={() => setCurrentScreen(screens.START)} className="flex items-center absolute left-2 top-3">
              <Image className="h-[15px] w-[18px]" source={require('../../public/grayarrow.png')} />
            </TouchableOpacity>
            <View className="flex justify-center items-center">
              <Image className="w-44 h-44 mt-16" source={require('../../public/2.png')} />
              <Image className="w-52 h-8 mt-2" source={require('../../public/logo.png')} />
              <Text className="text-slate-400 px-20 text-center text-md mt-2">Enter your choir code and email address to join.</Text>
              <InputField placeholder="Choir Membership Code" value={onboardingCode} onChangeText={setOnboardingCode} maxLength={6} />
              <InputField placeholder="Email Address" value={username} onChangeText={setUsername} />
              <Text className="text-red-400 px-20 text-center text-md mt-2">{onboardError}</Text>
            </View>
            <ActionButton text="JOIN CHOIR" onPress={codeEntered} disabled={!onboardingCode || !username} />
          </View>
        );
      case screens.LOGIN:
          return (
            <View className="h-full w-full bg-white flex items-center">

              <Modal
                animationType="slide"
                transparent={false}
                visible={isModalVisible}
                onRequestClose={closeModal}
              >
                <TouchableOpacity onPress={closeModal} className="fixed top-0 left-0 w-10 h-10 flex items-center justify-center">
                  <Text className="text-blue-500 mt-4 fixedbg-black text-xl">X</Text>
                </TouchableOpacity>
                <View className="flex-1 mt-44 items-center">
                  <View>
                  <Text className="text-xl mb-4">Reset Password</Text>
                  <InputField
                    placeholder="Enter your email"
                    value={resetEmail}
                    onChangeText={setResetEmail}
                  />
                  {resetError ? <Text className="text-red-500 mt-2">{resetError}</Text> : null}

                </View>
                </View>
                <ActionButton text="SEND RESET EMAIL" onPress={resetPassword} disabled={!resetEmail} />

              </Modal>


              <View className="w-full px-4 flex justify-between flex-col h-full">
                <View>
                    <TouchableOpacity onPress={() => setCurrentScreen(screens.START)} className="w-5 h-auto flex items-center absolute mt-12 left-2">
                      <Text className="text-4xl font-light">×</Text>
                    </TouchableOpacity>
                  <View className="flex flex-row items-center justify-center relative mb-4 mt-36">

                    <Text className="text-lg font-bold flex items-center justify-center text-gray-400">Enter your details</Text>
                  </View>
                  <View className="rounded-xl border border-gray-300">
                    <TextInput
                      placeholder="Username or email"
                      value={username}
                      onChangeText={setUsername}
                      className="h-14 w-full bg-gray-50 px-2 rounded-xl"
                    />
                    <View className="flex flex-row items-center justify-between rounded-b-xl">
                      <TextInput
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={passwordVisible}
                        className="h-14 w-96 px-2"
                      />
                      <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                        <Image
                          className="w-6 h-6 mr-3 opacity-40"
                          source={passwordVisible ? require('../../public/password_eye.png') : require('../../public/password_eye_strike.png')}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {signinError && <Text className='mt-3'>{signinError}</Text>}
                  <View className="mt-4">
                    <ActionButton text="SIGN IN" onPress={signinEmailPass} disabled={!username || !password} />

                    <Text
                      className="font-bold text-center mb-4 text-[#19B1F4] mt-4 text-lg"
                      onPress={openModal}
                    >
                      FORGOT PASSWORD
                    </Text>

                  </View>
                </View>
                <View>
                  <View className="flex flex-row justify-between mb-4 gap-x-4">
                    {/* <TouchableOpacity className="mt-4 gap-x-1 h-12 flex flex-row justify-center items-center border flex-1 rounded-xl border-b-4 bg-white border-slate-300">
                      <Image className="h-6 w-6" source={require('../../public/fb.png')} />
                      <Text className="text-[#0266FF] text-center font-bold text-lg flex items-center justify-center">FACEBOOK</Text>
                    </TouchableOpacity> */}
                    <TouchableOpacity
                      className="mt-4 gap-x-1 h-12 flex flex-row justify-center items-center border flex-1 rounded-xl border-b-4 bg-white border-slate-300"
                      onPress={justGoogleSignin}
                    >
                      <Image className="h-6 w-6" source={require('../../public/google.png')} />
                      <Text className="text-gray-500 text-center font-bold text-lg flex items-center justify-center">GOOGLE</Text>
                    </TouchableOpacity>
                  </View>
                  <Text className="text-center text-sm text-gray-500 mb-4">
                    By signing in to Harmony Hive, you agree to our Terms and Privacy Policy.
                  </Text>
                </View>
              </View>
            </View>
          );
      default:
        return (
          <View className="flex h-full bg-white items-center justify-between px-4">
            <View className="flex justify-center items-center">
              <Image className="w-32 h-32 mt-44" source={require('../../public/honeycomb.png')} />
              <Image className="w-52 h-8 mt-2" source={require('../../public/logo.png')} />
              <Text className="text-slate-400 px-20 text-center text-xl mt-2">Tell your teacher you practiced without lying.</Text>
            </View>
            <View className="w-full flex flex-col gap-y-3.5 justify-end mb-3">
              <ActionButton text="GET STARTED" onPress={() => setCurrentScreen(screens.SATB)} />
                <TouchableOpacity
                  className="h-14 w-full flex justify-center rounded-xl border-b-4"
                  onPress={() => setCurrentScreen(screens.LOGIN)}
                  style={{ backgroundColor: '#FFA700', borderColor: '#FFA700' }}
                >

                <Text className="text-white text-center text-md font-bold">I ALREADY HAVE AN ACCOUNT</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  return <View>{renderScreen()}</View>;
}

export default Starter;
