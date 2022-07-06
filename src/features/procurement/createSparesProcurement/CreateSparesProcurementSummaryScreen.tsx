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
import { SparesProcurement } from '../../../types/SparesProcurement';
import { SPARES_PROCUREMENTS } from '../../../constants/Firebase';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { openDocument } from '../../../services/StorageServices';
import { updateSparesProcurement } from '../../../services/SparesProcurementServices';
import { View } from 'react-native';
import { DRAFT, HEAD_OF_PROCUREMENT_ROLE, IN_REVIEW, REJECTED, REVISED_CODE, SUPER_ADMIN_ROLE } from '../../../types/Common';
import Unauthorized from '../../../components/atoms/unauthorized/Unauthorized';
import { SUBMIT_ACTION } from '../../../constants/Action';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { addCommaNumber } from '../../../helpers/NumericHelper';
import { sendNotifications } from '../../../services/NotificationServices';

const CreateSparesProcurementSummaryScreen = ({ navigation, route }: RootNavigationProps<"CreateSparesProcurementSummary">) => {

	const tailwind = useTailwind();
	const { docID } = route.params;
	const allowedStatuses = [DRAFT, REJECTED];
	const [modalOpen, setModalOpen] = useState(false);
	const user = useSelector(UserSelector);
	let displayID = "";
	let revisedCode;

	const { data } = useDocument<SparesProcurement>(`${SPARES_PROCUREMENTS}/${docID}`, {
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
			text1={`Procurement "${displayID}" has submitted to HOP`}
			text2={``}
			downloadButton={false}
			horizontalButtons={false}
			image={<TickIcon height={100} width={100} />}
			button1Text="Done"
			visible={modalOpen}
			setModalClose={() => { setModalOpen(false) }}
			nextAction={() => {
				updateSparesProcurement(data.id, { status: IN_REVIEW, display_id: displayID, revised_code: revisedCode }, user!, SUBMIT_ACTION, () => {
					navigation.navigate("Dashboard");
					revalidateCollection(SPARES_PROCUREMENTS);

					sendNotifications(
						[HEAD_OF_PROCUREMENT_ROLE, SUPER_ADMIN_ROLE],
						revisedCode > 0
							?
							`Procurement ${data.display_id} updated by ${user?.name}.`
							:
							`New procurement ${data.display_id} submitted by ${user?.name}.`,
						{ screen: "ViewSparesProcurementSummary", docID: docID });

				}, (error) => {
					console.error(error);
				})
			}}
			cancelAction={() => { }}
		/>
	);

	return (
		<Body header={<HeaderStack title={"Create Spares Procurement"} navigateProp={navigation} />} style={tailwind("mt-6")}>
			{modal}
			<View>
				<ViewPageHeaderText doc="Spares Procurement" id={displayID} />


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

				{
					data.suppliers.map((item, index) => (
						<View key={index}>
							<InfoDisplay placeholder={`Supplier ${index + 1}`} info={item.supplier.name} />
							<InfoDisplayLink placeholder="Attachment" info={item.filename} linkOnPress={() => { openDocument(SPARES_PROCUREMENTS, item.filename_storage) }} />
							<InfoDisplay placeholder={`Quotation ${index + 1} No.`} info={item.quotation_no} />
						</View>
					))
				}

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
					<RegularButton text="Submit" operation={() => { setModalOpen(!modalOpen); }} />
				</View>
			</View>

		</Body>

	)
}

export default CreateSparesProcurementSummaryScreen;