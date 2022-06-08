import React, { useEffect, useState } from "react";
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import { FieldArray, Formik } from 'formik';
import { revalidateDocument, useCollection, useDocument } from '@nandorojo/swr-firestore';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { useLinkTo } from '@react-navigation/native';
import { Quotation } from '../../../types/Quotation';
import { deleteQuotation, updateQuotation } from "../../../services/QuotationServices";
import PricesField from "../../../components/templates/sales/CreateQuotation/PricesField";
import { useTailwind } from "tailwind-rn";
import FormTextInputField from "../../../components/molecules/input/FormTextInputField";
import FormDropdownInputField from "../../../components/molecules/input/FormDropdownInputField";
import { View } from "react-native";
import ConfirmModal from "../../../components/molecules/modal/ConfirmModal";
import { DangerIcon } from "../../../../assets/svg/SVG";
import Body from "../../../components/atoms/display/Body";
import HeaderStack from "../../../components/atoms/display/HeaderStack";
import TextLabel from "../../../components/atoms/typography/TextLabel";
import RegularButton from "../../../components/atoms/buttons/RegularButton";
import * as Yup from 'yup';
import { BUNKERS, QUOTATIONS } from "../../../constants/Firebase";
import DatePickerField from "../../../components/atoms/input/datetimepickers/DatePickerField";
import TimePickerField from "../../../components/atoms/input/datetimepickers/TimePickerField";
import ViewPageHeaderText from "../../../components/molecules/display/ViewPageHeaderText";
import { Bunker } from "../../../types/Bunker";

import { DRAFT, REJECTED } from "../../../types/Common";
import Unauthorized from "../../../components/atoms/unauthorized/Unauthorized";
import { getBunkerNameList } from "../../../helpers/BunkerHelper";
import { useSelector } from "react-redux";
import { UserSelector } from "../../../redux/reducers/Auth";
import { UPDATE_ACTION } from "../../../constants/Action";
import FormDouble from "../../../components/molecules/alignment/FormDouble";
import { LITRE, LITRES } from "../../../constants/Units";
import BunkerBargeField from "../../../components/templates/sales/CreateQuotation/BunkerBargeField";
import AddNewButton from "../../../components/molecules/buttons/AddNewButton";
import { CurrenciesList } from "../../../constants/Currency";

const formSchema = Yup.object().shape({
  currency_rate: Yup.string().required("Required"),
  payment_term: Yup.string().required("Required"),
  validity_date: Yup.string().required("Required"),
  validity_time: Yup.string().required("Required"),
  products: Yup.array().of(
    Yup.object().shape({
      name: Yup.string(),
      quantity: Yup.string(),
      unit: Yup.string(),
      prices: Yup.array().of(
        Yup.object().shape({
          value: Yup.string().required("Required").matches(/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/, "Please ensure the correct number format"),
          unit: Yup.string().required("Required"),
        })
      )
    })
  ),
  barging_fee: Yup.string().matches(/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/, "Please ensure the correct number format"),
  bunker_barges: Yup.array().of(Yup.string().required("Required")),
});


