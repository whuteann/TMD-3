import React, { useEffect, useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import InfoDisplayLink from '../../../components/atoms/display/InfoDisplayLink';
import InfoDisplay from '../../../components/atoms/display/InfoDisplay';
import ViewPurchaseVoucherButtons from '../../../components/templates/procurement/ViewPurchaseVoucher.tsx/ViewPurchaseVoucherButtons';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { useTailwind } from 'tailwind-rn/dist';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import { revalidateDocument, useDocument } from '@nandorojo/swr-firestore';
import { PurchaseVoucher } from '../../../types/PurchaseVoucher';
import { PURCHASE_VOUCHERS } from '../../../constants/Firebase';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { openDocument } from '../../../services/StorageServices';
import { useLinkTo } from '@react-navigation/native';
import { View } from 'react-native';
import UploadButton from '../../../components/molecules/buttons/UploadButton';
import { updatePurchaseVoucher } from '../../../services/PurchaseVoucherServices';
import { createAndDisplayPDF, loadPDFLogo } from '../../../functions/PDFv2Functions';
import { generatePurchaseVoucherPDF } from '../../../components/templates/pdf/generatePurchaseVoucherPDF';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { UPDATE_ACTION } from '../../../constants/Action';
import { addCommaNumber } from '../../../helpers/NumericHelper';
import { convertCurrency } from '../../../constants/Currency';

const ViewPurchaseVoucherSummaryScreen = ({ navigation, route }: RootNavigationProps<"ViewPurchaseVoucherSummary">) => {

	const { docID } = route.params
	const tailwind = useTailwind();
	const [status, setStatus] = useState("");
	const linkTo = useLinkTo();
	const user = useSelector(UserSelector);

	const { data } = useDocument<PurchaseVoucher>(`${PURCHASE_VOUCHERS}/${docID}`, {
		ignoreFirestoreDocumentSnapshotField: false,
	})

	useEffect(() => {
		setStatus(data?.status || "");
	}, [data?.status])


	if (!data) return <LoadingData message="This document might not exist" />;

	const onDownload = async () => {
		let image = await loadPDFLogo();
		let html = generatePurchaseVoucherPDF(data, image);
		await createAndDisplayPDF(html);
	}

	let bottom = <ViewPurchaseVoucherButtons
		displayID={data.display_id}
		created_by={data.created_by}
		navID={data.id}
		status={status}
		navigation={navigation}
		setStatus={(val) => setStatus(val)}
		onDownload={onDownload}
	/>;

	return (
		<Body header={<HeaderStack title={"View Purchase Voucher"} navigateProp={navigation} />} style={tailwind("pt-10")}>
			<ViewPageHeaderText doc="Purchase Voucher" id={data.display_id} />

			<View>
				<InfoDisplay placeholder="Purchase Voucher Date" info={data.purchase_voucher_date} />
				<InfoDisplay placeholder="Proforma Invoice Date" info={data.proforma_invoice_date} />
				<InfoDisplay placeholder="Proforma Invoice No." info={data.proforma_invoice_no} />
				<InfoDisplayLink placeholder="Attachment" info={data.proforma_invoice_file} linkOnPress={() => { openDocument(PURCHASE_VOUCHERS, `${data.filename_storage_proforma}`) }} />

				<View style={tailwind("my-5")} >
					<InfoDisplayLink placeholder="Purchase Order No." info={data.purchase_order_secondary_id} linkOnPress={() => { linkTo(`/purchase-orders/${data.purchase_order_id}/show`) }} />

					<InfoDisplay placeholder="Supplier" info={data.supplier.name} />
					<InfoDisplay placeholder="Product" info={data.product.name} />
					<InfoDisplay placeholder="Unit of Measurement" info={data.unit_of_measurement} />
					<InfoDisplay placeholder="Quantity" info={addCommaNumber(data.quantity, "-")} />
					<InfoDisplay placeholder="Unit Price" info={data.unit_price ? `${convertCurrency(data.currency_rate)} ${addCommaNumber(data.unit_price, "-")}` : "-"} />
					<InfoDisplay placeholder="Currency Rate" info={data.currency_rate} />
					<InfoDisplay placeholder="Payment Term" info={data.payment_term} />
					<InfoDisplay placeholder="Mode of Delivery" info={data.delivery_mode} />
					<InfoDisplay placeholder={data.delivery_mode_type} info={data.delivery_mode_details || "-"} />
					<InfoDisplay placeholder="Port" info={data.port} />
					<InfoDisplay placeholder="Delivery Location" info={data.delivery_location} />
					<InfoDisplay placeholder="Contact Person" info={data.contact_person.name} />

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
				</View>

				<InfoDisplay placeholder="Original Amount" info={data.original_amount ? `${convertCurrency(data.currency_rate)} ${addCommaNumber(data.original_amount, "-")}` : ""} />
				<InfoDisplay placeholder="Account Purchase By" info={data.account_purchase_by.name || "-"} />
				<InfoDisplay placeholder="Cheque No." info={data.cheque_no || "-"} />
				<InfoDisplay placeholder="Paid Amount" info={data.paid_amount ? `${convertCurrency(data.currency_rate)} ${addCommaNumber(data.paid_amount, "-")}` : "-"} />

				{
					status == "Rejected"
						?
						<InfoDisplay placeholder="Reject Notes" info={data.reject_notes || "-"} />
						:
						null
				}
				{
					status == "Approved"
						?
						<View style={tailwind("mt-10")}>
							<UploadButton
								buttonText={"Upload DO"}
								path={PURCHASE_VOUCHERS}
								value={data.do_file}
								filename_storage={data.filename_storage_do}
								updateDoc={(filename, filename_storage) => { updatePurchaseVoucher(docID, { do_file: filename, filename_storage_do: filename_storage }, user!, UPDATE_ACTION, () => { revalidateDocument(`${PURCHASE_VOUCHERS}/${docID}`) }, (error) => { console.error(error); }) }}
							/>
							<UploadButton
								buttonText={"Upload Bunker Receiving Noted"}
								path={PURCHASE_VOUCHERS}
								value={data.brn_file}
								filename_storage={data.filename_storage_brn}
								updateDoc={(filename, filename_storage) => { updatePurchaseVoucher(docID, { brn_file: filename, filename_storage_brn: filename_storage }, user!, UPDATE_ACTION, () => { revalidateDocument(`${PURCHASE_VOUCHERS}/${docID}`) }, (error) => { console.error(error); }) }}
							/>
						</View>
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

export default ViewPurchaseVoucherSummaryScreen;