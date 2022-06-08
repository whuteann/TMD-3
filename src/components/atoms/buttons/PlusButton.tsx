import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { PlusSimpleWhiteIcon } from '../../../../assets/svg/SVG';
import TextLabel from '../typography/TextLabel';

interface ButtonProps {
  text: string;
  operation: () => void
}

const PlusButton: React.FC<ButtonProps> = ({
  text, operation
}) => {
  const tailwind = useTailwind();
  let button;

  button = (
    <TouchableOpacity
      style={tailwind('w-full')}
      onPress={operation}
    >
      <View style={tailwind('flex flex-row justify-between items-center bg-primary rounded-lg p-3')}>
        <TextLabel content={text} color='text-white' style={tailwind('font-bold text-16px w-[90%]')} />
        
        <PlusSimpleWhiteIcon height={15} width={15} />
      </View>
    </TouchableOpacity>
  )

  return (
    <View>
      {button}
    </View>
  )
}

export default PlusButton;