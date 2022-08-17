



import React from "react";
import { FlatList, Modal, Platform, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { useTailwind } from "tailwind-rn/dist";
import { XSimpleIcon } from "../../../../../assets/svg/SVG";
import { UserSelector } from "../../../../redux/reducers/Auth";
import { updateNotification } from "../../../../services/NotificationServices";
import { Notification } from "../../../../types/Notification";
import RegularButton from "../../../atoms/buttons/RegularButton";
import TextLabel from "../../../atoms/typography/TextLabel";
import NotificationCard from "./NotificationCard";

interface ListProps {
  visible: boolean,
  onClose: () => void,
  notifications?: any,
  navigation: any,
  read_count: number,
}



const NotificationModal: React.FC<ListProps> = ({
  visible, onClose, notifications = [], navigation, read_count
}) => {
  const tailwind = useTailwind();
  const user = useSelector(UserSelector);

  const markAllAsRead = () => {
    let current_time = new Date();
    let expire_time = new Date(current_time.setMinutes(current_time.getMinutes() + 5))

    notifications.map(item => {
      if (!item.read) {
        updateNotification(item.id, user?.id!, { read: true, expires_at: expire_time }, () => { }, () => { })
      }
    })

    onClose();
  }


  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        onClose();
      }}
    >
      <SafeAreaView style={[{ flex: 1 }]}>
        {
          Platform.OS == "web"
            ?
            <TouchableOpacity
              style={tailwind(`h-full justify-start items-end pt-[12%] md:pt-[4.6%] pr-[3%] ${Platform.OS !== "web" ? "bg-gray-faded" : ""}`)}
              activeOpacity={1}
              onPressOut={() => { onClose() }}
            >
              <View style={tailwind("bg-white box-card-shadow items-center w-[80%] sm:w-[80%] md:w-[75%] xl:w-1/3")}>
                <View style={tailwind("flex-row px-5 pt-7 items-center w-full")}>
                  <TextLabel content="Notifications" style={tailwind("text-30px font-bold w-[93%]")} />
                  <TouchableOpacity onPress={() => { onClose() }} style={tailwind("pr-5 pt-1")}>
                    <XSimpleIcon height={15} width={15} />
                  </TouchableOpacity>
                </View>
                {
                  notifications.length == 0
                    ?
                    <TextLabel content="No new notifications." style={tailwind("p-5 text-center text-16px")} />
                    :
                    <FlatList
                      showsVerticalScrollIndicator={false}
                      style={{ height: 500, width: "100%", marginTop: 20 }}
                      keyExtractor={(item: any, index: number) => index.toString()}
                      data={notifications}
                      renderItem={({ item }: { item: Notification }) => (
                        <NotificationCard
                          id={item.id!}
                          date={item.date}
                          label={item.message}
                          read={item.read}
                          created_at={item.created_at}
                          operation={() => {
                            if (item.data.screen) {
                              navigation.navigate(item.data.screen, { docID: item.data.docID });
                            }
                            onClose();
                          }} />
                      )}
                    />
                }

                {/* <View style={tailwind("w-10/12")}>
                  <RegularButton text="Mark all as read" type={read_count == 0 ? "disabled" : "primary"} operation={() => { markAllAsRead(); }} />
                </View> */}
              </View>
            </TouchableOpacity>
            :
            <View style={tailwind("bg-white h-full items-center p-3")}>
              <View style={tailwind("flex-row px-5 pt-7 items-center w-full")}>
                <TextLabel content="Notifications" style={tailwind("text-30px font-bold w-[93%]")} />
                <TouchableOpacity onPress={() => { onClose() }} style={tailwind("pr-5 pt-1")}>
                  <XSimpleIcon height={15} width={15} />
                </TouchableOpacity>
              </View>
              {
                notifications.length == 0
                  ?
                  <TextLabel content="No new notifications." style={tailwind("p-5 text-center text-16px")} />
                  :
                  <FlatList
                    showsVerticalScrollIndicator={false}
                    style={{ height: 500, width: "100%", marginTop: 20 }}
                    keyExtractor={(item: any, index: number) => index.toString()}
                    data={notifications}
                    renderItem={({ item }: { item: Notification }) => (
                      <NotificationCard
                        id={item.id!}
                        date={item.date}
                        label={item.message}
                        read={item.read}
                        created_at={item.created_at}
                        operation={() => {
                          if (item.data.screen) {
                            navigation.navigate(item.data.screen, { docID: item.data.docID });
                          }
                          onClose();
                        }} />
                    )}
                  />
              }

              {/* <View style={tailwind("w-10/12")}>
              <RegularButton text="Mark all as read" type={read_count == 0 ? "disabled" : "primary"} operation={() => { markAllAsRead(); }} />
            </View> */}
            </View>
        }
      </SafeAreaView>
    </Modal>
  )
}


export default NotificationModal;


