import React from 'react';
import { View, Text } from 'react-native';

interface ErrorMessageProps {
  errorMsg: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ errorMsg }) => {
  return (
    <View className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/20 p-5">
      <Text className="text-center font-bold text-red-300">{errorMsg}</Text>
    </View>
  );
};
