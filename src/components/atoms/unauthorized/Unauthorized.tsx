import React from "react";
import TextLabel from "../typography/TextLabel";
import { useTailwind } from "tailwind-rn/dist";
import { View } from "react-native";

interface loadingProps {
  message?: string;
}

const Unauthorized: React.FC<loadingProps> = ({
  message = 'You are not allowed to view this page'
}) => {

  const tailwind = useTailwind();

  return (
    <View style={tailwind("bg-cream w-full h-full z-10 items-center")}>
      <View style={tailwind("justify-end flex-col mt-[300px]")}>
        <View style={tailwind("mt-[30px]")}>
          <TextLabel content={message} style={tailwind("text-20px")} />
        </View>
      </View>
    </View>
  );
};

export default Unauthorized;