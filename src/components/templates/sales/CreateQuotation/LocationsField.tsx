import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import { TrashIcon } from '../../../../../assets/svg/SVG';
import TextLabel from '../../../atoms/typography/TextLabel';
import FormDropdownInputField from '../../../molecules/input/FormDropdownInputField';

interface InputProps {
  index: number,
  ports: Array<{ port: string, delivery_location: string }>,
  deleted: boolean,
  length: number,
  handleDelete: () => void,
  portList: Array<string>,
  locationList: Array<Array<string>>,
  errors: any,
}

type port = {
  port: string,
  delivery_location: string,
}

type portField = Array<port>;

const LocationsField: React.FC<InputProps> = ({
  handleDelete, ports, portList, locationList, deleted, index, length, errors
}) => {

  const tailwind = useTailwind();
  const [updated, setUpdated] = useState(false);
  const [portsLocal, setPortsLocal] = useState<portField>(ports);
  const [localList, setLocalList] = useState<port>(portsLocal[index]);
  const [locations, setLocations] = useState<Array<string>>([]);

  const updateList = (values: any, field: "port" | "delivery_location") => {
    let newList = portsLocal
    switch (field) {
      case "port":
        newList[index].port = values;
        break;
      case "delivery_location":
        newList[index].delivery_location = values;
        break;
    }

    setPortsLocal([...newList]);
  }


  useEffect(() => {
    setPortsLocal(ports);
    setLocalList(ports[index]);
    setUpdated(!updated);
  }, [deleted]);


  const [portErrors, setPortErrors] = useState<{ port: string, delivery_location: string }>();

  useEffect(() => {
    if (errors) {
      if (errors[index]) {
        setPortErrors(errors[index]);
      } else {
        setPortErrors(undefined);
      }
    } else {
      setPortErrors(undefined);
    }
  }, [errors])


  return (
    <View>
      <View style={tailwind("flex-row items-center")}>

        <View style={tailwind("flex-row w-1/5")}>
          <View>
            <TextLabel content={`Location ${index + 1}`} color="text-gray-primary" style={tailwind("font-bold mr-1")} />
          </View>
        </View>
        {
          length > 1
            ?
            (
              <View style={tailwind("items-end flex-grow")}>
                <TouchableOpacity onPress={() => { handleDelete() }}>
                  <TrashIcon height={15} width={15} />
                </TouchableOpacity>
              </View>
            )
            :
            null
        }
      </View>
      <FormDropdownInputField
        label="Port"
        value={localList.port}
        placeholder="Select"
        items={portList}
        onChangeValue={text => { updateList(text, "port"); setLocations(locationList[portList.indexOf(text)]); updateList("", "delivery_location"); }}
        required={true}
        hasError={Object.keys(portErrors || {}).includes("port")}
        errorMessage={portErrors ? portErrors.port : ""}
      />

      <FormDropdownInputField
        label="Delivery Location"
        value={localList.delivery_location}
        items={locations}
        onChangeValue={text => { updateList(text || localList.delivery_location, "delivery_location") }}
        required={true}
        hasError={Object.keys(portErrors || {}).includes("delivery_location")}
        errorMessage={portErrors ? portErrors.delivery_location : ""}
      />
    </View>
  )
}

export default LocationsField;