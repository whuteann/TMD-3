import React from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-elements';
import { useTailwind } from 'tailwind-rn/dist';

interface ButtonProps {
	text: string;
	operation: () => void,
	type?: 'primary' | 'secondary' | 'disabled',
	loading?: boolean
}

const RegularButton: React.FC<ButtonProps> = ({
	text, 
	operation, 
	type = 'primary',
	loading = false
}) => {
	const tailwind = useTailwind();
	let buttonStyle;
	let textStyle;

	switch (type) {
		case 'primary':
			buttonStyle = tailwind('bg-primary border border-primary');
			textStyle = tailwind('text-white');
			break;

		case 'secondary':
			buttonStyle = tailwind('bg-transparent border border-red-500');
			textStyle = tailwind('text-primary');
			break;

		case 'disabled':
			buttonStyle = tailwind('bg-gray-secondary border border-gray-secondary');
			textStyle = tailwind('text-white');
			break;

		default:
			break;
	}

	return (
		<View style={ tailwind('w-full my-2') }>
			<Button
				title={text}
				buttonStyle={[
					tailwind('py-4 rounded-lg'),
					buttonStyle,
					{ borderColor: buttonStyle.borderColor } // This is needed for react native elements button border issue (Left/Right)
				]}
				titleStyle={[
					tailwind('font-sans font-bold text-16px'),
					textStyle
				]}
				onPress={ operation }
				disabled={ type == 'disabled' ? true : false }
				loading={ loading }
				loadingProps={{
					size: 26,
					color: textStyle.color,
				}}
			/>
		</View>
	)
}

export default RegularButton;