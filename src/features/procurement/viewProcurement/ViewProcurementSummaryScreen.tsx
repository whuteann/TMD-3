import React from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import InfoDisplayLink from '../../../components/atoms/display/InfoDisplayLink';
import InfoDisplay from '../../../components/atoms/display/InfoDisplay';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { useTailwind } from 'tailwind-rn/dist';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import { useDocument } from '@nandorojo/swr-firestore';
import { Procurement } from '../../../types/Procurement';
import { PROCUREMENTS } from '../../../constants/Firebase';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { useLinkTo } from '@react-navigation/native';
import { View } from 'react-native';
import { PENDING, SUBMITTED } from '../../../types/Common';
import { addCommaNumber } from '../../../helpers/NumericHelper';
import { convertCurrency } from '../../../constants/Currency';

const ViewProcurementSummaryScreen = ({ navigation, route }: RootNavigationProps<"ViewProcurementSummary">) => {

	const tailwind = useTailwind();
	const docID = route.params.docID;
	const linkTo = useLinkTo();

	const { data } = useDocument<Procurement>(`${PROCUREMENTS}/${docID}`, {
		ignoreFirestoreDocumentSnapshotField: false,
		revalidateOnFocus: true,
	})

	if (!data) return <LoadingData message="This document might not exist" />;

	return (
		<Body header={<HeaderStack title={"View Procurement"} navigateProp={navigation} />} style={tailwind("pt-10")}>
			<View>

				<ViewPageHeaderText doc="Procurement" id={data.secondary_id} />

				<View style={tailwind("h-[400px]")}>
					<InfoDisplay placeholder="Procurement Date" info={data.procurement_date || "-"} />

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
					
					<InfoDisplay placeholder="Supplier" info={data.supplier.name || "-"} />
					<InfoDisplay placeholder="Product" info={data.product.name || "-"} />
					<InfoDisplay placeholder="Quantity" info={addCommaNumber(data.quantity, "-")} />
					<InfoDisplay placeholder="Unit of Measurement" info={data.unit_of_measurement || "-"} />
					<InfoDisplay placeholder="Currency Rate" info={data.currency_rate || "-"} />
					<InfoDisplay placeholder="Unit Price" info={`${convertCurrency(data.currency_rate)} ${data.unit_price}` || "-"} />
					<InfoDisplay placeholder="Payment Term" info={data.payment_term || "-"} />
					<InfoDisplay placeholder="Mode of Delivery" info={data.delivery_mode || "-"} />
					<InfoDisplay placeholder="Total Amount" info={` ${data.total_amount}` || "-"} />

					{
						data.status == SUBMITTED || data.status == PENDING
							?
							<InfoDisplayLink placeholder="Purchase Order" info={data.purchase_order_secondary_id} linkOnPress={() => { linkTo(`/purchase-orders/${data.purchase_order_id}/show`) }} />
							:
							null
					}


				</View>
			</View>

			<View>
				{
					data.status == "Requesting"
						?
						<RegularButton type="secondary" text="Create Purchase Order" operation={() => { linkTo(`/purchase-orders/${data.id}/create`) }} />
						:
						null
				}
			</View>

		</Body>
	)
}

export default ViewProcurementSummaryScreen;