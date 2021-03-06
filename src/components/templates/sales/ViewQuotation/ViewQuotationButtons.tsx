import React, { Dispatch, SetStateAction, useState } from 'react';
import { View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { TickIcon } from '../../../../../assets/svg/SVG';
import { approveQuotation, archiveQuotation, deleteQuotationProducts, rejectQuotation, updateQuotation } from '../../../../services/QuotationServices';
import RegularButton from '../../../atoms/buttons/RegularButton';
import ConfirmModal from '../../../molecules/modal/ConfirmModal';
import UploadButton from '../../../molecules/buttons/UploadButton';
import FormDropdownInputField from '../../../molecules/input/FormDropdownInputField';
import FormTextInputField from '../../../molecules/input/FormTextInputField';
import { QUOTATIONS, SALES_CONFIRMATIONS } from '../../../../constants/Firebase';
import { revalidateCollection } from '@nandorojo/swr-firestore';
import InfoInput from '../../../atoms/input/InfoInput';
import InfoDisplay from '../../../atoms/display/InfoDisplay';
import InfoDisplayLink from '../../../atoms/display/InfoDisplayLink';
import { openDocument } from '../../../../services/StorageServices';
import { Product } from '../../../../types/Product';
import { updateSalesConfirmation } from '../../../../services/SalesConfirmationServices';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../../redux/reducers/Auth';
import { ARCHIVE_QUOTATION, REVIEW_QUOTATION } from '../../../../permissions/Permissions';
import { UPDATE_ACTION } from '../../../../constants/Action';
import { APPROVED, ARCHIVED, DRAFT, HEAD_OF_MARKETING_ROLE, MARKETING_EXECUTIVE_ROLE, REJECTED, REJECTING, SUPER_ADMIN_ROLE } from '../../../../types/Common';
import { updateJobConfirmation } from '../../../../services/JobConfirmationServices';
import { RFQ } from '../../../../types/RFQ';
import { User } from '../../../../types/User';
import { sendNotifications } from '../../../../services/NotificationServices';

interface Props {
	docID: string,
	displayID: string,
	salesID: string,
	jobConfirmationID: string,
	jobID: string,
	status: string,
	rfqs: Array<RFQ>,
	uploaded: boolean,
	created_by: User,
	navigation: any,
	filename_storage: string,
	deletedItems: Array<string>,
	productList: Array<{ product: Product, quantity: string, unit: string, prices: Array<{ value: string, unit: string }> }>,
	purchaseOrder: string | undefined,
	purchaseOrderNo: string | undefined,

	setUploaded: (uploaded: boolean) => void;
	setStatus: Dispatch<SetStateAction<string>>;
	onDownload: () => void,
}



const ViewQuotationButtons: React.FC<Props> = ({
	docID,
	displayID,
	status,
	rfqs,
	navigation,
	uploaded,
	deletedItems,
	productList,
	purchaseOrder,
	created_by,
	purchaseOrderNo,
	filename_storage,
	salesID,
	jobConfirmationID,
	jobID,
	setUploaded,
	setStatus,
	onDownload
}) => {
	const [modalOpen, setModalOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [poError, setPoError] = useState(false);
	const [action, setAction] = useState<"approve" | "reject" | "archive">("approve");
	const [fileUploaded, setFileUploaded] = useState<string | undefined>(purchaseOrder);
	const [prevStatus, setPrevStatus] = useState(status);
	const [confirmedUploaded, setConfirmedUploaded] = useState(false);
	const tailwind = useTailwind();
	const user = useSelector(UserSelector);
	const permissions = user?.permission;

	const changeStatus = (newStatus: string) => {
		setPrevStatus(status);
		setStatus(newStatus);
	}

	// Form data
	const [rejectReason, setRejectReason] = useState("1. Pricing Issue");
	const [rejectNotes, setRejectNotes] = useState("");
	const [poNumber, setPoNumber] = useState<string | undefined>(purchaseOrderNo);

	let modal;
	let buttons;

	if (status == "archive" || status == "In Review" || status == "Rejecting") {
		modal = (
			<ConfirmModal
				cancelAction={() => { setModalOpen(false) }}
				downloadButton={false}
				text1={`Are you sure that you want to ${action} quotation ${displayID}`}
				image={<TickIcon height={100} width={100} />}
				button1Text="Save"
				button2Text="Cancel"
				horizontalButtons={true}
				visible={modalOpen}
				setModalClose={() => { setModalOpen(false) }}
				nextAction={() => {
					switch (action) {
						case "approve":
							approveQuotation(
								docID,
								user!,
								() => {
									navigation.navigate("ViewAllQuotation");

									sendNotifications(
										[SUPER_ADMIN_ROLE, MARKETING_EXECUTIVE_ROLE],
										`Quotation ${displayID} has been approved by ${user?.name}.`,
										{ screen: "ViewQuotationSummary", docID: docID });

									revalidateCollection(QUOTATIONS);
								}, (error) => {
									console.log(error);
								});
							setStatus("Approved");
							break;
						case "reject":
							rejectQuotation(
								docID,
								rejectNotes,
								user!,
								() => {
									navigation.navigate("ViewAllQuotation");

									sendNotifications(
										[SUPER_ADMIN_ROLE, MARKETING_EXECUTIVE_ROLE],
										`Quotation ${displayID} has been rejected by ${user?.name}.`,
										{ screen: "ViewQuotationSummary", docID: docID });

									revalidateCollection(QUOTATIONS);
								}, (error) => {
									console.log(error)
								});
							setStatus("Rejected");
							setRejectReason("1. Pricing Issue");
							setRejectNotes("");
							break;
						case "archive":
							archiveQuotation(
								docID,
								rejectReason,
								rejectNotes,
								user!, () => {
									navigation.navigate("ViewAllQuotation");

									sendNotifications(
										[SUPER_ADMIN_ROLE, HEAD_OF_MARKETING_ROLE],
										`Quotation ${displayID} has been archived by ${user?.name}.`,
										{ screen: "ViewQuotationSummary", docID: docID });

									revalidateCollection(QUOTATIONS);
								}, (error) => {
									console.log(error);
								});

							break;
					}
				}}
			/>
		);
	}


	if (status == DRAFT) {

		buttons = (
			<View>
				{
					user?.id == created_by.id
						?
						<RegularButton text="Edit" operation={() => { navigation.navigate("EditQuotation", { docID: docID }) }} />
						:
						<></>
				}
			</View>
		);

	} else if (status == "In Review") {

		if (permissions?.includes(REVIEW_QUOTATION)) {
			buttons = (
				<View>
					<View>
						<RegularButton text="Approve" operation={() => { setAction("approve"), setModalOpen(true) }} />
					</View>
					<RegularButton type="secondary" text="Reject" operation={() => { setStatus("Rejecting") }} />
				</View>
			);
		} else {
			buttons = <RegularButton text="Download" operation={() => { onDownload() }} />;
		}

	} else if (status == APPROVED) {

		buttons = (
			<View>
				{
					uploaded
						?
						(<InfoInput placeholder="Purchase Order No." value={poNumber} onChangeText={setPoNumber} hasError={poError} errorMessage={"Required"} />)
						:
						null
				}
				<View style={tailwind("mt-8")}>
					<UploadButton
						value={purchaseOrder}
						filename_storage={filename_storage}
						buttonText="Upload Purchase Order"
						path={SALES_CONFIRMATIONS}
						updateDoc={(filename, filename_storage_output) => {
							updateQuotation(
								docID,
								{ purchase_order_file: filename, filename_storage: filename_storage_output },
								user!,
								UPDATE_ACTION,
								() => {
									setFileUploaded(filename);
								}, (error) => {
									console.log(error);
								}
							)
						}}
						onDelete={() => { setFileUploaded(undefined); }}
						setUploaded={setUploaded}
					/>
					<View style={tailwind("mt-14 ")}>
						<RegularButton text="Proceed Sales"
							operation={
								() => {
									setLoading(true);

									if (fileUploaded && (poNumber == "" || !poNumber)) {
										setPoError(true);
										setLoading(false);
									} else {
										deleteQuotationProducts(docID, deletedItems, productList, () => {
											updateQuotation(docID, { purchase_order_no: poNumber }, user!, UPDATE_ACTION, () => {
												navigation.navigate("ProceedSalesConfirmation", { docID: docID });
												setLoading(false);
											}, (error) => {
												console.log(error);
											})
										})
									}
								}
							}
							loading={loading}
						/>
					</View>
					{
						permissions?.includes(ARCHIVE_QUOTATION)
							?
							<RegularButton type="secondary" text="Archive " operation={() => { changeStatus("archive"); }} />
							:
							null
					}
				</View>
			</View>
		)

	} else if (status == REJECTED) {

		buttons = (
			<View>
				<View>
					<RegularButton text="Edit " operation={() => { navigation.navigate("EditQuotation", { docID: docID }) }} />
				</View>
				{
					permissions?.includes(ARCHIVE_QUOTATION)
						?
						<RegularButton type="secondary" text="Archive " operation={() => { changeStatus("archive"); }} />
						:
						null
				}
			</View>
		);

	} else if (status == "archive") {

		buttons = (
			<View>
				<FormDropdownInputField
					label={"Reject Reason"}
					value={rejectReason}
					items={rfqs.map(item => item.reason)}
					shadow={true}
					onChangeValue={(val) => { setRejectReason(val) }}
				/>

				<FormTextInputField
					label={"Reject Notes"}
					multiline={true}
					value={rejectNotes}
					onChangeValue={(val) => { setRejectNotes(val) }}
				/>

				<RegularButton text="Confirm" operation={() => { setAction("archive"), setModalOpen(true) }} />
				<RegularButton text="Cancel" type="secondary" operation={() => { setStatus(prevStatus); setRejectReason('1. Pricing Issue'); setRejectNotes(""); }} />
			</View>
		);

	} else if (status == REJECTING) {

		buttons = (
			<View>
				<FormTextInputField
					label={"Reject Notes"}
					value={rejectNotes}
					onChangeValue={(val) => { setRejectNotes(val) }}
					multiline={true}
				/>

				<RegularButton text="Submit" operation={() => { setAction("reject"), setModalOpen(true) }} />
				<RegularButton text="Cancel" type="secondary" operation={() => { setStatus("In Review"); setRejectNotes(""); }} />
			</View>
		);

	} else if (status == ARCHIVED) {

		buttons = <RegularButton text="Download" operation={() => { onDownload() }} />;

	} else {
		buttons = (
			<View>
				{
					uploaded
						?
						(
							<View>
								<View>
									<InfoDisplay placeholder="Purchase Order No." info={purchaseOrderNo || "-"} />
									<InfoDisplayLink placeholder="PO attachment" info={purchaseOrder} linkOnPress={() => { openDocument(SALES_CONFIRMATIONS, `${filename_storage}`) }} />
								</View>

								<View style={tailwind("mt-10")} />
								<RegularButton
									text="Download"
									operation={onDownload}
								/>
								<RegularButton
									text="Re-upload Purchase Order"
									type={"secondary"}
									operation={() => {
										updateQuotation(docID, { purchase_order_no: "" }, user!, UPDATE_ACTION, () => { }, (error) => { console.log(error); })
										setUploaded(false);
									}}
								/>
							</View>
						)
						:
						(
							<View>
								{
									confirmedUploaded
										?
										(<InfoInput placeholder="Purchase Order No." value={poNumber} onChangeText={setPoNumber} hasError={poError} errorMessage={"Required"} />)
										:
										null
								}
								<View style={tailwind("mt-10")}>
									<UploadButton
										value={purchaseOrder}
										filename_storage={filename_storage}
										buttonText="Upload Purchase Order"
										path={SALES_CONFIRMATIONS}
										updateDoc={
											(filename, filename_storage_output) => {
												updateQuotation(docID, { purchase_order_file: filename, filename_storage: filename_storage_output }, user!, UPDATE_ACTION, () => {
													updateSalesConfirmation(salesID, { purchase_order_file: filename, filename_storage: filename_storage_output }, user!, UPDATE_ACTION, () => {
														updateJobConfirmation(jobConfirmationID, { purchase_order_file: filename, filename_storage_po: filename_storage_output }, user!, () => { }, (error) => {
															console.log(error);
														})
													}, (error) => { console.log(error); })
												}, (error) => {
													console.log(error);
												})
											}}
										setUploaded={setConfirmedUploaded}
									/>
									<View style={tailwind("mt-3")} />
									{
										confirmedUploaded
											?
											(
												<View>
													<RegularButton text="Save Updates"
														operation={
															() => {
																setLoading(true);
																if (!poNumber || poNumber == "") {
																	setPoError(true);
																	setLoading(false);
																} else {
																	updateQuotation(docID, { purchase_order_no: poNumber }, user!, UPDATE_ACTION, () => {
																		updateSalesConfirmation(salesID, { purchase_order_no: poNumber }, user!, UPDATE_ACTION, () => {
																			updateJobConfirmation(jobConfirmationID, { purchase_order_no: poNumber }, user!, () => {
																				setUploaded(true);
																				setPoNumber("");
																				setLoading(false);
																				navigation.navigate("ViewAllQuotation")
																			}, (error) => {
																				console.log(error);
																			})
																		}, (error) => {
																			console.log(error);
																		})
																	}, (error) => {
																		console.log(error);
																	}
																	)
																}
															}
														} />
													<RegularButton text="Cancel" type='secondary' operation={() => {
														navigation.navigate("ViewAllQuotation");
													}
													} />
												</View>
											)
											:
											<RegularButton text="Download" operation={onDownload} />
									}
								</View>
							</View>
						)
				}
			</View>
		)
	}

	return (
		<View>
			{modal}
			{buttons}
		</View>

	)
}

export default ViewQuotationButtons;