const CreateQuotationFormScreen2 = ({ navigation, route }: RootNavigationProps<"CreateQuotation2">) => {
  const tailwind = useTailwind();

  const [loading, setLoading] = useState(false);
  const docID = route.params.docID;
  const linkTo = useLinkTo();
  const [deleted, setDeleted] = useState(false);
  let action: "create" | "edit" = route.params.action;
  const user = useSelector(UserSelector);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitValues, setSubmitValues] = useState<any>();
  const [errorBunker, setErrorBunker] = useState(false);

  const allowedStatuses = [DRAFT, REJECTED];

  const { data } = useDocument<Quotation>(`${QUOTATIONS}/${docID}`, {
    ignoreFirestoreDocumentSnapshotField: false,
  })

  const { data: bunkers } = useCollection<Bunker>(`${BUNKERS}`, {
    ignoreFirestoreDocumentSnapshotField: false,
    where: ["deleted", "==", false]
  })

  if (!data || !bunkers) return <LoadingData message="This document might not exist" />;

  if (!allowedStatuses.includes(data?.status!)) {
    return <Unauthorized />;
  }

  const { bunkerList } = getBunkerNameList(bunkers);

  let modal = (
    <ConfirmModal
      text1={`Do you want to save Quotation ${data.secondary_id}`}
      image={<DangerIcon height={100} width={100} />}
      visible={modalOpen}
      button1Text="Save"
      button2Text="Don't Save"
      setModalClose={() => { setModalOpen(false) }}
      nextAction={() => {
        navigation.navigate("Dashboard");
        updateQuotation(docID, submitValues, user!, UPDATE_ACTION, () => navigation.navigate("Dashboard"), (error) => console.log(error));
      }}
      cancelAction={() => {
        if (action == "create") {
          deleteQuotation(docID, user, () => navigation.navigate("Dashboard"), () => { })
        } else {
          navigation.navigate("Dashboard");
        }
      }}
    />
  );


  const onSubmit = async (values) => {
    const unique = Array.from(new Set(values.bunker_barges.map(item => item)));


    if (values.bunker_barges.length == unique.length) {
      setLoading(true);
      setErrorBunker(false);
      let bunker_data: Array<Bunker> = [];

      values.bunker_barges.map(item => {
        let bunker_selected = bunkers[bunkerList.indexOf(item)];
        bunker_data.push(
          {
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
        )
      })



      updateQuotation(
        docID,
        {
          ...values,
          bunker_barges: bunker_data
        },
        user!,
        UPDATE_ACTION,
        () => {
          linkTo(`/quotations/${docID}/summary`);
          setLoading(false);
          revalidateDocument(`${QUOTATIONS}/${docID}`);

        }, (errorMessage) => {
          console.log(errorMessage)
        }
      );

    } else {
      setErrorBunker(true);
      return false;
    }
  }


  return (
    <Body header={<HeaderStack title={"Create Quotation"} navigateProp={navigation} />} style={tailwind("pt-10")}>
      {modal}
      <ViewPageHeaderText doc="Quotation" id={`${data.display_id}`} />

      <Formik
        initialValues={{
          //page 1
          quotation_date: data.quotation_date,
          products: data?.__snapshot?.data().products || [{ name: "Fuel", quantity: "", unit: LITRES, prices: [{ value: "", unit: LITRE }] }],
          bunker_barges: data.bunker_barges?.map(item => { return item.name }) || [""],

          //page 2
          currency_rate: data.currency_rate || "",
          barging_fee: data.barging_fee,
          barging_remark: data.barging_remark || "",
          conversion_factor: data.conversion_factor,
          payment_term: data.payment_term || "",
          validity_date: data.validity_date || "",
          validity_time: data.validity_time || "",
          receiving_vessel_name: data.receiving_vessel_name,
        }}
        onSubmit={(values) => { onSubmit(values); }}
        validationSchema={formSchema}
      >
        {({ errors, touched, values, setFieldValue, handleSubmit }) => (
          <View>

            <FormTextInputField label="Quotation Date"
              value={values.quotation_date}
              editable={false}
            />

            <View style={tailwind("border border-neutral-300 mb-5 mt-3")} />

            <View style={tailwind("z-50")}>
              <FormDropdownInputField
                label="Currency Rate"
                value={values.currency_rate}
                items={CurrenciesList}
                onChangeValue={(val) => { setFieldValue("currency_rate", val) }}
                required={true}
                shadow={true}
                hasError={errors.currency_rate && touched.currency_rate ? true : false}
                errorMessage={errors.currency_rate}
              />
            </View>

            <FieldArray name="products">
              {() => (
                <View>
                  {values.products.length > 0 ? (
                    values.products.map((product, index) => (
                      <PricesField
                        key={index}
                        index={index}
                        name={values.products[index].product.name}
                        prices={values.products[index].prices}
                        errors={errors.products && touched.products ? errors.products[index] : undefined}
                      />
                    ))) : null}
                </View>
              )}
            </FieldArray>

            <FormDouble
              left={
                <FormTextInputField
                  label="Barging Fee"
                  placeholder="-- Type --"
                  value={values.barging_fee}
                  onChangeValue={(val) => { setFieldValue("barging_fee", val) }}
                  number={true}
                  hasError={errors.barging_fee && touched.barging_fee ? true : false}
                  errorMessage={errors.barging_fee}
                />
              }
              right={
                <FormTextInputField
                  label="Barging Remark"
                  placeholder="-- Type --"
                  value={values.barging_remark}
                  onChangeValue={(val) => { setFieldValue("barging_remark", val) }}
                />
              }
            />

            <FormTextInputField
              label="Conversion Factor"
              placeholder="-- Type --"
              value={values.conversion_factor}
              onChangeValue={(val) => { setFieldValue("conversion_factor", val) }}
            />

            <FormDropdownInputField
              shadow={true}
              label="Payment Term"
              value={values.payment_term}
              items={["Cash in advance", "Cash on delivery", "7 days", "14 days", "30 days", "45 days", "60 days"]}
              onChangeValue={(val) => { setFieldValue("payment_term", val) }}
              required={true}
              hasError={errors.payment_term && touched.payment_term ? true : false}
              errorMessage={errors.payment_term}
            />

            {/* z-30 */}
            <View style={tailwind("mb-1")}>
              <View style={tailwind("flex-row mb-1")}>
                <View>
                  <TextLabel content={"Validity"} style={tailwind("font-bold mr-1")} />
                </View>
                <TextLabel content={`*`} color='text-red-500' />
              </View>
              <View style={tailwind("flex flex-row justify-between")}>
                <View style={tailwind("w-[48%]")}>
                  <DatePickerField
                    value={values.validity_date}
                    onChangeText={text => setFieldValue("validity_date", text)}
                    hasError={errors.validity_date && touched.validity_date ? true : false}
                    errorMessage={errors.validity_date}
                  />
                </View>
                <View style={tailwind("w-[48%]")}>
                  <TimePickerField
                    value={values.validity_time}
                    onChangeText={text => setFieldValue("validity_time", text)}
                    hasError={errors.validity_time && touched.validity_time ? true : false}
                    errorMessage={errors.validity_time}
                  />
                </View>
              </View>
            </View>

            <View style={tailwind("flex-row items-center")}>
              <View style={tailwind("flex-row w-1/5")}>
                <View>
                  <TextLabel content={`Bunker barges`} color="text-gray-primary" style={tailwind("font-bold mr-1")} />
                </View>
              </View>
            </View>
            <FieldArray name="bunker_barges">
              {({ remove, push }) => (
                <View>
                  {values.bunker_barges.length > 0 ? (
                    values.bunker_barges.map((port, index) => (
                      <View key={index}>
                        <BunkerBargeField
                          index={index}
                          length={values.bunker_barges.length}
                          bunkers={values.bunker_barges}
                          deleted={deleted}
                          onDelete={() => { remove(index); setDeleted(!deleted) }}
                          bunkerList={bunkerList}
                          errors={errors.bunker_barges && touched.bunker_barges ? errors.bunker_barges : undefined}
                        />
                      </View>
                    ))) : null}
                  <View style={[tailwind("mb-5")]}>
                    <AddNewButton text="Add Bunker Barge" onPress={() => push("")} />
                  </View>
                </View>
              )}
            </FieldArray>
            {
              errorBunker
                ?
                <TextLabel content={"Bunker Barge selected cannot be duplicates"} color='text-red-500' style={tailwind("mb-5")} />
                :
                <></>
            }

            <RegularButton text="Review RFQ and Submit" operation={() => { handleSubmit(); setErrorBunker(false); }} loading={loading} />
            <RegularButton text="Cancel" type="secondary" operation={() => { setSubmitValues(values); setModalOpen(true); }} />
          </View>
        )}
      </Formik>
    </Body>
  )
}

export default CreateQuotationFormScreen2;