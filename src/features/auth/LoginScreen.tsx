import React, { useEffect, useRef, useState } from 'react';
import { useTailwind } from 'tailwind-rn';
import { View, Image, Platform } from 'react-native';
import { AuthNavigationProps } from '../../navigations/NavigationProps/NavigationProps';
import { EmailIcon, LockIcon, LogoIcon } from '../../../assets/svg/SVG';
import { Formik, FormikValues } from 'formik';
import * as Yup from 'yup';
import { login } from '../../services/AuthServices';
import Header from '../../components/atoms/typography/Header';
import { getWindow } from '../../helpers/GenericHelper';
import TextInputField from '../../components/atoms/input/text/TextInputField';
import Body from '../../components/atoms/display/Body';
import Checkbox from '../../components/atoms/input/checkbox/Checkbox';
import RegularButton from '../../components/atoms/buttons/RegularButton';
import TextLabel from '../../components/atoms/typography/TextLabel';
import LinkText from '../../components/molecules/typography/LinkText';
import { registerForPushNotification } from '../../services/NotificationServices';
import { useDispatch } from 'react-redux';
import { setToken } from '../../redux/reducers/Auth';


const loginSchema = Yup.object().shape({
	email: Yup.string().email("Invalid email").required("Required"),
	password: Yup.string().min(6, "Must be at least 6 characters").required("Required")
});

const LoginPage = ({ navigation }: AuthNavigationProps<"Login">) => {
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const formRef = useRef<FormikValues>();
	const dispatch = useDispatch();
	const tailwind = useTailwind();
	const { height } = getWindow();

	useEffect(() => {
		if (Platform.OS == 'web') {
			const listener = event => {
				if (event.code === "Enter" || event.code === "NumpadEnter") {
					if (formRef.current) {
						formRef.current.handleSubmit()
					}
				}
			};

			document.addEventListener("keydown", listener);

			return () => {
				document.removeEventListener("keydown", listener);
			};
		}
	}, []);

	const onSubmit = async (values) => {
		setLoading(true);

		login(values.email, values.password, (user) => {
			setLoading(false);

			if (Platform.OS !== "web") {
				registerForPushNotification(user.id).then(token => {
					dispatch(setToken(token));
				}).catch(err => console.log(err));
			}
			// This will be handled by firebase onAuthStateChanged()
		}, (error) => {
			console.log(error);
			setLoading(false);
			setError(error)
		});


	}

	return (
		<Body variant='secondary' isFullScreen={true}>
			<View style={[
				tailwind('items-center flex flex-row justify-center w-full'),
				{ 'height': height }  // This is not good as it blocks the screen from scrolling on app but no alternatives for now
			]}>
				<View
					style={[
						tailwind('items-center justify-center w-full md:w-1/2 h-full'),
					]}
				>

					<LogoIcon height={89} width={91} />

					<Header
						title='Welcome back!'
						color='text-black'
						style={tailwind('mt-3')}
					/>

					<Header
						title="Let's get you logged in"
						color='text-black'
						style={tailwind('mb-2')}
					/>

					<Formik
						innerRef={formRef}
						initialValues={{
							email: '',
							password: '',
							remember: false
						}}
						onSubmit={values => { onSubmit(values) }}
						validationSchema={loginSchema}
					>
						{({ errors, values, touched, handleChange, handleSubmit, setFieldValue }) => (
							<View style={tailwind('items-center my-4 w-full md:w-3/5 lg:w-7/12')}>
								<TextInputField
									icon={<EmailIcon width={22} height={22} />}
									placeholder='Enter your e-mail'
									onChangeText={handleChange('email')}
									hasError={errors.email && touched.email ? true : false}
									errorMessage={errors.email}
									shadow={false} />

								<TextInputField
									icon={<LockIcon width={22} height={22} />}
									placeholder='Enter your password'
									onChangeText={(text) => setFieldValue('password', text)}
									password={true}
									hasError={errors.password && touched.password ? true : false}
									errorMessage={errors.password}
									shadow={false} />

								<Checkbox
									title='Remember me'
									onChecked={(checked) => setFieldValue('remember', checked)}
									hasError={errors.remember && touched.remember ? true : false}
									errorMessage={errors.remember} />

								<RegularButton
									type='primary'
									text='Log in'
									operation={() => { handleSubmit() }}
									loading={loading} />

								{
									error == ""
										?
										null
										:
										<TextLabel content={error ?? ''} color='text-red-500' />
								}

							</View>
						)}
					</Formik>

					<LinkText
						content='Forgot Password?'
						to={() => navigation.navigate("ForgetPassword")}
						color='text-primary'
					/>
				</View>

				<View style={tailwind(`hidden ${Platform.OS == "web" ? "md:block" : ""}  w-1/2 h-full`)}>
					<Image style={tailwind('h-full w-full')} source={require("../../../assets/images/login-page-image.jpg")} />
				</View>
			</View>
		</Body>
	)
}

export default LoginPage;
