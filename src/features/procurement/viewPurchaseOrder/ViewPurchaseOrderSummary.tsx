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

const ViewPurchaseOrderSummaryScreen = ({ navigation, route }: RootNavigationProps<"ViewPurchaseOrderSummary">) => {

	const tailwind = useTailwind();
	const { docID } = route.params
	const [status, setStatus] = useState("");


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
				<InfoDisplay placeholder="Unit Price" info={`${convertCurrency(data.currency_rate)} ${addCommaNumber(data.unit_price, "-")}`} />
				<InfoDisplay placeholder="Currency Rate" info={data.currency_rate} />
				<InfoDisplay placeholder="Total Amount" info={`${convertCurrency(data.currency_rate)} ${addCommaNumber(data.total_amount, "-")}`} />
				<InfoDisplay placeholder="Payment Term" info={data.payment_term} />
				<InfoDisplay placeholder="Vessel Name" info={data.vessel_name ? data.vessel_name.name : "-"} />

				<InfoDisplay placeholder="Mode of Delivery" info={data.delivery_mode || "-"} />
				<InfoDisplay placeholder={`Supplier ${data.delivery_mode_type}`} info={data.delivery_mode_details || "-"} />
				<InfoDisplay placeholder="Port" info={data.port || "-"} />
				<InfoDisplay placeholder="Delivery Location" info={data.delivery_location || "-"} />
				<InfoDisplay placeholder="Contact Person" info={data.contact_person ? data.contact_person.name : "-"} />
				<InfoDisplay placeholder="ETA/ Delivery Date" info={data.ETA_delivery_date ? `${data.ETA_delivery_date.startDate} to ${data.ETA_delivery_date.endDate}` : "-"} />
				<InfoDisplay placeholder="Remarks" info={data.remarks || "-"} />
				{
					data.purchase_vouchers
						?
						<View>
							{
								data.purchase_vouchers.map((item, index) => {
								return <InfoDisplayLink key={item.id} placeholder={`Purchase Voucher ${index + 1}`} info={item.secondary_id} linkOnPress={() => { navigation.navigate("ViewPurchaseVoucherSummary", { docID: item.id }) }} />
								})
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