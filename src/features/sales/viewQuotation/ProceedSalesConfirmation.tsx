import React, { useEffect, useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import InfoDisplay from '../../../components/atoms/display/InfoDisplay';
import UploadButton from '../../../components/molecules/buttons/UploadButton';
import PriceRadioButtons from '../../../components/templates/sales/ViewQuotation/PriceRadioButtons';
import { revalidateDocument, useDocument } from '@nandorojo/swr-firestore';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { useLinkTo } from '@react-navigation/native';
import { Quotation } from '../../../types/Quotation';
import { updateQuotation } from '../../../services/QuotationServices';
import { createSalesConfirmation, recreateSalesConfirmation } from '../../../services/SalesConfirmationServices';
import InfoInput from '../../../components/atoms/input/InfoInput';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { useTailwind } from 'tailwind-rn/dist';
import { View } from 'react-native';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import { QUOTATIONS, SALES_CONFIRMATIONS } from '../../../constants/Firebase';
import { Product } from '../../../types/Product';
import { APPROVED } from '../../../types/Common';
import Unauthorized from '../../../components/atoms/unauthorized/Unauthorized';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { UPDATE_ACTION } from '../../../constants/Action';
import { addCommaNumber } from '../../../helpers/NumericHelper';
import RadioButtonGroup from '../../../components/molecules/buttons/RadioButtonGroup';
import PortRadioButton from '../../../components/templates/sales/ViewQuotation/PortRadioButton';
import { updateSales } from '../../../services/SalesServices';
import DeliverModeRadioButton from '../../../components/templates/sales/ViewQuotation/DeliveryModeRadioButton';
import { convertCurrency } from '../../../constants/Currency';

const ProceedSalesConfirmationScreen = ({ navigation, route }: RootNavigationProps<"ProceedSalesConfirmation">) => {

	const tailwind = useTailwind();
	const [uploaded, setUploaded] = useState(false);
	const user = useSelector(UserSelector);
	const [loading, setLoading] = useState(false);
	const [poNumberError, setPoNumberError] = useState(false);
	const docID = route.params.docID;
	const linkTo = useLinkTo();
	const allowedStatuses = [APPROVED];
	let portsDisplayItems: Array<{ content: any, value: string }> = [];
	let deliveryModeDisplayItems: Array<{ content: any, value: string }> = [];

	const [pickedIndex, setPickedIndex] = useState<number | undefined>(undefined);
	const [pickedIndexDeliveryMode, setPickedIndexDeliveryMode] = useState<number | undefined>(undefined);
	const [pickedPrices, setPickedPrices] = useState<Array<{ product: Product, unit: string, quantity: string, price: { value: string, unit: string } }>>([]);

	const { data } = useDocument<Quotation>(`${QUOTATIONS}/${docID}`, {
		ignoreFirestoreDocumentSnapshotField: false,
		revalidateOnFocus: true,
	})

	const [poNumber, setPoNumber] = useState<string>("");



	useEffect(() => {
		setPoNumber(data?.__snapshot?.data().purchase_order_no);
	}, [data?.__snapshot?.data().purchase_order_no])

	let bunkers = data?.bunker_barges;

	if (!data || !bunkers) return <LoadingData message="This document might not exist" />;

	if (!allowedStatuses.includes(data?.status!)) {
		return <Unauthorized />;
	}

	const productsDisplayList: Array<{ product: Product, unit: string, quantity: string, prices: Array<{ value: string, unit: string, remarks: string }> }> = data?.__snapshot?.data().products;

	data.ports.map((item, index) => (
		portsDisplayItems.push(
			{
				content: (
					<PortRadioButton index={index} port={item.port} delivery_location={item.delivery_location} />
				), value: item.port
			}
		)
	))

	data.delivery_modes!.map((item, index) => (
		deliveryModeDisplayItems.push(
			{
				content: (
					<DeliverModeRadioButton index={index} delivery_mode={item} />
				), value: item
			}
		)
	))


	const proceedSales = () => {
		let pickedPort = data.ports[pickedIndex || 0];
		let pickedDeliveryMode = data.delivery_modes![pickedIndexDeliveryMode || 0];

		setLoading(true);
		if (data.purchase_order_file && (poNumber == "" || !poNumber)) {
			setPoNumberError(true);
			setLoading(false);
		} else {
			if (data.sales_confirmation_id, data.sales_confirmation_id) {
				recreateSalesConfirmation(
					data.sales_confirmation_id,
					poNumber
						?
						{ ...data, purchase_order_no: poNumber, port: pickedPort.port, delivery_location: pickedPort.delivery_location, delivery_mode: pickedDeliveryMode }
						:
						{ ...data, port: pickedPort.port, delivery_location: pickedPort.delivery_location, delivery_mode: pickedDeliveryMode }
					, pickedPrices,
					user!, () => {
						linkTo(`/sales-confirmation/${data.sales_confirmation_id}/summary`); setLoading(false);
					}, (error) => {
						console.error(error);
						setLoading(false);
					});
			} else {
				createSalesConfirmation(
					docID,
					{ ...data, purchase_order_no: poNumber, port: pickedPort.port, delivery_location: pickedPort.delivery_location, delivery_mode: pickedDeliveryMode },
					pickedPrices,
					user!, (id) => {
						updateQuotation(
							docID,
							poNumber ? { purchase_order_no: poNumber, sales_confirmation_id: id } : { sales_confirmation_id: id },
							user!,
							UPDATE_ACTION,
							() => {
								revalidateDocument(`${QUOTATIONS}/${docID}`)
								updateSales(data.sales_id, { sales_id: id }, user, () => {
									linkTo(`/sales-confirmation/${id}/summary`);
								}, (error) => {
									console.error(error);
								})
							}, (error) => {

							}
						)
						setLoading(false);
					}, (error) => {
						console.error(error);
					}
				)
			}
		}
	}


	return (
		<Body header={<HeaderStack title={"Proceed Sales Confirmation"} navigateProp={navigation} />} style={tailwind("pt-10")}>

			<ViewPageHeaderText doc="Quotation" id={data.display_id} status={"Approved"} />

			<View>
				<InfoDisplay placeholder={`Quotation Date`} info={data.quotation_date} />
				<InfoDisplay placeholder={`Customer`} info={data.customer?.name} />
				<InfoDisplay placeholder={`Customer Address`} info={`${data.customer?.address}`} />

				<RadioButtonGroup displayItem={portsDisplayItems} onPicked={(picked) => { setPickedIndex(picked); }} />

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
				
				<InfoDisplay placeholder={`Currency Rate`} info={data.currency_rate} />

				<RadioButtonGroup displayItem={deliveryModeDisplayItems} onPicked={(picked) => { setPickedIndexDeliveryMode(picked); }} />

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
				<View style={tailwind("border border-neutral-300 mb-5 mt-2")} />
				<InfoDisplay placeholder={`Barging Fee`} info={`${data.barging_fee ? `${convertCurrency(data.currency_rate!)} ${addCommaNumber(data.barging_fee, "-")}${data.barging_remark ? `/${data.barging_remark}` : ""}` : `-`}`} />
				<InfoDisplay placeholder={`Conversion Factor`} info={data.conversion_factor || "-"} />
				<InfoDisplay placeholder={`Remarks`} info={data.remarks || "-"} />
				{
					productsDisplayList
						?
						productsDisplayList.map(
							(item, index) =>
							(
								<PriceRadioButtons
									key={index}
									currency={convertCurrency(data.currency_rate!)}
									product={item.product.name}
									currItem={item}
									index={index + 1}
									prices={productsDisplayList[index].prices}
									pickedPrices={pickedPrices}
									setPickedPrices={(val) => setPickedPrices(val)}
								/>
							)
						)
						:
						<></>
				}
				<View style={tailwind("border border-neutral-300 mb-5 mt-3")} />

				<InfoDisplay placeholder={`Payment Term`} info={data.payment_term || "-"} />
				<InfoDisplay placeholder={`Validity`} info={`Date: ${data.validity_date == "--Select Date--" ? "-" : data.validity_date}, Time: ${data.validity_time}`} />

				{uploaded ? (
					<View>
						<InfoInput placeholder="Purchase Order No." value={poNumber} onChangeText={setPoNumber} hasError={poNumberError} errorMessage={"Required"} />
					</View>
				) : null}

			</View>

			<UploadButton
				buttonText={"Upload Purchase Order"}
				path={SALES_CONFIRMATIONS}
				value={data?.__snapshot?.data().purchase_order_file}
				filename_storage={data?.__snapshot?.data().filename_storage}
				updateDoc={(filename, filename_storage) => {
					updateQuotation(docID, { purchase_order_file: filename, filename_storage: filename_storage }, user!, UPDATE_ACTION, () => {
						revalidateDocument(`${QUOTATIONS}/${docID}`)
					}, (error) => {
						console.error(error);
					})
				}}
				setUploaded={setUploaded}
			/>

			<View style={tailwind("mb-3 mt-7")}>
				<RegularButton
					type={
						(productsDisplayList ? pickedPrices.length == productsDisplayList.length : false) && (pickedIndex != undefined) && (pickedIndexDeliveryMode != undefined) ? "primary" : "disabled"}
					text="Proceed Confirmation"
					operation={
						() => { proceedSales(); }
					}
					loading={loading}
				/>

			</View>

		</Body>
	)
}

export default ProceedSalesConfirmationScreen;