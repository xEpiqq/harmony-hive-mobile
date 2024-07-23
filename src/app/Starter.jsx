import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StarterWelcome from "./StarterPages/StarterWelcome";
import StarterSATB from "./StarterPages/StarterSATB";
import StarterName from "./StarterPages/StarterName";
import StarterCode from "./StarterPages/StarterCode";
import StarterCreateAccount from "./StarterPages/StarterCreateAccount";
import StarterJoinChoir from "./StarterPages/StarterJoinChoir";
import StarterLogin from "./StarterPages/StarterLogin";
import StarterResetPassword from "./StarterPages/StarterChangePassword";

GoogleSignin.configure({
  webClientId:
    "41274838584-680c8sgq16fojgeq7nla5j6foioqq46p.apps.googleusercontent.com",
});

function Starter() {
  const stackNavigator = createNativeStackNavigator();

  return (
    <stackNavigator.Navigator initialRouteName="Welcome">
      <stackNavigator.Screen
        name="Welcome"
        component={StarterWelcome}
        options={{ headerShown: false }}
      />
      <stackNavigator.Screen
        name="Login"
        component={StarterLogin}
        options={{ headerShown: false }}
      />
      <stackNavigator.Screen
        name="JoinChoir"
        component={StarterJoinChoir}
        options={{ headerShown: false }}
      />
      <stackNavigator.Screen
        name="Code"
        component={StarterCode}
        options={{ headerShown: false }}
      />
      <stackNavigator.Screen
        name="CreateAccount"
        component={StarterCreateAccount}
        options={{ headerShown: false }}
      />
      <stackNavigator.Screen
        name="SATB"
        component={StarterSATB}
        options={{ headerShown: false }}
      />
      <stackNavigator.Screen
        name="Name"
        component={StarterName}
        options={{ headerShown: false }}
      />
      <stackNavigator.Screen
        name="ResetPassword"
        component={StarterResetPassword}
        options={{ headerShown: false }}
        presentation="modal"
      />
    </stackNavigator.Navigator>
  );
}

export default Starter;
