import React from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';

import HeaderStack from '../../../components/atoms/display/HeaderStack';
import InfoDisplay from '../../../components/atoms/display/InfoDisplay';
import InfoDisplayLink from '../../../components/atoms/display/InfoDisplayLink';
import Body from '../../../components/atoms/display/Body';
import { useTailwind } from 'tailwind-rn/dist';
import { useDocument } from '@nandorojo/swr-firestore';
import { SparesPurchaseOrder } from '../../../types/SparesPurchaseOrder';
import { SPARES_PURCHASE_ORDERS } from '../../../constants/Firebase';
import LoadingData from '../../../components/atoms/loading/loadingData';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import { useLinkTo } from '@react-navigation/native';
import { View } from 'react-native';
import { openDocument } from '../../../services/StorageServices';
import { addCommaNumber } from '../../../helpers/NumericHelper';

const PreviewSparesPurchaseOrderSummaryScreen = ({ navigation, route }: RootNavigationProps<"ViewSparesPurchaseOrderSummary">) => {
	const { docID } = route.params;
	const linkTo = useLinkTo();
	const tailwind = useTailwind();

	const { data } = useDocument<SparesPurchaseOrder>(`${SPARES_PURCHASE_ORDERS}/${docID}`, {
		ignoreFirestoreDocumentSnapshotField: false,
		revalidateOnFocus: true,
	})


	if (!data) return <LoadingData message="This document might not exist" />;

	return (
		<Body header={<HeaderStack title={"Create Purchase Order"} navigateProp={navigation} />} style={tailwind("mt-6")}>
			<ViewPageHeaderText doc="Purchase Order" id={data.display_id} />

			<View>
				<InfoDisplay placeholder="Purchase Order Date" info={data.purchase_order_date} />
				<InfoDisplayLink placeholder="Procurement No." info={data.spares_procurement_secondary_id} linkOnPress={() => { linkTo(`/spares-procurements/${data.spares_procurement_id}/preview`) }} />

				<View>
					<InfoDisplay placeholder="Supplier" info={data.supplier.name || "-"} />
					<InfoDisplay placeholder="Product" info={data.product.product_description || "-"} />
					<InfoDisplay placeholder="Unit of Measurement" info={data.unit_of_measurement || "-"} />
					<InfoDisplay placeholder="Quantity" info={addCommaNumber(data.quantity, "-")} />
					<InfoDisplay placeholder="Unit Price" info={addCommaNumber(data.unit_price, "-")} />
					<InfoDisplay placeholder="Currency Rate" info={data.currency_rate || "-"} />
					<InfoDisplay placeholder="Total Amount" info={addCommaNumber(`${Number(data.quantity) * Number(data.unit_price)}`, "-")} />
					<InfoDisplay placeholder="Payment Term" info={data.payment_term || "-"} />
					<InfoDisplay placeholder="Vessel Name" info={data.vessel_name || "-"} />
					<InfoDisplay placeholder="Port" info={data.port || "-"} />
					<InfoDisplay placeholder="Delivery Location" info={data.delivery_location || "-"} />
					<InfoDisplay placeholder="Contact Person" info={data.contact_person ? data.contact_person.name : "-"} />
					<InfoDisplay placeholder="ETA/ Delivery Date" info={data.ETA_delivery_date || "-"} />
					<InfoDisplay placeholder="Remarks" info={data.remarks || "-"} />
					{
						data.doFile || data.invFile
							?
							<View>
								<InfoDisplay placeholder="Delivery Note No." info={data.doNumber || "-"} />
								<InfoDisplayLink placeholder="DO Attachment" info={data.doFile} linkOnPress={() => { openDocument(SPARES_PURCHASE_ORDERS, data.filename_storage_do) }} />
								<InfoDisplay placeholder="Invoice No." info={data.invNumber || "-"} />
								<InfoDisplayLink placeholder="Invoice Attachement" info={data.invFile} linkOnPress={() => { openDocument(SPARES_PURCHASE_ORDERS, data.filename_storage_inv) }} />
							</View>
							:
							null
					}
				</View>
			</View>


		</Body>
	)
}

export default PreviewSparesPurchaseOrderSummaryScreen;