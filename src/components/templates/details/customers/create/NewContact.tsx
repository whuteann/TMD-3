import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import { TrashIcon } from '../../../../../../assets/svg/SVG';
import TextLabel from '../../../../atoms/typography/TextLabel';
import FormTextInputField from '../../../../molecules/input/FormTextInputField';

interface sectionProps {
  contact_persons: Array<{ name: string, email: string, phone_number: string }>,
  index: number,
  deleted: boolean,
  handleDelete: () => void,
  length: number,
  errors?: any,
}

const NewContact: React.FC<sectionProps> = ({
  index,
  contact_persons,
  deleted,
  handleDelete,
  length,
  errors
}) => {
  const [localList, setLocalList] = useState(contact_persons);
  const tailwind = useTailwind();

  const [contactPersonErrors, setContactPersonErrors] = useState<{ name: string, email: string, phone_number: string }>();

  useEffect(() => {
    if (errors) {
      if (errors[index]) {
        setContactPersonErrors(errors[index]);
      } else {
        setContactPersonErrors(undefined);
      }
    } else {
      setContactPersonErrors(undefined);
    }
  }, [errors])

  const updateList = (value: string, field: "name" | "email" | "phone_number") => {
    let newList = localList;

    switch (field) {
      case "name":
        newList[index].name = value;
        break;
      case "email":
        newList[index].email = value;
        break;
      case "phone_number":
        newList[index].phone_number = value;
        break;
      default:
        break;
    }

    setLocalList([...newList]);
  }

  return (
    <View>
      <View style={tailwind('flex flex-row items-center')}>
        <TextLabel content={`Contact Person ${index + 1}`} style={tailwind('font-bold text-16px underline')} />

        {
          length > 1
            ?
            (
              <TouchableOpacity onPress={() => { handleDelete() }}>
                <TrashIcon width={15} height={15} />
              </TouchableOpacity>
            )
            :
            null
        }
      </View>

      <FormTextInputField
        label="Name"
        value={contact_persons[index].name}
        onChangeValue={text => updateList(text, "name")}
        required={true}
        hasError={Object.keys(contactPersonErrors || {}).includes("name")}
        errorMessage={contactPersonErrors ? contactPersonErrors.name : "chow line"}
      />

      <FormTextInputField
        label="Email"
        value={contact_persons[index].email}
        onChangeValue={text => updateList(text, "email")}
        required={true}
        hasError={Object.keys(contactPersonErrors || {}).includes("email")}
        errorMessage={contactPersonErrors ? contactPersonErrors.email : ""}
      />

      <FormTextInputField
        label="Phone Number"
        value={contact_persons[index].phone_number}
        onChangeValue={text => updateList(text, "phone_number")}
        required={true}
        hasError={Object.keys(contactPersonErrors || {}).includes("phone_number")}
        errorMessage={contactPersonErrors ? contactPersonErrors.phone_number : ""}
      />
    </View>
  )
}

export default NewContact;