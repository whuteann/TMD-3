import React from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import InfoDisplay from '../../../components/atoms/display/InfoDisplay';
import InfoDisplayLink from '../../../components/atoms/display/InfoDisplayLink';
import { useDocument } from '@nandorojo/swr-firestore';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { useLinkTo } from '@react-navigation/native';
import { SalesConfirmation } from '../../../types/SalesConfirmation';
import { SALES_CONFIRMATIONS } from '../../../constants/Firebase';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { useTailwind } from 'tailwind-rn/dist';
import { View } from 'react-native';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import { openDocument } from '../../../services/StorageServices';
import { createAndDisplayPDF, loadPDFLogo } from '../../../functions/PDFv2Functions';
import { generateSalesConfirmationPDF } from '../../../components/templates/pdf/generateSalesConfirmationPDF';
import { addCommaNumber } from '../../../helpers/NumericHelper';
import { convertCurrency } from '../../../constants/Currency';


const ViewSalesConfirmationSummaryScreen = ({ navigation, route }: RootNavigationProps<"SalesConfirmationSummary">) => {
	const docID = route.params.docID;
	const tailwind = useTailwind();
	const linkTo = useLinkTo();

	const { data: sales } = useDocument<SalesConfirmation>(`${SALES_CONFIRMATIONS}/${docID}`, {
		ignoreFirestoreDocumentSnapshotField: false,
	})

	let bunkers = sales?.bunker_barges;

	if (!sales || !bunkers) return <LoadingData message="This document might not exist" />;
	const quotationID = sales.quotation_id

	let receiving_vessel_contact_people: string = "";
	let contact_persons_list: Array<string> = sales.receiving_vessel_contact_person || [];

	if (contact_persons_list.length !== 0) {
		contact_persons_list.map((item, index) => {
			receiving_vessel_contact_people = receiving_vessel_contact_people + ((index == 0) ? item : (index + 1 == contact_persons_list.length) ? `, and ${item}` : `, ${item}`)
		})
	} else {
		receiving_vessel_contact_people = "-";
	}

	const onDownload = async () => {
		let image = await loadPDFLogo();
		let html = generateSalesConfirmationPDF(sales!, image);
		await createAndDisplayPDF(html);
	}

	return (
		<Body header={<HeaderStack title={"Sales Confirmation"} navigateProp={navigation} />} style={tailwind("pt-10")}>

			<ViewPageHeaderText doc="Sales Confirmation" id={sales.secondary_id} />

			{/* 1200 */}
			<View>
				<InfoDisplayLink placeholder="Quotation No." info={sales.quotation_secondary_id} linkOnPress={() => { linkTo(`/quotations/${quotationID}/show`) }} />

				<InfoDisplay placeholder={`Quotation Date`} info={sales.quotation_date} />
				<InfoDisplay placeholder={`Customer`} info={sales.customer?.name} />
				<InfoDisplay placeholder={`Customer Address`} info={`${sales.customer?.address}`} />
				<InfoDisplay placeholder={`Port`} info={sales.port || "-"} />
				<InfoDisplay placeholder={`Delivery Location`} info={sales.delivery_location || "-"} />
				<InfoDisplay placeholder={`Mode of Delivery`} info={sales.delivery_mode || "-"} />

				<InfoDisplay placeholder={`Delivery Date`} info={
					sales.delivery_date?.startDate
						?
						sales.delivery_date.endDate
							?
							`${sales.delivery_date?.startDate} to ${sales.delivery_date?.endDate}`
							:
							`${sales.delivery_date.startDate}`
						:
						"-"}
				/>
				<InfoDisplay placeholder={`Currency rate`} info={sales.currency_rate || "-"} />

				{
					sales.products.map((item, index) => (
						<View key={index}>
							<View style={tailwind("border border-neutral-300 mb-5 mt-3")} />
							<InfoDisplay placeholder={`Product ${index + 1}`} info={item.product.name} bold={true} />
							<InfoDisplay placeholder={`Unit of measurement`} info={item.unit} />
							<InfoDisplay
								placeholder={`Price`}
								info={`${convertCurrency(sales.currency_rate)}${addCommaNumber(item.price.value, "0")} per ${item.price.unit}`}
								secondLine={item.price.remarks} />
						</View>
					))
				}
				<View style={tailwind("border border-neutral-300 mb-5 mt-3")} />

				<InfoDisplay placeholder={`Barging Fee`} info={`${sales.barging_fee ? `${convertCurrency(sales.currency_rate!)}${addCommaNumber(sales.barging_fee, "-")}${sales.barging_remark ? `/${sales.barging_remark}` : ""}` : `-`}`} />
				<InfoDisplay placeholder={`Barging Unit`} info={`${sales.barging_unit || "-"}`} />
				<InfoDisplay placeholder={`Conversion Factor`} info={sales.conversion_factor || "-"} />
				<InfoDisplay placeholder={`Payment Term`} info={sales.payment_term || "-"} />
				<InfoDisplay placeholder={`Validity`} info={`Date: ${sales.validity_date == "--Select Date--" ? "-" : sales.validity_date}, Time: ${sales.validity_time}`} />

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

				<InfoDisplay placeholder={`Remarks`} info={sales.remarks || "-"} />
				<InfoDisplay placeholder={`Remarks for Operation Team`} info={sales.remarks_OT || "-"} />
				<InfoDisplay placeholder={`Conditions`} info={sales.conditions || "-"} />
				<InfoDisplay placeholder={`Surveyor Contact Person`} info={sales.surveyor_contact_person || "-"} />
				<InfoDisplay placeholder={`Receiving Vessel Contact Person`} info={`${receiving_vessel_contact_people}`} />
				{sales.purchase_order_file ? (
					<View>
						<InfoDisplay placeholder="Purchase Order No." info={sales.purchase_order_no || "-"} />
						<InfoDisplayLink placeholder="PO attachment" info={sales.purchase_order_file} linkOnPress={() => { openDocument(SALES_CONFIRMATIONS, `${sales.filename_storage}` || "") }} />
					</View>)
					:
					(<InfoDisplay placeholder="PO attachment" info="N/A" />)
				}

			</View>
			<View style={tailwind("mt-10")} />
			<RegularButton text='Download' operation={() => { onDownload() }} />
		</Body>
	)
}

export default ViewSalesConfirmationSummaryScreen;