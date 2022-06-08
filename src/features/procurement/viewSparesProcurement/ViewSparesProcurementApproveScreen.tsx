import React, { useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import InfoDisplay from '../../../components/atoms/display/InfoDisplay';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import Body from '../../../components/atoms/display/Body';
import { useTailwind } from 'tailwind-rn/dist';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { SparesProcurement } from '../../../types/SparesProcurement';
import { revalidateCollection, useDocument } from '@nandorojo/swr-firestore';
import { SPARES_PROCUREMENTS } from '../../../constants/Firebase';
import { View } from 'react-native';
import RadioButtonGroup from '../../../components/molecules/buttons/RadioButtonGroup';
import SupplierRadioButton from '../../../components/templates/procurement/ViewSparesProcurement/SupplierRadioButton';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import ConfirmModal from '../../../components/molecules/modal/ConfirmModal';
import { TickIcon } from '../../../../assets/svg/SVG';
import { approveSparesProcurement, updateSparesProcurement } from '../../../services/SparesProcurementServices';
import { deleteFile } from '../../../services/StorageServices';
import { IN_REVIEW, PURCHASING_ASSISTANT_ROLE, SUPER_ADMIN_ROLE } from '../../../types/Common';
import Unauthorized from '../../../components/atoms/unauthorized/Unauthorized';
import { UPDATE_ACTION } from '../../../constants/Action';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { addCommaNumber } from '../../../helpers/NumericHelper';
import { sendNotifications } from '../../../services/NotificationServices';


const ViewSparesProcurementApproveScreen = ({ navigation, route }: RootNavigationProps<"ViewSparesProcurementSummary">) => {
	const tailwind = useTailwind();
	const { docID } = route.params;
	const [modalOpen, setModalOpen] = useState(false);
	const [pickedIndex, setPickedIndex] = useState<number | undefined>(0);
	const allowedStatuses = [IN_REVIEW];
	let supplierDisplayItems: Array<{ content: any, value: string }> = [];
	const user = useSelector(UserSelector);

	const { data } = useDocument<SparesProcurement>(`${SPARES_PROCUREMENTS}/${docID}`, {
		ignoreFirestoreDocumentSnapshotField: false,
		revalidateOnFocus: true,
	})

	if (!data) return <LoadingData message="This document might not exist" />;

	if (!allowedStatuses.includes(data?.status!)) {
		return <Unauthorized />;
	}

	let modal = (
		<ConfirmModal
			cancelAction={() => { setModalOpen(false) }}
			downloadButton={false}
			text1={`Are you sure that you want to approve spares procurement ${data.secondary_id}`}
			image={<TickIcon height={100} width={100} />}
			button1Text="Save"
			button2Text="Cancel"
			horizontalButtons={true}
			visible={modalOpen}
			setModalClose={() => { setModalOpen(false) }}
			nextAction={() => {
				let pickedSupplier = data.suppliers[pickedIndex || 0];
				updateSparesProcurement(data.id, { suppliers: [pickedSupplier] }, user!, UPDATE_ACTION, () => {
					data.suppliers.map((item) => {
						if (item.filename_storage != pickedSupplier.filename_storage)
							deleteFile(SPARES_PROCUREMENTS, item.filename_storage, () => { })
					})
					approveSparesProcurement(data.id, user!, () => {
						revalidateCollection(SPARES_PROCUREMENTS);
						navigation.navigate("ViewAllSparesProcurement");

						sendNotifications(
							[SUPER_ADMIN_ROLE, PURCHASING_ASSISTANT_ROLE],
							`Procurement ${data.display_id} has been approved by ${user?.name}.`,
							{ screen: "ViewSparesProcurementSummary", docID: docID });

					}, (error) => {
						console.log(error);
					})
				}, (error) => {
					console.log(error);
				})
			}
			}
		/>
	);

	data.suppliers.map((item, index) => (
		supplierDisplayItems.push(
			{
				content: (
					<SupplierRadioButton index={index} supplierName={item.supplier.name} filename={item.filename} quotation_no={item.quotation_no} filename_storage={item.filename_storage} />
				), value: item.quotation_no
			}
		)
	))


	return (
		<Body header={<HeaderStack title={"View Spares Procurement"} navigateProp={navigation} />} style={tailwind("mt-6")}>
			{modal}
			<View>
				<ViewPageHeaderText doc="Spares Procurement" id={data.display_id} />
				<InfoDisplay placeholder={`Procurement Date`} info={`${data.procurement_date}`} />
				<InfoDisplay placeholder={`Propose Date`} info={`${data.proposed_date.startDate} to ${data.proposed_date.endDate}`} />

				<RadioButtonGroup displayItem={supplierDisplayItems} onPicked={(picked) => setPickedIndex(picked)} />

				<View style={tailwind("mt-3")}>
					<InfoDisplay placeholder={`Sizing`} info={`${data.sizing || "-"}`} />
					<InfoDisplay placeholder={`Product`} info={`${data.product.product_description}`} />
					<InfoDisplay placeholder={`Quantity`} info={`${addCommaNumber(data.quantity, "-")}`} />
					<InfoDisplay placeholder={`Unit of Measurement`} info={`${data.unit_of_measurement}`} />
					<InfoDisplay placeholder={`Remarks`} info={`${data.remarks || "-"}`} />

				</View>


			</View>
			<View>
				<View style={tailwind("mt-10")}>
					<RegularButton text="Approve" type={pickedIndex == undefined ? "disabled" : "primary"} operation={() => { setModalOpen(true); }} />
				</View>
			</View>

		</Body>
	)
}

export default ViewSparesProcurementApproveScreen;