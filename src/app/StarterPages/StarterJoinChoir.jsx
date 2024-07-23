import { HarmonyHiveText, SingingLady } from "../../../assets/images";

export default function StarterJoinChoir() {
  return (
    <View className="flex h-full bg-white items-center justify-between px-4">
      <View className="flex justify-center items-center">
        <Image
          className="w-44 h-44 mt-16"
          source={SingingLady}
        />
        <Image
          className="w-52 h-8 mt-2"
          source={HarmonyHiveText}
        />
        <Text className="text-slate-400 px-20 text-center text-md mt-2">
          Enter your choir code and email address to join.
        </Text>
        <InputField
          placeholder="Choir Membership Code"
          value={onboardingCode}
          onChangeText={setOnboardingCode}
          maxLength={6}
        />
        <InputField
          placeholder="Email Address"
          value={username}
          onChangeText={setUsername}
        />
        <Text className="text-red-400 px-20 text-center text-md mt-2">
          {onboardError}
        </Text>
      </View>
      <ActionButton
        text="JOIN CHOIR"
        onPress={codeEntered}
        disabled={!onboardingCode || !username}
      />
    </View>
  );
}
