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
import { useRefreshContext } from '../../../providers/RefreshProvider';
import { loadingDelay } from '../../../helpers/GenericHelper';
import Line from '../../../components/atoms/display/Line';

const CreateSparesProcurementSummaryScreen = ({ navigation, route }: RootNavigationProps<"CreateSparesProcurementSummary">) => {

	const tailwind = useTailwind();
	const { docID } = route.params;
	const allowedStatuses = [DRAFT, REJECTED];
	const [modalOpen, setModalOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const user = useSelector(UserSelector);
	let displayID = "";
	let revisedCode;
	const refreshContext = useRefreshContext();

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
			text1={`Procurement "${displayID}" has been submitted to HOP`}
			text2={``}
			downloadButton={false}
			horizontalButtons={false}
			image={<TickIcon height={100} width={100} />}
			button1Text="Done"
			visible={modalOpen}
			setModalClose={() => { setModalOpen(false) }}
			nextAction={() => {
				setLoading(true);

				updateSparesProcurement(data.id, { status: IN_REVIEW, display_id: displayID, revised_code: revisedCode }, user!, SUBMIT_ACTION, () => {
					sendNotifications(
						[HEAD_OF_PROCUREMENT_ROLE, SUPER_ADMIN_ROLE],
						revisedCode > 0
							?
							`Procurement ${data.display_id} updated by ${user?.name}.`
							:
							`New procurement ${data.display_id} submitted by ${user?.name}.`,
						{ screen: "ViewSparesProcurementSummary", docID: docID });

					loadingDelay(() => {
						navigation.navigate("Dashboard");
						setLoading(false);
						revalidateCollection(SPARES_PROCUREMENTS);
					})

					refreshContext?.refreshList(SPARES_PROCUREMENTS);
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
							<InfoDisplay placeholder={`Supplier ${index + 1}`} info={item.supplier.name} bold={true} />
							<InfoDisplayLink placeholder="Attachment" info={item.filename} linkOnPress={() => { openDocument(SPARES_PROCUREMENTS, item.filename_storage) }} />
							<InfoDisplay placeholder={`Quotation ${index + 1} No.`} info={item.quotation_no} />
						</View>
					))
				}

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
					<RegularButton text="Submit" loading={loading} operation={() => { setModalOpen(!modalOpen); }} />
				</View>
			</View>

		</Body>

	)
}

export default CreateSparesProcurementSummaryScreen;