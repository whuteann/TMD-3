import { revalidateCollection, revalidateDocument } from '@nandorojo/swr-firestore';
import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useTailwind } from 'tailwind-rn/dist';
import { TickIcon } from '../../../../../assets/svg/SVG';
import { APPROVE_ACTION, UPDATE_ACTION, VERIFY_ACTION } from '../../../../constants/Action';
import { SPARES_PURCHASE_ORDERS } from '../../../../constants/Firebase';
import { CREATE_PURCHASE_VOUCHER, CREATE_SPARES_PURCHASE_ORDER, FINAL_REVIEW_SPARES_PURCHASE_ORDER, REVIEW_SPARES_PURCHASE_ORDER } from '../../../../permissions/Permissions';
import { UserSelector } from '../../../../redux/reducers/Auth';
import { sendNotifications } from '../../../../services/NotificationServices';
import { approveSparesPurchaseOrder, rejectSparesPurchaseOrder, updateSparesPurchaseOrder, verifySparesPurchaseOrder } from '../../../../services/SparesPurchaseOrderServices';
import { deleteFile, UploadFileAndroid, UploadFileWeb } from '../../../../services/StorageServices';
import { APPROVED, APPROVED_DOC, DRAFT, DOC_SUBMITTED, IN_REVIEW, PV_ISSUED, PV_PENDING, REJECTED, REJECTING, VERIFIED, VERIFIED_DOC, SUPER_ADMIN_ROLE, PURCHASING_ASSISTANT_ROLE, HEAD_OF_PROCUREMENT_ROLE, ACCOUNT_ASSISTANT_ROLE, GENERAL_MANAGER_ROLE } from '../../../../types/Common';
import { sparesPurchaseOrderStatuses } from '../../../../types/SparesPurchaseOrder';
import { User } from '../../../../types/User';
import RegularButton from '../../../atoms/buttons/RegularButton';
import InfoInput from '../../../atoms/input/InfoInput';
import UploadButton from '../../../molecules/buttons/UploadButton';
import FormTextInputField from '../../../molecules/input/FormTextInputField';
import ConfirmModal from '../../../molecules/modal/ConfirmModal';

interface Props {
	display_id: string;
	status: string;
	nav_id: string;
	navigation: any;
	totalAmount: number;
	doFile: string,
	filename_storage_do: string,
	invFile: string,
	invNo: string,
	filename_storage_inv: string,
	created_by: User,
	setStatus: (status: sparesPurchaseOrderStatuses) => void;
	onDownload: () => void;
}


