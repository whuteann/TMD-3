import { useEffect, useState } from "react";
import { Text } from "react-native";
import React from "react";
import { useTailwind } from "tailwind-rn/dist";

interface headerProps {
  title: string,
  color?: string,
  alignment?: string,
  style?: any
}

const Header = (props: headerProps) => {
  const {
    title,
    color = 'text-primary',
    alignment = 'text-center',
    style
  } = props;

  const tailwind = useTailwind();

  return (
    <Text
      style={[
        tailwind(`w-full text-22px font-bold ${color} ${alignment}`),
        style
      ]}
    >
      { title }
    </Text>
  );
}

export default Header;