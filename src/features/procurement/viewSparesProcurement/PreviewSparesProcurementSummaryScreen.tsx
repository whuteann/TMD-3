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
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { DRAFT, PENDING, REJECTED, SUBMITTED } from '../../../types/Common';
import { useLinkTo } from '@react-navigation/native';
import { addCommaNumber } from '../../../helpers/NumericHelper';

const PreviewSparesProcurementSummaryScreen = ({ navigation, route }: RootNavigationProps<"PreviewSparesProcurementSummary">) => {
	const tailwind = useTailwind();
	const { docID } = route.params;

	const [status, setStatus] = useState<spareProcurementStatuses>(DRAFT);
	const user = useSelector(UserSelector);
	const linkTo = useLinkTo();

	const { data } = useDocument<SparesProcurement>(`${SPARES_PROCUREMENTS}/${docID}`, {
		ignoreFirestoreDocumentSnapshotField: false,
		revalidateOnFocus: true,
	})

	useEffect(() => {
		setStatus(data?.status || DRAFT);
	}, [data?.status])

	if (!data) return <LoadingData message="This document might not exist" />;

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

				<View style={tailwind("mt-3")}>
					<InfoDisplay placeholder={`Sizing`} info={`${data.sizing || "-"}`} />
					<InfoDisplay placeholder={`Product`} info={`${data.product.product_description}`} />
					<InfoDisplay placeholder={`Quantity`} info={addCommaNumber(`${data.quantity}`, "-")} />
					<InfoDisplay placeholder={`Unit of Measurement`} info={`${data.unit_of_measurement}`} />
					<InfoDisplay placeholder={`Remarks`} info={`${data.remarks || "-"}`} />

					{
						data.status == SUBMITTED || data.status == PENDING
							?
							<InfoDisplayLink placeholder="Purchase Order" info={data.spares_purchase_order_secondary_id} linkOnPress={() => { linkTo(`/spares-purchase-orders/${data.spares_purchase_order_id}/preview`) }} />
							:
							null
					}
					<InfoDisplay placeholder={`Unit of Measurement`} info={`${data.unit_of_measurement}`} />
					<InfoDisplay placeholder={`Remarks`} info={`${data.remarks || "-"}`} />
					{
						status == REJECTED
							?
							<InfoDisplay placeholder={`Reject Notes`} info={`${data.reject_notes || "-"}`} />
							:
							null
					}

				</View>


			</View>
		</Body>
	)
}

export default PreviewSparesProcurementSummaryScreen;