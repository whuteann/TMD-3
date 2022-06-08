import React, { useEffect, useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import InfoDisplay from '../../../components/atoms/display/InfoDisplay';
import InfoDisplayLink from '../../../components/atoms/display/InfoDisplayLink';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { useTailwind } from 'tailwind-rn/dist';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import { useDocument } from '@nandorojo/swr-firestore';
import { SPARES_PURCHASE_VOUCHERS } from '../../../constants/Firebase';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { View } from 'react-native';
import { useLinkTo } from '@react-navigation/native';
import { SparesPurchaseVoucher } from '../../../types/SparesPurchaseVoucher';
import ViewSparesPurchaseVoucherButtons from '../../../components/templates/procurement/ViewPurchaseVoucher.tsx/ViewSparesPurchaseVoucherButtons';
import { REJECTED } from '../../../types/Common';
import { createAndDisplayPDF, loadPDFLogo } from '../../../functions/PDFv2Functions';
import { generateSparesPurchaseVoucherPDF } from '../../../components/templates/pdf/generateSparesPurchaseVoucherPDF';
import { convertCurrency } from '../../../constants/Currency';
import { addCommaNumber } from '../../../helpers/NumericHelper';


const ViewSparesPurchaseVoucherSummaryScreen = ({ navigation, route }: RootNavigationProps<"ViewSparesPurchaseVoucherSummary">) => {

	const tailwind = useTailwind();
	const linkTo = useLinkTo();
	const { docID } = route.params;
	const [status, setStatus] = useState("");

	const { data } = useDocument<SparesPurchaseVoucher>(`${SPARES_PURCHASE_VOUCHERS}/${docID}`, {
		ignoreFirestoreDocumentSnapshotField: false,
		revalidateOnFocus: true,
	})

	useEffect(() => {
		setStatus(data?.status || "");
	}, [data?.status])

	if (!data) return <LoadingData message="This document might not exist" />;

	const onDownload = async () => {
		let image = await loadPDFLogo();
		let html = generateSparesPurchaseVoucherPDF(data, image);
		await createAndDisplayPDF(html);
	}

	let buttons = <ViewSparesPurchaseVoucherButtons
		displayID={data.display_id}
		created_by={data.created_by}
		product={data.product}
		unit_price={data.unit_price}
		navID={data.id}
		status={status}
		navigation={navigation}
		setStatus={(val) => setStatus(val)}
		onDownload={() => onDownload()}
	/>;

	return (
		<Body header={<HeaderStack title={"View Purchase Voucher"} navigateProp={navigation} />} style={tailwind("pt-10")}>

			<ViewPageHeaderText doc="Purchase Voucher" id={data.display_id} />

			<View>
				<InfoDisplay placeholder="Purchase Voucher Date" info={data.purchase_voucher_date} />
				<InfoDisplay placeholder="Delivery Note No." info={data.doNumber} />
				<InfoDisplay placeholder="Invoice No." info={data.invNumber} />

				<View style={tailwind("my-5")} >
					<InfoDisplayLink placeholder="Purchase Order No." info={data.spares_purchase_order_secondary_id} linkOnPress={() => { linkTo(`/spares-purchase-orders/${data.spares_purchase_order_id}/show`) }} />

					<InfoDisplay placeholder="Supplier" info={data.supplier.name} />
					<InfoDisplay placeholder="Product" info={data.product.product_description} />
					<InfoDisplay placeholder="Unit of Measurement" info={data.unit_of_measurement} />
					<InfoDisplay placeholder="Quantity" info={data.quantity} />
					<InfoDisplay placeholder="Unit Price" info={data.unit_price ? `${convertCurrency(data.currency_rate)} ${addCommaNumber(data.unit_price, "-")}` : "-"} />
					<InfoDisplay placeholder="Currency Rate" info={data.currency_rate} />
					<InfoDisplay placeholder="Payment Term" info={data.payment_term} />
					<InfoDisplay placeholder="Vessel Name" info={data.vessel_name ? data.vessel_name.name : "-"} />
					<InfoDisplay placeholder="Type of Supply" info={data.type_of_supply} />
					<InfoDisplay placeholder="Delivery Location" info={data.delivery_location} />
					<InfoDisplay placeholder="Contact Person" info={data.contact_person.name} />
					<InfoDisplay placeholder="ETA/ Delivery Date" info={data.ETA_delivery_date} />
					<InfoDisplay placeholder="Remarks" info={data.remarks || "-"} />
				</View>

				<InfoDisplay placeholder="Original Amount" info={data.original_amount ? `${convertCurrency(data.currency_rate)} ${addCommaNumber(data.original_amount, "-")}` : "-"} />
				<InfoDisplay placeholder="Account Purchase By" info={data.account_purchase_by.name || "-"} />
				<InfoDisplay placeholder="Cheque No." info={data.cheque_no || "-"} />
				<InfoDisplay placeholder="Paid Amount" info={data.paid_amount ? `${convertCurrency(data.currency_rate)} ${addCommaNumber(data.paid_amount, "-")}` : "-"} />
				{
					status == REJECTED
						?
						<InfoDisplay placeholder="Reject Notes" info={data.reject_notes || "-"} />
						:
						null
				}

				<View style={tailwind("mt-7")}>
					{buttons}
				</View>
			</View>
		</Body>
	)
}

export default ViewSparesPurchaseVoucherSummaryScreen;