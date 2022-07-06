import React, { useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import { TickIcon } from '../../../../assets/svg/SVG';
import { useTailwind } from 'tailwind-rn';
import ConfirmModal from '../../../components/molecules/modal/ConfirmModal';
import InfoDisplay from '../../../components/atoms/display/InfoDisplay';
import { revalidateCollection, useDocument } from '@nandorojo/swr-firestore';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { Formik } from 'formik';
import { useLinkTo } from '@react-navigation/native';
import { SalesConfirmation } from '../../../types/SalesConfirmation';
import { updateQuotation } from '../../../services/QuotationServices';
import { updateSalesConfirmation } from '../../../services/SalesConfirmationServices';
import { CUSTOMERS, SALES_CONFIRMATIONS } from '../../../constants/Firebase';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import FormTextInputField from '../../../components/molecules/input/FormTextInputField';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import { View } from 'react-native';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import InfoDisplayLink from '../../../components/atoms/display/InfoDisplayLink';
import { openDocument } from '../../../services/StorageServices';
import { createAndDisplayPDF, loadPDFLogo } from '../../../functions/PDFv2Functions';
import { generateSalesConfirmationPDF } from '../../../components/templates/pdf/generateSalesConfirmationPDF';
import { ACCOUNT_ASSISTANT_ROLE, CONFIRMED, NOT_CONFIRMED, OPERATION_TEAM_ROLE, SUPER_ADMIN_ROLE } from '../../../types/Common';
import Unauthorized from '../../../components/atoms/unauthorized/Unauthorized';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { createJobConfirmation } from '../../../services/JobConfirmationServices';
import { SUBMIT_ACTION, UPDATE_ACTION } from '../../../constants/Action';
import { addCommaNumber } from '../../../helpers/NumericHelper';
import { updateSales } from '../../../services/SalesServices';
import { convertCurrency } from '../../../constants/Currency';
import { Customer } from '../../../types/Customer';
import { sendNotifications } from '../../../services/NotificationServices';


const ProceedSalesConfirmationFinalScreen = ({ navigation, route }: RootNavigationProps<"ProceedSalesConfirmationFinal">) => {

	const tailwind = useTailwind();
	const [modalOpen, setModalOpen] = useState(false);
	const user = useSelector(UserSelector);
	const [submitValues, setSubmitValues] = useState<any>();
	const allowedStatuses = [NOT_CONFIRMED];
	const docID = route.params.docID;
	let attentionPICList: Array<string> = [];
	const linkTo = useLinkTo();

	let modal;

	const { data } = useDocument<SalesConfirmation>(`${SALES_CONFIRMATIONS}/${docID}`, {
		ignoreFirestoreDocumentSnapshotField: false,
	})

	const { data: customerData } = useDocument<Customer>(`${CUSTOMERS}/${data?.customer?.id}`, {
		ignoreFirestoreDocumentSnapshotField: false,
	})

	let bunkers = data?.bunker_barges;

	if (!data || !bunkers || !customerData) return <LoadingData message="This document might not exist" />;

	if (!allowedStatuses.includes(data?.status!)) {
		return <Unauthorized />;
	}

	const products = data?.products || [];

	const completeProceedSales = (values) => {
		updateSalesConfirmation(docID, { ...values, status: CONFIRMED }, user!, SUBMIT_ACTION, () => {
			createJobConfirmation({ ...data, ...values }, user!, (val) => {
				const { id, displayID } = val;
				sendNotifications(
					[ACCOUNT_ASSISTANT_ROLE, OPERATION_TEAM_ROLE, SUPER_ADMIN_ROLE],
					`New job confirmation ${displayID} submitted by ${user?.name}.`,
					{ screen: "JobConfirmationSummary", docID: id })

				updateSales(data.sales_id, { job_id: id }, user, () => {
					updateQuotation(data.quotation_id,
						{ sales_confirmation_id: docID, sales_confirmation_secondary_id: data.secondary_id, confirmed_date: data.confirmed_date, job_confirmation_id: id, status: CONFIRMED },
						user!,
						UPDATE_ACTION,
						() => {
							revalidateCollection(SALES_CONFIRMATIONS);
							linkTo("/dashboard");
						}, (error) => {
							console.error(error);
						});
				}, (error) => {
					console.error(error);
				})
			}, (error) => {
				console.error(error);
			});
		}, (error) => {
			console.error(error);
		});
	}

	const onDownload = async () => {
		let image = await loadPDFLogo();
		let html = generateSalesConfirmationPDF(data, image);
		await createAndDisplayPDF(html);
	}

	modal = (
		<ConfirmModal
			cancelAction={() => { setModalOpen(false) }}
			downloadButton={false}
			text1={` Sales Confirmation ${data.secondary_id} has sent to Operation Team & Account Assistant`}
			text2="" image={<TickIcon height={100} width={100} />}
			horizontalButtons={false}
			button1Text="Done"
			visible={modalOpen}
			nextAction={() => { completeProceedSales(submitValues); }}
			setModalClose={() => { setModalOpen(false) }}
		/>
	);

	customerData.contact_persons.map(
		(item) => {
			attentionPICList.push(item.name)
		}
	)

	return (
		<Body header={<HeaderStack title={"Proceed Sales Confirmation"} navigateProp={navigation} navigateToDashboard={true} />} style={tailwind("pt-10")}>

			<ViewPageHeaderText doc="Sales Confirmation" id={data.secondary_id} />

			{modal}

			<View>

				<InfoDisplay placeholder={`Quotation ID`} info={data.quotation_secondary_id} />
				<InfoDisplay placeholder={`Quotation Date`} info={data.quotation_date} />
				<InfoDisplay placeholder={`Confirmed Date`} info={data.confirmed_date} />
				<InfoDisplay placeholder={`Customer`} info={data.customer?.name} />
				<InfoDisplay placeholder={`Customer Address`} info={`${data.customer?.address}`} />
				{
					products.map((item, index) => (
						<View key={index}>
							<View style={tailwind("border border-neutral-300 mb-5 mt-3")} />

							<InfoDisplay placeholder={`Product ${index + 1}`} info={item.product.name} bold={true} />
							<InfoDisplay placeholder={`Unit of measurement`} info={`${addCommaNumber(item.quantity, "0")} ${item.unit}`} />
							<InfoDisplay
								placeholder={`Price`}
								info={`${convertCurrency(data.currency_rate)} ${addCommaNumber(item.price.value, "0")} per ${item.price.unit}`}
								secondLine={item.price.remarks}
							/>
						</View>
					))
				}

				<View style={tailwind("border border-neutral-300 mb-5 mt-3")} />

				<InfoDisplay placeholder={`Port`} info={data.port || "-"} />
				<InfoDisplay placeholder={`Delivery Location`} info={data.delivery_location || "-"} />

				<InfoDisplay placeholder={`Delivery Date`} info={
					data.delivery_date?.startDate
						?
						data.delivery_date.endDate
							?
							`${data.delivery_date?.startDate} to ${data.delivery_date?.endDate}`
							:
							`${data.delivery_date.startDate}`
						:
						"-"}
				/>

				<InfoDisplay placeholder={`Mode of Delivery`} info={data.delivery_mode || "-"} />
				<InfoDisplay placeholder={`Currency  Rate`} info={data.currency_rate} />
				<InfoDisplay placeholder={`Barging Fee`} info={`${data.barging_fee ? `${convertCurrency(data.currency_rate!)} ${addCommaNumber(data.barging_fee, "-")}${data.barging_remark ? `/${data.barging_remark}` : ""}` : `-`}`} />
				<InfoDisplay placeholder={`Conversion Factor`} info={data.conversion_factor || "-"} />
				<InfoDisplay placeholder={`Payment Term`} info={data.payment_term || "-"} />
				<InfoDisplay placeholder={`Validity`} info={`Date: ${data.validity_date == "--Select Date--" ? "-" : data.validity_date}, Time: ${data.validity_time}`} />

				<View style={tailwind("border border-neutral-300 mb-5 mt-2")} />
				{
					bunkers.map((item, index) => {
						return (
							<View key={item.id}>

								<InfoDisplay placeholder={`Bunker Barge ${index + 1}`} info={`${item.name}` || "-"} bold={true} />
								<InfoDisplay placeholder={`Capacity`} info={`${addCommaNumber(item.capacity, "0")}` || "-"} />
							</View>
						)
					})
				}
				<View style={tailwind("border border-neutral-300 mb-5 mt-2")} />

				{data.purchase_order_file ? (
					<View>
						<InfoDisplay placeholder="Purchase Order No." info={data.purchase_order_no || "-"} />
						<InfoDisplayLink placeholder="PO attachment" info={data.purchase_order_file} linkOnPress={() => { openDocument(SALES_CONFIRMATIONS, `${data.filename_storage}` || "") }} />
					</View>)
					:
					(<InfoDisplay placeholder="PO attachment" info="N/A" />)
				}
			</View>

			<View style={tailwind("my-5")}>
				<RegularButton type="secondary" text="Download Sales Confirmation" operation={() => { onDownload() }} />
			</View>

			<View style={tailwind("border border-neutral-300 mb-5 mt-3")} />

			<Formik
				initialValues={{
					remarks: data.remarks,
					conditions: "",
					surveyor_contact_person: "",
					receiving_vessel_contact_person: [],
					remarks_OT: ""
				}}
				onSubmit={
					(values) => {
						setSubmitValues(values);
						setModalOpen(true);
					}}
			>
				{({ values, setFieldValue, handleSubmit }) => (
					<View>
						<FormTextInputField label="Remarks" value={`${values.remarks}`} onChangeValue={(val) => { setFieldValue("remarks", val) }} multiline={true} />

						<FormTextInputField label="Remarks for Operation Team" value={`${values.remarks_OT}`} onChangeValue={(val) => { setFieldValue("remarks_OT", val) }} multiline={true} />

						<FormTextInputField label="Conditions" value={`${values.conditions}`} onChangeValue={(val) => { setFieldValue("conditions", val) }} />

						<FormTextInputField label="Surveyor Contact Person" value={`${values.surveyor_contact_person}`} onChangeValue={(val) => { setFieldValue("surveyor_contact_person", val) }} />

						<View style={tailwind("z-10")}>
							<FormDropdownInputField
								label="Receiving vessel contact person"
								value={values.receiving_vessel_contact_person || ""}
								items={attentionPICList}
								onChangeValue={(val) => setFieldValue("receiving_vessel_contact_person", val)}
								multiple={true}
							/>
						</View>

						<View style={tailwind("mt-5")}>
							<RegularButton
								text="Confirm"
								operation={() => { handleSubmit() }}
							/>
						</View>
					</View>
				)}
			</Formik>

		</Body>
	)
}

export default ProceedSalesConfirmationFinalScreen;