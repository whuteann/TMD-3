import React, { useEffect, useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import InfoDisplay from '../../../components/atoms/display/InfoDisplay';
import InfoDisplayLink from '../../../components/atoms/display/InfoDisplayLink';
import ViewSparesPurchaseOrderButtons from '../../../components/templates/procurement/ViewSparesPurchaseOrder/ViewSparesPurchaseOrderButtons';
import Body from '../../../components/atoms/display/Body';
import { useTailwind } from 'tailwind-rn/dist';
import { useDocument } from '@nandorojo/swr-firestore';
import { SparesPurchaseOrder } from '../../../types/SparesPurchaseOrder';
import { SPARES_PURCHASE_ORDERS } from '../../../constants/Firebase';
import LoadingData from '../../../components/atoms/loading/loadingData';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import { useLinkTo } from '@react-navigation/native';
import { APPROVED_DOC, DOC_SUBMITTED, PV_ISSUED, PV_PENDING, REJECTED, VERIFIED_DOC } from '../../../types/Common';
import { View } from 'react-native';
import { openDocument } from '../../../services/StorageServices';
import { createAndDisplayPDF, loadPDFLogo } from '../../../functions/PDFv2Functions';
import { generateSparesPurchaseOrderPDF } from '../../../components/templates/pdf/generateSparesPurchaseOrderPDF';
import { addCommaNumber } from '../../../helpers/NumericHelper';
import { convertCurrency } from '../../../constants/Currency';

const ViewSparesPurchaseOrderSummaryScreen = ({ navigation, route }: RootNavigationProps<"ViewSparesPurchaseOrderSummary">) => {
	const { docID } = route.params;
	const linkTo = useLinkTo();
	const tailwind = useTailwind();
	const [status, setStatus] = useState('');

	const { data } = useDocument<SparesPurchaseOrder>(`${SPARES_PURCHASE_ORDERS}/${docID}`, {
		ignoreFirestoreDocumentSnapshotField: false,
		revalidateOnFocus: true,
	})

	useEffect(() => {
		setStatus(data?.status || "");
	}, [data?.status])


	if (!data) return <LoadingData message="This document might not exist" />;

	const onDownload = async () => {
		let image = await loadPDFLogo();
		let html = generateSparesPurchaseOrderPDF(data, image);
		await createAndDisplayPDF(html);
	}

	let bottom = <ViewSparesPurchaseOrderButtons
		created_by={data.created_by}
		display_id={data.display_id}
		nav_id={data.id}
		status={status}
		navigation={navigation}
		totalAmount={Number(data.total_amount)}
		setStatus={(val) => setStatus(val)}
		doFile={data.doFile}
		filename_storage_do={data.filename_storage_do}
		invFile={data.invFile}
		invNo={data.invNumber}
		filename_storage_inv={data.filename_storage_inv}
		onDownload={() => { onDownload(); }}
	/>


	return (
		<Body header={<HeaderStack title={"View Purchase Order"} navigateProp={navigation} />} style={tailwind("mt-6")}>
			<ViewPageHeaderText doc="Purchase Order" id={data.display_id} status={status} />

			<View>
				<InfoDisplay placeholder="Purchase Order Date" info={data.purchase_order_date} />
				<InfoDisplayLink placeholder="Procurement No." info={data.spares_procurement_secondary_id} linkOnPress={() => { linkTo(`/spares-procurements/${data.spares_procurement_id}/show`) }} />

				<View>
					<InfoDisplay placeholder="Supplier" info={data.supplier.name || "-"} />
					<InfoDisplay placeholder="Product" info={data.product.product_description || "-"} />
					<InfoDisplay placeholder="Unit of Measurement" info={data.unit_of_measurement || "-"} />
					<InfoDisplay placeholder="Quantity" info={addCommaNumber(data.quantity, "-")} />
					<InfoDisplay placeholder="Unit Price" info={data.unit_price ? `${convertCurrency(data.currency_rate)} ${addCommaNumber(data.unit_price, "-")}` : "-"} />
					<InfoDisplay placeholder="Currency Rate" info={data.currency_rate || "-"} />
					<InfoDisplay placeholder="Type of Supply" info={data.type_of_supply || "-"} />
					<InfoDisplay placeholder="Total Amount" info={`${convertCurrency(data.currency_rate)} ${addCommaNumber(`${Number(data.quantity) * Number(data.unit_price)}`, "-")}`} />
					<InfoDisplay placeholder="Payment Term" info={data.payment_term || "-"} />
					<InfoDisplay placeholder="Vessel Name" info={data.vessel_name ? data.vessel_name.name : "-"} />
					<InfoDisplay placeholder="Port" info={data.port || "-"} />
					<InfoDisplay placeholder="Delivery Location" info={data.delivery_location || "-"} />
					<InfoDisplay placeholder="Contact Person" info={data.contact_person ? data.contact_person.name : "-"} />
					<InfoDisplay placeholder="ETA/ Delivery Date" info={data.ETA_delivery_date || "-"} />
					<InfoDisplay placeholder="Remarks" info={data.remarks || "-"} />
					{
						data.spares_purchase_vouchers
							?
							<View>
								{
									data.spares_purchase_vouchers.map((item, index) => {
										return <InfoDisplayLink key={item.id} placeholder={`Purchase Voucher ${index + 1}`} info={item.secondary_id} linkOnPress={() => { navigation.navigate("ViewSparesPurchaseVoucherSummary", { docID: item.id }) }} />
									})
								}
							</View>
							:
							<></>
					}
					{
						(data.doFile || data.invFile) && (status == VERIFIED_DOC || status == APPROVED_DOC || status == PV_PENDING || status == PV_ISSUED || status == DOC_SUBMITTED)
							?
							<View>
								<InfoDisplay placeholder="Delivery Note No." info={data.doNumber || "-"} />
								<InfoDisplayLink placeholder="DO Attachment" info={data.doFile} linkOnPress={() => { openDocument(SPARES_PURCHASE_ORDERS, data.filename_storage_do) }} />
								<InfoDisplay placeholder="Invoice No." info={data.invNumber || "-"} />
								{
									data.invFile
										?
										<InfoDisplayLink placeholder="Invoice Attachment" info={data.invFile} linkOnPress={() => { openDocument(SPARES_PURCHASE_ORDERS, data.filename_storage_inv) }} />
										:
										<InfoDisplay placeholder="Invoice Attachment" info={"-"} />
								}
							</View>
							:
							<></>
					}
					{
						status == REJECTED
							?
							<InfoDisplay placeholder="Reject Notes" info={data.reject_notes || "-"} />
							:
							<></>
					}
				</View>
			</View>


			<View style={tailwind("mt-5")} />
			{bottom}

		</Body>
	)
}

export default ViewSparesPurchaseOrderSummaryScreen;