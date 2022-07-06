import React, { useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import { Formik } from 'formik';
import { useTailwind } from 'tailwind-rn';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { revalidateDocument, useCollection, useDocument } from '@nandorojo/swr-firestore';
import { BUNKERS, PORTS, SPARES_PURCHASE_ORDERS } from '../../../constants/Firebase';
import LoadingData from '../../../components/atoms/loading/loadingData';
import FormTextInputField from '../../../components/molecules/input/FormTextInputField';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import FormDateInputField from '../../../components/molecules/input/FormDateInputField';
import { View } from 'react-native';
import { SparesPurchaseOrder } from '../../../types/SparesPurchaseOrder';
import { Port } from '../../../types/Port';
import { getPortNameAndDeliveryLocations } from '../../../helpers/PortHelper';
import { getSupplierContactPersonsByName } from '../../../helpers/SupplierHelper';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import * as Yup from 'yup';
import { contactPerson } from '../../../types/Supplier';
import { updateSparesPurchaseOrder } from '../../../services/SparesPurchaseOrderServices';
import { DRAFT, REJECTED } from '../../../types/Common';
import Unauthorized from '../../../components/atoms/unauthorized/Unauthorized';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { UPDATE_ACTION } from '../../../constants/Action';
import { Bunker } from '../../../types/Bunker';
import { getBunkerNameList } from '../../../helpers/BunkerHelper';

const formSchema = Yup.object().shape({
  vessel_name: Yup.string().required("Required"),
  type_of_supply: Yup.string().required("Required"),
  port: Yup.string().required("Required"),
  delivery_location: Yup.string().required("Required"),
  contact_person: Yup.string().required("Required"),
  ETA_delivery_date: Yup.string().required("Required"),
});


const CreateSparesPurchaseOrderFormScreen2 = ({ navigation, route }: RootNavigationProps<"CreateSparesPurchaseOrder2">) => {
  const tailwind = useTailwind();
  const { docID } = route.params;
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<Array<string>>(["sample"]);
  const allowedStatuses = [DRAFT, REJECTED];
  const user = useSelector(UserSelector);

  const { data } = useDocument<SparesPurchaseOrder>(`${SPARES_PURCHASE_ORDERS}/${docID}`, {
    ignoreFirestoreDocumentSnapshotField: false,
  })

  const { data: ports } = useCollection<Port>(`${PORTS}`, {
    ignoreFirestoreDocumentSnapshotField: true,
    where: ["deleted", "==", false]
  });

  const { data: bunkers } = useCollection<Bunker>(`${BUNKERS}`, {
    ignoreFirestoreDocumentSnapshotField: false,
    where: ["deleted", "==", false]
  })

  if (!data || !ports || !bunkers) return <LoadingData message="This document might not exist" />;

  if (!allowedStatuses.includes(data?.status!)) {
    return <Unauthorized />;
  }

  const { portList, locationsList } = getPortNameAndDeliveryLocations(ports);
  const { contactPersonsList, contactPersonsNameList } = getSupplierContactPersonsByName(data.supplier);
  const { bunkerList } = getBunkerNameList(bunkers);

  let initialValues = {
    purchase_order_date: data.purchase_order_date,
    vessel_name: data.vessel_name ? data.vessel_name.name : "",
    type_of_supply: data.type_of_supply || "",
    port: data.port || "",
    delivery_location: data.delivery_location || "",
    contact_person: data.contact_person ? data.contact_person.name : "",
    ETA_delivery_date: data.ETA_delivery_date || "",
    remarks: data.remarks || "",
  }

  return (
    <Body header={<HeaderStack title={"Create Spares Purchase Order"} navigateProp={navigation} />} style={tailwind("mt-6")}>

      <ViewPageHeaderText doc="Purchase Order" id={data.display_id} />

      <Formik
        initialValues={initialValues}
        onSubmit={(values) => {
          setLoading(true);
          let bunker_selected = bunkers[bunkerList.indexOf(values.vessel_name)]
          let bunker_data = {
            id: bunker_selected.id,
            name: bunker_selected.name,
            official_number: bunker_selected.official_number,
            imo_number: bunker_selected.imo_number,
            flag: bunker_selected.flag,
            call_sign: bunker_selected.call_sign,
            net_tonnage: bunker_selected.net_tonnage,
            gross_tonnage: bunker_selected.gross_tonnage,
            sdwt: bunker_selected.sdwt,
            loa: bunker_selected.loa,
            depth: bunker_selected.depth,
            capacity: bunker_selected.capacity,
            created_at: bunker_selected.created_at,
          }
          let selected_contact_person: contactPerson = contactPersonsList[contactPersonsNameList.indexOf(values.contact_person)]
          let contact_person_data: contactPerson = {
            name: selected_contact_person.name,
            email: selected_contact_person.email,
            phone_number: selected_contact_person.phone_number
          }

          updateSparesPurchaseOrder(docID, { ...values, contact_person: contact_person_data, vessel_name: bunker_data }, user!, UPDATE_ACTION, () => {
            navigation.navigate("CreateSparesPurchaseOrderSummary", { docID: data.id });
            revalidateDocument(`${SPARES_PURCHASE_ORDERS}/${docID}`)
            setLoading(false);
          }, (error) => {
            console.error(error);
          })
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

            <FormDropdownInputField
              label="Vessel Name"
              items={bunkerList}
              value={values.vessel_name}
              onChangeValue={text => setFieldValue("vessel_name", text)}
              required={true}
              hasError={errors.vessel_name && touched.vessel_name ? true : false}
              errorMessage={errors.vessel_name}
            />

            <FormTextInputField
              label="Type of Supply"
              value={values.type_of_supply}
              onChangeValue={text => setFieldValue("type_of_supply", text)}
              required={true}
              hasError={errors.delivery_location && touched.delivery_location ? true : false}
              errorMessage={errors.delivery_location}
            />

            <FormDropdownInputField
              label="Port"
              value={values.port}
              items={portList}
              onChangeValue={text => { setFieldValue("port", text); setLocations(locationsList[portList.indexOf(text)]) }}
              required={true}
              hasError={errors.port && touched.port ? true : false}
              errorMessage={errors.port}
            />

            <FormDropdownInputField
              label="Delivery Location"
              value={values.delivery_location}
              items={locations || []}
              onChangeValue={text => setFieldValue("delivery_location", text || values.delivery_location)}
              required={true}
              hasError={errors.delivery_location && touched.delivery_location ? true : false}
              errorMessage={errors.delivery_location}
            />

            <FormDropdownInputField
              label="Contact Person"
              value={values.contact_person}
              items={contactPersonsNameList}
              onChangeValue={(val) => { setFieldValue("contact_person", val) }}
              required={true}
              hasError={errors.contact_person && touched.contact_person ? true : false}
              errorMessage={errors.contact_person}
            />

            <FormDateInputField
              label='ETA/ Delivery Date'
              value={values.ETA_delivery_date}
              onChangeValue={text => setFieldValue("ETA_delivery_date", text)}
              required={true}
              hasError={errors.ETA_delivery_date && touched.ETA_delivery_date ? true : false}
              errorMessage={errors.ETA_delivery_date}
            />

            <FormTextInputField
              label="Remarks"
              value={values.remarks}
              onChangeValue={text => setFieldValue("remarks", text)}
              multiline={true}
            />

            <View>
              <RegularButton
                text="Review PO & Submit"
                operation={() => { handleSubmit() }}
                loading={loading}
              />
            </View>
          </View>
        )}

      </Formik>
    </Body>
  )
}

export default CreateSparesPurchaseOrderFormScreen2;