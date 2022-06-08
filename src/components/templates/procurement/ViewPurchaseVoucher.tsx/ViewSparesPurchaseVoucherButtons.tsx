import { revalidateCollection } from '@nandorojo/swr-firestore';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { TickIcon } from '../../../../../assets/svg/SVG';
import { UPDATE_ACTION } from '../../../../constants/Action';
import { SPARES_PURCHASE_VOUCHERS } from '../../../../constants/Firebase';
import { REVIEW_PURCHASE_VOUCHER } from '../../../../permissions/Permissions';
import { UserSelector } from '../../../../redux/reducers/Auth';
import { sendNotifications } from '../../../../services/NotificationServices';
import { updateShipSpare } from '../../../../services/ShipSpareServices';
import { approveSparesPurchaseVoucher, rejectSparesPurchaseVoucher } from '../../../../services/SparesPurchaseVoucherServices';
import { ACCOUNT_ASSISTANT_ROLE, DRAFT, IN_REVIEW, REJECTED, REJECTING, SUPER_ADMIN_ROLE } from '../../../../types/Common';
import { ShipSpare } from '../../../../types/ShipSpare';
import { User } from '../../../../types/User';
import RegularButton from '../../../atoms/buttons/RegularButton';
import FormTextInputField from '../../../molecules/input/FormTextInputField';
import ConfirmModal from '../../../molecules/modal/ConfirmModal';

interface Props {
	displayID: string,
	navID: string,
	status: string,
	navigation: any,
	product: ShipSpare,
	unit_price: string,
	created_by: User,
	setStatus: (status) => void;
	onDownload?: () => void;
}


const ViewSparesPurchaseVoucherButtons: React.FC<Props> = ({
	status, navigation, displayID, navID, product, unit_price, created_by, setStatus, onDownload = () => { }
}) => {

	let bottom;
	const [modalOpen, setModalOpen] = useState(false);
	const [rejectNotes, setRejectNotes] = useState("");
	const [action, setAction] = useState<"approve" | "reject" | "archive">("approve");
	const user = useSelector(UserSelector);
	const permissions = user?.permission;

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
			switch (action) {
				case "approve":
					setStatus("Approved");
					approveSparesPurchaseVoucher(navID, user!, () => {
						updateShipSpare(product.id, product.product_code, { product_code: product.product_code, ref_price: unit_price }, user!, UPDATE_ACTION, () => {
							navigation.navigate("ViewAllSparesPurchaseVoucher");
							revalidateCollection(SPARES_PURCHASE_VOUCHERS);

							sendNotifications(
								[SUPER_ADMIN_ROLE, ACCOUNT_ASSISTANT_ROLE],
								`Purchase voucher ${displayID} has been approved by ${user?.name}.`,
								{ screen: "ViewSparesPurchaseVoucherSummary", docID: navID });
						}, (error) => {
							console.log(error);
						});
					}, (error) => {
						console.log(error);
					})
					break;
				case "reject":
					setStatus("Rejected");
					rejectSparesPurchaseVoucher(navID, rejectNotes, user!, () => {
						navigation.navigate("ViewAllSparesPurchaseVoucher");
						revalidateCollection(SPARES_PURCHASE_VOUCHERS);

						sendNotifications(
							[SUPER_ADMIN_ROLE, ACCOUNT_ASSISTANT_ROLE],
							`Purchase voucher ${displayID} has been rejected by ${user?.name}.`,
							{ screen: "ViewSparesPurchaseVoucherSummary", docID: navID });
					}, (error) => {
						console.log(error);
					})
					break;
			}
		}
		}
	/>

	if (status == IN_REVIEW) {
		bottom = (
			<View>
				{
					permissions?.includes(REVIEW_PURCHASE_VOUCHER)
						?
						<View>
							<RegularButton text="Approve" operation={() => { setModalOpen(true) }} />
							<RegularButton type="secondary" text="Reject" operation={() => { setStatus("Rejecting") }} />
						</View>
						:
						<RegularButton text="Download" operation={() => { onDownload(); }} />
				}
			</View>
		)
	} else if (status == REJECTED) {
		bottom = (
			<View>
				<RegularButton text="Edit" operation={() => { navigation.navigate("EditSparesPurchaseVoucherForm", { docID: navID }) }} />
			</View>
		)
	} else if (status == DRAFT) {
		bottom = (
			<View>
				{
					user?.id == created_by.id
						?
						<RegularButton text="Edit" operation={() => { navigation.navigate("EditSparesPurchaseVoucherForm", { docID: navID }) }} />
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

				<RegularButton text="Submit" operation={() => { setAction("reject"), setModalOpen(true) }} />
				<RegularButton text="Cancel" type="secondary" operation={() => { setStatus("In Review"); setRejectNotes(""); }} />
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

export default ViewSparesPurchaseVoucherButtons;