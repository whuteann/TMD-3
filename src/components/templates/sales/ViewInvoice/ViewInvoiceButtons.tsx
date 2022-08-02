
import { revalidateCollection } from '@nandorojo/swr-firestore';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { TickIcon } from '../../../../../assets/svg/SVG';
import { INVOICES } from '../../../../constants/Firebase';
import { createAndDisplayPDF, loadPDFLogo } from '../../../../functions/PDFv2Functions';
import { loadingDelay } from '../../../../helpers/GenericHelper';
import { REVIEW_INVOICE } from '../../../../permissions/Permissions';
import { useRefreshContext } from '../../../../providers/RefreshProvider';
import { UserSelector } from '../../../../redux/reducers/Auth';
import { approveInvoice, rejectInvoice } from '../../../../services/InvoiceServices';
import { updateJobConfirmation } from '../../../../services/JobConfirmationServices';
import { sendNotifications } from '../../../../services/NotificationServices';
import { ACCOUNT_ASSISTANT_ROLE, DRAFT, IN_REVIEW, REJECTED, REJECTING, SUPER_ADMIN_ROLE } from '../../../../types/Common';
import { User } from '../../../../types/User';
import RegularButton from '../../../atoms/buttons/RegularButton';
import FormTextInputField from '../../../molecules/input/FormTextInputField';
import ConfirmModal from '../../../molecules/modal/ConfirmModal';
import { generateSalesInvoicePDF } from '../../pdf/generateSalesInvoicePDF';

interface Props {
	status: string,
	linkTo: (link: string) => void,
	docID: string,
	display_id: string,
	created_by: User,
	setStatus: (status) => void,
	job_confirmation_id: string,
	data: any,
}

const ApprovalAction = (
	action: string, setApprove: (action: string) => void, setModalOpen: (open: boolean) => void
) => {
	setApprove(action);
	setModalOpen(true);
}

const ViewInvoiceButtons: React.FC<Props> = ({
	status, linkTo, setStatus, created_by, docID, display_id, job_confirmation_id, data
}) => {
	const [modalOpen, setModalOpen] = useState(false);
	const [approve, setApprove] = useState("");
	const [loading, setLoading] = useState(false);
	const user = useSelector(UserSelector);
	const permissions = user?.permission;
	const [rejectNotes, setRejectNotes] = useState("");
	const refreshContext = useRefreshContext();
	let modal;
	let buttons;

	const onDownload = async () => {
		let image = await loadPDFLogo();
		let html = generateSalesInvoicePDF(data, image);
		await createAndDisplayPDF(html);
	}


	modal = (
		<ConfirmModal
			cancelAction={() => { }}
			downloadButton={false}
			text1={`Confirm ${approve} "${display_id}" ??`}
			image={<TickIcon height={100} width={100} />}
			button1Text="Confirm"
			horizontalButtons={false}
			visible={modalOpen}
			setModalClose={() => { setModalOpen(false) }}
			nextAction={() => {

				setLoading(true);

				switch (approve) {
					case "approve":
						approveInvoice(docID, user!, (error) => { console.error(error); });
						updateJobConfirmation(
							job_confirmation_id,
							{ invoice_status: "Approved" },
							user!,
							() => {
								loadingDelay(() => {
									linkTo("/invoices");
									setStatus("Approve");
									revalidateCollection(INVOICES);
									setLoading(false);
								});
							},
							(error) => { console.error(error); });

						sendNotifications(
							[SUPER_ADMIN_ROLE, ACCOUNT_ASSISTANT_ROLE],
							`Invoice ${display_id} has been approved by ${user?.name}.`,
							{ screen: "ViewInvoiceSummary", docID: docID });

						refreshContext?.refreshList(INVOICES);
						break;
					case "reject":
						rejectInvoice(docID, rejectNotes, user!, (error) => { console.error(error); });
						updateJobConfirmation(job_confirmation_id,
							{ invoice_status: "Rejected", reject_notes: rejectNotes },
							user!,
							() => {
								loadingDelay(() => {
									linkTo("/invoices");
									setStatus("Rejected");
									revalidateCollection(INVOICES);
									setLoading(false);
								});

							},
							(error) => { console.error(error); });


						sendNotifications(
							[SUPER_ADMIN_ROLE, ACCOUNT_ASSISTANT_ROLE],
							`Invoice ${display_id} has been rejected by ${user?.name}.`,
							{ screen: "ViewInvoiceSummary", docID: docID });


						refreshContext?.refreshList(INVOICES);
						break;
				}
			}
			}
		/>
	);


	if (status == IN_REVIEW) {
		if (permissions?.includes(REVIEW_INVOICE)) {
			buttons = (
				<View>
					<RegularButton text="Approve" loading={loading} operation={() => { ApprovalAction("approve", (action) => setApprove(action), (open) => setModalOpen(open)) }} />
					<RegularButton type="secondary" loading={loading} text="Reject" operation={() => { setStatus("Rejecting") }} />
				</View>
			)
		} else {
			buttons = <RegularButton text="Download" operation={() => { onDownload() }} />
		}
	} else if (status == REJECTED) {
		buttons = <RegularButton text="Edit" operation={() => { linkTo(`/invoices/${docID}/edit`) }} />

	} else if (status == DRAFT) {
		buttons = (
			<View>
				{
					user?.id == created_by.id
						?
						<RegularButton text="Edit" operation={() => { linkTo(`/invoices/${docID}/edit`) }} />
						:
						<></>
				}
			</View>
		)
	} else if (status == REJECTING) {

		buttons = (
			<View>
				<FormTextInputField label={"Reject Notes"} value={rejectNotes} multiline={true} onChangeValue={(val) => setRejectNotes(val)} />
				<RegularButton text="Submit" loading={loading} operation={() => { ApprovalAction("reject", setApprove, setModalOpen) }} />
				<RegularButton text="Cancel" loading={loading} type="secondary" operation={() => { setStatus("In Review") }} />
			</View>
		)
	} else {
		buttons = (
			<View>
				<RegularButton text="Download" operation={() => { onDownload() }} />
				<RegularButton type="secondary" text="Issue Official Receipt" operation={() => { linkTo(`/receipts/${docID}/create`) }} />
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

export default ViewInvoiceButtons;