import { revalidateCollection } from '@nandorojo/swr-firestore';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { TickIcon } from '../../../../../assets/svg/SVG';
import { UPDATE_ACTION } from '../../../../constants/Action';
import { PURCHASE_ORDERS } from '../../../../constants/Firebase';
import { loadingDelay } from '../../../../helpers/GenericHelper';
import { CREATE_PURCHASE_VOUCHER, EDIT_DRAFT, PROCEED_PURCHASE_ORDER, REVIEW_PURCHASE_ORDER } from '../../../../permissions/Permissions';
import { useRefreshContext } from '../../../../providers/RefreshProvider';
import { UserSelector } from '../../../../redux/reducers/Auth';
import { sendNotifications } from '../../../../services/NotificationServices';
import { approvePurchaseOrder, rejectPurchaseOrder, updatePurchaseOrder } from '../../../../services/PurchaseOrderServices';
import { ACCOUNT_ASSISTANT_ROLE, DRAFT, IN_REVIEW, MARKETING_EXECUTIVE_ROLE, NO_PURCHASE_VOUCHER, OPERATION_TEAM_ROLE, PV_ISSUED, PV_PENDING, REJECTED, REJECTING, SUPER_ADMIN_ROLE } from '../../../../types/Common';
import { User } from '../../../../types/User';
import RegularButton from '../../../atoms/buttons/RegularButton';
import FormTextInputField from '../../../molecules/input/FormTextInputField';
import ConfirmModal from '../../../molecules/modal/ConfirmModal';

interface Props {
	displayID: string,
	nav_id: string,
	status: string,
	navigation: any,
	created_by: User,
	setStatus: (status) => void;
	onDownload: () => void;
}

