import React, { useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import AddNewButton from '../../../components/molecules/buttons/AddNewButton';
import { FieldArray, Formik } from 'formik';
import { useTailwind } from 'tailwind-rn';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import FormTextInputField from '../../../components/molecules/input/FormTextInputField';
import { Platform, View } from 'react-native';
import { revalidateDocument, useCollection, useDocument } from '@nandorojo/swr-firestore';
import { Supplier } from '../../../types/Supplier';
import { SHIP_SPARES, SPARES_PROCUREMENTS, SUPPLIERS } from '../../../constants/Firebase';
import LoadingData from '../../../components/atoms/loading/loadingData';
import * as Yup from "yup";
import { getSupplierNames } from '../../../helpers/SupplierHelper';
import { SparesProcurement } from '../../../types/SparesProcurement';
import EditSupplierQuotationField from '../../../components/templates/procurement/CreateSparesProcurement/EditSupplierQuotationField';
import { UploadBatch } from '../../../services/StorageServices';
import { updateSparesProcurement } from '../../../services/SparesProcurementServices';
import { DRAFT, IN_REVIEW, REJECTED } from '../../../types/Common';
import Unauthorized from '../../../components/atoms/unauthorized/Unauthorized';
import { UPDATE_ACTION } from '../../../constants/Action';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { ShipSpare } from '../../../types/ShipSpare';
import { getShipSparesDescription } from '../../../helpers/ShipSpareHelper';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import FormRangeDateInputField from '../../../components/molecules/input/FormRangeDateInputField';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import ProductsField from '../../../components/templates/procurement/CreateSparesProcurement/ProductsField';


const formSchema = Yup.object().shape({
  procurement_date: Yup.string().required("Required"),
  suppliers: Yup.array().of(
    Yup.object().shape({
      supplier: Yup.string().required("Required"),
      quotation_no: Yup.string().when("filename", {
        is: (value) => value !== "",
        then: Yup.string().required("Required quotation number")
      }),
      updated: Yup.boolean(),
      filename: Yup.string().required("Required"),
      uri: Yup.string().when("updated", {
        is: true,
        then: Yup.string().required("Required")
      }),
    })
  ),
  products: Yup.array().of(
    Yup.object().shape({
      product: Yup.string().required("Required"),
      sizing: Yup.string(),
      quantity: Yup.string().required("Required").matches(/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/, "Please ensure the correct number format"),
      unit_of_measurement: Yup.string().required("Required"),
    })
  ),
  proposed_date: Yup.object().shape({
    startDate: Yup.string().required("Required"),
    endDate: Yup.string()
  }),
});


const current = new Date();

const EditSparesProcurementFormScreen = ({ navigation, route }: RootNavigationProps<"EditSparesProcurement">) => {
  const tailwind = useTailwind();
  const { docID } = route.params;
  const [openCreateProduct, setOpenCreateProduct] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const allowedStatuses = [DRAFT, REJECTED, IN_REVIEW];
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const user = useSelector(UserSelector);

  const { data: spares_procurement } = useDocument<SparesProcurement>(`${SPARES_PROCUREMENTS}/${docID}`, {
    ignoreFirestoreDocumentSnapshotField: false,
    revalidateOnFocus: true,
  })

  const { data: suppliers } = useCollection<Supplier>(`${SUPPLIERS}`, {
    ignoreFirestoreDocumentSnapshotField: false,
    where: ["deleted", "==", false]
  })

  const { data: shipSpares } = useCollection<ShipSpare>(`${SHIP_SPARES}`, {
    ignoreFirestoreDocumentSnapshotField: false,
    where: ["deleted", "==", false]
  })

  if (!suppliers || !shipSpares || !spares_procurement) return <LoadingData message="This document might not exist" />;

  if (!allowedStatuses.includes(spares_procurement?.status!)) {
    return <Unauthorized />;
  }

  const { shipSparesList } = getShipSparesDescription(shipSpares);
  const { suppliersList } = getSupplierNames(suppliers);


  const data = {
    procurement_date: spares_procurement.procurement_date,
    suppliers: spares_procurement.suppliers.map(
      (item) => {
        return {
          supplier: item.supplier.name,
          quotation_no: item.quotation_no,
          filename: item.filename,
          filename_storage: item.filename_storage,
          uri: "",
          file: "",
          updated: false
        }
      }
    ),
    products: spares_procurement.products.map(
      (item) => {
        return {
          product: item.product.product_description,
          sizing: item.sizing || "",
          quantity: item.quantity,
          unit_of_measurement: item.unit_of_measurement
        }
      }
    ),
    proposed_date: spares_procurement.proposed_date,
    remarks: spares_procurement.remarks,
    reject_notes: ""
  };

  return (
    <Body header={<HeaderStack title={"Create Spares Procurement"} navigateProp={navigation} />} style={tailwind("mt-6")}>

      <ViewPageHeaderText doc="Procurement" id={spares_procurement.display_id} />

      <Formik
        initialValues={data}
        onSubmit={(values) => {
          setLoading(true);
          let selectedProducts: Array<{ product: ShipSpare, sizing?: string, quantity: string, unit_of_measurement: string }> = [];

          values.products.map(product => {
            let selectedProduct = shipSpares[shipSparesList.indexOf(product.product)];
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

            selectedProducts.push({
              product: product_data,
              sizing: product.sizing || "",
              quantity: product.quantity,
              unit_of_measurement: product.unit_of_measurement
            });
          })

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
              filename_storage: item.updated ? `${item.filename}.${current}${index}` : item.filename_storage,
            })
          })

          suppliersPickedList.map((item, index) => {
            if (values.suppliers[index].updated) {
              suppliersFiles.push({
                file: values.suppliers[index].file,
                filename_storage: `${item.filename}.${current}${index}`,
                uri: values.suppliers[index].uri
              })
            }
          })


          UploadBatch(SPARES_PROCUREMENTS, suppliersFiles)
            .then((err) => {
              updateSparesProcurement(spares_procurement.id, { ...values, suppliers: suppliersPickedList, products: selectedProducts, created_by: user, status: DRAFT }, user!, UPDATE_ACTION, () => {
                revalidateDocument(`${SPARES_PROCUREMENTS}/${docID}`);
                navigation.navigate("CreateSparesProcurementSummary", { docID: spares_procurement.id });
                setLoading(false);
              }, (error) => {
                console.error(error);
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
              label="Procurement Date"
              value={values.procurement_date}
              editable={false}
            />

            <View style={tailwind("border border-neutral-300 mb-5 mt-3")} />

            <FieldArray name="suppliers">
              {({ remove, push }) => (
                <View style={tailwind(`${Platform.OS == "web" ? "z-[19]" : ""}`)}>
                  {values.suppliers.length > 0 ? (
                    values.suppliers.map((supplierField, index) => (
                      <View key={index} style={tailwind(`${Platform.OS == "web" ? `z-[${30 - index}]` : ""}`)}>
                        <EditSupplierQuotationField
                          docID={spares_procurement.id}
                          index={index}
                          suppliers={suppliers}
                          suppliersList={values.suppliers}
                          db_supplier={spares_procurement.suppliers}
                          length={values.suppliers.length}
                          deleted={deleted}
                          setFieldValue={(val) => setFieldValue("suppliers", val)}
                          handleDelete={() => { remove(index); setDeleted(!deleted) }}
                          errors={errors.suppliers && touched.suppliers ? errors.suppliers : undefined}
                        />
                      </View>
                    ))) : null}
                  <AddNewButton text="Add Another Supplier & Quotation" onPress={() => push({ supplier: "", quotation_no: "", filename: "", uri: "", file: "" })} />
                </View>
              )}
            </FieldArray>


            <FieldArray name="products">
              {({ remove, push }) => (
                <View>
                  {values.products.length > 0 ? (
                    values.products.map((product, index) => (
                      <View key={index}>
                        <ProductsField
                          index={index}
                          length={values.products.length}
                          products={values.products}
                          deleted={deleted}
                          onDelete={() => { remove(index); setDeleted(!deleted) }}
                          productList={shipSparesList}
                          errors={errors.products && touched.products ? errors.products : undefined}
                        />
                      </View>
                    ))) : null}
                  <AddNewButton text="Add Another Product" onPress={() => push({ product: "", sizing: "", quantity: "", unit_of_measurement: "" })} />
                </View>
              )}
            </FieldArray>

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

            <RegularButton text="Submit" operation={() => { handleSubmit() }} loading={loading} />
          </View>
        )}
      </Formik>
    </Body>
  )
}

export default EditSparesProcurementFormScreen;