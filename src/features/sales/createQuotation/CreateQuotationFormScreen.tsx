import React, { useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import AddNewButton from '../../../components/molecules/buttons/AddNewButton';
import { Formik, FieldArray } from 'formik';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { useLinkTo } from '@react-navigation/native';
import { createQuotation, updateQuotation } from '../../../services/QuotationServices';
import { View } from 'react-native';
import ProductsField from '../../../components/templates/sales/CreateQuotation/ProductsField';
import FormTextInputField from '../../../components/molecules/input/FormTextInputField';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import { useTailwind } from 'tailwind-rn/dist';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import * as Yup from 'yup';
import { useCollection } from '@nandorojo/swr-firestore';
import { CUSTOMERS, PORTS, PRODUCTS } from '../../../constants/Firebase';
import { Product } from '../../../types/Product';
import { Port } from '../../../types/Port';
import { getCustomerNameAndContactPerson } from '../../../helpers/CustomerHelper';
import { getPortNameAndDeliveryLocations } from '../../../helpers/PortHelper';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { Customer } from '../../../types/Customer';
import FormRangeDateInputField from '../../../components/molecules/input/FormRangeDateInputField';
import { LITRE, LITRES } from '../../../constants/Units';
import LocationsField from '../../../components/templates/sales/CreateQuotation/LocationsField';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import { DRAFT } from '../../../types/Common';
import ModeOfDeliveryField from '../../../components/templates/sales/CreateQuotation/ModeOfDeliveryField';
import { createSales } from '../../../services/SalesServices';
import { UPDATE_ACTION } from '../../../constants/Action';
import FormDateInputField from '../../../components/molecules/input/FormDateInputField';

const formSchema = Yup.object().shape({
  customer: Yup.string().required("Required"),
  quotation_date: Yup.string().required("Required"),
  products: Yup.array().of(
    Yup.object().shape({
      product: Yup.object().shape({
        id: Yup.string().required("Required"),
        name: Yup.string().required("Required"),
        sku: Yup.string().required("Required"),
        description: Yup.string().required("Required"),
        created_at: Yup.string().required("Required")
      }),
      quantity: Yup.string().required("Required"),
      unit: Yup.string().required("Required"),
      prices: Yup.array().of(
        Yup.object().shape({
          value: Yup.string(),
          unit: Yup.string(),
        })
      )
    })
  ),

  ports: Yup.array().of(
    Yup.object().shape({
      port: Yup.string().required("Required"),
      delivery_location: Yup.string().required("Required")
    })
  ),

  delivery_date: Yup.object().shape({
    startDate: Yup.string().required("Required"),
    endDate: Yup.string()
  }),
  delivery_modes: Yup.array().of(Yup.string().required("Required")),
  receiving_vessel_name: Yup.string().required("Required")
});

const CreateQuotationFormScreen = ({ navigation }: RootNavigationProps<"CreateQuotation">) => {
  const tailwind = useTailwind();
  const user = useSelector(UserSelector);
  const [deleted, setDeleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorLocations, setErrorLocations] = useState(false);
  const [errorDeliveryMode, setErrorDeliveryMode] = useState(false);
  const [address, setAddress] = useState<string>("");
  let displayID: string = "";

  const linkTo = useLinkTo();

  const { data: customers } = useCollection<Customer>(`${CUSTOMERS}`, {
    ignoreFirestoreDocumentSnapshotField: true,
    where: ["deleted", "==", false]
  })

  const { data: products } = useCollection<Product>(`${PRODUCTS}`, {
    ignoreFirestoreDocumentSnapshotField: true,
    where: ["deleted", "==", false]
  })

  const { data: ports } = useCollection<Port>(`${PORTS}`, {
    ignoreFirestoreDocumentSnapshotField: true,
    where: ["deleted", "==", false]
  })

  if (!customers || !products || !ports) {
    return <LoadingData message="Loading..."></LoadingData>;
  }

  const { portList, locationsList } = getPortNameAndDeliveryLocations(ports);

  let customerInfo = getCustomerNameAndContactPerson(customers);

  const onSubmit = async (values) => {
    setLoading(true);
    console.error(values.ports);
    const unique = Array.from(new Set(values.ports.map(item => item.delivery_location)));
    const unique_delivery_mode = Array.from(new Set(values.delivery_modes.map(item => item)));

    if (values.ports.length == unique.length && values.delivery_modes.length == unique_delivery_mode.length) {
      setErrorLocations(false);
      setErrorDeliveryMode(false);
      let customer = customers[customerInfo.nameList.indexOf(values.customer)];

      let data = {
        ...values,
        ...{
          customer: {
            id: customer.id,
            name: customer.name,
            address: customer.address,
            contact_persons: customer.contact_persons,
            fax: customer.fax,
            telephone: customer.telephone,
            account_no: customer.account_no,
            segmentation: customer.segmentation,
            status: customer.status,
            created_at: customer.created_at,
            deleted: false
          }
        },
        status: DRAFT
      }


      createQuotation(data, user!, (newID) => {
        createSales(data.customer!, newID,
          user!, (id) => {
            updateQuotation(newID, { sales_id: id }, user!, UPDATE_ACTION, () => {
              linkTo(`/quotations/${newID}/create/cont`);
              setLoading(false);
            }, () => { })
          }, () => {
          })


      }, (error) => {
        console.error(error);
      })

    } else {
      setLoading(false);
      if (!(values.ports.length == unique.length)) {
        setErrorLocations(true);
      }
      if (!(values.delivery_modes.length == unique_delivery_mode.length)) {
        setErrorDeliveryMode(true);
      }
    }
  }

  return (
    <Body header={<HeaderStack title={"Create Quotation"} navigateProp={navigation} />} style={tailwind("mt-6")}>

      <View style={tailwind("mt-5")} />

      <Formik
        initialValues={{
          quotation_date: `${new Date().getDate().toString()}/${(new Date().getMonth() + 1).toString()}/${new Date().getFullYear().toString()}`,
          customer: `${customerInfo?.nameList[0]}`,
          products: [{
            product: {
              id: "",
              name: "",
              sku: "",
              description: "",
              created_at: "",
              deleted: false
            },
            quantity: "",
            unit: LITRES,
            prices: [{ value: "", unit: LITRE, remarks: "" }]
          }],
          ports: [{ port: "", delivery_location: "" }],
          delivery_date: { startDate: "", endDate: "" },
          delivery_modes: [""],
          remarks: "",
          receiving_vessel_name: "",

          currency_rate: "",
          barging_fee: "",
          conversion_factor: "",
          payment_term: "",
          validity_date: "",
          validity_time: "",
          secondary_id: displayID,
          display_id: displayID,
        }}
        onSubmit={(values) => { onSubmit(values) }}
        validationSchema={formSchema}
      >
        {({ errors, touched, values, setFieldValue, handleSubmit }) => (
          <View>
            <FormDateInputField
              required={true}
              label='Quotation Date'
              value={values.quotation_date}
              onChangeValue={text => setFieldValue("quotation_date", text)}
              hasError={errors.quotation_date && touched.quotation_date ? true : false}
              errorMessage={errors.quotation_date}
            />

            <View style={tailwind("border border-neutral-300 mb-5 mt-3")} />

            <FormDropdownInputField
              label="Customer"
              value={values.customer}
              items={customerInfo?.nameList ? customerInfo?.nameList : ["", ""]}
              onChangeValue={(val) => {
                setFieldValue("customer", val);
                setAddress(val == "" ? "-" : customers[customerInfo.nameList.indexOf(val)].address);
              }}
              required={true}
              hasError={errors.customer && touched.customer ? true : false}
              errorMessage={errors.customer}
            />

            <FormTextInputField
              label="Address"
              value={address || "-"}
              multiline={true}
              editable={false}
            />

            <FieldArray name="products">
              {({ remove, push }) => (
                <View>
                  {values.products.length > 0 ? (
                    values.products.map((product, index) => (
                      <View key={index}>
                        <ProductsField
                          index={index}
                          handleDelete={() => { remove(index); setDeleted(!deleted) }}
                          deleted={deleted}
                          length={values.products.length}
                          products={values.products}
                          productsList={products}
                          errors={errors.products && touched.products ? errors.products : undefined}
                        />
                      </View>
                    ))) : null}
                  <View style={[tailwind("mb-5")]}>
                    <AddNewButton text="Add Another Product & Unit" onPress={() => push({ quantity: "", unit: LITRES, prices: [{ value: "", unit: LITRE, remarks: "" }] })} />
                  </View>
                </View>
              )}
            </FieldArray>

            <FieldArray name="ports">
              {({ remove, push }) => (
                <View>
                  {values.ports.length > 0 ? (
                    values.ports.map((port, index) => (
                      <View key={index}>
                        <LocationsField
                          index={index}
                          handleDelete={() => { remove(index); setDeleted(!deleted) }}
                          deleted={deleted}
                          length={values.ports.length}
                          ports={values.ports}
                          portList={portList}
                          locationList={locationsList}
                          errors={errors.ports && touched.ports ? errors.ports : undefined}
                        />
                      </View>
                    ))) : null}
                  <View style={[tailwind("mb-5")]}>
                    <AddNewButton text="Add Location" onPress={() => push({ port: "", delivery_location: "" })} />
                  </View>
                </View>
              )}
            </FieldArray>
            {
              errorLocations
                ?
                <TextLabel content={"Delivery location selected cannot be duplicated"} color='text-red-500' />
                :
                <></>
            }

            <FormRangeDateInputField
              label='Delivery Date'
              value={values.delivery_date}
              onChangeValue={text => setFieldValue("delivery_date", text)}
              required={true}
              hasError={(errors.delivery_date?.startDate && touched.delivery_date?.startDate) ? true : false}
              errorMessage={errors.delivery_date?.startDate}
            />

            <FieldArray name="delivery_modes">
              {({ remove, push }) => (
                <View>
                  {values.delivery_modes.length > 0 ? (
                    values.delivery_modes.map((port, index) => (
                      <View key={index}>
                        <ModeOfDeliveryField
                          index={index}
                          length={values.delivery_modes.length}
                          delivery_modes={values.delivery_modes}
                          deleted={deleted}
                          onDelete={() => { remove(index); setDeleted(!deleted) }}
                          errors={errors.delivery_modes && touched.delivery_modes ? errors.delivery_modes : undefined}
                        />
                      </View>
                    ))) : null}
                  <View style={[tailwind("mb-5")]}>
                    <AddNewButton text="Add Delivery Mode" onPress={() => push("")} />
                  </View>
                </View>
              )}
            </FieldArray>
            {
              errorDeliveryMode
                ?
                <TextLabel content={"Delivery modes selected cannot be duplicated"} color='text-red-500' />
                :
                <></>
            }

            <FormTextInputField
              label="Receiving Vessel's Name"
              required={true}
              value={values.receiving_vessel_name}
              onChangeValue={text => setFieldValue("receiving_vessel_name", text)}
              hasError={errors.receiving_vessel_name && touched.receiving_vessel_name ? true : false}
              errorMessage={errors.receiving_vessel_name}
            />

            <FormTextInputField
              label="Remarks"
              value={values.remarks}
              onChangeValue={text => setFieldValue("remarks", text)}
              multiline={true}
              hasError={errors.remarks && touched.remarks ? true : false}
              errorMessage={errors.remarks}
            />

            <RegularButton
              text="Next"
              operation={() => { handleSubmit(); setErrorLocations(false); setErrorDeliveryMode(false); }}
              loading={loading}
            />


          </View>
        )}
      </Formik>
    </Body>
  )
}

export default CreateQuotationFormScreen;