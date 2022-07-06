import React, { useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import DoubleDisplay from '../../../components/molecules/display/DoubleDisplay';
import { Formik } from 'formik';
import { useCollection, useDocument } from '@nandorojo/swr-firestore';
import { Invoice } from '../../../types/Invoice';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { createReceipt } from '../../../services/ReceiptServices';
import { useLinkTo } from '@react-navigation/native';
import { useTailwind } from 'tailwind-rn';
import FormTextInputField from '../../../components/molecules/input/FormTextInputField';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import { View } from 'react-native';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import TextInputField from '../../../components/atoms/input/text/TextInputField';
import * as Yup from "yup";
import { BANKS, INVOICES } from '../../../constants/Firebase';
import { Bank } from '../../../types/Bank';
import { getBankNameList } from '../../../helpers/BankHelper';
import { APPROVED } from '../../../types/Common';
import Unauthorized from '../../../components/atoms/unauthorized/Unauthorized';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { convertCurrency } from '../../../constants/Currency';


const current_date = `${new Date().getDate().toString()}/${(new Date().getMonth() + 1).toString()}/${new Date().getFullYear().toString()}`;

const formSchema = Yup.object().shape({
	amount_received: Yup.string().required("Required"),
	account_received_in: Yup.string().required("Required")
});

const CreateReceiptFormScreen = ({ navigation, route }: RootNavigationProps<"CreateOfficialReceipt">) => {
	const tailwind = useTailwind();
	const { docID } = route.params;
	const [loading, setLoading] = useState(false);
	const linkTo = useLinkTo();
	const allowedStatuses = [APPROVED];
	const user = useSelector(UserSelector);

	let initialValues = {
		secondary_id: "",
		invoice_id: "",
		invoice_secondary_id: "",
		account_received_in: "",
		cheque_number: "",
		customer: { name: "", account_no: "" },
		receipt_date: "",
		barging_fee: "",
		barging_remark: "",
		invoice_date: "",
		products: [{ product: { name: "" }, BDN_quantity: { quantity: "", unit: "" }, quantity: "", unit: "", price: { value: "", unit: "" }, subtotal: "" }],
		discount: "",
		total_payable: "",
		amount_received: "",
		currency_rate: ""
	};


	const { data } = useDocument<Invoice>(`${INVOICES}/${docID}`, {
		ignoreFirestoreDocumentSnapshotField: false,
	})

	const { data: banks } = useCollection<Bank>(`${BANKS}`, {
		ignoreFirestoreDocumentSnapshotField: false,
		where: ["deleted", "==", false]
	})

	if (!data || !banks) return <LoadingData message="This document might not exist" />;

	if (!allowedStatuses.includes(data?.status!)) {
		return <Unauthorized />;
	}

	const { bankList } = getBankNameList(banks);

	initialValues = {
		secondary_id: "",
		invoice_id: data.id,
		invoice_secondary_id: data.display_id,
		account_received_in: "",
		barging_fee: data.barging_fee || "",
		barging_remark: data.barging_remark || "",
		receipt_date: current_date,
		invoice_date: data.invoice_date,
		customer: data.customer || { name: "", account_no: "" },

		currency_rate: data.currency_rate || "MYR",
		products: data.products,
		discount: data.discount || "",
		total_payable: data.total_payable || "",
		amount_received: "",
		cheque_number: "",
	}


	return (
		<Body header={<HeaderStack title={"Issue Receipt"} navigateProp={navigation} />} style={tailwind("pt-10")}>

			<View style={tailwind("mt-5")} />

			<Formik
				initialValues={initialValues}
				validationSchema={formSchema}
				onSubmit={(values) => {
					setLoading(true);
					let bank_chosen = banks[bankList.indexOf(values.account_received_in || "")]

					createReceipt(
						{
							...values,
							account_received_in: {
								id: bank_chosen.id,
								name: bank_chosen.name,
								account_no: bank_chosen.account_no,
								swift_code: bank_chosen.swift_code,
								address: bank_chosen.address,
							}
						},
						user!,
						(id) => {
							linkTo(`/receipts/${id}/summary`);
							setLoading(false);
						}, (error) => {
							console.error(error);
						}
					);
				}}
			>

				{({ errors, touched, values, setFieldValue, handleSubmit }) => (
					<View style={tailwind("mt-5")}>

						<FormTextInputField
							label="Receipt Date"
							value={values.receipt_date}
							editable={false}
						/>

						<FormTextInputField
							label="Invoice Number"
							value={values.invoice_secondary_id}
							editable={false}
						/>


						<FormDropdownInputField
							label="Account Received In"
							value={values.account_received_in || ""}
							items={bankList}
							onChangeValue={(val) => setFieldValue("account_received_in", val)}
							hasError={errors.account_received_in && touched.account_received_in ? true : false}
							errorMessage={errors.account_received_in}
							required={true}
						/>

						<FormTextInputField
							label="Cheque Number"
							value={values.cheque_number || ""}
							onChangeValue={(val) => setFieldValue("cheque_number", val)}
						/>

						<FormTextInputField
							label="Received From"
							value={values.customer?.name || "-"}
							editable={false}
						/>

						<FormTextInputField
							label="Customer Account No. (e.g 3000-C012)"
							value={values.customer?.account_no || "-"}
							editable={false}
						/>

						{
							values.products.map((item, index) => (
								<View key={index}>
									<View style={tailwind("mb-1")}>
										<TextLabel content={`Product ${index + 1} - ${item.product.name}`} />
									</View>

									<DoubleDisplay label={`BDN Quantity ${index + 1}`} amount={item.BDN_quantity.quantity} unit={item.BDN_quantity.unit} />

									<DoubleDisplay label={`Unit of Measurement ${index + 1}`} amount={item.quantity} unit={item.unit} />

									<DoubleDisplay label={`Price ${index + 1}`} amount={`${convertCurrency(data.currency_rate!)} ${item.price.value}`} unit={item.price.unit} />

									<View style={tailwind("mb-4")}>
										<View style={tailwind("mb-2")}>
											<TextLabel content="Subtotal" color='font-black text-gray-primary' />
										</View>
										<TextInputField
											placeholder={`${convertCurrency(data.currency_rate!)} ${item.subtotal}`}
											onChangeText={() => null}
											editable={false}
											shadow={true}
										/>
									</View>
								</View>
							))
						}

						<FormTextInputField
							label="Barging Fee"
							value={`${convertCurrency(data.currency_rate!)} ${values.barging_fee || "0"}`}
							editable={false}
						/>

						<FormTextInputField
							label="Discount"
							value={`${convertCurrency(data.currency_rate!)} ${values.discount}`}
							editable={false}
						/>

						<FormTextInputField
							label="Total"
							value={`${convertCurrency(data.currency_rate!)} ${values.total_payable}`}
							editable={false}
						/>

						<FormTextInputField
							label="Amount Received"
							value={`${convertCurrency(data.currency_rate!)} ${values.amount_received}`}
							onChangeValue={text => setFieldValue("amount_received", text.replace(`${convertCurrency(data.currency_rate!)}`, "").trim())}
							required={true}
							number={true}
							hasError={errors.amount_received && touched.amount_received ? true : false}
							errorMessage={errors.amount_received}
						/>

						<RegularButton text="Review Receipt and Submit" operation={() => { handleSubmit() }} loading={loading} />

					</View>
				)}
			</Formik>
		</Body>
	)
}

export default CreateReceiptFormScreen;