const ViewSparesPurchaseOrderButtons: React.FC<Props> = ({
	status, navigation, totalAmount, nav_id, display_id, doFile, filename_storage_do, invFile, filename_storage_inv, created_by, invNo, setStatus, onDownload,
}) => {
	const [modalOpen, setModalOpen] = useState(false);
	const [rejectNotes, setRejectNotes] = useState("");
	const [action, setAction] = useState<"reject" | "approve" | "verify" | "verifyFinal" | "approveFinal" | "submit">();
	const [uploadedDO, setUploadedDO] = useState(false);
	const [uploadedINV, setUploadedINV] = useState(false);
	const [invUploaded, setInvUploaded] = useState<any>();

	const [loading, setLoading] = useState(false);
	const [doFileNo, setDoFileNo] = useState("");
	const [doFileError, setDoFileError] = useState("");
	const [invFileNo, setInvFileNo] = useState("");
	const [invFileError, setInvFileError] = useState("");
	const [prevStatus, setPrevStatus] = useState<sparesPurchaseOrderStatuses>(IN_REVIEW);
	const user = useSelector(UserSelector);
	const tailwind = useTailwind();
	const permissions = user?.permission;

	let modal;
	let bottom;


	const setModal = (text) => {
		modal = (
			<ConfirmModal
				cancelAction={() => null}
				downloadButton={false}
				text1={text}
				text2=""
				image={<TickIcon height={100} width={100} />}
				button1Text="Done"
				visible={modalOpen}
				setModalClose={() => { setModalOpen(false) }}
				nextAction={() => {
					switch (action) {
						case "approve":
							approveSparesPurchaseOrder(nav_id, user!, () => {
								navigation.navigate("ViewAllSparesPurchaseOrder");
								revalidateCollection(SPARES_PURCHASE_ORDERS);

								sendNotifications(
									[SUPER_ADMIN_ROLE, PURCHASING_ASSISTANT_ROLE, ACCOUNT_ASSISTANT_ROLE, GENERAL_MANAGER_ROLE],
									`Purchase order ${display_id} has been approved by ${user?.name}.`,
									{ screen: "ViewSparesPurchaseOrderSummary", docID: nav_id });
							}, (error) => {
								console.error(error);
							})
							setStatus("Approved");
							break;
						case "reject":
							if (filename_storage_do) {
								deleteFile(SPARES_PURCHASE_ORDERS, filename_storage_do, () => {
									updateSparesPurchaseOrder(nav_id, { doFile: "", doNumber: "", filename_storage_do: "" }, user!, UPDATE_ACTION, () => {
									}, (error) => { console.error(error); });
								});
							}
							if (filename_storage_inv) {
								deleteFile(SPARES_PURCHASE_ORDERS, filename_storage_inv, () => {
									updateSparesPurchaseOrder(nav_id, { invFile: "", invNumber: "", filename_storage_inv: "" }, user!, UPDATE_ACTION, () => { }, (error) => { console.error(error); });
								});
							}
							rejectSparesPurchaseOrder(nav_id, rejectNotes, user!, () => {
								navigation.navigate("ViewAllSparesPurchaseOrder");
								revalidateCollection(SPARES_PURCHASE_ORDERS);

								sendNotifications(
									[SUPER_ADMIN_ROLE, PURCHASING_ASSISTANT_ROLE, ACCOUNT_ASSISTANT_ROLE, HEAD_OF_PROCUREMENT_ROLE],
									`Purchase order ${display_id} has been rejected by ${user?.name}.`,
									{ screen: "ViewSparesPurchaseOrderSummary", docID: nav_id });
							}, (error) => {
								console.error(error);
							});
							setStatus("Rejected");
							setRejectNotes("");
							break;
						case "verify":
							verifySparesPurchaseOrder(nav_id, user!, () => {
								navigation.navigate("ViewAllSparesPurchaseOrder");
								revalidateCollection(SPARES_PURCHASE_ORDERS);

								sendNotifications(
									[SUPER_ADMIN_ROLE, PURCHASING_ASSISTANT_ROLE, ACCOUNT_ASSISTANT_ROLE, GENERAL_MANAGER_ROLE],
									`Purchase order ${display_id} has been verified by ${user?.name}.`,
									{ screen: "ViewSparesPurchaseOrderSummary", docID: nav_id });
							}, (error) => {
								console.error(error);
							})
							break;
						case "submit":
							updateSparesPurchaseOrder(nav_id, { status: DOC_SUBMITTED, doNumber: doFileNo, invNumber: invFileNo }, user!, VERIFY_ACTION, () => {
								navigation.navigate("ViewAllSparesPurchaseOrder");
								setDoFileNo("");
								setInvFileNo("");
								revalidateCollection(SPARES_PURCHASE_ORDERS);

								sendNotifications(
									[SUPER_ADMIN_ROLE, HEAD_OF_PROCUREMENT_ROLE],
									`Purchase order files for ${display_id} has been submitted by ${user?.name}.`,
									{ screen: "ViewSparesPurchaseOrderSummary", docID: nav_id });

							}, (error) => {
								console.error(error);
							})
							break;
						case "verifyFinal":
							updateSparesPurchaseOrder(nav_id, invFileNo ? { status: VERIFIED_DOC, invNumber: invFileNo } : { status: VERIFIED_DOC }, user!, VERIFY_ACTION, () => {
								navigation.navigate("ViewAllSparesPurchaseOrder");
								setDoFileNo("");
								setInvFileNo("");
								revalidateCollection(SPARES_PURCHASE_ORDERS);

								sendNotifications(
									[SUPER_ADMIN_ROLE, PURCHASING_ASSISTANT_ROLE, ACCOUNT_ASSISTANT_ROLE, GENERAL_MANAGER_ROLE, HEAD_OF_PROCUREMENT_ROLE],
									`Submitted purchase order files ${display_id} has been verified by ${user?.name}, ready for approval`,
									{ screen: "ViewSparesPurchaseOrderSummary", docID: nav_id });
							}, (error) => {
								console.error(error);
							})
							break;
						case "approveFinal":
							updateSparesPurchaseOrder(nav_id, invFileNo ? { status: APPROVED_DOC, invNumber: invFileNo } : { status: APPROVED_DOC }, user!, APPROVE_ACTION, () => {
								navigation.navigate("ViewAllSparesPurchaseOrder");
								setDoFileNo("");
								setInvFileNo("");
								revalidateCollection(SPARES_PURCHASE_ORDERS);

								sendNotifications(
									[SUPER_ADMIN_ROLE, PURCHASING_ASSISTANT_ROLE, ACCOUNT_ASSISTANT_ROLE, GENERAL_MANAGER_ROLE, HEAD_OF_PROCUREMENT_ROLE],
									`Submitted purchase order files ${display_id} has been approved by ${user?.name}.`,
									{ screen: "ViewSparesPurchaseOrderSummary", docID: nav_id });
							}, (error) => {
								console.error(error);
							})
							break;
					}
				}}
			/>)
			;
	}

	if (status == IN_REVIEW) {
		setModal(totalAmount < 5000 ? `Purchase Order “${display_id}” has been approved` : `Purchase Order “${display_id}” has been submitted to GM`);
		bottom = (
			<View>
				{
					permissions?.includes(REVIEW_SPARES_PURCHASE_ORDER)
						?
						(
							<View>
								{
									totalAmount < 5000
										?
										<RegularButton text={"Approve"} operation={() => { setModalOpen(true); setAction("approve"); }} />
										:
										<RegularButton text={"Verify"} operation={() => { setModalOpen(true); setAction("verify"); }} />
								}
								<RegularButton type="secondary" text="Reject" operation={() => { setStatus(REJECTING); setPrevStatus(status); }} />
							</View>
						)
						:
						<View></View>
				}

			</View>
		)

	} else if (status == APPROVED) {
		setModal(`Purchase Order “${display_id}” has been submitted to GM`);
		bottom = (
			<View>
				{
					uploadedDO
						?
						<InfoInput
							placeholder="Delivery Noted No."
							onChangeText={(text) => { setDoFileNo(text) }}
							hasError={doFileError ? true : false}
							errorMessage={doFileError}
						/>
						:
						null
				}
				<UploadButton
					value={doFile}
					filename_storage={filename_storage_do}
					buttonText="Upload DO"
					path={SPARES_PURCHASE_ORDERS}
					updateDoc={(filename, filename_storage_output) => {
						updateSparesPurchaseOrder(nav_id, { doFile: filename, filename_storage_do: filename_storage_output }, user!, UPDATE_ACTION, () => {
							revalidateDocument(`${SPARES_PURCHASE_ORDERS}/${nav_id}`)
						}, (error) => { console.error(error); })
					}}
					setUploaded={setUploadedDO}
				/>

				{
					uploadedINV
						?
						<InfoInput
							placeholder="Invoice No."
							onChangeText={(text) => { setInvFileNo(text) }}
							hasError={invFileError ? true : false}
							errorMessage={invFileError}
						/>
						:
						null
				}
				<UploadButton
					value={invFile}
					filename_storage={filename_storage_inv}
					buttonText="Upload Invoice"
					path={SPARES_PURCHASE_ORDERS}
					updateDoc={(filename, filename_storage_output) => {
						updateSparesPurchaseOrder(nav_id, { invFile: filename, filename_storage_inv: filename_storage_output }, user!, UPDATE_ACTION, () => {
							revalidateDocument(`${SPARES_PURCHASE_ORDERS}/${nav_id}`)
						}, (error) => {
							console.error(error);
						})
					}}
					setUploaded={setUploadedINV}
				/>
				<View style={tailwind("mb-4")} />
				<RegularButton text="Submit" type={uploadedDO ? "primary" : "disabled"} operation={() => {
					if (!doFileNo) {
						setDoFileError(doFileNo ? "" : "Required");
					} else if (uploadedINV && !invFileNo) {
						setInvFileError(invFileNo ? "" : "Required");
					}
					else {
						setAction("submit")
						setModalOpen(true);
					}
				}} />
			</View>
		)
	} else if (status == VERIFIED) {
		setModal(`Purchase Order “${display_id}” has been approved`);
		bottom = (
			<View>
				{
					permissions?.includes(FINAL_REVIEW_SPARES_PURCHASE_ORDER)
						?
						<View>
							<RegularButton text="Approve" operation={() => { setModalOpen(true); setAction("approve"); }} />
							<RegularButton type="secondary" text="Reject" operation={() => { setStatus(REJECTING); setPrevStatus(status); }} />
						</View>
						:
						<RegularButton text="Download" operation={() => { onDownload(); }} />
				}

			</View>
		)
	} else if (status == DOC_SUBMITTED) {
		setModal(totalAmount < 5000 ? `Invoice of “${display_id}” has been approved` : `Invoice of “${display_id}” has been submitted to GM`);
		bottom = (
			<View>
				{
					invNo
						?
						<></>
						:
						<InfoInput
							placeholder="Invoice No."
							onChangeText={(text) => { setInvFileNo(text) }}
							hasError={invFileError ? true : false}
							errorMessage={invFileError}
						/>
				}
				{
					invFile
						?
						<></>
						:
						<View>
							<UploadButton
								value={invFile}
								filename_storage={filename_storage_inv}
								buttonText="Upload Invoice"
								path={SPARES_PURCHASE_ORDERS}
								autoSave={false}
								setSelectedFile={(file) => { setInvUploaded(file); }}
								setUploaded={setUploadedINV}
							/>
							<View style={tailwind("mb-4")} />
						</View>
				}
				{
					permissions?.includes(REVIEW_SPARES_PURCHASE_ORDER)
						?
						(
							<View>
								{
									totalAmount < 5000
										?
										<RegularButton text={"Approve"} operation={() => {
											if (invUploaded) {
												setLoading(true);
												if (Platform.OS == "web") {
													UploadFileWeb({ name: invUploaded.filename, file: invUploaded.file }, SPARES_PURCHASE_ORDERS).then((data) => {
														const { url, filename, filename_storage } = data as { url: string, filename: string, filename_storage: string };
														updateSparesPurchaseOrder(nav_id, { invFile: filename, filename_storage_inv: filename_storage }, user!, UPDATE_ACTION, () => {
															revalidateDocument(`${SPARES_PURCHASE_ORDERS}/${nav_id}`);
															setLoading(false);
															setModalOpen(true);
															setAction("approveFinal");
														}, (error) => {
															console.error(error);
														})
													});
												} else {
													UploadFileAndroid({ name: invUploaded.filename, file: invUploaded.file, uri: invUploaded.uri }, SPARES_PURCHASE_ORDERS).then((data) => {
														const { url, filename, filename_storage } = data as { url: string, filename: string, filename_storage: string };
														updateSparesPurchaseOrder(nav_id, { invFile: filename, filename_storage_inv: filename_storage }, user!, UPDATE_ACTION, () => {
															revalidateDocument(`${SPARES_PURCHASE_ORDERS}/${nav_id}`);
															setLoading(false);
															setModalOpen(true);
															setAction("approveFinal");
														}, (error) => {
															console.error(error);
														})
													});
												}
											} else {
												setModalOpen(true);
												setAction("approveFinal");
											}
										}} />
										:
										<RegularButton text={"Verify"} operation={() => {
											if (invUploaded) {
												setLoading(true);
												if (Platform.OS == "web") {
													UploadFileWeb({ name: invUploaded.filename, file: invUploaded.file }, SPARES_PURCHASE_ORDERS).then((data) => {
														const { url, filename, filename_storage } = data as { url: string, filename: string, filename_storage: string };
														updateSparesPurchaseOrder(nav_id, { invFile: filename, filename_storage_inv: filename_storage }, user!, UPDATE_ACTION, () => {
															revalidateDocument(`${SPARES_PURCHASE_ORDERS}/${nav_id}`);
															setLoading(false);
															setModalOpen(true);
															setAction("verifyFinal");
														}, (error) => {
															console.error(error);
														})
													});
												} else {
													UploadFileAndroid({ name: invUploaded.filename, file: invUploaded.file, uri: invUploaded.uri }, SPARES_PURCHASE_ORDERS).then((data) => {
														const { url, filename, filename_storage } = data as { url: string, filename: string, filename_storage: string };
														updateSparesPurchaseOrder(nav_id, { invFile: filename, filename_storage_inv: filename_storage }, user!, UPDATE_ACTION, () => {
															revalidateDocument(`${SPARES_PURCHASE_ORDERS}/${nav_id}`);
															setLoading(false);
															setModalOpen(true);
															setAction("verifyFinal");
														}, (error) => {
															console.error(error);
														})
													});
												}
											} else {
												setModalOpen(true);
												setAction("verifyFinal");
											}

										}} />
								}
								<RegularButton type="secondary" text="Reject" operation={() => { setStatus(REJECTING); setPrevStatus(status); }} />
							</View>
						)
						:
						<View></View>
				}

			</View>
		)
	} else if (status == VERIFIED_DOC) {
		setModal(`Purchase Order "${display_id}" has notify to AA`);
		bottom = (
			<View>
				{
					invNo
						?
						<></>
						:
						<InfoInput
							placeholder="Invoice No."
							onChangeText={(text) => { setInvFileNo(text) }}
							hasError={invFileError ? true : false}
							errorMessage={invFileError}
						/>
				}
				{
					invFile
						?
						<></>
						:
						<View>
							<UploadButton
								value={invFile}
								filename_storage={filename_storage_inv}
								buttonText="Upload Invoice"
								path={SPARES_PURCHASE_ORDERS}
								autoSave={false}
								setSelectedFile={(file) => { setInvUploaded(file); }}
								setUploaded={setUploadedINV}
							/>
							<View style={tailwind("mb-4")} />
						</View>
				}
				{
					permissions?.includes(FINAL_REVIEW_SPARES_PURCHASE_ORDER)
						?
						<View>
							<RegularButton text="Approve" operation={() => {
								if (invUploaded) {
									setLoading(true);
									if (Platform.OS == "web") {
										UploadFileWeb({ name: invUploaded.filename, file: invUploaded.file }, SPARES_PURCHASE_ORDERS).then((data) => {
											const { url, filename, filename_storage } = data as { url: string, filename: string, filename_storage: string };
											updateSparesPurchaseOrder(nav_id, { invFile: filename, filename_storage_inv: filename_storage }, user!, UPDATE_ACTION, () => {
												revalidateDocument(`${SPARES_PURCHASE_ORDERS}/${nav_id}`);
												setLoading(false);
												setModalOpen(true);
												setAction("approveFinal");
											}, (error) => {
												console.error(error);
											})
										});
									} else {
										UploadFileAndroid({ name: invUploaded.filename, file: invUploaded.file, uri: invUploaded.uri }, SPARES_PURCHASE_ORDERS).then((data) => {
											const { url, filename, filename_storage } = data as { url: string, filename: string, filename_storage: string };
											updateSparesPurchaseOrder(nav_id, { invFile: filename, filename_storage_inv: filename_storage }, user!, UPDATE_ACTION, () => {
												revalidateDocument(`${SPARES_PURCHASE_ORDERS}/${nav_id}`);
												setLoading(false);
												setModalOpen(true);
												setAction("approveFinal");
											}, (error) => {
												console.error(error);
											})
										});
									}
								} else {
									setModalOpen(true);
									setAction("approveFinal");
								}
							}} />
							<RegularButton type="secondary" text="Reject" operation={() => { setStatus(REJECTING); setPrevStatus(status); }} />
						</View>
						:
						<RegularButton text="Download" operation={() => { onDownload(); }} />
				}
			</View>
		)
	} else if (status == REJECTING) {
		setModal(`Purchase Order "${display_id}" has been rejected`);
		bottom = (
			<View>
				<FormTextInputField
					label={"Reject Notes"}
					value={rejectNotes}
					onChangeValue={(val) => { setRejectNotes(val) }}
					multiline={true}
				/>

				<RegularButton text="Submit" operation={() => { setAction("reject"), setModalOpen(true) }} />
				<RegularButton text="Cancel" type="secondary" operation={() => { setStatus(prevStatus); setRejectNotes(""); }} />
			</View>
		)
	} else if (status == REJECTED) {
		bottom = (
			<View>
				{
					permissions?.includes(CREATE_SPARES_PURCHASE_ORDER)
						?
						<RegularButton text="Edit" operation={() => { navigation.navigate("EditSparesPurchaseOrder", { docID: nav_id }) }} />
						:
						<RegularButton text="Download" operation={() => { onDownload(); }} />
				}
			</View>
		)
	} else if (status == DRAFT) {
		bottom = (
			<View>
				{
					user?.id == created_by.id
						?
						<RegularButton text="Edit" operation={() => { navigation.navigate("EditSparesPurchaseOrder", { docID: nav_id }) }} />
						:
						<></>
				}
			</View>
		)
	} else {
		bottom = (
			<View>
				{
					invNo
						?
						<></>
						:
						<InfoInput
							placeholder="Invoice No."
							onChangeText={(text) => { setInvFileNo(text) }}
							hasError={invFileError ? true : false}
							errorMessage={invFileError}
						/>
				}
				{
					invFile
						?
						<></>
						:
						<View>
							<UploadButton
								value={invFile}
								filename_storage={filename_storage_inv}
								buttonText="Upload Invoice"
								path={SPARES_PURCHASE_ORDERS}
								autoSave={false}
								setSelectedFile={(file) => { setInvUploaded(file); }}
								setUploaded={setUploadedINV}
							/>
							<View style={tailwind("mb-4")} />
						</View>
				}
				<RegularButton text="Download" operation={() => { onDownload(); }} />
				{
					permissions?.includes(CREATE_PURCHASE_VOUCHER)
						?
						<View>
							{
								status == PV_ISSUED || status == PV_PENDING || status == APPROVED_DOC
									?
									<View>
										<RegularButton type={invFile || invUploaded ? "secondary" : "disabled"} text="Create Purchase Voucher" operation={() => {
											if (invFile && invNo) {
												navigation.navigate("CreateSparesPurchaseVoucherForm", { docID: nav_id })
											} else {
												if (!invFileNo && !invNo) {
													setInvFileError(invFileNo ? "" : "Required");
												} else {
													if (invUploaded) {
														if (Platform.OS == "web") {
															UploadFileWeb({ name: invUploaded.filename, file: invUploaded.file }, SPARES_PURCHASE_ORDERS).then((data) => {
																const { url, filename, filename_storage } = data as { url: string, filename: string, filename_storage: string };
																updateSparesPurchaseOrder(
																	nav_id,
																	invFileNo ? { invFile: filename, invNumber: invFileNo, filename_storage_inv: filename_storage } : { invFile: filename, filename_storage_inv: filename_storage },
																	user!,
																	UPDATE_ACTION, () => {
																		revalidateDocument(`${SPARES_PURCHASE_ORDERS}/${nav_id}`);
																		setLoading(false);
																		navigation.navigate("CreateSparesPurchaseVoucherForm", { docID: nav_id })
																	}, (error) => {
																		console.error(error);
																	})
															});
														} else {
															UploadFileAndroid({ name: invUploaded.filename, file: invUploaded.file, uri: invUploaded.uri }, SPARES_PURCHASE_ORDERS).then((data) => {
																const { url, filename, filename_storage } = data as { url: string, filename: string, filename_storage: string };
																updateSparesPurchaseOrder(
																	nav_id,
																	invFileNo ? { invFile: filename, invNumber: invFileNo, filename_storage_inv: filename_storage } : { invFile: filename, filename_storage_inv: filename_storage },
																	user!,
																	UPDATE_ACTION, () => {
																		revalidateDocument(`${SPARES_PURCHASE_ORDERS}/${nav_id}`);
																		setLoading(false);
																		navigation.navigate("CreateSparesPurchaseVoucherForm", { docID: nav_id })
																	}, (error) => {
																		console.error(error);
																	})
															});
														}
													} else {
														if (!invFileNo) {
															setInvFileError(invFileNo ? "" : "Required");
														} else {
															updateSparesPurchaseOrder(
																nav_id,
																{ invNumber: invFileNo },
																user!,
																UPDATE_ACTION, () => {
																	revalidateDocument(`${SPARES_PURCHASE_ORDERS}/${nav_id}`);
																	setLoading(false);
																	navigation.navigate("CreateSparesPurchaseVoucherForm", { docID: nav_id })
																}, (error) => {
																	console.error(error);
																})
														}
													}
												}
											}
										}} />
									</View>
									:
									<></>
							}
						</View>
						:
						<></>
				}
			</View>
		)
	}


	return (
		<View>
			{modal}
			{bottom}
		</View>

	)
}

export default ViewSparesPurchaseOrderButtons;