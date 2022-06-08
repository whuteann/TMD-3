import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ThreeDotsIcon } from '../../../../../../assets/svg/SVG';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../../../atoms/typography/TextLabel';

interface inputProps {
  navigate: () => void,
  name: string,
  email: string,
  contactNo: string,
}

const ContactPersonTab: React.FC<inputProps> = ({
  navigate, name, email, contactNo
}) => {
  const tailwind = useTailwind();

  return (
    <TouchableOpacity onPress={navigate}>
      <View style={tailwind('box-card-shadow flex flex-row bg-white justify-between items-center mt-2 p-3')}>
        <View style={tailwind('flex flex-row items-center')}>
          <View>
            <View style={tailwind('flex flex-row')}>
              <View style={tailwind('w-full')}>
                <TextLabel content="Name" style={tailwind('font-bold')} />
              </View>

              <TextLabel content={`:    `} style={tailwind('font-bold')} />
              <View style={tailwind('w-full')}>
                <TextLabel content={name} style={tailwind('ml-2')} />
              </View>
            </View>
            
            <View style={tailwind('flex flex-row')}>
              <View style={tailwind('w-full')}>
                <TextLabel content="Email" style={tailwind('font-bold')} />
              </View>

              <TextLabel content={`:    `} style={tailwind('font-bold')} />
              <View style={tailwind('w-full')}>
                <TextLabel content={email} style={tailwind('ml-2')} />
              </View>
            </View>

            <View style={tailwind('flex flex-row')}>
              <View style={tailwind('w-full')}>
                <TextLabel content="Contact No." style={tailwind('font-bold')} />
              </View>
              
              <TextLabel content={`:    `} style={tailwind('font-bold')} />
              <View style={tailwind('w-full')}>
                <TextLabel content={contactNo} style={tailwind('ml-2')} />
              </View>
            </View>
          </View>
        </View>
        
        <ThreeDotsIcon height={20} width={20} />
      </View>
    </TouchableOpacity>
  );
}

export default ContactPersonTab;
