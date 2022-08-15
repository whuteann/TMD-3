import React, { useEffect, useState } from 'react';
import AddButtonText from '../../../atoms/buttons/AddButtonText';
import UploadButton from '../../../molecules/buttons/UploadButton';
import AddNewSupplier from '../../add/AddNewSupplier';
import { useTailwind } from 'tailwind-rn/dist';
import FormTextInputField from '../../../molecules/input/FormTextInputField';
import { Platform, TouchableOpacity, View } from 'react-native';
import { Supplier } from '../../../../types/Supplier';
import DropdownField from '../../../atoms/input/dropdown/DropdownField';
import TextLabel from '../../../atoms/typography/TextLabel';
import { TrashIcon } from '../../../../../assets/svg/SVG';
import SearchableDropdownField from '../../../atoms/input/dropdown/SearchableDropdownField';

type SupplierField = {
  supplier: string,
  quotation_no: string,
  filename: string,
  uri: string,
  file: any
}

interface inputProps {
  index: number,
  suppliers: Array<Supplier>,
  suppliersList: Array<SupplierField>,
  deleted: boolean,
  length: number,
  errors: any,
  handleDelete: () => void,
  setFieldValue: (val: Array<SupplierField>) => void,
}


const SupplierQuotationField: React.FC<inputProps> = ({
  index, suppliers, suppliersList, deleted, length, errors, handleDelete, setFieldValue
}) => {
  const [localList, setLocalList] = useState<Array<SupplierField>>(suppliersList);
  const [supplierErrors, setSupplierErrors] = useState<{ supplier: string, quotation_no: string, filename: string, uri: string, file: string }>();
  const [uploaded, setUploaded] = useState<Boolean>(false);
  const tailwind = useTailwind();

  useEffect(() => {
    setLocalList(suppliersList);
  }, [deleted, suppliersList]);

  useEffect(() => {

    let newList = localList;
    if (newList[index].file && newList[index].uri) {
      setUploaded(true);
    } else if (newList[index].uri) {
      newList[index].file = "UPLOADED FROM MOBILE"
      setUploaded(true);
    } else {
      newList[index].quotation_no = ""
      setUploaded(false);
    }

    setFieldValue(localList);
  }, [localList])

  useEffect(() => {
    if (errors) {
      if (errors[index]) {
        setSupplierErrors(errors[index]);
      } else {
        setSupplierErrors(undefined);
      }
    } else {
      setSupplierErrors(undefined);
    }
  }, [errors])

  const updateList = (field: "qNo" | "supplier" | "file", value: any) => {
    let newList = localList;
    switch (field) {
      case "supplier":
        newList[index].supplier = value;
        break;
      case "qNo":
        newList[index].quotation_no = value;
        break;
      case "file":
        newList[index] = { ...newList[index], ...value };
        break;
    }

    setLocalList([...newList]);
  }

  return (
    <View style={tailwind(`${Platform.OS == "web" ? "z-50" : ""}`)}>
      <View style={tailwind("flex-row items-center")}>

        <View style={tailwind("flex-row w-1/5")}>
          <View>
            <TextLabel content={`Supplier ${index + 1}`} style={tailwind("font-bold mr-1")} />
          </View>
          {
            index == 0
              ?
              <TextLabel content={`*`} color='text-red-500' />
              :
              null
          }
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

      <View style={tailwind(`${Platform.OS == "web" ? "z-50" : ""}`)}>
        <SearchableDropdownField
          placeholder="Select"
          value={localList[index].supplier}
          items={suppliers ? suppliers.map(item => item.name) : []}
          onChangeValue={(val) => { updateList("supplier", val) }}
          hasError={Object.keys(supplierErrors || {}).includes("supplier")}
          errorMessage={supplierErrors ? supplierErrors.supplier : ""}
        />
      </View>

      <View style={tailwind("mb-2")} />
      <View >
        <UploadButton
          value={localList[index].filename}
          buttonText="Upload Quotation"
          autoSave={false}
          setSelectedFile={(file) => { updateList("file", file) }}
          hasError={Object.keys(supplierErrors || {}).includes("filename")}
          errorMessage={supplierErrors ? supplierErrors.filename : ""}
        />
      </View>
      {uploaded ? (
        <View style={tailwind("mb-2")}>
          <FormTextInputField
            label={`Quotation ${index + 1} No.`}
            required={true}
            value={localList[index].quotation_no}
            onChangeValue={text => { updateList("qNo", text) }}
            hasError={Object.keys(supplierErrors || {}).includes("quotation_no")}
            errorMessage={supplierErrors ? supplierErrors.quotation_no : ""}
          />
        </View>
      ) : null}


    </View>
  )
}

export default SupplierQuotationField;