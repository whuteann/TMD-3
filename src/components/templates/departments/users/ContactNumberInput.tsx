import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { TrashIcon } from '../../../../../assets/svg/SVG';
import DropdownField from '../../../atoms/input/dropdown/DropdownField';
import TextInputField from '../../../atoms/input/text/TextInputField';
import { useTailwind } from 'tailwind-rn/dist';

interface inputProps {
	handleChange: (val: Array<{ type: string, number: string }>) => void,
	handleDelete: () => void,
	index: number,
	deleted: boolean,
	contacts: Array<{ type: string, number: string }>,
	listLength: number,
	editable?: boolean
}

const ContactNumberInput: React.FC<inputProps> = ({
	handleChange, 
	handleDelete, 
	deleted, 
	contacts, 
	listLength, 
	index,
	editable = true
}) => {
	const tailwind = useTailwind();
	const [contactsLocal, setContactsLocal] = useState(contacts);
	const [infoLocal, setInfoLocal] = useState(contactsLocal[index]);

	const updateList = (field: string, value: string) => {
		let newList = contactsLocal;

		switch (field) {
			case "type":
				newList[index].type = value;
				break;
			case "number":
				newList[index].number = value;
				break;
		}
		setContactsLocal([...newList]);
	}

	useEffect(() => {
		setContactsLocal(contacts);
		setInfoLocal(contacts[index]);
	}, [deleted]);

	return (
		<View style={tailwind("w-full")}>
			<View style={tailwind("flex-row")}>
				<View style={tailwind("w-[33%]")}>
					<DropdownField 
						value={infoLocal.type} 
						placeholder="Select" 
						items={["Mobile", "Fax"]} 
						onChangeValue={(text) => updateList("type", text)} 
						shadow={false} 
						editable={editable} />
				</View>
				<View style={tailwind(`ml-[2%] flex-row items-center w-[66%]`)}>
					<View style={tailwind(`${listLength > 1 ? 'w-[89%]' : 'w-full'}`)} >
						<TextInputField 
							placeholder='018 888 8888' 
							value={infoLocal.number} 
							onChangeText={(text) => updateList("number", text)} 
							shadow={false} 
							number={true} 
							editable={editable} />
					</View>
					
					{listLength > 1 && editable ? (
						<View style={tailwind("ml-[3%] pb-5")}>
							<TouchableOpacity onPress={handleDelete}>
								<TrashIcon width={20} height={20} />
							</TouchableOpacity>
						</View>
					) : null}
				</View>
			</View>
		</View>

	)
}

export default ContactNumberInput;