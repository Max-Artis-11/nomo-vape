import Colors from '@/shared/Colors';
import { Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import { TextInput } from 'react-native';

const Input = (props) => {
  const {
    placeholder,
    password = false,
    onChangeText,
    inputRef,
    ...restProps
  } = props;

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
  });

  if (!fontsLoaded) return null;

  return (
    <TextInput
      ref={inputRef}
      placeholder={placeholder}
      secureTextEntry={password}
      onChangeText={onChangeText}
      placeholderTextColor="#888"
      style={{
        padding: 20,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 30,
        fontSize: 18,
        paddingVertical: 20,
        width: '100%',
        fontFamily: 'Inter_600SemiBold',
        color: Colors.WHITE,
        backgroundColor: 'rgba(255, 255, 255, 0.05)', // transparent grey
      }}
      {...restProps}
    />
  );
};

export default Input;
