import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import { useTailwind } from 'tailwind-rn';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import PlusButton from '../../../components/atoms/buttons/PlusButton';
import Body from '../../../components/atoms/display/Body';
import { useCollection } from '@nandorojo/swr-firestore';
import { CUSTOMER_SEGMENTATIONS } from '../../../constants/Firebase';
import { useDispatch } from 'react-redux';
import { setRefresh } from '../../../redux/reducers/Refresh';
import CardSpace from '../../../components/atoms/space/CardSpace';
import { CustomerSegmentation } from '../../../types/CustomerSegmentation';
import { customerSegRef } from '../../../functions/Firebase';
import CustomerSegmentationTab from '../../../components/templates/details/customerSegmentation/CustomerSegmentationTab';


const CustomerSegmentationListScreen = ({ navigation }: RootNavigationProps<"CustomerSegmentationList">) => {
  const [isPaginating, setIsPaginating] = useState<boolean>(false);

  const tailwind = useTailwind();
  const dispatch = useDispatch();
  const LIMIT = 20;

  const { data, mutate } = useCollection<CustomerSegmentation>(`${CUSTOMER_SEGMENTATIONS}`, {
    limit: LIMIT,
    where: ["deleted", "==", false],
    parseDates: ["created_at"],
    orderBy: ["created_at", "desc"],
    ignoreFirestoreDocumentSnapshotField: false
  }, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
  });

  const onRefresh = async () => {
    dispatch(setRefresh(true));
    await mutate();
    dispatch(setRefresh(false));
  }

  const onPaginate = async () => {
    if (isPaginating || !data?.length || data.length < LIMIT) return;

    setIsPaginating(true);

    const startAfterDocument = data[data.length - 1].__snapshot;

    // get more documents, after the most recent one we have
    const moreDocs = await customerSegRef
      .where("deleted", "==", false)
      .orderBy("created_at", "desc")
      .startAfter(startAfterDocument)
      .limit(LIMIT)
      .get()
      .then((d) => {
        const docs: any = [];
        d.docs.forEach((doc) => docs.push({ ...doc.data(), id: doc.id, __snapshot: doc }));
        return docs;
      });

    // mutate our local cache, adding the docs we just added
    // set revalidate to false to prevent SWR from revalidating on its own
    // @ts-ignore
    await mutate((state) => [...state, ...moreDocs], false);

    setIsPaginating(false);
  };

  return (
    <Body
      header={<HeaderStack title={"Customer Segmentation"} navigateProp={navigation} />}
      onRefresh={onRefresh}
      style={tailwind("mt-6")}>
      <View style={tailwind('mb-3')}>
        <PlusButton text="Add New Customer Segmentation" operation={() => { navigation.navigate("CreateCustomerSegmentation") }} />
      </View>

      <FlatList
        contentContainerStyle={tailwind('m-1')}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        data={data}
        onEndReachedThreshold={0.8}
        onEndReached={onPaginate}
        keyExtractor={(item: any, index: number) => index.toString()}
        renderItem={({ item }: { item: any }) => {
          if (!item.deleted_at) {
            return (
              <View>
                <CustomerSegmentationTab
                  navigate={() => { navigation.navigate("EditCustomerSegmentation", { docID: item.id }) }}
                  name={item.name}
                  description={item.description} />
                <CardSpace />
              </View>
            )
          } else {
            return null;
          }
        }
        }
      />
    </Body>
  );
}

export default CustomerSegmentationListScreen;