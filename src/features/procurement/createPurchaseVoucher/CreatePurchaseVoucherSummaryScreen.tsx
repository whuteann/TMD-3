import React, { useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import { TickIcon } from '../../../../assets/svg/SVG';
import ConfirmModal from '../../../components/molecules/modal/ConfirmModal';
import InfoDisplay from '../../../components/atoms/display/InfoDisplay';
import InfoDisplayLink from '../../../components/atoms/display/InfoDisplayLink';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { useTailwind } from 'tailwind-rn/dist';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import { revalidateCollection, useDocument } from '@nandorojo/swr-firestore';
import { PurchaseVoucher } from '../../../types/PurchaseVoucher';
import { PURCHASE_ORDERS, PURCHASE_VOUCHERS } from '../../../constants/Firebase';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { View } from 'react-native';
import { openDocument } from '../../../services/StorageServices';
import { confirmPurchaseVoucher } from '../../../services/PurchaseVoucherServices';
import { useLinkTo } from '@react-navigation/native';
import { DRAFT, HEAD_OF_ACCOUNTS_ROLE, REJECTED, REVISED_CODE, SUPER_ADMIN_ROLE } from '../../../types/Common';
import Unauthorized from '../../../components/atoms/unauthorized/Unauthorized';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { addCommaNumber } from '../../../helpers/NumericHelper';
import { convertCurrency } from '../../../constants/Currency';
import { sendNotifications } from '../../../services/NotificationServices';


const CreatePurchaseVoucherSummaryScreen = ({ navigation, route }: RootNavigationProps<"CreatePurchaseVoucherSummary">) => {

	const [modalOpen, setModalOpen] = useState(false);
	const tailwind = useTailwind();
	const linkTo = useLinkTo();
	const user = useSelector(UserSelector);
	const { docID } = route.params;
	let displayID = "";
	let revisedCode;
	const allowedStatuses = [DRAFT, REJECTED];

	const { data } = useDocument<PurchaseVoucher>(`${PURCHASE_VOUCHERS}/${docID}`, {
		ignoreFirestoreDocumentSnapshotField: false,
		revalidateOnFocus: true,
	})

	if (!data) return <LoadingData message="This document might not exist" />;

	if (!allowedStatuses.includes(data?.status!)) {
		return <Unauthorized />;
	}

	revisedCode = data.revised_code !== undefined ? Number(data.revised_code) + 1 : 0
	displayID = `${data.secondary_id}${data.revised_code !== undefined ? REVISED_CODE(revisedCode) : ""}`;

	let modal = (
		<ConfirmModal
			text1={`Purchase Voucher “${displayID}” has submitted to HOA`}
			text2=""
			downloadButton={false}
			horizontalButtons={false}
			image={<TickIcon height={100} width={100} />}
			button1Text="Done"
			visible={modalOpen}
			setModalClose={() => { setModalOpen(false) }}
			nextAction={() => {
				confirmPurchaseVoucher(data.purchase_order_id, data.id, displayID, revisedCode, user!, () => {

					sendNotifications(
						[HEAD_OF_ACCOUNTS_ROLE, SUPER_ADMIN_ROLE],
						revisedCode > 0
							?
							`Purchase voucher ${data.display_id} updated by ${user?.name}.`
							:
							`Purchase voucher ${data.display_id} submitted for approval by ${user?.name}.`,
						{ screen: "ViewPurchaseVoucherSummary", docID: docID });

					revalidateCollection(PURCHASE_ORDERS);
					revalidateCollection(PURCHASE_VOUCHERS);
					navigation.navigate("Dashboard");
				}, () => {
					console.error("error");
				});
			}}
			cancelAction={() => { navigation.navigate("Dashboard"); }}
		/>
	);

	return (
		<Body header={<HeaderStack title={"Create Purchase Voucher"} navigateProp={navigation} />} style={tailwind("pt-10")}>
			{modal}
			<ViewPageHeaderText doc="Purchase Voucher" id={displayID} />

			<View>
				<InfoDisplay placeholder="Purchase Voucher Date" info={data.purchase_voucher_date} />
				<InfoDisplay placeholder="Proforma Invoice Date" info={data.proforma_invoice_date} />
				<InfoDisplay placeholder="Proforma Invoice No." info={data.proforma_invoice_no} />
				<InfoDisplayLink placeholder="Attachment" info={data.proforma_invoice_file} linkOnPress={() => { openDocument(PURCHASE_VOUCHERS, `${data.filename_storage_proforma}`) }} />

				<View style={tailwind("my-5")} >
					<InfoDisplayLink placeholder="Purchase Order No." info={data.purchase_order_secondary_id} linkOnPress={() => { linkTo(`/purchase-orders/${data.purchase_order_id}/preview`) }} />

					<InfoDisplay placeholder="Supplier" info={data.supplier.name || "-"} />
					<InfoDisplay placeholder="Product" info={data.product.name || "-"} />
					<InfoDisplay placeholder="Unit of Measurement" info={data.unit_of_measurement || "-"} />
					<InfoDisplay placeholder="Quantity" info={addCommaNumber(data.quantity, "-")} />
					<InfoDisplay placeholder="Unit Price" info={`${convertCurrency(data.currency_rate)} ${addCommaNumber(data.unit_price, "-")}`} />
					<InfoDisplay placeholder="Currency Rate" info={data.currency_rate || "-"} />
					<InfoDisplay placeholder="Payment Term" info={data.payment_term || "-"} />
					<InfoDisplay placeholder="Mode of Delivery" info={data.delivery_mode || "-"} />
					<InfoDisplay placeholder={data.delivery_mode_type} info={data.delivery_mode_details || "-"} />
					<InfoDisplay placeholder="Port" info={data.port || "-"} />
					<InfoDisplay placeholder="Delivery Location" info={data.delivery_location || "-"} />
					<InfoDisplay placeholder="Contact Person" info={data.contact_person.name || "-"} />

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

				<InfoDisplay placeholder="Original Amount" info={data.original_amount ? `${convertCurrency(data.currency_rate)} ${addCommaNumber(data.original_amount, "-")}` : "-"} />
				<InfoDisplay placeholder="Account Purchase By" info={data.account_purchase_by.name || "-"} />
				<InfoDisplay placeholder="Cheque No." info={data.cheque_no || "-"} />
				<InfoDisplay placeholder="Paid Amount" info={data.paid_amount ? `${convertCurrency(data.currency_rate)} ${addCommaNumber(data.paid_amount, "-")}` : "-"} />


				<View style={tailwind("mt-7")}>
					<RegularButton text="Submit" operation={() => { setModalOpen(true) }} />
					<RegularButton text="Cancel" type="secondary" operation={() => { navigation.navigate("Dashboard") }} />
				</View>
			</View>
		</Body>
	)
}

export default CreatePurchaseVoucherSummaryScreen;