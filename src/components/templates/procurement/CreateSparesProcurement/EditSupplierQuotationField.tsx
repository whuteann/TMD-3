import React, { useEffect, useState } from 'react';
import UploadButton from '../../../molecules/buttons/UploadButton';
import { useTailwind } from 'tailwind-rn/dist';
import FormTextInputField from '../../../molecules/input/FormTextInputField';
import { Platform, TouchableOpacity, View } from 'react-native';
import { Supplier } from '../../../../types/Supplier';
import DropdownField from '../../../atoms/input/dropdown/DropdownField';
import TextLabel from '../../../atoms/typography/TextLabel';
import { TrashIcon } from '../../../../../assets/svg/SVG';
import { SPARES_PROCUREMENTS } from '../../../../constants/Firebase';
import { SupplierField } from '../../../../types/SparesProcurement';
import { updateSparesProcurement } from '../../../../services/SparesProcurementServices';
import { deleteFile } from '../../../../services/StorageServices';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../../redux/reducers/Auth';
import { UPDATE_ACTION } from '../../../../constants/Action';
import SearchableDropdownField from '../../../atoms/input/dropdown/SearchableDropdownField';

type SupplierFieldLocal = {
  supplier: string,
  quotation_no: string,
  filename: string,
  uri: string,
  file: any
}

interface inputProps {
  index: number,
  suppliers: Array<Supplier>,
  suppliersList: Array<SupplierFieldLocal>,
  deleted: boolean,
  length: number,
  errors: any,
  docID: string,
  db_supplier: Array<SupplierField>,
  handleDelete: () => void,
  setFieldValue: (val: Array<SupplierFieldLocal>) => void,
}


const EditSupplierQuotationField: React.FC<inputProps> = ({
  index, suppliers, suppliersList, deleted, length, errors, docID, db_supplier, handleDelete, setFieldValue
}) => {
  const [openCreateSupplier, setOpenCreateSupplier] = useState(false);
  const [localList, setLocalList] = useState<Array<any>>(suppliersList);
  const [supplierErrors, setSupplierErrors] = useState<{ supplier: string, quotation_no: string, filename: string, uri: string, file: string }>();
  const [uploaded, setUploaded] = useState<Boolean>(false);
  const tailwind = useTailwind();
  const user = useSelector(UserSelector);

  useEffect(() => {
    setLocalList(suppliersList);
  }, [deleted]);

  useEffect(() => {
    let newList = localList;
    if (newList[index].filename) {
      setUploaded(true);
    } else {
      newList[index].quotation_no = "";
      newList[index].filename_storage = "";
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
        newList[index] = { ...newList[index], ...value, updated: true };
        break;
    }


    setLocalList([...newList]);
  }

  const updateSuppliersInfo = (filename, filename_storage) => {
    let newList = db_supplier;

    newList[index].filename = filename;
    newList[index].filename_storage = filename_storage;
    newList[index].quotation_no = "";

    if (localList[index].filename_storage != "") {
      updateSparesProcurement(docID, { suppliers: newList }, user!, UPDATE_ACTION, () => { }, (error) => { console.error(error); })
    }

  }

  return (
    <View>
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
                <TouchableOpacity onPress={() => {
                  handleDelete();
                  if (localList[index].filename_storage) {
                    deleteFile(SPARES_PROCUREMENTS, localList[index].filename_storage, () => { });
                  }
                }}>
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

      {/* <AddButtonText text="Create New Supplier"
        onPress={() => {
          setOpenCreateSupplier(!openCreateSupplier);
        }} />
      {
        openCreateSupplier
          ? (
            <View style={tailwind("mb-2")}>
              <AddNewSupplier onCancel={() => { setOpenCreateSupplier(false); }} />
            </View>
          )
          :
          null
      } */}
      <View style={tailwind("mb-2")} />
      <View >
        <UploadButton
          value={localList[index].filename}
          path={SPARES_PROCUREMENTS}
          filename_storage={localList[index].filename_storage}
          updateDoc={(filename, filename_storage) => { updateSuppliersInfo(filename, filename_storage) }}
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

export default EditSupplierQuotationField;