import { revalidateCollection } from '@nandorojo/swr-firestore';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { TickIcon } from '../../../../../assets/svg/SVG';
import { UPDATE_ACTION } from '../../../../constants/Action';
import { SHIP_SPARES, SPARES_PURCHASE_VOUCHERS } from '../../../../constants/Firebase';
import { loadingDelay } from '../../../../helpers/GenericHelper';
import { EDIT_DRAFT, REVIEW_PURCHASE_VOUCHER } from '../../../../permissions/Permissions';
import { useRefreshContext } from '../../../../providers/RefreshProvider';
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
	products: Array<ShipSpare>,
	unit_prices: Array<string>,
	created_by: User,
	setStatus: (status) => void;
	onDownload?: () => void;
}


const ViewSparesPurchaseVoucherButtons: React.FC<Props> = ({
	status, navigation, displayID, navID, products, unit_prices, created_by, setStatus, onDownload = () => { }
}) => {

	let bottom;
	const [modalOpen, setModalOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [rejectNotes, setRejectNotes] = useState("");
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
					approveSparesPurchaseVoucher(navID, user!, () => {

						products.map((product, index) => {
							updateShipSpare(product.id, product.product_code, { product_code: product.product_code, ref_price: unit_prices[index] }, user!, UPDATE_ACTION, () => {
								console.log("done");
							}, (error) => {
								console.error(error);
							});
						})

						loadingDelay(() => {
							setLoading(false);
							navigation.navigate("ViewAllSparesPurchaseVoucher");
							revalidateCollection(SPARES_PURCHASE_VOUCHERS);
							revalidateCollection(SHIP_SPARES);
							setStatus("Approved");
						})


						sendNotifications(
							[SUPER_ADMIN_ROLE, ACCOUNT_ASSISTANT_ROLE],
							`Purchase voucher ${displayID} has been approved by ${user?.name}.`,
							{ screen: "ViewSparesPurchaseVoucherSummary", docID: navID });

					}, (error) => {
						console.error(error);
					})

					refreshContext?.refreshList(SPARES_PURCHASE_VOUCHERS);
					break;
				case "reject":
					rejectSparesPurchaseVoucher(navID, rejectNotes, user!, () => {
						loadingDelay(() => {
							setLoading(false);
							navigation.navigate("ViewAllSparesPurchaseVoucher");
							revalidateCollection(SPARES_PURCHASE_VOUCHERS);
							setStatus("Rejected");
						})

						sendNotifications(
							[SUPER_ADMIN_ROLE, ACCOUNT_ASSISTANT_ROLE],
							`Purchase voucher ${displayID} has been rejected by ${user?.name}.`,
							{ screen: "ViewSparesPurchaseVoucherSummary", docID: navID });
					}, (error) => {
						console.error(error);
					})

					refreshContext?.refreshList(SPARES_PURCHASE_VOUCHERS);
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
							<RegularButton text="Approve" loading={loading} operation={() => { setModalOpen(true) }} />
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
				<RegularButton text="Edit" operation={() => { navigation.navigate("EditSparesPurchaseVoucherForm", { docID: navID }) }} />
			</View>
		)
	} else if (status == DRAFT) {
		bottom = (
			<View>
				{
					user?.id == created_by.id || permissions?.includes(EDIT_DRAFT)
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

export default ViewSparesPurchaseVoucherButtons;