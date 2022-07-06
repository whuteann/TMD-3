import React, { useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import AddNewButton from '../../../components/molecules/buttons/AddNewButton';
import AddButtonText from '../../../components/atoms/buttons/AddButtonText';
import SupplierQuotationField from '../../../components/templates/procurement/CreateSparesProcurement/SupplierQuotationField';
import { FieldArray, Formik } from 'formik';
import { useTailwind } from 'tailwind-rn';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import FormTextInputField from '../../../components/molecules/input/FormTextInputField';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import FormDouble from '../../../components/molecules/alignment/FormDouble';
import { View } from 'react-native';
import { useCollection } from '@nandorojo/swr-firestore';
import { Supplier } from '../../../types/Supplier';
import { SHIP_SPARES, SPARES_PROCUREMENTS, SUPPLIERS } from '../../../constants/Firebase';
import LoadingData from '../../../components/atoms/loading/loadingData';
import * as Yup from "yup";
import { getSupplierNames } from '../../../helpers/SupplierHelper';
import { createSparesProcurement } from '../../../services/SparesProcurementServices';
import { UploadBatch } from '../../../services/StorageServices';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { ShipSpare } from '../../../types/ShipSpare';
import { getShipSparesDescription } from '../../../helpers/ShipSpareHelper';
import AddShipSparesInput from '../../../components/templates/add/AddShipSparesInput';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import FormRangeDateInputField from '../../../components/molecules/input/FormRangeDateInputField';



const formSchema = Yup.object().shape({
  procurement_date: Yup.string().required("Required"),
  suppliers: Yup.array().of(
    Yup.object().shape({
      supplier: Yup.string().required("Required"),
      quotation_no: Yup.string().when("filename", {
        is: (value) => value !== "",
        then: Yup.string().required("Required quotation number")
      }),
      filename: Yup.string().required("Required"),
      uri: Yup.string().required("Required"),
    })
  ),
  product: Yup.string().required("Required"),
  quantity: Yup.string().required("Required").matches(/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/, "Please ensure the correct number format"),
  unit_of_measurement: Yup.string().required("Required"),
  proposed_date: Yup.object().shape({
    startDate: Yup.string().required("Required"),
    endDate: Yup.string()
  }),
});


const current = new Date();
const currentDate = `${current.getDate().toString()}/${+current.getMonth().toString() + 1}/${current.getFullYear().toString()}`

const CreateSparesProcurementFormScreen = ({ navigation }: RootNavigationProps<"CreateSparesProcurement">) => {
  const tailwind = useTailwind();
  const [openCreateProduct, setOpenCreateProduct] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const user = useSelector(UserSelector);

  const { data: suppliers } = useCollection<Supplier>(`${SUPPLIERS}`, {
    ignoreFirestoreDocumentSnapshotField: false,
    where: ["deleted", "==", false]
  })

  const { data: shipSpares } = useCollection<ShipSpare>(`${SHIP_SPARES}`, {
    ignoreFirestoreDocumentSnapshotField: false,
    where: ["deleted", "==", false]
  })

  if (!suppliers || !shipSpares) return <LoadingData message="This document might not exist" />;

  const { shipSparesList } = getShipSparesDescription(shipSpares);
  const { suppliersList } = getSupplierNames(suppliers);

  const data = {
    procurement_date: currentDate,
    suppliers: [{
      supplier: "",
      quotation_no: "",
      filename: "",
      uri: "",
      file: ""
    }],
    product: "",
    sizing: "",
    quantity: "",
    unit_of_measurement: "",
    proposed_date: { startDate: "", endDate: "" },
    remarks: ""
  };

  return (
    <Body header={<HeaderStack title={"Create Spares Procurement"} navigateProp={navigation} />} style={tailwind("mt-6")}>

      <View style={tailwind("mt-5")} />

      <Formik
        initialValues={data}
        onSubmit={(values) => {
          setLoading(true);

          let selectedProduct = shipSpares[shipSparesList.indexOf(values.product)];
          let product_data: ShipSpare = {
            id: selectedProduct.id,
            product_code: selectedProduct.product_code,
            product_description: selectedProduct.product_description,
            group: selectedProduct.group,
            uom: selectedProduct.uom,
            ref_price: selectedProduct.ref_price,
            quantity: selectedProduct.quantity,
            serial_number: selectedProduct.serial_number,
            created_at: selectedProduct.created_at
          }
          let suppliersPickedList: Array<any> = [];
          let suppliersFiles: Array<any> = [];

          values.suppliers.map((item, index) => {
            let selectedSupplier: Supplier = suppliers[suppliersList.indexOf(item.supplier)];

            suppliersPickedList.push({
              supplier: {
                id: selectedSupplier.id,
                secondary_id: selectedSupplier.secondary_id || "",
                name: selectedSupplier.name,
                address: selectedSupplier.address,
                contact_persons: selectedSupplier.contact_persons,
                telephone: selectedSupplier.telephone,
                year: selectedSupplier.year,
                email: selectedSupplier.email,
                product: selectedSupplier.product,
                remark: selectedSupplier.remark,
                status: selectedSupplier.status,
                created_at: selectedSupplier.created_at,
              },
              quotation_no: item.quotation_no,
              filename: item.filename,
              filename_storage: `${item.filename}.${current}${index}`,
            })

            suppliersFiles.push({
              file: values.suppliers[index].file,
              filename_storage: `${item.filename}.${current}${index}`,
              uri: values.suppliers[index].uri
            })
          })


          UploadBatch(SPARES_PROCUREMENTS, suppliersFiles)
            .then((err) => {
              createSparesProcurement({ ...values, suppliers: suppliersPickedList, product: product_data }, user!, (id) => {
                navigation.navigate("CreateSparesProcurementSummary", { docID: id });
                setLoading(false);
              }, (error) => {
                setLoading(false);
                setError(error.message);
              });
            }).catch(err => {
              setLoading(false);
              console.error("ERROR!")
              setError(err.message);
            })
        }}
        validationSchema={formSchema}
      >

        {({ values, errors, touched, setFieldValue, handleSubmit }) => (
          <View>

            <FormTextInputField
              label="Procurement Date goooood"
              value={values.procurement_date}
              editable={false}
            />

            <View style={tailwind("border border-neutral-300 mb-5 mt-3")} />

            <FieldArray name="suppliers">
              {({ remove, push }) => (
                <View>
                  {values.suppliers.length > 0 ? (
                    values.suppliers.map((supplierField, index) => (
                      <SupplierQuotationField
                        key={index}
                        index={index}
                        suppliers={suppliers}
                        suppliersList={values.suppliers}
                        length={values.suppliers.length}
                        deleted={deleted}
                        setFieldValue={(val) => setFieldValue("suppliers", val)}
                        handleDelete={() => { remove(index); setDeleted(!deleted) }}
                        errors={errors.suppliers && touched.suppliers ? errors.suppliers : undefined}
                      />
                    ))) : null}
                  <AddNewButton text="Add Another Supplier & Quotation" onPress={() => push({ supplier: "", quotation_no: "", filename: "", uri: "", file: "" })} />
                </View>
              )}
            </FieldArray>

            <View style={tailwind("mb-4")} />
            <FormDropdownInputField
              label={`Product`}
              value={values.product}
              items={shipSparesList}
              onChangeValue={(val) => { setFieldValue("product", val) }}
              required={true}
              hasError={errors.product && touched.product ? true : false}
              errorMessage={errors.product}
            />

            <View style={tailwind("mb-3")}>
              <AddButtonText text="Create New Product" onPress={() => { setOpenCreateProduct(!openCreateProduct); }} />
            </View>
            {openCreateProduct ? (
              <View style={tailwind("mb-2")}>
                <AddShipSparesInput onCancel={() => { setOpenCreateProduct(false); }} />
              </View>
            ) : null}

            <FormTextInputField
              label="Sizing (optional)"
              placeholder="-- Type --"
              value={values.sizing}
              onChangeValue={(val) => { setFieldValue("sizing", val) }}
            />

            <FormDouble
              left={
                <FormTextInputField
                  label='Quantity'
                  number={true}
                  value={values.quantity}
                  required={true}
                  onChangeValue={(val) => { setFieldValue("quantity", val) }}
                  hasError={errors.quantity && touched.quantity ? true : false}
                  errorMessage={errors.quantity}
                />
              }

              right={
                <FormTextInputField
                  label='Unit of measurement'
                  placeholder='Litres'
                  value={values.unit_of_measurement}
                  required={true}
                  onChangeValue={(val) => { setFieldValue("unit_of_measurement", val) }}
                  hasError={errors.unit_of_measurement && touched.unit_of_measurement ? true : false}
                  errorMessage={errors.unit_of_measurement}
                />
              }
            />

            <FormRangeDateInputField
              label='Proposed Date'
              value={values.proposed_date}
              onChangeValue={text => setFieldValue("proposed_date", text)}
              required={true}
              hasError={errors.proposed_date && touched.proposed_date ? true : false}
              errorMessage={errors.proposed_date?.startDate}
            />

            <FormTextInputField
              label="Remarks"
              value={values.remarks}
              onChangeValue={text => setFieldValue("remarks", text)}
              multiline={true}
              hasError={errors.remarks && touched.remarks ? true : false}
              errorMessage={errors.remarks}
            />
            {
              error
                ?
                <TextLabel content={error ?? ''} color='text-red-500' />
                :
                <></>
            }
            <RegularButton text="Submit" operation={() => { handleSubmit(); }} loading={loading} />
          </View>
        )}
      </Formik>
    </Body>
  )
}

export default CreateSparesProcurementFormScreen;