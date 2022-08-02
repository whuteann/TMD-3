import React, { Dispatch, SetStateAction, useState } from 'react';
import { View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { TickIcon } from '../../../../../assets/svg/SVG';
import RegularButton from '../../../atoms/buttons/RegularButton';
import ConfirmModal from '../../../molecules/modal/ConfirmModal';
import { APPROVED, DRAFT, IN_REVIEW, PURCHASING_ASSISTANT_ROLE, REJECTED, REJECTING, SUPER_ADMIN_ROLE, UserRole } from '../../../../types/Common';
import { SPARES_PROCUREMENTS } from '../../../../constants/Firebase';
import { revalidateCollection } from '@nandorojo/swr-firestore';
import FormTextInputField from '../../../molecules/input/FormTextInputField';
import { spareProcurementStatuses } from '../../../../types/SparesProcurement';
import { rejectSparesProcurement } from '../../../../services/SparesProcurementServices';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../../redux/reducers/Auth';
import { CREATE_SPARES_PURCHASE_ORDER, EDIT_DRAFT, REVIEW_SPARES_PROCUREMENT } from '../../../../permissions/Permissions';
import { User } from '../../../../types/User';
import { sendNotifications } from '../../../../services/NotificationServices';
import { useRefreshContext } from '../../../../providers/RefreshProvider';
import { loadingDelay } from '../../../../helpers/GenericHelper';

interface Props {
  docID: string,
  displayID: string,
  status: spareProcurementStatuses,
  navigation: any,
  created_by: User,
  setStatus: Dispatch<SetStateAction<spareProcurementStatuses>>;
  onDownload: () => void,
}

const ViewSparesProcurementButtons: React.FC<Props> = ({
  docID,
  displayID,
  status,
  navigation,
  created_by,
  setStatus,
  onDownload
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | "archive">("approve");
  const tailwind = useTailwind();
  const user = useSelector(UserSelector);
  const permissions = user?.permission;
  const [loading, setLoading] = useState(false);
  const refreshContext = useRefreshContext();

  // Form data
  const [rejectNotes, setRejectNotes] = useState("");

  let modal;
  let buttons;

  if (status == IN_REVIEW || status == REJECTING) {
    modal = (
      <ConfirmModal
        cancelAction={() => { setModalOpen(false) }}
        downloadButton={false}
        text1={`Are you sure that you want to ${action} spares procurement ${displayID}`}
        image={<TickIcon height={100} width={100} />}
        button1Text="Save"
        button2Text="Cancel"
        horizontalButtons={true}
        visible={modalOpen}
        setModalClose={() => { setModalOpen(false) }}
        nextAction={() => {
          setLoading(true);

          switch (action) {
            case "reject":
              rejectSparesProcurement(docID, rejectNotes, user!, () => {

                sendNotifications(
                  [SUPER_ADMIN_ROLE, PURCHASING_ASSISTANT_ROLE],
                  `Procurement ${displayID} has been rejected by ${user?.name}.`,
                  { screen: "ViewSparesProcurementSummary", docID: docID });

                loadingDelay(() => {
                  setStatus("Rejected");
                  setRejectNotes("");
                  navigation.navigate("ViewAllSparesProcurement");
                  setLoading(false);
                  revalidateCollection(SPARES_PROCUREMENTS);
                })

                refreshContext?.refreshList(SPARES_PROCUREMENTS)
              }, (error) => { console.error(error); });

              refreshContext?.refreshList(SPARES_PROCUREMENTS);
              break;
          }
        }
        }
      />
    );
  }


  if (status == DRAFT) {

    buttons = (
      <View>
        {
          user?.id == created_by.id || permissions?.includes(EDIT_DRAFT)
            ?
            <RegularButton text="Edit" operation={() => { navigation.navigate("EditSparesProcurement", { docID: docID }) }} />
            :
            <></>
        }
      </View>
    )

  } else if (status == IN_REVIEW) {

    buttons = (
      <View>
        {
          permissions?.includes(REVIEW_SPARES_PROCUREMENT)
            ?
            <View>
              <RegularButton text="Approve" operation={() => { navigation.navigate("ViewSparesProcurementApprove", { docID: docID }) }} />
              <RegularButton type="secondary" text="Reject" operation={() => { setStatus("Rejecting") }} />
            </View>
            :
            <View />
        }
      </View>
    );

  } else if (status == APPROVED) {

    buttons = (
      <View>
        {
          permissions?.includes(CREATE_SPARES_PURCHASE_ORDER)
            ?
            <RegularButton text="Create Purchase Order" operation={() => { navigation.navigate("CreateSparesPurchaseOrder", { docID: docID }); }} />
            :
            <View />
        }

      </View>
    )

  } else if (status == REJECTED) {

    buttons = (
      <View>
        <RegularButton text="Edit " operation={() => { navigation.navigate("EditSparesProcurement", { docID: docID }) }} />
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

        <RegularButton text="Submit" loading={loading} operation={() => { setAction("reject"), setModalOpen(true) }} />
        <RegularButton text="Cancel" loading={loading} type="secondary" operation={() => { setStatus("In Review"); setRejectNotes(""); }} />
      </View>
    );

  } else {
    buttons = (
      <View>
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

export default ViewSparesProcurementButtons;