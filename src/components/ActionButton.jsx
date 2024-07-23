import { TouchableOpacity, Text } from "react-native";

export default function ActionButton({ text, onPress, disabled }) {
  return (
    <TouchableOpacity
      className={`h-14 w-full flex justify-center rounded-xl border-b-4 ${
        disabled
          ? "bg-gray-300 border-gray-400"
          : "bg-[#FFDE1A] border-[#FFCE00]"
      }`}
      onPress={onPress}
      disabled={disabled}
    >
      <Text className="text-white text-center text-md font-bold">{text}</Text>
    </TouchableOpacity>
  );
}
