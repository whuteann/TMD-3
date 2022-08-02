import React, { useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import InfoDisplay from '../../../components/atoms/display/InfoDisplay';
import PriceDisplay from '../../../components/templates/sales/ViewQuotation/PriceDisplay';
import { revalidateCollection, revalidateDocument, useDocument } from '@nandorojo/swr-firestore';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { Quotation } from '../../../types/Quotation';
import { updateQuotation } from '../../../services/QuotationServices';
import { useTailwind } from 'tailwind-rn/dist';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { View } from 'react-native';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import { QUOTATIONS, USERS } from '../../../constants/Firebase';
import { generateProductDisplay } from '../../../helpers/QuotationHelper';
import { DRAFT, HEAD_OF_MARKETING_ROLE, IN_REVIEW, REVISED_CODE, SUPER_ADMIN_ROLE } from '../../../types/Common';
import Unauthorized from '../../../components/atoms/unauthorized/Unauthorized';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { SUBMIT_ACTION } from '../../../constants/Action';
import { addCommaNumber } from '../../../helpers/NumericHelper';
import { convertCurrency } from '../../../constants/Currency';
import { sendNotifications } from '../../../services/NotificationServices';
import { addQuotationCount } from '../../../services/UserServices';
import { useRefreshContext } from '../../../providers/RefreshProvider';
import { loadingDelay } from '../../../helpers/GenericHelper';


const CreateQuotationSummaryScreen = ({ navigation, route }: RootNavigationProps<"CreateQuotationSummary">) => {
	const tailwind = useTailwind();

	const [loading, setLoading] = useState(false);
	const docID = route.params.docID;
	const allowedStatuses = [DRAFT];
	const user = useSelector(UserSelector);
	const refreshContext = useRefreshContext();

	let displayID = "";
	let revisedCode: number;

	const { data } = useDocument<Quotation>(`${QUOTATIONS}/${docID}`, {
		ignoreFirestoreDocumentSnapshotField: false,
		revalidateOnFocus: true
	})

	const ports = data?.ports;
	const bunkers = data?.bunker_barges
	const delivery_modes = data?.delivery_modes

	if (!data || !ports || !bunkers || !delivery_modes) return <LoadingData message="This document might not exist" />;

	if (!allowedStatuses.includes(data?.status!)) {
		return <Unauthorized />;
	}

	const productsDisplayList: Array<{ name: string, unit: string, prices: Array<{ value: string, unit: string, remarks: string }> }> = generateProductDisplay(data.products);

	revisedCode = data.revised_code !== undefined ? Number(data.revised_code) + 1 : 0
	displayID = `${data.secondary_id}${data.revised_code !== undefined ? REVISED_CODE(revisedCode) : ""}`;

	return (
		<Body header={<HeaderStack title={"Create Quotation"} navigateProp={navigation} />} style={tailwind("pt-10")}>

			<ViewPageHeaderText doc="Quotation" id={displayID} />


			<View>
				<InfoDisplay placeholder={`Quotation Date`} info={`${data.quotation_date}`} />
				<InfoDisplay placeholder={`Customer`} info={`${data.customer?.name}`} />
				<InfoDisplay placeholder={`Customer Address`} info={`${data.customer?.address}`} />
				{
					ports.map((item, index) => {
						return (
							<View key={item.port}>
								<View style={tailwind("border border-neutral-300 mb-5 mt-2")} />
								<InfoDisplay placeholder={`Port ${index + 1}`} info={`${item.port}` || "-"} bold={true} />
								<InfoDisplay placeholder={`Delivery Location`} info={`${item.delivery_location}` || "-"} />
							</View>
						)
					})
				}
				<View style={tailwind("border border-neutral-300 mb-5 mt-3")} />

				<InfoDisplay placeholder={`Delivery Date`} info={
					data.delivery_date?.startDate
						?
						data.delivery_date.endDate
							?
							`${data.delivery_date?.startDate} to ${data.delivery_date?.endDate}`
							:
							`${data.delivery_date.startDate}`
						:
						"-"}
				/>

				{
					delivery_modes.map((item, index) => {
						return (
							<View key={item}>
								<InfoDisplay placeholder={`Delivery Mode ${index + 1}`} info={`${item}` || "-"} bold={true} />
							</View>
						)
					})
				}

				<InfoDisplay placeholder={`Currency Rate`} info={`${data.currency_rate}` || "-	"} />

				<View style={tailwind("border border-neutral-300 mb-5 mt-2")} />
				{
					bunkers.map((item, index) => {
						return (
							<View key={item.id}>

								<InfoDisplay placeholder={`Bunker Barge ${index + 1}`} info={`${item.name}` || "-"} bold={true} />
								<InfoDisplay placeholder={`Capacity`} info={`${addCommaNumber(item.capacity, "0")}` || "-"} />
							</View>
						)
					})
				}
				<View style={tailwind("border border-neutral-300 mb-5 mt-3")} />


				<InfoDisplay placeholder={`Receiving Vessel's Name`} info={`${data.receiving_vessel_name || "-"}`} />
				<InfoDisplay placeholder={`Remarks`} info={`${data.remarks || "-"}`} />

				<View>
					{
						productsDisplayList.map(
							(item, index) => (
								<PriceDisplay
									key={index}
									currency={convertCurrency(data.currency_rate!)}
									product={item.name}
									unit={item.unit}
									prices={item.prices}
									index={index}
									status={"status"}
									products={productsDisplayList}
								/>
							)
						)
					}
				</View>

				<View style={tailwind("border border-neutral-300 mb-5 mt-3")} />

				<InfoDisplay placeholder={`Barging Fee`} info={`${data.barging_fee ? `${convertCurrency(data.currency_rate!)} ${addCommaNumber(data.barging_fee, "-")}${data.barging_remark ? `/${data.barging_remark}` : ""}` : `-`}`} />
				<InfoDisplay placeholder={`Conversion Factor`} info={`${data.conversion_factor || "-"}`} />
				<InfoDisplay placeholder={`Payment Term`} info={`${data.payment_term || "-"}`} />
				<InfoDisplay placeholder={`Validity`} info={`Date: ${data.validity_date == "--Select Date--" ? "-" : data.validity_date}`} />
				<InfoDisplay placeholder={``} info={`Time: ${data.validity_time}`} />


				<View style={tailwind("mt-12")}>
					<RegularButton text="Submit RFQ"
						operation={
							() => {
								setLoading(true);

								updateQuotation(docID, { ...data.__snapshot?.data(), revised_code: revisedCode, display_id: displayID, status: IN_REVIEW }, user!, SUBMIT_ACTION, () => {
									

									sendNotifications(
										[SUPER_ADMIN_ROLE, HEAD_OF_MARKETING_ROLE],
										revisedCode > 0
											?
											`Quotation ${data.display_id} updated by ${user?.name}.`
											:
											`New quotation ${data.secondary_id} submitted by ${user?.name}. `,
										{ screen: "ViewQuotationSummary", docID: data.id });

									

									if (revisedCode == 0) {
										addQuotationCount(user?.id!);
										revalidateDocument(`${USERS}/${user?.id}`);
									}

									loadingDelay(()=>{
										revalidateCollection(QUOTATIONS);
										navigation.navigate("Dashboard");
										setLoading(false);
									});
									
								}, (error) => {
									console.error(error)
								});

								refreshContext?.refreshList(QUOTATIONS);
							}
						}
						loading={loading} />
				</View>

				<RegularButton text="Cancel" type="secondary" operation={() => { navigation.navigate("ViewAllQuotation") }} />
			</View>
		</Body>
	)
}

export default CreateQuotationSummaryScreen;