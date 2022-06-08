import React, { useEffect, useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import ViewQuotationButtons from '../../../components/templates/sales/ViewQuotation/ViewQuotationButtons';
import InfoDisplay from '../../../components/atoms/display/InfoDisplay';
import InfoDisplayLink from '../../../components/atoms/display/InfoDisplayLink';
import PriceDisplay from '../../../components/templates/sales/ViewQuotation/PriceDisplay';
import { useCollection, useDocument } from '@nandorojo/swr-firestore';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { useLinkTo } from '@react-navigation/native';
import { Quotation } from '../../../types/Quotation';
import { useTailwind } from 'tailwind-rn/dist';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { View } from 'react-native';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import { createAndDisplayPDF, loadPDFLogo } from '../../../functions/PDFv2Functions';
import { generatePDFQuotation } from '../../../components/templates/pdf/generateQuotationPDF';
import { generateProductDisplay } from '../../../helpers/QuotationHelper';
import { RFQ } from '../../../types/RFQ';
import { QUOTATIONS, RFQS } from '../../../constants/Firebase';
import { addCommaNumber } from '../../../helpers/NumericHelper';
import { convertCurrency } from '../../../constants/Currency';

const ViewQuotationSummaryScreen = ({ navigation, route }: RootNavigationProps<"ViewQuotationSummary">) => {

	const tailwind = useTailwind();
	const docID = route.params.docID;
	const linkTo = useLinkTo();
	const [status, setStatus] = useState("");
	const [uploaded, setUploaded] = useState(false);
	const [deletedItems, setDeleteItems] = useState<Array<string>>([]);
	const [updatedProducts, setUpdatedProducts] = useState<Array<{ name: string, unit: string, prices: Array<{ value: string, unit: string }> }>>();

	const saveDeletedProducts = (deletedProduct: string) => {
		let newList = deletedItems;
		newList.push(deletedProduct);
		setDeleteItems([...newList]);
	}

	const { data } = useDocument<Quotation>(`${QUOTATIONS}/${docID}`, {
		ignoreFirestoreDocumentSnapshotField: false,
		revalidateOnFocus: true,
	})

	const { data: rfqs } = useCollection<RFQ>(`${RFQS}`, {
		ignoreFirestoreDocumentSnapshotField: false,
		where: ["deleted", "==", false]
	})

	useEffect(() => {
		setStatus(data?.status || "");
	}, [data?.status])

	useEffect(() => {
		setUploaded(data?.purchase_order_file ? true : false);
	}, [data?.purchase_order_file])

	const ports = data?.ports;
	const bunkers = data?.bunker_barges;
	const delivery_modes = data?.delivery_modes

	if (!data || !rfqs || !ports || !delivery_modes) return <LoadingData message="This document might not exist" />;

	const productsDisplayList: Array<{ name: string, unit: string, prices: Array<{ value: string, unit: string }> }> = generateProductDisplay(data.products);

	const onDownload = async () => {
		let image = await loadPDFLogo();
		let html = generatePDFQuotation(data, image);
		await createAndDisplayPDF(html);
	}

	let bottom;
	bottom =
		<ViewQuotationButtons
			docID={docID}
			created_by={data.created_by}
			salesID={`${data.sales_confirmation_id}`}
			jobConfirmationID={`${data.job_confirmation_id}`}
			jobID={`${data.sales_id}`}
			displayID={data.display_id}
			rfqs={rfqs}
			status={status}
			uploaded={uploaded}
			navigation={navigation}
			setUploaded={setUploaded}
			setStatus={(status) => setStatus(status)}
			deletedItems={deletedItems}
			productList={data.products || []}
			purchaseOrder={data.purchase_order_file || ""}
			purchaseOrderNo={data.purchase_order_no || ""}
			filename_storage={data.filename_storage || ""}
			onDownload={onDownload}
		/>

	return (
		<Body header={<HeaderStack title={"Create Quotation"} navigateProp={navigation} />} style={tailwind("pt-10")}>
			<ViewPageHeaderText doc="Quotation" id={`${data.display_id}`} status={status} />

			<View>
				<InfoDisplay placeholder={`Quotation Date`} info={`${data.quotation_date}`} />
				<InfoDisplay placeholder={`Customer`} info={`${data.customer?.name}`} />
				<InfoDisplay placeholder={`Customer Address`} info={`${data.customer?.address}`} />

				{
					ports.map((item, index) => {
						return (
							<View key={item.port}>
								<View style={tailwind("border border-neutral-300 mb-5 mt-2")} />
								<InfoDisplay placeholder={`Port ${index + 1}`} info={`${item.port || "-"}`} bold={true} />
								<InfoDisplay placeholder={`Delivery Location`} info={`${item.delivery_location || "-"}`} />
							</View>
						)
					})
				}

				<View style={tailwind("border border-neutral-300 mb-5 mt-2")} />

				<InfoDisplay placeholder={`Delivery Date`} info={`${data.delivery_date?.startDate ? `${data.delivery_date?.startDate} to ${data.delivery_date?.endDate}` : "-"}`} />
				{
					delivery_modes.map((item, index) => {
						return (
							<View key={item}>
								<InfoDisplay placeholder={`Delivery Mode ${index + 1}`} info={`${item}` || "-"} bold={true} />
							</View>
						)
					})
				}
				<InfoDisplay placeholder={`Currency Rate`} info={data.currency_rate || "-"} />

				{
					bunkers
						? (
							<View>
								<View style={tailwind("border border-neutral-300 mb-5 mt-2")} />
								{bunkers.map((item, index) => {
									return (
										<View key={item.id}>
											<InfoDisplay placeholder={`Bunker Barge ${index + 1}`} info={`${item.name}` || "-"} bold={true} />
											<InfoDisplay placeholder={`Capacity`} info={`${addCommaNumber(item.capacity, "0")}` || "-"} />
										</View>
									)
								})}
								<View style={tailwind("border border-neutral-300 mb-5 mt-2")} />
							</View>
						)
						:
						<InfoDisplay placeholder={`Bunker Barge(s)`} info={"-"} />
				}

				<InfoDisplay placeholder={`Receiving Vessel's Name`} info={`${data.receiving_vessel_name || "-"}`} />
				<InfoDisplay placeholder={`Remarks`} info={`${data.remarks || "-"}`} />
				<InfoDisplay placeholder={`Barging Fee`} info={`${data.barging_fee ? `${convertCurrency(data.currency_rate!)} ${addCommaNumber(data.barging_fee, "-")}${data.barging_remark ? `/${data.barging_remark}` : ""}` : `-`}`} />
				<InfoDisplay placeholder={`Conversion Factor`} info={`${data.conversion_factor || "-"}`} />

				{
					status == "Confirmed"
						?
						(
							<View>
								<InfoDisplayLink placeholder={`Sales Confirmation No.`} info={data.sales_confirmation_secondary_id} linkOnPress={() => { linkTo(`/sales-confirmation/${data.sales_confirmation_id}/show`) }} />
								<InfoDisplay placeholder={`Confirmation Date`} info={data.confirmed_date} />
							</View>
						)
						:
						null
				}

				{
					updatedProducts
						?
						updatedProducts.map(
							(item, index) => (
								<PriceDisplay
									key={index}
									product={item.name}
									currency={convertCurrency(data.currency_rate!)}
									unit={item.unit}
									prices={item.prices}
									length={updatedProducts.length}
									index={index}
									status={status}
									products={productsDisplayList}
									deleteAProduct={(deleted) => { saveDeletedProducts(deleted) }}
									setProducts={(val) => { setUpdatedProducts(val) }}
								/>
							)
						)
						:
						productsDisplayList.map(
							(item, index) => (
								<PriceDisplay
									key={index}
									product={item.name}
									currency={convertCurrency(data.currency_rate!)}
									unit={item.unit}
									prices={item.prices}
									index={index}
									status={status}
									products={productsDisplayList}
									deleteAProduct={(deleted) => { saveDeletedProducts(deleted) }}
									setProducts={(val) => { setUpdatedProducts(val) }}
								/>
							)
						)
				}

				<View style={tailwind("border border-neutral-300 mb-5 mt-3")} />

				<InfoDisplay placeholder={`Payment Term`} info={`${data.payment_term || "-"}`} />
				<InfoDisplay placeholder={`Validity`} info={`Date: ${data.validity_date == "" ? "-" : data.validity_date}`} />
				<InfoDisplay placeholder={``} info={`Time: ${data.validity_time || "-"}`} />

				{
					status == "Rejected"
						?
						(<InfoDisplay placeholder={`Reject Notes from HOM`} info={data.reject_notes || "-"} />)
						:
						null
				}
			</View>

			{
				status == "Approved" || status == "Confirmed"
					?
					(
						<View>
							{bottom}
						</View>
					)
					:
					(
						<View style={tailwind("mt-10")}>
							{bottom}
						</View>
					)
			}

		</Body>
	)
}

export default ViewQuotationSummaryScreen;