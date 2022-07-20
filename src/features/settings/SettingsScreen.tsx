import { useTailwind } from "tailwind-rn/dist";
import { ImportPermissions } from "../../commands/ImportPermissions";
import RegularButton from "../../components/atoms/buttons/RegularButton";
import Body from "../../components/atoms/display/Body";
import HeaderStack from "../../components/atoms/display/HeaderStack";
import { RootNavigationProps } from "../../navigations/NavigationProps/NavigationProps";
import { CREATE_SPARES_PURCHASE_VOUCHER } from "../../permissions/Permissions";
import {GENERAL_MANAGER_ROLE, SUPER_ADMIN_ROLE } from "../../types/Common";


const SettingsScreen = ({ navigation, route }: RootNavigationProps<"CreateInvoice">) => {

  const tailwind = useTailwind();

  return (
    <Body header={<HeaderStack title={"Settings"} navigateProp={navigation} />} style={tailwind("pt-10")}>
      <RegularButton text="Update Permissions" operation={() => {
        ImportPermissions(
          [GENERAL_MANAGER_ROLE, SUPER_ADMIN_ROLE],
          [CREATE_SPARES_PURCHASE_VOUCHER]);
      }} />
    </Body>
  )
}

export default SettingsScreen;

