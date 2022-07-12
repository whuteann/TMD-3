import React, { useEffect, useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import InfoDisplay from '../../../components/atoms/display/InfoDisplay';
import InfoDisplayLink from '../../../components/atoms/display/InfoDisplayLink';
import { revalidateDocument, useDocument } from '@nandorojo/swr-firestore';
import { JobConfirmation } from '../../../types/JobConfirmation';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { useLinkTo } from '@react-navigation/native';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import UploadButton from '../../../components/molecules/buttons/UploadButton';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { useTailwind } from 'tailwind-rn/dist';
import { View } from 'react-native';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import { JOB_CONFIRMATIONS, SALES_CONFIRMATIONS } from '../../../constants/Firebase';
import { updateJobConfirmation } from '../../../services/JobConfirmationServices';
import { openDocument } from '../../../services/StorageServices';
import { createAndDisplayPDF } from '../../../functions/PDFv2Functions';
import { generateJobConfirmationAAPDF } from '../../../components/templates/pdf/generateJobConfirmationAAPDF';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { generateJobConfirmationOPPDF } from '../../../components/templates/pdf/generateJobConfirmationOPPDF';
import { addCommaNumber } from '../../../helpers/NumericHelper';
import { convertCurrency } from '../../../constants/Currency';
import { ACCOUNT_ASSISTANT_ROLE, HEAD_OF_MARKETING_ROLE, MARKETING_EXECUTIVE_ROLE, OPERATION_TEAM_ROLE } from '../../../types/Common';
import { ISSUE_INVOICE } from '../../../permissions/Permissions';

const ViewJobConfirmationSummaryScreen = ({ navigation, route }: RootNavigationProps<"JobConfirmationSummary">) => {

	const tailwind = useTailwind();
	const [uploaded, setUploaded] = useState(false);
	const { docID } = route.params;
	const linkTo = useLinkTo();
	const user = useSelector(UserSelector);
	const [status, setStatus] = useState("");


	const { data } = useDocument<JobConfirmation>(`${JOB_CONFIRMATIONS}/${docID}`, {
		ignoreFirestoreDocumentSnapshotField: false,
		revalidateOnFocus: true,
	})

	useEffect(() => {
		setStatus(data?.status || "");
	}, [data?.status])

	let bunkers = data?.bunker_barges;

	if (!data || !bunkers) return <LoadingData message="This document might not exist" />;

	const onDownload = async () => {
		let html: any;

		if (user?.role == ACCOUNT_ASSISTANT_ROLE) {
			html = generateJobConfirmationAAPDF(data);
		} else if (user?.role == OPERATION_TEAM_ROLE) {
			html = generateJobConfirmationOPPDF(data);
		} else {
			// Should return something else
			html = generateJobConfirmationOPPDF(data);
		}

		await createAndDisplayPDF(html);
	}

	const onDownloadOTVer = async () => {
		let html: any;
		html = generateJobConfirmationOPPDF(data);
		await createAndDisplayPDF(html);
	}

	const onDownloadAAVer = async () => {
		let html: any;
		html = generateJobConfirmationAAPDF(data);
		await createAndDisplayPDF(html);
	}

	let receiving_vessel_contact_people: string = "";
	let contact_persons_list: Array<string> = data?.receiving_vessel_contact_person || [""];

	if (contact_persons_list.length !== 0) {
		contact_persons_list.map((item, index) => {
			receiving_vessel_contact_people = receiving_vessel_contact_people + ((index == 0) ? item : (index + 1 == contact_persons_list.length) ? `, and ${item}` : `, ${item}`)
		})
	} else {
		receiving_vessel_contact_people = "-";
	}

	return (
		<Body header={<HeaderStack title={"View Job Confirmation"} navigateProp={navigation} />} style={tailwind("pt-10")}>

			<ViewPageHeaderText doc="Job Confirmation" id={data.secondary_id} />

			<View>
				<InfoDisplay placeholder="Quotation ID" info={data.quotation_secondary_id} />
				<InfoDisplay placeholder="Confirmed Date" info={data.confirmed_date} />
				<InfoDisplay placeholder="Customer" info={data.customer?.name} />
				<InfoDisplay placeholder={`Customer Address`} info={`${data.customer?.address}`} />
				<InfoDisplay placeholder="Currency Rate" info={data.currency_rate} />

				{
					data.products.map((item, index) => (
						<View key={index}>
							<View style={tailwind("border border-neutral-300 mb-5 mt-3")} />

							<InfoDisplay placeholder={`Product ${index + 1}`} info={item.product.name} bold={true} />
							<InfoDisplay placeholder={`Unit`} info={item.unit} />
							<InfoDisplay
								placeholder={`Price`}
								info={`${convertCurrency(data.currency_rate)} ${addCommaNumber(item.price.value, "0")} per ${item.price.unit}`}
								secondLine={user?.role !== OPERATION_TEAM_ROLE ? item.price.remarks : ""}
							/>
						</View>
					))
				}
				<View style={tailwind("border border-neutral-300 mb-5 mt-3")} />

				<InfoDisplay placeholder="Port" info={data.port || "-"} />
				<InfoDisplay placeholder="Delivery Location" info={data.delivery_location || "-"} />

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

				<InfoDisplay placeholder="Delivery Mode" info={data.delivery_mode || "-"} />
				<InfoDisplay placeholder="Receiving Vessel's Name" info={data.receiving_vessel_name || "-"} />
				<InfoDisplay placeholder="Payment Term" info={data.payment_term || "-"} />
				<InfoDisplay placeholder="Remarks" info={data.remarks_OT || "-"} />
				<InfoDisplay placeholder="Conditions" info={data.conditions || "-"} />
				<InfoDisplay placeholder="Surveyor Contact Person" info={data.surveyor_contact_person || "-"} />
				<InfoDisplay placeholder="Receiving Vessel  Contact Person" info={receiving_vessel_contact_people} />
				<InfoDisplay placeholder="Barging Fee" info={`${data.barging_fee ? `${convertCurrency(data.currency_rate!)} ${addCommaNumber(data.barging_fee, "-")}${data.barging_remark ? `/${data.barging_remark}` : ""}` : `-`}`} />

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

				<InfoDisplay placeholder="Purchase Order No." info={data.purchase_order_no ? data.purchase_order_no : "-"} />
				{
					data.purchase_order_file
						?
						<InfoDisplayLink placeholder="PO Attachment" info={data.purchase_order_file} linkOnPress={() => { openDocument(SALES_CONFIRMATIONS, `${data.filename_storage_po}`) }} />
						:
						<InfoDisplay placeholder="PO Attachment" info={"-"} />
				}

			</View>

			{status == "No Invoice" ? (
				<View>
					<View style={tailwind("mt-5")}>
						<UploadButton
							buttonText="Upload Bunker Delivery Note"
							value={data.bdn_file}
							filename_storage={data.filename_storage_bdn}
							updateDoc={(filename, filename_storage) => {
								updateJobConfirmation(docID, { bdn_file: filename, filename_storage_bdn: filename_storage }, user!, () => {
									revalidateDocument(`${JOB_CONFIRMATIONS}/${docID}`);
								}, (error) => {
									console.error(error);
								})
							}}
							path={JOB_CONFIRMATIONS}
							setUploaded={setUploaded}
						/>
						<View style={tailwind("mt-5")}>
							{
								user?.permission?.includes(ISSUE_INVOICE)
									?
									<RegularButton type={uploaded ? "primary" : "disabled"} text="Proceed Issue Invoice" operation={() => { linkTo(`/invoices/${docID}/create`) }} />
									:
									<></>
							}

						</View>
						{
							user?.role == "Marketing Executive/Marketing Assistant" || user?.role == "Super Admin"
								?
								<View>
									<RegularButton text="Download OT job confirmation" operation={() => { onDownloadOTVer() }} />
									<RegularButton text="Download AA job confirmation" operation={() => { onDownloadAAVer() }} />
								</View>
								:
								<RegularButton text="Download" operation={() => { onDownload() }} />
						}

					</View>
				</View>

			) : (
				<View>
					<InfoDisplayLink placeholder="BDN Attachment" info={data?.bdn_file} linkOnPress={() => { openDocument(JOB_CONFIRMATIONS, `${data?.filename_storage_bdn}`) }} />
					<InfoDisplayLink placeholder="Invoice No." info={data?.invoice_secondary_id} linkOnPress={() => { linkTo(`/invoices/${data?.invoice_id}/show`) }} />
					<InfoDisplay placeholder="Invoice Status" info={data?.invoice_status} />
				</View>
			)}

		</Body>
	)
}

export default ViewJobConfirmationSummaryScreen;