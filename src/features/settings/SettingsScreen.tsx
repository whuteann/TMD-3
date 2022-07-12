import { useTailwind } from "tailwind-rn/dist";
import { ImportPermissions } from "../../commands/ImportPermissions";
import RegularButton from "../../components/atoms/buttons/RegularButton";
import Body from "../../components/atoms/display/Body";
import HeaderStack from "../../components/atoms/display/HeaderStack";
import { RootNavigationProps } from "../../navigations/NavigationProps/NavigationProps";
import { VIEW_SPARES_PURCHASE_VOUCHER } from "../../permissions/Permissions";
import { ACCOUNT_ASSISTANT_ROLE, ACCOUNT_EXECUTIVE_ROLE, ACCOUNT_RECEIVABLE_ROLE, GENERAL_MANAGER_ROLE, HEAD_OF_ACCOUNTS_ROLE, SUPER_ADMIN_ROLE } from "../../types/Common";


const SettingsScreen = ({ navigation, route }: RootNavigationProps<"CreateInvoice">) => {

  const tailwind = useTailwind();

  return (
    <Body header={<HeaderStack title={"Settings"} navigateProp={navigation} />} style={tailwind("pt-10")}>
      <RegularButton text="Update Permissions" operation={() => {
        ImportPermissions(
          [ACCOUNT_ASSISTANT_ROLE, ACCOUNT_EXECUTIVE_ROLE, ACCOUNT_RECEIVABLE_ROLE, HEAD_OF_ACCOUNTS_ROLE, GENERAL_MANAGER_ROLE],
          [VIEW_SPARES_PURCHASE_VOUCHER]);
      }} />
    </Body>
  )
}

export default SettingsScreen;

