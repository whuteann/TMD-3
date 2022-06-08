import React, { useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import AddProductsInput from '../../../components/templates/add/AddProductsInput';
import AddButtonText from '../../../components/atoms/buttons/AddButtonText';
import { Formik } from 'formik';
import { useTailwind } from 'tailwind-rn';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import FormDouble from '../../../components/molecules/alignment/FormDouble';
import FormTextInputField from '../../../components/molecules/input/FormTextInputField';
import * as Yup from 'yup';
import { createProcurement } from '../../../services/ProcurementServices';
import { revalidateCollection, useCollection } from '@nandorojo/swr-firestore';
import { PROCUREMENTS, PRODUCTS, SUPPLIERS } from '../../../constants/Firebase';
import { View } from 'react-native';
import { Supplier } from '../../../types/Supplier';
import { Product } from '../../../types/Product';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { getSupplierNames } from '../../../helpers/SupplierHelper';
import { getProductNames } from '../../../helpers/ProductHelper';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { LITRES, UNITS_LIST } from '../../../constants/Units';
import FormRangeDateInputField from '../../../components/molecules/input/FormRangeDateInputField';
import { CurrenciesList } from '../../../constants/Currency';
import { DeliveryModes } from '../../../types/DeliveryModes';
import { sendNotifications } from '../../../services/NotificationServices';
import { MARKETING_EXECUTIVE_ROLE, SUPER_ADMIN_ROLE } from '../../../types/Common';

const formSchema = Yup.object().shape({
  procurement_date: Yup.string().required("Required"),
  supplier: Yup.string().required("Required"),
  product: Yup.string().required("Required"),
  unit_of_measurement: Yup.string().required("Required"),
  quantity: Yup.string().required("Required").matches(/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/, "Please ensure the correct number format"),
  proposed_date: Yup.object().shape({
    startDate: Yup.string().required("Required"),
    endDate: Yup.string().required("Required")
  }),
  currency_rate: Yup.string().required("Required"),
  unit_price: Yup.string().required("Required").matches(/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/, "Please ensure the correct number format"),
  payment_term: Yup.string().required("Required"),
  delivery_mode: Yup.string().required("Required"),
});

const initialValues = {
  procurement_date: `${new Date().getDate().toString()}/${(new Date().getMonth() + 1).toString()}/${new Date().getFullYear().toString()}`,
  supplier: "",
  product: "",
  unit_of_measurement: LITRES,
  quantity: "",
  proposed_date: { startDate: "", endDate: "" },
  currency_rate: "",
  unit_price: "",
  payment_term: "",
  delivery_mode: ""
};

const CreateProcurementFormScreen = ({ navigation }: RootNavigationProps<"CreateProcurement">) => {

  const tailwind = useTailwind();
  const [openCreateProduct, setOpenCreateProduct] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = useSelector(UserSelector);

  const { data: suppliers } = useCollection<Supplier>(`${SUPPLIERS}`, {
    ignoreFirestoreDocumentSnapshotField: false,
    where: ["deleted", "==", false]
  })

  const { data: products } = useCollection<Product>(`${PRODUCTS}`, {
    ignoreFirestoreDocumentSnapshotField: false,
    where: ["deleted", "==", false]
  })

  if (!suppliers || !products) return <LoadingData message="This document might not exist" />;

  const { suppliersList } = getSupplierNames(suppliers);
  const { productsList } = getProductNames(products);

  return (
    <Body header={<HeaderStack title={"Create Procurement"} navigateProp={navigation} />} style={tailwind("mt-6")}>

      {/* <ViewPageHeaderText doc="Procurement" id={displayID} /> */}
      <View style={tailwind("mt-5")} />

      <Formik
        initialValues={initialValues}
        onSubmit={
          (values) => {
            console.log(values);
            let supplier_picked = suppliers[suppliersList.indexOf(values.supplier)]
            let product_picked = products[productsList.indexOf(values.product)]

            let supplier_data: Supplier = {
              id: supplier_picked.id,
              secondary_id: supplier_picked.secondary_id || "",
              name: supplier_picked.name,
              address: supplier_picked.address,
              contact_persons: supplier_picked.contact_persons,
              telephone: supplier_picked.telephone,
              year: supplier_picked.year,
              email: supplier_picked.email,
              product: supplier_picked.product,
              remark: supplier_picked.remark,
              account_no: supplier_picked.account_no,
              status: supplier_picked.status,
              created_at: supplier_picked.created_at,
            }
            let product_data: Product = {
              id: product_picked.id,
              name: product_picked.name,
              sku: product_picked.sku,
              description: product_picked.description,
              created_at: product_picked.created_at,
              deleted: false,
            }

            setLoading(true);
            createProcurement({ ...values, supplier: supplier_data, product: product_data, total_amount: `${(Number(values.unit_price) * Number(values.quantity)).toFixed(2)}` }, user!, (val) => {
              const { displayID, newID } = val;
              navigation.navigate("ViewAllProcurement");
              setLoading(false);
              revalidateCollection(PROCUREMENTS);

              sendNotifications(
                [SUPER_ADMIN_ROLE, MARKETING_EXECUTIVE_ROLE],
                `New procurement ${displayID} submitted by ${user?.name}.`,
                { screen: "ViewProcurementSummary", docID: newID });

            }, (error) => {
              console.log(error);
            });
          }}
        validationSchema={formSchema}
      >
        {({ values, errors, touched, setFieldValue, handleSubmit }) => (
          <View>

            <FormTextInputField
              label='Procurement Date'
              value={values.procurement_date}
              editable={false}
            />

            <View style={tailwind("border border-neutral-300 mb-5 mt-3")} />

            <FormDropdownInputField
              label="Supplier"
              value={values.supplier}
              items={suppliersList}
              onChangeValue={(val) => { setFieldValue("supplier", val) }}
              required={true}
              hasError={errors.supplier && touched.supplier ? true : false}
              errorMessage={errors.supplier}
            />

            <FormDropdownInputField
              label="Product"
              value={values.product}
              items={productsList}
              onChangeValue={(val) => { setFieldValue("product", val) }}
              required={true}
              hasError={errors.product && touched.product ? true : false}
              errorMessage={errors.product}
            />

            <View style={tailwind("mb-5")}>
              <AddButtonText text="Create New Product" onPress={() => { setOpenCreateProduct(!openCreateProduct); }} />
            </View>
            {openCreateProduct ? (
              <View style={tailwind("mb-2")}>
                <AddProductsInput onCancel={() => { setOpenCreateProduct(false); }} />
              </View>
            ) : null}

            <FormDouble
              left={
                <FormTextInputField
                  label='Quantity'
                  number={true}
                  value={values.quantity}
                  onChangeValue={(val) => { setFieldValue("quantity", val) }}
                  hasError={errors.quantity && touched.quantity ? true : false}
                  errorMessage={errors.quantity}
                />
              }

              right={
                <FormDropdownInputField
                  label="Unit of measurement"
                  value={values.unit_of_measurement}
                  items={UNITS_LIST}
                  onChangeValue={(val) => { setFieldValue("unit_of_measurement", val) }}
                  hasError={errors.unit_of_measurement && touched.unit_of_measurement ? true : false}
                  errorMessage={errors.unit_of_measurement}
                />
              }
            />

            {/* <View style={tailwind("mt-1 mb-5")}>
              <AddButtonText text="Create New Unit of Measurement" onPress={() => { }} />
            </View> */}

            <FormRangeDateInputField
              label='Proposed Date'
              value={values.proposed_date}
              onChangeValue={text => setFieldValue("proposed_date", text)}
              required={true}
              hasError={errors.proposed_date && touched.proposed_date ? true : false}
              errorMessage={errors.proposed_date?.startDate || errors.proposed_date?.endDate}
            />

            <FormDropdownInputField
              label="Currency Rate"
              value={values.currency_rate}
              items={CurrenciesList}
              onChangeValue={(val) => { setFieldValue("currency_rate", val) }}
              required={true}
              hasError={errors.currency_rate && touched.currency_rate ? true : false}
              errorMessage={errors.currency_rate}
            />

            <FormTextInputField
              label="Unit Price"
              value={values.unit_price}
              onChangeValue={(val) => { setFieldValue("unit_price", val) }}
              required={true}
              number={true}
              hasError={errors.unit_price && touched.unit_price ? true : false}
              errorMessage={errors.unit_price}
            />

            <FormDropdownInputField
              shadow={true}
              label="Payment Term"
              value={values.payment_term}
              items={["Cash in advance", "Cash on delivery", "7 days", "14 days", "30 days"]}
              onChangeValue={(val) => { setFieldValue("payment_term", val) }}
              required={true}
              hasError={errors.payment_term && touched.payment_term ? true : false}
              errorMessage={errors.payment_term}
            />

            <FormDropdownInputField
              label="Mode of Delivery"
              value={values.delivery_mode}
              items={DeliveryModes}
              onChangeValue={(val) => { setFieldValue("delivery_mode", val); }}
              required={true}
              hasError={errors.delivery_mode && touched.delivery_mode ? true : false}
              errorMessage={errors.delivery_mode}
            />

            <RegularButton
              text="Submit"
              operation={handleSubmit}
              loading={loading}
            />
          </View>
        )}
      </Formik>

    </Body>
  )
}

export default CreateProcurementFormScreen;