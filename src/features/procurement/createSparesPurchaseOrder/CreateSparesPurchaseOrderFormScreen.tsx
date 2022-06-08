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
import { useDocument } from '@nandorojo/swr-firestore';
import { SPARES_PROCUREMENTS } from '../../../constants/Firebase';
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
import { ShipSpare } from '../../../types/ShipSpare';
import { CurrenciesList } from '../../../constants/Currency';

const to_replace_string = SPARES_PROCUREMENT_CODE;
const replace_string = SPARES_PURCHASE_ORDER_CODE;

const formSchema = Yup.object().shape({
  currency_rate: Yup.string().required("Required"),
  unit_price: Yup.string().required("Required").matches(/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/, "Please ensure the correct number format"),
  payment_term: Yup.string().required("Required")
});

const CreateSparesPurchaseOrderFormScreen = ({ navigation, route }: RootNavigationProps<"CreateSparesPurchaseOrder">) => {

  const { docID } = route.params;
  const [loading, setLoading] = useState(false);
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
    product: ShipSpare,
    unit_of_measurement: string,
    quantity: string,
    proposed_date: string,
    currency_rate: string,
    unit_price: string,
    payment_term: string
  };

  const { data } = useDocument<SparesProcurement>(`${SPARES_PROCUREMENTS}/${docID}`, {
    ignoreFirestoreDocumentSnapshotField: false,
  })

  if (!data) return <LoadingData message="This document might not exist" />;

  if (!allowedStatuses.includes(data?.status!)) {
    return <Unauthorized />;
  }

  let initialValues: initialValuesType = {
    spares_procurement_id: data.id,
    spares_procurement_secondary_id: data.display_id,
    purchase_order_date: `${new Date().getDate().toString()}/${(new Date().getMonth() + 1).toString()}/${new Date().getFullYear().toString()}`,
    supplier: data.suppliers ? data.suppliers[0].supplier : "",
    product: data.product,
    unit_of_measurement: data.unit_of_measurement || "",
    quantity: data.quantity || "",
    proposed_date: `${data.proposed_date.startDate} to ${data.proposed_date.endDate}` || "",

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
          console.log(values);
          setLoading(true);
          createSparesPurchaseOrder(displayID, { ...values, status: DRAFT, display_id: displayID }, user!, (id) => {
            updateSparesProcurement(data.id, { spares_purchase_order_id: id, spares_purchase_order_secondary_id: displayID, status: PENDING }, user!, UPDATE_ACTION, () => {
              linkTo(`/spares-purchase-orders/${id}/edit/cont`);
              setLoading(false);
            }, (error) => {
              console.log(error);
            })
          }, (error) => {
            console.log(error);
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

            <FormTextInputField
              label="Product"
              value={values.product.product_description}
              editable={false}
            />

            <FormDouble
              left={
                <FormTextInputField
                  label="Quantity"
                  value={values.quantity}
                  editable={false}
                />
              }
              right={
                <FormTextInputField
                  label="Unit of measurement"
                  value={values.unit_of_measurement}
                  editable={false}
                />
              }
            />

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

            <FormTextInputField
              label="Unit Price"
              number={true}
              value={values.unit_price}
              onChangeValue={(val) => { setFieldValue("unit_price", val) }}
              required={true}
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

            <View>
              <RegularButton
                text="Next"
                operation={handleSubmit}
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