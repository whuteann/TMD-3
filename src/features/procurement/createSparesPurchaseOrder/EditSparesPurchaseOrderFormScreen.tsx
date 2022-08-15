import React, { useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import { Formik } from 'formik';
import { useTailwind } from 'tailwind-rn';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import FormTextInputField from '../../../components/molecules/input/FormTextInputField';
import FormDouble from '../../../components/molecules/alignment/FormDouble';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import { useCollection, useDocument } from '@nandorojo/swr-firestore';
import { PROCUREMENT_PAYMENT_TERMS, SPARES_PURCHASE_ORDERS } from '../../../constants/Firebase';
import LoadingData from '../../../components/atoms/loading/loadingData';
import * as Yup from "yup";
import { useLinkTo } from '@react-navigation/native';
import { View } from 'react-native';
import { updateSparesProcurement } from '../../../services/SparesProcurementServices';
import { DRAFT, PENDING, REJECTED } from '../../../types/Common';
import { updateSparesPurchaseOrder } from '../../../services/SparesPurchaseOrderServices';
import { SparesPurchaseOrder } from '../../../types/SparesPurchaseOrder';
import Unauthorized from '../../../components/atoms/unauthorized/Unauthorized';
import { UPDATE_ACTION } from '../../../constants/Action';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { ShipSpare } from '../../../types/ShipSpare';
import { CurrenciesList } from '../../../constants/Currency';
import Line from '../../../components/atoms/display/Line';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import { PaymentTerm } from '../../../types/PaymentTerm';


const formSchema = Yup.object().shape({
  currency_rate: Yup.string().required("Required"),
  products: Yup.array().of(
    Yup.object().shape({
      unit_price: Yup.string().required("Required").matches(/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/, "Please ensure the correct number format"),
    })
  ),
  payment_term: Yup.string().required("Required")
});

const EditSparesPurchaseOrderFormScreen = ({ navigation, route }: RootNavigationProps<"EditSparesPurchaseOrder">) => {

  const { docID } = route.params;
  const [loading, setLoading] = useState(false);
  const [productErrors, setProductErrors] = useState<Array<{ unit_price: string }>>();
  const tailwind = useTailwind();
  const linkTo = useLinkTo();
  const allowedStatuses = [DRAFT, REJECTED];
  const user = useSelector(UserSelector);

  type initialValuesType = {
    spares_procurement_id: string,
    spares_procurement_secondary_id: string,
    purchase_order_date: string,
    supplier: any,
    products: Array<{ product: ShipSpare, sizing?: string, quantity: string, unit_of_measurement: string, unit_price: string }>,
    proposed_date: string,
    currency_rate: string,
    payment_term: string,
    reject_notes: string
  };

  const { data } = useDocument<SparesPurchaseOrder>(`${SPARES_PURCHASE_ORDERS}/${docID}`, {
    ignoreFirestoreDocumentSnapshotField: false,
  })

  const { data: payment_terms } = useCollection<PaymentTerm>(`${PROCUREMENT_PAYMENT_TERMS}`, {
    ignoreFirestoreDocumentSnapshotField: false,
    where: ["deleted", "==", false]
  })

  if (!data || !payment_terms) return <LoadingData message="This document might not exist" />;

  if (!allowedStatuses.includes(data?.status!)) {
    return <Unauthorized />;
  }


  let initialValues: initialValuesType = {
    spares_procurement_id: data.spares_procurement_id,
    spares_procurement_secondary_id: data.spares_procurement_secondary_id,
    purchase_order_date: `${new Date().getDate().toString()}/${(new Date().getMonth() + 1).toString()}/${new Date().getFullYear().toString()}`,
    supplier: data.supplier ? data.supplier : "",
    products: data.products.map(item => {
      return {
        product: item.product,
        sizing: item.sizing || "",
        quantity: item.quantity,
        unit_of_measurement: item.unit_of_measurement,
        unit_price: item.unit_price
      }
    }),
    proposed_date: data.proposed_date || "",

    currency_rate: data.currency_rate || "",
    payment_term: data.payment_term || "",
    reject_notes: ""
  };



  return (
    <Body header={<HeaderStack title={"Create Purchase Order"} navigateProp={navigation} />} style={tailwind("mt-6")}>

      <ViewPageHeaderText doc="Purchase Order" id={data.display_id} />

      <Formik
        initialValues={initialValues}
        onSubmit={(values) => {
          setLoading(true);
          updateSparesPurchaseOrder(data.id, { ...values, status: DRAFT, created_by: user }, user!, UPDATE_ACTION, () => {
            updateSparesProcurement(data.spares_procurement_id, { spares_purchase_order_id: data.id, spares_purchase_order_secondary_id: data.secondary_id, status: PENDING }, user!, UPDATE_ACTION, () => {
              linkTo(`/spares-purchase-orders/${data.id}/edit/cont`);
              setLoading(false);
            }, (error) => {
              console.error(error);
            })
          }, (error) => {
            console.error(error);
          });
        }}
        validationSchema={formSchema}
      >
        {({ values, errors, touched, setFieldValue, handleSubmit }) => (
          <View>

            <FormTextInputField
              label="Purchase Order Date"
              value={values.purchase_order_date}
              editable={false}
            />

            <View style={tailwind("border border-neutral-300 mb-5 mt-3")} />

            <FormTextInputField
              label="Supplier"
              value={values.supplier.name}
              editable={false}
            />

            <Line />

            {
              values.products.map((item, index) => {
                return (
                  <View key={`${index}`} style={tailwind("mb-5")}>
                    <TextLabel content={`Product ${index + 1} : ${item.product.product_description}`} style={tailwind("font-bold")} />

                    <FormDouble
                      left={
                        <FormTextInputField
                          label="Quantity"
                          value={item.quantity}
                          editable={false}
                        />
                      }
                      right={
                        <FormTextInputField
                          label="Unit of measurement"
                          value={item.unit_of_measurement}
                          editable={false}
                        />
                      }
                    />
                    <FormTextInputField
                      label="Unit Price"
                      number={true}
                      placeholder={"0.00"}
                      value={values.products[index].unit_price}
                      onChangeValue={(val) => { setFieldValue(`products.${index}.unit_price`, val) }}
                      required={true}
                      hasError={productErrors ? (productErrors[index] ? (productErrors[index].unit_price ? true : false) : false) : false}
                      errorMessage={productErrors ? (productErrors[index] ? (productErrors[index].unit_price ? productErrors[index].unit_price : "") : "") : ""}
                    />

                  </View>
                )
              })
            }

            <Line />


            <FormTextInputField
              label="Proposed Date"
              value={values.proposed_date}
              editable={false}
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

            <FormDropdownInputField
              shadow={true}
              label="Payment Term"
              value={values.payment_term}
              items={payment_terms.map(item => { return item.name })}
              onChangeValue={(val) => { setFieldValue("payment_term", val) }}
              required={true}
              hasError={errors.payment_term && touched.payment_term ? true : false}
              errorMessage={errors.payment_term}
            />

            <View>
              <RegularButton
                text="Next"
                operation={() => { handleSubmit(); setProductErrors(errors.products as Array<{ unit_price: string }>); }}
                loading={loading}
              />
            </View>
          </View>
        )}
      </Formik>
    </Body>
  )
}

export default EditSparesPurchaseOrderFormScreen;