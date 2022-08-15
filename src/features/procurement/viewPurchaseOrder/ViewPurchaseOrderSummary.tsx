import React, { useEffect, useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import InfoDisplayLink from '../../../components/atoms/display/InfoDisplayLink';
import InfoDisplay from '../../../components/atoms/display/InfoDisplay';
import PurchaseOrderButtons from '../../../components/templates/procurement/ViewPurchaseOrder/ViewPurchaseOrderButtons';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { useTailwind } from 'tailwind-rn/dist';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import { useDocument } from '@nandorojo/swr-firestore';
import { PurchaseOrder } from '../../../types/PurchaseOrder';
import { PURCHASE_ORDERS } from '../../../constants/Firebase';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { View } from 'react-native';
import { createAndDisplayPDF, loadPDFLogo } from '../../../functions/PDFv2Functions';
import { generatePurchaseOrderPDF } from '../../../components/templates/pdf/generatePurchaseOrderPDF';
import { addCommaNumber } from '../../../helpers/NumericHelper';
import { convertCurrency } from '../../../constants/Currency';
import Line from '../../../components/atoms/display/Line';

const ViewPurchaseOrderSummaryScreen = ({ navigation, route }: RootNavigationProps<"ViewPurchaseOrderSummary">) => {

	const tailwind = useTailwind();
	const { docID } = route.params
	const [status, setStatus] = useState("");
	let amount_paid_total: number = 0;


	const { data } = useDocument<PurchaseOrder>(`${PURCHASE_ORDERS}/${docID}`, {
		ignoreFirestoreDocumentSnapshotField: false,
		revalidateOnFocus: true,
	})

	useEffect(() => {
		setStatus(data?.status || "");
	}, [data?.status])

	if (!data) return <LoadingData message="This document might not exist" />;

	const onDownload = async () => {
		let image = await loadPDFLogo();
		let html = generatePurchaseOrderPDF(data, image);
		await createAndDisplayPDF(html);
	}

	let bottom;
	bottom = <PurchaseOrderButtons
		displayID={data.secondary_id}
		created_by={data.created_by}
		nav_id={data.id}
		status={status}
		navigation={navigation}
		onDownload={() => { onDownload(); }}
		setStatus={(val) => setStatus(val)}
	/>

	if (data.purchase_vouchers) {
		data.purchase_vouchers.forEach((item) => {
			amount_paid_total = (item.paid_amount ? Number(item.paid_amount) : 0) + amount_paid_total
		});
	}

	return (
		<Body header={<HeaderStack title={"View Purchase Order"} navigateProp={navigation} />} style={tailwind("mt-6")}>

			<ViewPageHeaderText doc="Purchase Order" id={data.display_id} status={status} />

			<View>
				<InfoDisplay placeholder="Purchase Order Date" info={data.purchase_order_date} />
				<InfoDisplayLink placeholder="Procurement No." info={data.procurement_secondary_id} linkOnPress={() => { navigation.navigate("ViewProcurementSummary", { docID: data.procurement_id }) }} />
				<InfoDisplay placeholder="Supplier" info={data.supplier.name} />
				<InfoDisplay placeholder="Product" info={data.product.name} />
				<InfoDisplay placeholder="Unit of Measurement" info={data.unit_of_measurement} />
				<InfoDisplay placeholder="Quantity" info={addCommaNumber(data.quantity, "-")} />
				<InfoDisplay placeholder="Unit Price" info={`${convertCurrency(data.currency_rate)} ${addCommaNumber(data.unit_price, "-")} per ${data.price_unit_of_measurement}`} />
				<InfoDisplay placeholder="Currency Rate" info={data.currency_rate} />
				<InfoDisplay placeholder="Total Amount" info={`${convertCurrency(data.currency_rate)} ${addCommaNumber(data.total_amount, "-")}`} />
				<InfoDisplay placeholder="Payment Term" info={data.payment_term} />
				<InfoDisplay placeholder="Vessel Name" info={data.vessel_name ? data.vessel_name.name : "-"} />

				<InfoDisplay placeholder="Mode of Delivery" info={data.delivery_mode || "-"} />
				<InfoDisplay placeholder={`Supplier ${data.delivery_mode_type}`} info={data.delivery_mode_details || "-"} />
				<InfoDisplay placeholder="Port" info={data.port || "-"} />
				<InfoDisplay placeholder="Delivery Location" info={data.delivery_location || "-"} />
				<InfoDisplay placeholder="Contact Person" info={data.contact_person ? data.contact_person.name : "-"} />

				<InfoDisplay placeholder={`ETA/ Delivery Date`} info={
					data.ETA_delivery_date?.startDate
						?
						data.ETA_delivery_date.endDate
							?
							`${data.ETA_delivery_date?.startDate} to ${data.ETA_delivery_date?.endDate}`
							:
							`${data.ETA_delivery_date.startDate}`
						:
						"-"}
				/>

				<InfoDisplay placeholder="Remarks" info={data.remarks || "-"} />

				{
					data.purchase_vouchers
						?
						<View>
							<Line />
							{
								data.purchase_vouchers.map((item, index) => {
									if (data.purchase_vouchers) {
										let displayID = data.purchase_vouchers[index].secondary_id;
										return (
											<View key={displayID}>
												<InfoDisplayLink
													placeholder={`Purchase Voucher ${index + 1}`}
													info={`${displayID}`}
													linkOnPress={() => {
														navigation.navigate("ViewPurchaseVoucherSummary", { docID: item.id })
													}} />
												<InfoDisplay placeholder="Amount Paid" info={`${convertCurrency(data.currency_rate!)} ${item.paid_amount || "0"}`} />
											</View>

										)
									}
								})
							}
							<View style={tailwind("mb-5")} />

							{
								Number(data.total_amount) - amount_paid_total == 0
									?
									<View>
										<InfoDisplay bold={true} placeholder='Amount Left' info={`${convertCurrency(data.currency_rate!)} ${Number(data.total_amount) - amount_paid_total}`} />
										<InfoDisplay bold={true} placeholder='Payment status' info="complete" />
									</View>
									:
									<InfoDisplay bold={true} placeholder='Amount Left' info={`${convertCurrency(data.currency_rate!)} ${Number(data.total_amount) - amount_paid_total}`} />
							}
						</View>
						:
						null
				}

				{
					status == "Rejected"
						?
						<InfoDisplay placeholder="Reject notes" info={data.reject_notes || "-"} />
						:
						null
				}

				<View style={tailwind("mt-7")}>
					{bottom}
				</View>
			</View>

		</Body>
	)
}

export default ViewPurchaseOrderSummaryScreen;