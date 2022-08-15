import React, { useEffect, useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import InfoDisplayLink from '../../../components/atoms/display/InfoDisplayLink';
import InfoDisplay from '../../../components/atoms/display/InfoDisplay';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import Body from '../../../components/atoms/display/Body';
import { useTailwind } from 'tailwind-rn/dist';
import { openDocument } from '../../../services/StorageServices';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { spareProcurementStatuses, SparesProcurement } from '../../../types/SparesProcurement';
import { useDocument } from '@nandorojo/swr-firestore';
import { SPARES_PROCUREMENTS } from '../../../constants/Firebase';
import { View } from 'react-native';
import ViewSparesProcurementButtons from '../../../components/templates/procurement/ViewSparesProcurement/ViewSparesProcurementButtons';
import { DRAFT, PENDING, REJECTED, SUBMITTED } from '../../../types/Common';
import { useLinkTo } from '@react-navigation/native';
import { addCommaNumber } from '../../../helpers/NumericHelper';
import Line from '../../../components/atoms/display/Line';

const ViewSparesProcurementSummaryScreen = ({ navigation, route }: RootNavigationProps<"ViewSparesProcurementSummary">) => {
	const tailwind = useTailwind();
	const { docID } = route.params;

	const [status, setStatus] = useState<spareProcurementStatuses>(DRAFT);
	const linkTo = useLinkTo();

	const { data } = useDocument<SparesProcurement>(`${SPARES_PROCUREMENTS}/${docID}`, {
		ignoreFirestoreDocumentSnapshotField: false,
		revalidateOnFocus: true,
	})

	useEffect(() => {
		setStatus(data?.status || DRAFT);
	}, [data?.status])

	if (!data) return <LoadingData message="This document might not exist" />;

	let buttons = <ViewSparesProcurementButtons
		docID={docID}
		created_by={data.created_by}
		displayID={data.display_id}
		status={status}
		navigation={navigation}
		setStatus={setStatus}
		onDownload={() => { }}
	/>;
	;

	return (
		<Body header={<HeaderStack title={"View Spares Procurement"} navigateProp={navigation} />} style={tailwind("mt-6")}>
			<View>
				<ViewPageHeaderText doc="Spares Procurement" id={data.display_id} status={status} />


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
							{
								item.filename
									?
									<InfoDisplayLink placeholder="Attachment" info={item.filename} linkOnPress={() => { openDocument(SPARES_PROCUREMENTS, item.filename_storage) }} />
									:
									<InfoDisplay placeholder={`Attachment`} info={"-"} />
							}
							<InfoDisplay placeholder={`Quotation ${index + 1} No.`} info={item.quotation_no || "-"} />
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

				{
					status == REJECTED
						?
						<InfoDisplay placeholder={`Reject Notes`} info={`${data.reject_notes || "-"}`} />
						:
						null
				}




			</View>
			<View>
				<View style={tailwind("mt-10")}>
					{buttons}
				</View>
			</View>

		</Body>
	)
}

export default ViewSparesProcurementSummaryScreen;