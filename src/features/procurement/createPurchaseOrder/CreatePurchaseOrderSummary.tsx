import React, { useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import ConfirmModal from '../../../components/molecules/modal/ConfirmModal';
import { TickIcon } from '../../../../assets/svg/SVG';
import InfoDisplay from '../../../components/atoms/display/InfoDisplay';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { useTailwind } from 'tailwind-rn/dist';
import { revalidateCollection, useDocument } from '@nandorojo/swr-firestore';
import { PurchaseOrder } from '../../../types/PurchaseOrder';
import { PROCUREMENTS, PURCHASE_ORDERS } from '../../../constants/Firebase';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { updatePurchaseOrder } from '../../../services/PurchaseOrderServices';
import { View } from 'react-native';
import { updateProcurement } from '../../../services/ProcurementServices';
import InfoDisplayLink from '../../../components/atoms/display/InfoDisplayLink';
import { useLinkTo } from '@react-navigation/native';
import { DRAFT, HEAD_OF_MARKETING_ROLE, IN_REVIEW, REJECTED, REVISED_CODE, SUBMITTED, SUPER_ADMIN_ROLE } from '../../../types/Common';
import Unauthorized from '../../../components/atoms/unauthorized/Unauthorized';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { SUBMIT_ACTION } from '../../../constants/Action';
import { addCommaNumber } from '../../../helpers/NumericHelper';
import { convertCurrency } from '../../../constants/Currency';
import { sendNotifications } from '../../../services/NotificationServices';

const CreatePurchaseOrderSummaryScreen = ({ navigation, route }: RootNavigationProps<"CreatePurchaseOrderSummary">) => {

	const { docID } = route.params;
	const [modalOpen, setModalOpen] = useState(false);
	const tailwind = useTailwind();
	const user = useSelector(UserSelector);
	const linkTo = useLinkTo();
	const allowedStatuses = [DRAFT, REJECTED];
	let displayID = "";
	let revisedCode;

	const { data } = useDocument<PurchaseOrder>(`${PURCHASE_ORDERS}/${docID}`, {
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
			text1={`Purchase Order “${displayID}” has been submitted to HOM`}
			text2=""
			downloadButton={false}
			horizontalButtons={false}
			image={<TickIcon height={100} width={100} />}
			button1Text="Done"
			visible={modalOpen}
			setModalClose={() => { setModalOpen(false) }}
			nextAction={() => {
				updatePurchaseOrder(
					docID,
					{ status: IN_REVIEW, display_id: displayID, revised_code: revisedCode },
					user!,
					SUBMIT_ACTION,
					() => {
						revalidateCollection(PURCHASE_ORDERS);
						updateProcurement(data.procurement_id, { status: SUBMITTED, purchase_order_id: data.id, purchase_order_secondary_id: displayID }, user!, () => {
							navigation.navigate("Dashboard");
							revalidateCollection(PROCUREMENTS);

							sendNotifications(
								[HEAD_OF_MARKETING_ROLE, SUPER_ADMIN_ROLE],
								revisedCode > 0
									?
									`Purchase order ${displayID} updated by ${user?.name}.`
									:
									`New purchase order ${displayID} submitted by ${user?.name}.`,
								{ screen: "ViewPurchaseOrderSummary", docID: docID });
						}, (error) => {
							console.error(error);
						});
					}, (error) => {
						console.error(error);
					}
				)
			}}
			cancelAction={() => { navigation.navigate("Dashboard") }}
		/>
	);

	return (
		<Body header={<HeaderStack title={"Create Purchase Order"} navigateProp={navigation} />} style={tailwind("mt-6")}>
			{modal}
			<ViewPageHeaderText doc="Purchase Order" id={displayID} />

			<View>
				<InfoDisplay placeholder="Purchase Order Date" info={data.purchase_order_date} />
				<InfoDisplayLink placeholder="Procurement No." info={data.procurement_secondary_id} linkOnPress={() => { linkTo(`/procurements/${data.procurement_id}/preview`) }} />
				<View>
					<InfoDisplay placeholder="Supplier" info={data.supplier.name || "-"} />
					<InfoDisplay placeholder="Product" info={data.product.name || "-"} />
					<InfoDisplay placeholder="Unit of Measurement" info={data.unit_of_measurement || "-"} />
					<InfoDisplay placeholder="Quantity" info={addCommaNumber(data.quantity, "-")} />
					<InfoDisplay placeholder="Unit Price" info={`${convertCurrency(data.currency_rate)} ${addCommaNumber(data.unit_price, "-")}`} />
					<InfoDisplay placeholder="Currency Rate" info={data.currency_rate || "-"} />
					<InfoDisplay placeholder="Total Amount" info={`${convertCurrency(data.currency_rate)} ${addCommaNumber(data.total_amount, "0")}`} />
					<InfoDisplay placeholder="Payment Term" info={data.payment_term || "-"} />
					<InfoDisplay placeholder="Mode of Delivery" info={data.delivery_mode || "-"} />
					<InfoDisplay placeholder="Vessel Name" info={data.vessel_name.name} />

					<InfoDisplay placeholder={data.delivery_mode_type} info={data.delivery_mode_details || "-"} />
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
				</View>
			</View>


			<View style={tailwind("mt-5")} />
			<RegularButton text="Submit" operation={() => { setModalOpen(true) }} />
			<RegularButton type="secondary" text="Cancel" operation={() => { navigation.navigate("Dashboard") }} />

		</Body>
	)
}

export default CreatePurchaseOrderSummaryScreen;