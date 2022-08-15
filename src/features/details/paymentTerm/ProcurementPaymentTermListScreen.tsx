import React, { useState } from 'react';
import { View } from 'react-native';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import PlusButton from '../../../components/atoms/buttons/PlusButton';
import { useTailwind } from 'tailwind-rn/dist';
import { useDispatch } from 'react-redux';
import { useCollection } from '@nandorojo/swr-firestore';
import { PROCUREMENT_PAYMENT_TERMS } from '../../../constants/Firebase';
import { setRefresh } from '../../../redux/reducers/Refresh';
import { procurementPaymentTermRef } from '../../../functions/Firebase';
import Body from '../../../components/atoms/display/Body';
import { FlatList } from 'react-native';
import CardSpace from '../../../components/atoms/space/CardSpace';
import { PaymentTerm } from '../../../types/PaymentTerm';
import PaymentTermCard from '../../../components/templates/details/paymentTerm/index/paymentTermCard';

const ProcurementPaymentTermListScreen = ({ navigation }: RootNavigationProps<"ProcurementPaymentTermList">) => {
  const [isPaginating, setIsPaginating] = useState<boolean>(false);
  const tailwind = useTailwind();
  const dispatch = useDispatch();
  const LIMIT = 20;

  const { data, mutate } = useCollection<PaymentTerm>(PROCUREMENT_PAYMENT_TERMS, {
    limit: LIMIT,
    where: ['deleted', '==', false],
    parseDates: ["created_at"],
    orderBy: ["created_at", "asc"],
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
    const moreDocs = await procurementPaymentTermRef
      .where("deleted", "==", false)
      .orderBy("created_at", "asc")
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
      header={<HeaderStack title={"Procurement Payment Term"} navigateProp={navigation} />}
      style={tailwind("mt-6")}
      onRefresh={onRefresh}>

      <View style={tailwind('mb-3')}>
        <PlusButton text="Add New Procurement Payment Term" operation={() => { navigation.navigate("CreateProcurementPaymentTerm") }} />
      </View>

      <View style={tailwind('w-full mt-3')}>
        <FlatList
          contentContainerStyle={tailwind('m-1')}
          ItemSeparatorComponent={() => <CardSpace />}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          data={data}
          onEndReachedThreshold={0.8}
          onEndReached={onPaginate}
          keyExtractor={(item: any, index: number) => index.toString()}
          renderItem={({ item }: { item: any }) => <PaymentTermCard navigate={() => { navigation.navigate("EditProcurementPaymentTerm", { docID: item.id }) }} title={item.name} />}
        />
      </View>

    </Body>
  )
}

export default ProcurementPaymentTermListScreen;