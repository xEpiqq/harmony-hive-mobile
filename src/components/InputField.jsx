import { TextInput } from "react-native";

export default InputField = ({
    placeholder,
    value,
    onChangeText,
    secureTextEntry,
    maxLength,
  }) => (
    <TextInput
      className="bg-gray-100 rounded-lg text-gray-500 placeholder:text-gray-300 w-full h-12 pl-3"
      placeholder={placeholder}
      onChangeText={onChangeText}
      value={value}
      secureTextEntry={secureTextEntry}
      placeholderTextColor="rgba(0, 0, 0, 0.3)"
      autoCapitalize="none"
      maxLength={maxLength}
    />
  );
  