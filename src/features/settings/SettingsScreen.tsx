import { useTailwind } from "tailwind-rn/dist";
import { ImportPermissions } from "../../commands/ImportPermissions";
import RegularButton from "../../components/atoms/buttons/RegularButton";
import Body from "../../components/atoms/display/Body";
import HeaderStack from "../../components/atoms/display/HeaderStack";
import { QUOTATIONS, SALES_CONFIRMATIONS } from "../../constants/Firebase";
import { RootNavigationProps } from "../../navigations/NavigationProps/NavigationProps";
import { CREATE_SPARES_PURCHASE_VOUCHER } from "../../permissions/Permissions";
import { useRefreshContext } from "../../providers/RefreshProvider";
import { emailToAccountAssistants } from "../../services/SalesConfirmationServices";
import { GENERAL_MANAGER_ROLE, SUPER_ADMIN_ROLE } from "../../types/Common";


const SettingsScreen = ({ navigation, route }: RootNavigationProps<"CreateInvoice">) => {

  const tailwind = useTailwind();
  const refreshContext = useRefreshContext();

  return (
    <Body header={<HeaderStack title={"Settings"} navigateProp={navigation} />} style={tailwind("pt-10")}>
      <RegularButton text="Update Permissions" operation={() => {
        ImportPermissions(
          [GENERAL_MANAGER_ROLE, SUPER_ADMIN_ROLE],
          [CREATE_SPARES_PURCHASE_VOUCHER]);
      }} />
      <RegularButton text="Send Email" operation={() => {
        emailToAccountAssistants("eG4UzCJ5c0TKuKm3RDvF");
      }} />
      <RegularButton text="Create PDF" operation={() => {
      }} />

      <RegularButton text="Test Refresh" operation={() => {
        refreshContext?.refreshList(QUOTATIONS);
      }} />

      <RegularButton text="Test Refresh 2" operation={() => {
        refreshContext?.refreshList(SALES_CONFIRMATIONS);
      }} />
    </Body>
  )
}

export default SettingsScreen;

