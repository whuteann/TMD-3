import { Text } from "react-native";
import React from "react";
import { useTailwind } from "tailwind-rn/dist";

interface textLabelProps {
  content: string,
  color?: string,
  alignment?: string,
  style?: any
}

const TextLabel = (props: textLabelProps) => {
  const {
    content,
    color = 'text-black',
    alignment = 'text-left',
    style
  } = props;

  const tailwind = useTailwind();

  return (
    <Text
      style={[
        tailwind(`w-full text-14px my-1 font-sans ${color} ${alignment}`),
        style
      ]}
    >
      { content }
    </Text>
  );
}

export default TextLabel;