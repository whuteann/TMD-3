import React, { useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import ConfirmModal from '../../../components/molecules/modal/ConfirmModal';
import { TickIcon } from '../../../../assets/svg/SVG';
import InfoDisplay from '../../../components/atoms/display/InfoDisplay';
import InfoDisplayLink from '../../../components/atoms/display/InfoDisplayLink';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { useTailwind } from 'tailwind-rn/dist';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import { useLinkTo } from '@react-navigation/native';
import { revalidateCollection, useDocument } from '@nandorojo/swr-firestore';
import { SparesPurchaseOrder } from '../../../types/SparesPurchaseOrder';
import { SPARES_PROCUREMENTS, SPARES_PURCHASE_ORDERS } from '../../../constants/Firebase';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { updateSparesPurchaseOrder } from '../../../services/SparesPurchaseOrderServices';
import { DRAFT, HEAD_OF_PROCUREMENT_ROLE, IN_REVIEW, REJECTED, REVISED_CODE, SUBMITTED, SUPER_ADMIN_ROLE } from '../../../types/Common';
import { updateSparesProcurement } from '../../../services/SparesProcurementServices';
import { View } from 'react-native';
import Unauthorized from '../../../components/atoms/unauthorized/Unauthorized';
import { SUBMIT_ACTION, UPDATE_ACTION } from '../../../constants/Action';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { addCommaNumber } from '../../../helpers/NumericHelper';
import { convertCurrency } from '../../../constants/Currency';
import { sendNotifications } from '../../../services/NotificationServices';

const CreateSparesPurchaseOrderSummaryScreen = ({ navigation, route }: RootNavigationProps<"CreateSparesPurchaseOrderSummary">) => {

	const { docID } = route.params;
	const [modalOpen, setModalOpen] = useState(false);
	const tailwind = useTailwind();
	const linkTo = useLinkTo();
	const allowedStatuses = [DRAFT, REJECTED];
	const user = useSelector(UserSelector);
	let displayID = "";
	let revisedCode;

	const { data } = useDocument<SparesPurchaseOrder>(`${SPARES_PURCHASE_ORDERS}/${docID}`, {
		ignoreFirestoreDocumentSnapshotField: false,
	})


	if (!data) return <LoadingData message="This document might not exist" />;

	if (!allowedStatuses.includes(data?.status!)) {
		return <Unauthorized />;
	}

	revisedCode = data.revised_code !== undefined ? Number(data.revised_code) + 1 : 0
	displayID = `${data.secondary_id}${data.revised_code !== undefined ? REVISED_CODE(revisedCode) : ""}`;

	let modal = (
		<ConfirmModal
			text1={`Purchase Order “${data.secondary_id}" has submitted to HOM`}
			text2=""
			downloadButton={false}
			horizontalButtons={false}
			image={<TickIcon height={100} width={100} />}
			button1Text="Done"
			visible={modalOpen}
			setModalClose={() => { setModalOpen(false) }}
			nextAction={() => {
				updateSparesPurchaseOrder(docID, { status: IN_REVIEW, display_id: displayID, revised_code: revisedCode, total_amount: `${Number(data.quantity) * Number(data.unit_price)}` }, user!, SUBMIT_ACTION, () => {
					updateSparesProcurement(data.spares_procurement_id, { status: SUBMITTED, spares_purchase_order_id: data.id, spares_purchase_order_secondary_id: displayID }, user!, UPDATE_ACTION, () => {
						navigation.navigate("Dashboard");
						revalidateCollection(SPARES_PURCHASE_ORDERS);
						revalidateCollection(SPARES_PROCUREMENTS);

						sendNotifications(
							[SUPER_ADMIN_ROLE, HEAD_OF_PROCUREMENT_ROLE],
							revisedCode > 0
								?
								(
									(Number(data.quantity) * Number(data.unit_price)) > 5000
										?
										`Purchase order ${data.display_id} updated by ${user?.name}, ready for verification.`
										:
										`Purchase order ${data.display_id} updated by ${user?.name}, ready for approval.`
								)
								:
								(
									(Number(data.quantity) * Number(data.unit_price)) > 5000
										?
										`Purchase order ${data.display_id} submitted for verification by ${user?.name}.`
										:
										`Purchase order ${data.display_id} submitted for approval by ${user?.name}`
								)
							,
							{ screen: "ViewSparesPurchaseOrderSummary", docID: data.id });

					}, (error) => {
						console.error(error);
					});
				}, (error) => {
					console.error(error);
				}
				)
			}}
			cancelAction={() => { }}
		/>
	);

	return (
		<Body header={<HeaderStack title={"Create Purchase Order"} navigateProp={navigation} />} style={tailwind("mt-6")}>
			{modal}
			<ViewPageHeaderText doc="Purchase Order" id={displayID} />

			<View>
				<InfoDisplay placeholder="Purchase Order Date" info={data.purchase_order_date} />
				<InfoDisplayLink placeholder="Procurement No." info={data.spares_procurement_secondary_id} linkOnPress={() => { linkTo(`/spares-procurements/${data.spares_procurement_id}/preview`) }} />

				<View>
					<InfoDisplay placeholder="Supplier" info={data.supplier.name || "-"} />
					<InfoDisplay placeholder="Product" info={data.product.product_description || "-"} />
					<InfoDisplay placeholder="Unit of Measurement" info={data.unit_of_measurement || "-"} />
					<InfoDisplay placeholder="Quantity" info={addCommaNumber(data.quantity, "-")} />
					<InfoDisplay placeholder="Unit Price" info={data.unit_price ? `${convertCurrency(data.currency_rate)} ${addCommaNumber(data.unit_price, "-")}` : "-"} />
					<InfoDisplay placeholder="Currency Rate" info={data.currency_rate || "-"} />
					<InfoDisplay placeholder="Type of Supply" info={data.type_of_supply || "-"} />
					<InfoDisplay placeholder="Total Amount" info={`${convertCurrency(data.currency_rate)} ${addCommaNumber(`${Number(data.quantity) * Number(data.unit_price)}`, "0")}`} />
					<InfoDisplay placeholder="Payment Term" info={data.payment_term || "-"} />
					<InfoDisplay placeholder="Vessel Name" info={data.vessel_name ? data.vessel_name.name : "-"} />
					<InfoDisplay placeholder="Port" info={data.port || "-"} />
					<InfoDisplay placeholder="Delivery Location" info={data.delivery_location || "-"} />
					<InfoDisplay placeholder="Contact Person" info={data.contact_person ? data.contact_person.name : "-"} />
					<InfoDisplay placeholder="ETA/ Delivery Date" info={data.ETA_delivery_date || "-"} />
					<InfoDisplay placeholder="Remarks" info={data.remarks || "-"} />
				</View>
			</View>


			<View style={tailwind("mt-5")} />
			<RegularButton text="Submit" operation={() => { setModalOpen(true) }} />
			<RegularButton type="secondary" text="Cancel" operation={() => { navigation.navigate("Dashboard") }} />

		</Body>
	)
}

export default CreateSparesPurchaseOrderSummaryScreen;