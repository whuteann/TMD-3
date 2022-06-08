import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import AddButtonText from '../../atoms/buttons/AddButtonText';
import { useTailwind } from 'tailwind-rn/dist';

interface inputProps {
  text: string,
  onPress: () => void,
}

const AddNewButton: React.FC<inputProps> = ({
  text, onPress
}) => {
  const tailwind = useTailwind();

  return (
    <View>
      <TouchableOpacity onPress={onPress}>
        <View style={tailwind("border border-primary rounded-lg p-3")}>
         <AddButtonText text={text} onPress={onPress}/>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({});

export default AddNewButton;