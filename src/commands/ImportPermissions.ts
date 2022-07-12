import { firestore, userRef } from "../functions/Firebase"
import { VIEW_SPARES_PURCHASE_VOUCHER } from "../permissions/Permissions";

export const ImportPermissions = (roles: Array<string>, permissions: Array<string>) => {


  userRef.where("role", "in", roles).get().then(snapshot => {

    let batch = firestore.batch();

    const users = snapshot.docs.map(doc => {
      let old_permissions: Array<string> = doc.data().permission;
      let updated_permissions: Array<string> = old_permissions.concat(permissions);

      batch.update(userRef.doc(doc.id), { "permission": updated_permissions });
    });

    batch.commit().then(() => {
      console.log("done");
    }).catch(err => {
      console.log(err)
    });
  })
}