import React, { useState } from 'react';
import { RootNavigationProps } from '../../navigations/NavigationProps/NavigationProps';
import { Formik, FieldArray } from 'formik';
import { submitProfile } from '../../helpers/ProfileHelper';
import { revalidateDocument, useDocument } from '@nandorojo/swr-firestore';
import LoadingData from '../../components/atoms/loading/loadingData';
import { auth } from '../../functions/Firebase';
import { User } from '../../types/User';
import RegularButton from '../../components/atoms/buttons/RegularButton';
import Body from '../../components/atoms/display/Body';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../components/atoms/typography/TextLabel';
import FormTextInputField from '../../components/molecules/input/FormTextInputField';
import { USERS } from '../../constants/Firebase';
import AddNewButton from '../../components/molecules/buttons/AddNewButton';
import ContactNumberInput from '../../components/templates/auth/ContactNumberInput';
import TextInputField from '../../components/atoms/input/text/TextInputField';
import * as Yup from "yup"
import { View } from 'react-native';
import FormLabel from '../../components/molecules/typography/FormLabel';

const formSchema = Yup.object().shape({
	password: Yup.string()
		.min(6, "Must be at least 6 characters"),
	confirmPassword: Yup.string()
		.oneOf([Yup.ref('password'), null], "Passwords don't match!"),


	contacts: Yup.array().of(
		Yup.object().shape({
			type: Yup.string().required("Required"),
			number: Yup.string().required("Required")
		})
	),

}, [["password", "confirmPassword"]]);


const ProfileScreen = ({ navigation, route }: RootNavigationProps<"Profile">) => {


	const [deleted, setDeleted] = useState(false);
	const [loading, setLoading] = useState(false);
	const tailwind = useTailwind();
	const [confirmPasswordError, setConfirmPasswordError] = useState(false);
	const [currentPasswordError, setCurrentPasswordError] = useState(false);
	const [currentPasswordErrorMessage, setCurrentPasswordErrorMessage] = useState("Please enter your current password");

	const { data } = useDocument<User>(`${USERS}/${auth.currentUser?.uid}`, {
		ignoreFirestoreDocumentSnapshotField: false,
		revalidateOnFocus: true,
	})

	if (!data) return <LoadingData />

	let initialValues = {
		contacts: data.contacts || [{ number: "", type: "Mobile" }],
		password: "",
		confirmPassword: "",
		currentPassword: "",
	}


	return (
		<Body
			header={
				<View style={tailwind("items-start p-6 pl-10 border-0 box-card-shadow bg-white")}>
					<TextLabel content="Let's get started" style={tailwind("text-22px font-black")} />
					<TextLabel content="by completing your profile!" style={tailwind("text-22px font-black")} />
				</View>
			}
		>

			<View style={tailwind("mt-10")}>
				<FormTextInputField
					label='Name'
					value={`${data.name}`}
					editable={false}
					shadow={false}
				/>

				<FormTextInputField
					label='Department/Position'
					value={`${data.role}`}
					editable={false}
					shadow={false}
				/>

				<FormTextInputField
					label='Email'
					value={`${data.email}`}
					editable={false}
					shadow={false}
				/>

				<Formik
					initialValues={initialValues}
					enableReinitialize={true}
					onSubmit={
						(values) => {
							setLoading(true);
							if (values.password !== "") {
								if (values.confirmPassword == "") {
									setConfirmPasswordError(true);
									setLoading(false);
								} else if (values.confirmPassword == "") {
									setCurrentPasswordError(true);
									setLoading(false);
								}
								else {
									submitProfile(
										values,
										values.currentPassword,
										() => {
											navigation.navigate("Dashboard");
											revalidateDocument(`${USERS}/${auth.currentUser?.uid}`);
											setLoading(false);
										},
										(error) => {
											setCurrentPasswordError(true);
											setCurrentPasswordErrorMessage(error || "");
											revalidateDocument(`${USERS}/${auth.currentUser?.uid}`);
											setLoading(false);
										}
									);
								}
							} else {
								submitProfile(
									values,
									values.currentPassword,
									() => { navigation.navigate("Dashboard"); setLoading(false) },
									(error) => { console.error(error) }
								);
							}
						}}
					validationSchema={formSchema}
				>
					{({ errors, touched, values, setFieldValue, handleSubmit }) => (
						<View>
							<View>
								<FormLabel text={"Contact Number"} required={true} />
								<FieldArray name="contacts">
									{({ remove, push }) => (
										<View>
											{values.contacts.length > 0 ? (
												values.contacts.map((item, index) => (

													<View key={index}>
														<ContactNumberInput
															handleDelete={() => { remove(index); setDeleted(!deleted) }}
															deleted={deleted}
															index={index}
															contacts={values.contacts}
															listLength={values.contacts.length}
															errors={errors.contacts && touched.contacts ? errors.contacts : undefined}
														/>

													</View>

												))) : null}

											<View style={tailwind("mb-5")}>
												<AddNewButton text="Add Another Phone" onPress={() => push({ type: 'Mobile', number: "" })} />
											</View>
										</View>
									)}
								</FieldArray>

							</View>

							<TextLabel content={"Reset Password"} style={tailwind("font-bold mb-2")} />
							<TextInputField
								placeholder='Current Password'
								value={values.currentPassword}
								onChangeText={(val) => { setFieldValue("currentPassword", val) }}
								shadow={false}
								password={true}
								hasError={(errors.currentPassword && touched.currentPassword) || currentPasswordError ? true : false}
								errorMessage={currentPasswordErrorMessage}
							/>
							<TextInputField
								placeholder='New Password'
								value={values.password}
								onChangeText={(val) => { setFieldValue("password", val) }}
								shadow={false}
								margin={tailwind("mb-3")}
								password={true}
								hasError={errors.password && touched.password ? true : false}
								errorMessage={errors.password}
							/>
							<TextInputField
								placeholder='Confirm Password'
								value={values.confirmPassword}
								onChangeText={(val) => { setFieldValue("confirmPassword", val) }}
								shadow={false}
								password={true}
								hasError={(errors.confirmPassword && touched.confirmPassword) || confirmPasswordError ? true : false}
								errorMessage={confirmPasswordError ? "Please confirm new password" : errors.confirmPassword}
							/>

							<RegularButton text="Save" operation={() => { setConfirmPasswordError(false); handleSubmit() }} loading={loading} />
						</View>
					)}

				</Formik>
			</View>
		</Body>
	)
}

export default ProfileScreen;