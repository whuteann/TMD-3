import { revalidateCollection } from '@nandorojo/swr-firestore';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { TickIcon } from '../../../../../assets/svg/SVG';
import { PURCHASE_VOUCHERS } from '../../../../constants/Firebase';
import { loadingDelay } from '../../../../helpers/GenericHelper';
import { EDIT_DRAFT, REVIEW_PURCHASE_VOUCHER } from '../../../../permissions/Permissions';
import { useRefreshContext } from '../../../../providers/RefreshProvider';
import { UserSelector } from '../../../../redux/reducers/Auth';
import { sendNotifications } from '../../../../services/NotificationServices';
import { approvePurchaseVoucher, rejectPurchaseVoucher } from '../../../../services/PurchaseVoucherServices';
import { ACCOUNT_ASSISTANT_ROLE, DRAFT, IN_REVIEW, REJECTED, REJECTING, SUPER_ADMIN_ROLE } from '../../../../types/Common';
import { User } from '../../../../types/User';
import RegularButton from '../../../atoms/buttons/RegularButton';
import FormTextInputField from '../../../molecules/input/FormTextInputField';
import ConfirmModal from '../../../molecules/modal/ConfirmModal';

interface Props {
	displayID: string,
	navID: string,
	status: string,
	navigation: any,
	created_by: User,
	setStatus: (status) => void;
	onDownload?: () => void;
}


const PurchaseVoucherButtons: React.FC<Props> = ({
	status, navigation, displayID, navID, created_by, setStatus, onDownload = () => { }
}) => {

	let bottom;
	const [modalOpen, setModalOpen] = useState(false);
	const [rejectNotes, setRejectNotes] = useState("");
	const [loading, setLoading] = useState(false);
	const [action, setAction] = useState<"approve" | "reject" | "archive">("approve");
	const user = useSelector(UserSelector);
	const permissions = user?.permission;
	const refreshContext = useRefreshContext();

	let modal = <ConfirmModal
		cancelAction={() => { setModalOpen(false) }}
		downloadButton={false}
		text1={`Are you sure that you want to ${action} quotation ${displayID}`}
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
					approvePurchaseVoucher(navID, user!, () => {

						loadingDelay(() => {
							setLoading(false);
							setStatus("Approved");
							navigation.navigate("ViewAllPurchaseVoucher");
							revalidateCollection(PURCHASE_VOUCHERS);
						})

						sendNotifications(
							[ACCOUNT_ASSISTANT_ROLE, SUPER_ADMIN_ROLE],
							`Purchase voucher ${displayID} has been approved by ${user?.name}.`,
							{ screen: "ViewPurchaseVoucherSummary", docID: navID });

						refreshContext?.refreshList(PURCHASE_VOUCHERS);
					}, (error) => { console.error(error); })
					break;
				case "reject":
					rejectPurchaseVoucher(navID, rejectNotes, user!, () => {

						loadingDelay(() => {
							setLoading(false);
							setStatus("Rejected");
							navigation.navigate("ViewAllPurchaseVoucher");
							revalidateCollection(PURCHASE_VOUCHERS);
						})

						sendNotifications(
							[ACCOUNT_ASSISTANT_ROLE, SUPER_ADMIN_ROLE],
							`Purchase voucher ${displayID} has been rejected by ${user?.name}.`,
							{ screen: "ViewPurchaseVoucherSummary", docID: navID });

						refreshContext?.refreshList(PURCHASE_VOUCHERS);
					}, (error) => { console.error(error); })
					break;
			}
		}
		}
	/>

	if (status == IN_REVIEW) {
		if (permissions?.includes(REVIEW_PURCHASE_VOUCHER)) {
			bottom = (
				<View>
					<RegularButton text="Approve" operation={() => { setModalOpen(true) }} />
					<RegularButton type="secondary" text="Reject" operation={() => { setStatus("Rejecting") }} />
				</View>
			)
		} else {
			bottom = (
				<View>
					<RegularButton text="Download" operation={() => { onDownload(); }} />
				</View>
			)
		}
	} else if (status == REJECTED) {
		bottom = (
			<View>
				<RegularButton text="Edit" operation={() => { navigation.navigate("EditPurchaseVoucherForm", { docID: navID }) }} />
			</View>
		)
	} else if (status == DRAFT) {
		bottom = (
			<View>
				{
					user?.id == created_by.id || permissions?.includes(EDIT_DRAFT)
						?
						<RegularButton text="Edit" operation={() => { navigation.navigate("EditPurchaseVoucherForm", { docID: navID }) }} />
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

	}
	else {
		bottom = (
			<View>
				<RegularButton text="Download" operation={() => { onDownload(); }} />
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

export default PurchaseVoucherButtons;