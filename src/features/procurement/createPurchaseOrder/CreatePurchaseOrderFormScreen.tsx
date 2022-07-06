import React, { useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import { Formik } from 'formik';
import { useTailwind } from 'tailwind-rn';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import FormTextInputField from '../../../components/molecules/input/FormTextInputField';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import { useCollection, useDocument } from '@nandorojo/swr-firestore';
import { Procurement } from '../../../types/Procurement';
import { BUNKERS, PORTS, PROCUREMENTS, SUPPLIERS } from '../../../constants/Firebase';
import LoadingData from '../../../components/atoms/loading/loadingData';
import * as Yup from "yup";
import { createPurchaseOrder } from '../../../services/PurchaseOrderServices';
import { useLinkTo } from '@react-navigation/native';
import { View } from 'react-native';
import { updateProcurement } from '../../../services/ProcurementServices';
import { contactPerson, Supplier } from '../../../types/Supplier';
import { Product } from '../../../types/Product';
import { DRAFT, PENDING, PROCUREMENT_CODE, PURCHASE_ORDER_LORRY_CODE, PURCHASE_ORDER_TRADER_CODE, PURCHASE_ORDER_VESSEL_CODE, REQUESTING } from '../../../types/Common';
import Unauthorized from '../../../components/atoms/unauthorized/Unauthorized';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { EX_PIPE_LINE, LORRY_TANKER, SHIP_TO_SHIP, TRADER } from '../../../types/DeliveryModes';
import { Port } from '../../../types/Port';
import { getPortNameAndDeliveryLocations } from '../../../helpers/PortHelper';
import FormRangeDateInputField from '../../../components/molecules/input/FormRangeDateInputField';
import { Bunker } from '../../../types/Bunker';
import { getBunkerNameList } from '../../../helpers/BunkerHelper';

const current = new Date();
const currentDate = `${current.getDate().toString()}/${+current.getMonth().toString() + 1}/${current.getFullYear().toString()}`

const to_replace_string = PROCUREMENT_CODE;


const formSchema = Yup.object().shape({
  delivery_mode_details: Yup.string().required("Required"),
  port: Yup.string().required("Required"),
  delivery_location: Yup.string().required("Required"),
  contact_person: Yup.string().required("Required"),
  ETA_delivery_date: Yup.object().shape({
    startDate: Yup.string().required("Required"),
    endDate: Yup.string()
  }),
  vessel_name: Yup.string().required("Required"),
});

const CreatePurchaseOrderFormScreen = ({ navigation, route }: RootNavigationProps<"CreatePurchaseOrderForm">) => {

  const { docID } = route.params;
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<Array<string>>(["sample"]);
  const tailwind = useTailwind();
  const linkTo = useLinkTo();
  const user = useSelector(UserSelector);
  const allowedStatuses = [REQUESTING];
  let replace_string: any = "";
  let delivery_details_label: string = "";

  let displayID: string = ""
  type procurementData = {
    procurement_id: string,
    procurement_secondary_id: string,
    purchase_order_date: string,
    supplier: Supplier,
    product: Product,
    unit_of_measurement: string,
    quantity: string,
    proposed_date: string,
    currency_rate: string,
    unit_price: string,
    payment_term: string,
    delivery_mode: typeof LORRY_TANKER | typeof TRADER | typeof SHIP_TO_SHIP | typeof EX_PIPE_LINE,
    total_amount: string,
  };

  const { data } = useDocument<Procurement>(`${PROCUREMENTS}/${docID}`, {
    ignoreFirestoreDocumentSnapshotField: false,
  })

  const { data: ports } = useCollection<Port>(`${PORTS}`, {
    ignoreFirestoreDocumentSnapshotField: true,
    where: ["deleted", "==", false]
  });

  const { data: supplier } = useDocument<Supplier>(`${SUPPLIERS}/${data?.supplier.id}`, {
    ignoreFirestoreDocumentSnapshotField: false,
  })

  const { data: bunkers } = useCollection<Bunker>(`${BUNKERS}`, {
    ignoreFirestoreDocumentSnapshotField: false,
    where: ["deleted", "==", false]
  })

  if (!data || !ports || !supplier || !bunkers) return <LoadingData message="This document might not exist" />;

  if (!allowedStatuses.includes(data?.status!)) {
    return <Unauthorized />;
  }

  const { portList, locationsList } = getPortNameAndDeliveryLocations(ports);
  const { bunkerList } = getBunkerNameList(bunkers);
  const suppliersList = supplier.contact_persons.map(item => item.name);

  let procurement_data: procurementData = {
    procurement_id: data.id,
    procurement_secondary_id: data.secondary_id,
    purchase_order_date: `${new Date().getDate().toString()}/${(new Date().getMonth() + 1).toString()}/${new Date().getFullYear().toString()}`,
    supplier: data.supplier,
    product: data.product,
    unit_of_measurement: data.unit_of_measurement || "",
    quantity: data.quantity || "",
    proposed_date: `${data.proposed_date.startDate} to ${data.proposed_date.endDate}` || "",

    currency_rate: data.currency_rate,
    unit_price: data.unit_price,
    payment_term: data.payment_term,
    delivery_mode: data.delivery_mode,
    total_amount: data.total_amount,
  };

  let initialValues = {
    purchase_order_date: currentDate,
    delivery_mode_details: "",
    port: portList[0],
    delivery_location: "",
    contact_person: "",
    ETA_delivery_date: { startDate: "", endDate: "" },
    remarks: "",
    vessel_name: ""
  }

  switch (data.delivery_mode) {
    case "Lorry Tanker":
      replace_string = PURCHASE_ORDER_LORRY_CODE;
      delivery_details_label = "Lorry Name and Number";
      break;
    case "Ex Pipe Line":
      replace_string = PURCHASE_ORDER_VESSEL_CODE;
      delivery_details_label = "Ex Pipe Line";
      break;
    case "Ship to Ship Transfer":
      replace_string = PURCHASE_ORDER_VESSEL_CODE;
      delivery_details_label = "Vessel Name";
      break;
    case "Trader":
      replace_string = PURCHASE_ORDER_TRADER_CODE;
      delivery_details_label = "Vessel Name/Ex Pipe Line";
      break;
  }


  displayID = data.secondary_id.replace(to_replace_string, replace_string);

  return (
    <Body header={<HeaderStack title={"Create Purchase Order"} navigateProp={navigation} />} style={tailwind("mt-6")}>

      <ViewPageHeaderText doc="Purchase Order" id={displayID} />

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

          let selected_contact_person: contactPerson = supplier.contact_persons.map(item => item)[suppliersList.indexOf(values.contact_person)]
          let contact_person_data: contactPerson = {
            name: selected_contact_person.name,
            email: selected_contact_person.email,
            phone_number: selected_contact_person.phone_number
          }

          createPurchaseOrder(
            displayID,
            { ...values, ...procurement_data, delivery_mode_type: delivery_details_label, vessel_name: bunker_data,contact_person: contact_person_data, status: DRAFT },
            user!, (id) => {
              updateProcurement(data.id, { purchase_order_id: id, purchase_order_secondary_id: displayID, status: PENDING }, user!, () => {
                linkTo(`/purchase-orders/${id}/summary`);
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

            <FormDropdownInputField
              label="Receiving vessel"
              value={values.vessel_name}
              items={bunkerList}
              onChangeValue={(val) => { setFieldValue("vessel_name", val) }}
              required={true}
              hasError={errors.vessel_name && touched.vessel_name ? true : false}
              errorMessage={errors.vessel_name}
            />

            <FormTextInputField
              label={`Supplier's ${delivery_details_label}`}
              value={values.delivery_mode_details}
              onChangeValue={text => setFieldValue("delivery_mode_details", text)}
              required={true}
              hasError={errors.delivery_mode_details && touched.delivery_mode_details ? true : false}
              errorMessage={errors.delivery_mode_details}
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
              items={suppliersList}
              onChangeValue={(val) => { setFieldValue("contact_person", val) }}
              required={true}
              hasError={errors.contact_person && touched.contact_person ? true : false}
              errorMessage={errors.contact_person}
            />

            <FormRangeDateInputField
              label='ETA/ Delivery Date'
              value={values.ETA_delivery_date}
              onChangeValue={text => setFieldValue("ETA_delivery_date", text)}
              required={true}
              hasError={errors.ETA_delivery_date && touched.ETA_delivery_date ? true : false}
              errorMessage={errors.ETA_delivery_date?.startDate}
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

export default CreatePurchaseOrderFormScreen;