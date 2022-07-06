import React, { useEffect, useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import InfoDisplay from '../../../components/atoms/display/InfoDisplay';
import InfoDisplayLink from '../../../components/atoms/display/InfoDisplayLink';
import ViewInvoiceButtons from '../../../components/templates/sales/ViewInvoice/ViewInvoiceButtons';
import { useDocument } from '@nandorojo/swr-firestore';
import { Invoice } from '../../../types/Invoice';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { useLinkTo } from '@react-navigation/native';
import Body from '../../../components/atoms/display/Body';
import { useTailwind } from 'tailwind-rn/dist';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import { View } from 'react-native';
import { addCommaNumber } from '../../../helpers/NumericHelper';
import { User } from '../../../types/User';
import { convertCurrency } from '../../../constants/Currency';


const ViewInvoiceSummaryScreen = ({ navigation, route }: RootNavigationProps<"ViewInvoiceSummary">) => {

	const tailwind = useTailwind();

	let buttons;
	const { docID } = route.params
	const [status, setStatus] = useState("");
	const linkTo = useLinkTo();

	const { data } = useDocument<Invoice>(`invoices/${docID}`, {
		ignoreFirestoreDocumentSnapshotField: false,
		revalidateOnFocus: true,
	})

	useEffect(() => {
		setStatus(data?.status || "");
	}, [data?.status])

	let bunkers = data?.bunker_barges;
	
	if (!data || !bunkers) return <LoadingData message="This document might not exist" />;

	buttons = <ViewInvoiceButtons
		status={status}
		created_by={data.created_by || {} as User}
		setStatus={setStatus}
		linkTo={(link) => { linkTo(link) }}
		docID={data.id}
		display_id={data.display_id}
		job_confirmation_id={data.job_confirmation_id || ""}
		data={data}
	/>

	return (
		<Body header={<HeaderStack title={"View Invoice"} navigateProp={navigation} />} style={tailwind("pt-10")}>

			<ViewPageHeaderText doc="Invoice" id={data.display_id} status={status} />

			<View>

				<InfoDisplay placeholder="Invoice Date" info={data.invoice_date} />
				<InfoDisplay placeholder="D/O No." info={data.do_no} />
				<InfoDisplay placeholder="Purchase Order No." info={data.purchase_order_no || "-"} />
				<InfoDisplay placeholder="Payment Term" info={data.payment_term || "-"} />

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

				<View style={tailwind("mt-5")} />

				<InfoDisplay placeholder="Customer" info={data.customer?.name} />
				<InfoDisplay placeholder="Address" info={data.customer?.address} />
				<InfoDisplay placeholder="Attention (PIC)" info={data.attention_pic?.name || "-"} />
				<InfoDisplay placeholder="Phone" info={data.customer?.telephone} />
				<InfoDisplay placeholder="Fax" info={data.customer?.fax} />
				<InfoDisplay placeholder="Customer Account No." info={data.customer?.account_no} />

				<View style={tailwind("mt-5")} />

				<InfoDisplay placeholder="Currency Rate" info={data.currency_rate} />

				{
					data.products.map((item, index) => (
						<View key={index}>
							<View style={tailwind("border border-neutral-300 mb-5 mt-3")} />
							<InfoDisplay placeholder={`Product ${index + 1}`} info={item.product.name} />
							<InfoDisplay placeholder="BDN Quantity" info={`${addCommaNumber(item.BDN_quantity.quantity, "0")} ${item.BDN_quantity.unit}`} />
							<InfoDisplay placeholder="Unit of Measurement" info={`${addCommaNumber(item.quantity, "0")} ${item.unit}`} />
							<InfoDisplay placeholder="Price 1" info={`${convertCurrency(data.currency_rate!)} ${addCommaNumber(item.price.value, "0")} ${item.price.unit}${item.MOPS ? ` - MOPS price` : ""}`} />
							<InfoDisplay placeholder="Subtotal" info={`${convertCurrency(data.currency_rate!)} ${addCommaNumber(item.subtotal, "0")}`} />
						</View>
					))
				}

				<View style={tailwind("border border-neutral-300 mb-5 mt-3")} />

				<InfoDisplay placeholder="Barging Fee" info={`${data.barging_fee ? `${convertCurrency(data.currency_rate!)} ${addCommaNumber(data.barging_fee, "-")}${data.barging_remark ? `/${data.barging_remark}` : ""}` : `-`}`} />
				<InfoDisplay placeholder="Discount" info={`${convertCurrency(data.currency_rate!)} ${addCommaNumber(data.discount, "-")}`} />
				<InfoDisplay placeholder="Total" info={`${convertCurrency(data.currency_rate!)} ${addCommaNumber(data.total_payable, "-")}`} />

				<View style={tailwind("mt-5")} />

				<InfoDisplay placeholder="Sale Ref" info={data.quotation_secondary_id} />
				<InfoDisplay placeholder="Delivery Location" info={data.delivery_location || "-"} />

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
								
				<InfoDisplay placeholder="Mode of Delivery" info={data.delivery_mode} />

				<View style={tailwind("mt-5")} />
				<InfoDisplay placeholder="Contract" info={data.contract || "-"} />
				<InfoDisplay placeholder="Bank Details" info={data.bank_details?.name || "-"} />
				<InfoDisplay placeholder="Notes" info={data.notes || "-"} />

				{status == "rejected" ? (
					<InfoDisplay placeholder="Reject Notes" info={data.reject_notes || "-"} />
				) : null}

				{
					data.receipts
						?
						data.receipts.map((item, index) => {
							if (data.receipts) {
								let displayID = data.receipts[index].secondary_id;
								let navID = data.receipts[index].id;
								return (
									<InfoDisplayLink
										key={index}
										placeholder={`Official Receipt ${index + 1}`}
										info={`${displayID}`}
										linkOnPress={() => {
											linkTo(`/receipts/${navID}/show`)
										}} />
								)
							}
						})
						:
						null
				}

			</View>

			<View style={tailwind("mt-10")}>
				{buttons}
			</View>

		</Body>
	)
}

export default ViewInvoiceSummaryScreen;