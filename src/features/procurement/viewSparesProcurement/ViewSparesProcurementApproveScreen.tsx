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
import { useRefreshContext } from '../../../providers/RefreshProvider';
import { loadingDelay } from '../../../helpers/GenericHelper';
import Line from '../../../components/atoms/display/Line';


const ViewSparesProcurementApproveScreen = ({ navigation, route }: RootNavigationProps<"ViewSparesProcurementSummary">) => {
	const tailwind = useTailwind();
	const { docID } = route.params;
	const [modalOpen, setModalOpen] = useState(false);
	const [pickedIndex, setPickedIndex] = useState<number | undefined>(0);
	const [loading, setLoading] = useState(false);

	const allowedStatuses = [IN_REVIEW];
	let supplierDisplayItems: Array<{ content: any, value: string }> = [];
	const user = useSelector(UserSelector);
	const refreshContext = useRefreshContext();

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
				setLoading(true);

				let pickedSupplier = data.suppliers[pickedIndex || 0];
				updateSparesProcurement(data.id, { suppliers: [pickedSupplier] }, user!, UPDATE_ACTION, () => {
					data.suppliers.map((item) => {
						if (item.filename_storage != pickedSupplier.filename_storage)
							deleteFile(SPARES_PROCUREMENTS, item.filename_storage, () => { })
					})
					approveSparesProcurement(data.id, user!, () => {

						loadingDelay(() => {
							revalidateCollection(SPARES_PROCUREMENTS);
							setLoading(false);
							navigation.navigate("ViewAllSparesProcurement");
						})

						sendNotifications(
							[SUPER_ADMIN_ROLE, PURCHASING_ASSISTANT_ROLE],
							`Procurement ${data.display_id} has been approved by ${user?.name}.`,
							{ screen: "ViewSparesProcurementSummary", docID: docID });

						refreshContext?.refreshList(SPARES_PROCUREMENTS);
					}, (error) => {
						console.error(error);
					})
				}, (error) => {
					console.error(error);
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

				<InfoDisplay placeholder={`Proposed Date`} info={
					data.proposed_date?.startDate
						?
						data.proposed_date.endDate
							?
							`${data.proposed_date?.startDate} to ${data.proposed_date?.endDate}`
							:
							`${data.proposed_date.startDate}`
						:
						"-"}
				/>

				<RadioButtonGroup displayItem={supplierDisplayItems} onPicked={(picked) => setPickedIndex(picked)} />

				<Line />

				{
					data.products.map((product, index) => {
						return (
							<View key={`${index}`} style={tailwind("mb-5")}>
								<InfoDisplay placeholder={`Product ${index + 1}`} info={product.product.product_description} bold={true} />
								<InfoDisplay placeholder={`Sizing`} info={product.sizing || "-"} />
								<InfoDisplay placeholder={`Quantity`} info={`${product.quantity} ${product.unit_of_measurement}`} />
							</View>
						)
					})
				}

				<Line />

				<InfoDisplay placeholder={`Remarks`} info={`${data.remarks || "-"}`} />


			</View>
			<View>
				<View style={tailwind("mt-10")}>
					<RegularButton text="Approve" loading={loading} type={pickedIndex == undefined ? "disabled" : "primary"} operation={() => { setModalOpen(true); }} />
				</View>
			</View>

		</Body>
	)
}

export default ViewSparesProcurementApproveScreen;