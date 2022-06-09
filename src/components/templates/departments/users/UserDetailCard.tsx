import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import TextLabel from '../../../atoms/typography/TextLabel';

interface inputProps {
  navigate: () => void,
  name: string,
  role: string,
  email: string,
}

const UserDetailCard: React.FC<inputProps> = ({
  navigate,
  name,
  role,
  email
}) => {
  const tailwind = useTailwind();

  return (
    <TouchableOpacity onPress={navigate}>
      <View style={tailwind('my-4')}>
        <View>
          <View style={tailwind('my-2')}>
            <TextLabel
              content={name}
              style={tailwind("font-bold")}
            />
          </View>
        </View>

        <View style={tailwind('flex flex-row justify-between')}>
          <TextLabel
            content={role}
            color="text-gray-primary"
          />

          <View>
            <TextLabel
              content={email}
              color="text-gray-primary"
              alignment='text-right'
              style={tailwind("w-full")}
            />
          </View>

        </View>
      </View>
    </TouchableOpacity>
  );
}

export default UserDetailCard;