const ViewPurchaseOrderButtons: React.FC<Props> = ({
	status, navigation, displayID, nav_id, created_by, setStatus, onDownload,
}) => {
	const [modalOpen, setModalOpen] = useState(false);
	const [action, setAction] = useState<"approve" | "reject" | "proceed">("approve");
	const [rejectNotes, setRejectNotes] = useState("");
	const [loading, setLoading] = useState(false);
	const user = useSelector(UserSelector);
	const permissions = user?.permission;
	const refreshContext = useRefreshContext();

	let modal;
	let bottom;

	modal = (
		<ConfirmModal
			cancelAction={() => { setModalOpen(false) }}
			downloadButton={false}
			text1={`Are you sure that you want to ${action == "proceed" ? "proceed with" : action} purchase order ${displayID}`}
			image={<TickIcon height={100} width={100} />}
			button1Text="Save"
			button2Text="Cancel"
			horizontalButtons={true}
			visible={modalOpen}
			setModalClose={() => { setModalOpen(false) }}
			nextAction={() => {
				setLoading(true);

				switch (action) {
					case "approve":
						approvePurchaseOrder(nav_id, user!, () => {
							sendNotifications(
								[MARKETING_EXECUTIVE_ROLE, SUPER_ADMIN_ROLE],
								`Purchase order ${displayID} has been approved by ${user?.name}`,
								{ screen: "ViewPurchaseOrderSummary", docID: nav_id });

							loadingDelay(() => {
								revalidateCollection(PURCHASE_ORDERS);
								setLoading(false);
								navigation.navigate("ViewAllPurchaseOrder");
								setStatus("Approved");
							})
						}, (error) => { console.error(error); });

						refreshContext?.refreshList(PURCHASE_ORDERS);
						break;
					case "reject":
						rejectPurchaseOrder(nav_id, rejectNotes, user!, () => {
							sendNotifications(
								[MARKETING_EXECUTIVE_ROLE, SUPER_ADMIN_ROLE],
								`Purchase order ${displayID} has been rejected by ${user?.name}`,
								{ screen: "ViewPurchaseOrderSummary", docID: nav_id });

							loadingDelay(() => {
								revalidateCollection(PURCHASE_ORDERS);
								setLoading(false);
								navigation.navigate("ViewAllPurchaseOrder");
								setStatus("Rejected");
							})

						}, (error) => { console.error(error); });

						refreshContext?.refreshList(PURCHASE_ORDERS);
						break;
					case "proceed":
						updatePurchaseOrder(nav_id, { status: "No Purchase Voucher" }, user!, UPDATE_ACTION
							, () => {
								loadingDelay(() => {
									setLoading(false);
									revalidateCollection(PURCHASE_ORDERS);
									navigation.navigate("ViewAllPurchaseOrder");
								})
							}, (error) => { console.error(error) })

						sendNotifications(
							[ACCOUNT_ASSISTANT_ROLE, OPERATION_TEAM_ROLE, SUPER_ADMIN_ROLE],
							`Purchase order ${displayID} permitted to proceed by ${user?.name}.`,
							{ screen: "ViewPurchaseOrderSummary", docID: nav_id });

						refreshContext?.refreshList(PURCHASE_ORDERS);
						break;
				}
			}
			}
		/>
	);

	if (status == IN_REVIEW) {
		bottom = (
			<View>
				{
					permissions?.includes(REVIEW_PURCHASE_ORDER)
						?
						<View>
							<RegularButton text="Approve" loading={loading} operation={() => { setAction("approve"); setModalOpen(true) }} />
							<RegularButton type="secondary" loading={loading} text="Reject" operation={() => { setStatus("Rejecting") }} />
						</View>
						:
						<RegularButton text="Download" operation={() => { onDownload(); }} />
				}
			</View>
		)
	} else if (status == REJECTED) {
		bottom = (
			<View>
				<RegularButton text="Edit" operation={() => { navigation.navigate("EditPurchaseOrderForm", { docID: nav_id }); }} />
			</View>
		)
	} else if (status == DRAFT) {
		bottom = (
			<View>
				{
					user?.id == created_by.id || user?.permission?.includes(EDIT_DRAFT)
						?
						<RegularButton text="Edit" operation={() => { navigation.navigate("EditPurchaseOrderForm", { docID: nav_id }); }} />
						:
						<></>
				}
			</View>
		)
	} else if (status == REJECTING) {
		bottom = (
			<View>
				<FormTextInputField
					label={"Reject Notes"}
					value={rejectNotes}
					onChangeValue={(val) => { setRejectNotes(val) }}
					multiline={true}
				/>

				<RegularButton text="Submit" loading={loading} operation={() => { setAction("reject"), setModalOpen(true) }} />
				<RegularButton text="Cancel" loading={loading} type="secondary" operation={() => { setStatus("In Review"); setRejectNotes(""); }} />
			</View>
		);
	} else if (status == NO_PURCHASE_VOUCHER) {

		bottom = (
			<View>
				{
					permissions?.includes(CREATE_PURCHASE_VOUCHER)
						?
						<RegularButton type="secondary" text="Create Purchase Voucher" operation={() => { navigation.navigate("CreatePurchaseVoucherForm", { docID: nav_id }); }} />
						:
						<RegularButton text="Download" operation={() => { onDownload(); }} />
				}
			</View>
		)

	} else if (status == PV_ISSUED || status == PV_PENDING) {
		bottom = (
			<View>
				<RegularButton text="Download" operation={() => { onDownload(); }} />
				{
					permissions?.includes(CREATE_PURCHASE_VOUCHER)
						?
						<RegularButton type="secondary" text="Create Purchase Voucher" operation={() => { navigation.navigate("CreatePurchaseVoucherForm", { docID: nav_id }); }} />
						:
						<></>
				}
			</View>
		)
	} else {
		bottom = (
			<View>
				<RegularButton text="Download" type={"primary"} operation={() => { onDownload() }} />
				{
					permissions?.includes(PROCEED_PURCHASE_ORDER)
						?
						<RegularButton type="secondary" loading={loading} text="Proceed" operation={() => { setAction("proceed"); setModalOpen(true) }} />
						:
						null
				}
			</View>
		)
	}

	return (
		<View>
			{modal}
			{bottom}
		</View>
	)
}

export default ViewPurchaseOrderButtons;