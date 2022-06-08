import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import TextLabel from '../../atoms/typography/TextLabel';

interface linkTextProps {
  content: string,
  to: () => void,
  color?: string,
  alignment?: string,
  style?: any
}

const LinkText: React.FC<linkTextProps> = ({
  content,
  to,
  color,
  alignment,
  style
}) => {
  return (
    <TouchableOpacity onPress={() => to()}>
      <TextLabel content={content} color={ color } alignment={ alignment } style={ style } />
    </TouchableOpacity>
  );
}

export default LinkText;