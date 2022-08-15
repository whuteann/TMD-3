import React, { useEffect, useState } from 'react';
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
import { PROCUREMENT_PAYMENT_TERMS, SPARES_PROCUREMENTS } from '../../../constants/Firebase';
import LoadingData from '../../../components/atoms/loading/loadingData';
import * as Yup from "yup";
import { useLinkTo } from '@react-navigation/native';
import { View } from 'react-native';
import { SparesProcurement } from '../../../types/SparesProcurement';
import { updateSparesProcurement } from '../../../services/SparesProcurementServices';
import { APPROVED, DRAFT, PENDING, SPARES_PROCUREMENT_CODE, SPARES_PURCHASE_ORDER_CODE } from '../../../types/Common';
import { createSparesPurchaseOrder } from '../../../services/SparesPurchaseOrderServices';
import Unauthorized from '../../../components/atoms/unauthorized/Unauthorized';
import { UPDATE_ACTION } from '../../../constants/Action';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { CurrenciesList } from '../../../constants/Currency';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import Line from '../../../components/atoms/display/Line';
import { ShipSpare } from '../../../types/ShipSpare';
import { PaymentTerm } from '../../../types/PaymentTerm';

const to_replace_string = SPARES_PROCUREMENT_CODE;
const replace_string = SPARES_PURCHASE_ORDER_CODE;

const formSchema = Yup.object().shape({
  currency_rate: Yup.string().required("Required"),
  products: Yup.array().of(
    Yup.object().shape({
      unit_price: Yup.string().required("Required").matches(/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/, "Please ensure the correct number format"),
    })
  ),
  payment_term: Yup.string().required("Required")
});

const CreateSparesPurchaseOrderFormScreen = ({ navigation, route }: RootNavigationProps<"CreateSparesPurchaseOrder">) => {

  const { docID } = route.params;
  const [loading, setLoading] = useState(false);
  const [productErrors, setProductErrors] = useState<Array<{ unit_price: string }>>();
  const [submit, setSubmit] = useState(true);
  const tailwind = useTailwind();
  const linkTo = useLinkTo();
  const allowedStatuses = [APPROVED];
  const user = useSelector(UserSelector);

  let displayID: string = ""
  type initialValuesType = {
    spares_procurement_id: string,
    spares_procurement_secondary_id: string,
    purchase_order_date: string,
    supplier: any,
    products: Array<{ product: ShipSpare, sizing?: string, quantity: string, unit_of_measurement: string, unit_price: string }>,
    proposed_date: string,
    currency_rate: string,
    unit_price: string,
    payment_term: string
  };


  const { data } = useDocument<SparesProcurement>(`${SPARES_PROCUREMENTS}/${docID}`, {
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
    spares_procurement_id: data.id,
    spares_procurement_secondary_id: data.display_id,
    purchase_order_date: `${new Date().getDate().toString()}/${(new Date().getMonth() + 1).toString()}/${new Date().getFullYear().toString()}`,
    supplier: data.suppliers ? data.suppliers[0].supplier : "",
    products: data.products.map(
      (item) => {
        return {
          product: item.product,
          sizing: item.sizing || "",
          quantity: item.quantity,
          unit_of_measurement: item.unit_of_measurement,
          unit_price: "",
        }
      }
    ),
    proposed_date: data.proposed_date.endDate ? `${data.proposed_date.startDate} to ${data.proposed_date.endDate}` : `${data.proposed_date.startDate}` || "",

    currency_rate: "",
    unit_price: "",
    payment_term: ""
  };

  displayID = data.secondary_id.replace(to_replace_string, replace_string);


  return (
    <Body header={<HeaderStack title={"Create Purchase Order"} navigateProp={navigation} />} style={tailwind("mt-6")}>

      <ViewPageHeaderText doc="Purchase Order" id={displayID} />

      <Formik
        initialValues={initialValues}
        onSubmit={(values) => {
          setLoading(true);

          createSparesPurchaseOrder(displayID, { ...values, status: DRAFT, display_id: displayID }, user!, (id) => {
            updateSparesProcurement(data.id, { spares_purchase_order_id: id, spares_purchase_order_secondary_id: displayID, status: PENDING }, user!, UPDATE_ACTION, () => {
              linkTo(`/spares-purchase-orders/${id}/edit/cont`);
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
                operation={() => { handleSubmit(); setSubmit(!submit); setProductErrors(errors.products as Array<{ unit_price: string }>) }}
                loading={loading}
              />
            </View>
          </View>
        )}
      </Formik>
    </Body>
  )
}

export default CreateSparesPurchaseOrderFormScreen;