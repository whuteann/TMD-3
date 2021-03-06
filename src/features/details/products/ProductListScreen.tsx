import React, { useState } from 'react';
import { View } from 'react-native';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import ProductCard from '../../../components/templates/details/products/index/ProductCard';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import PlusButton from '../../../components/atoms/buttons/PlusButton';
import { useTailwind } from 'tailwind-rn/dist';
import { useDispatch } from 'react-redux';
import { revalidateCollection, useCollection } from '@nandorojo/swr-firestore';
import { PRODUCTS } from '../../../constants/Firebase';
import { setRefresh } from '../../../redux/reducers/Refresh';
import { functions, productRef } from '../../../functions/Firebase';
import Body from '../../../components/atoms/display/Body';
import { FlatList } from 'react-native';
import CardSpace from '../../../components/atoms/space/CardSpace';
import { Product } from '../../../types/Product';
import UploadFileButton from '../../../components/molecules/buttons/UploadFileButton';
import StatusModal from '../../../components/atoms/modal/StatusModal';
import { WarningIcon } from '../../../../assets/svg/SVG';

const ProductListScreen = ({ navigation }: RootNavigationProps<"ProductList">) => {
  const [isPaginating, setIsPaginating] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const tailwind = useTailwind();
  const dispatch = useDispatch();
  const LIMIT = 20;

  const { data, mutate } = useCollection<Product>(PRODUCTS, {
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
    const moreDocs = await productRef
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
      header={<HeaderStack title={"Products"} navigateProp={navigation} />}
      style={tailwind("mt-6")}
      onRefresh={onRefresh}>

      <View style={tailwind('mb-3')}>
        <PlusButton text="Add New Product" operation={() => { navigation.navigate("CreateProduct") }} />
      </View>

      <View style={tailwind('mt-3')}>
        <UploadFileButton
          buttonText='Upload Excel'
          onSuccess={(uri) => {
            const data = {
              uri: uri
            }
            const importProductsFunc = functions.httpsCallable('importProducts');
            importProductsFunc(data).then(res => {
              revalidateCollection(PRODUCTS);
              setModalVisible(true);
            }).catch(err => {
              setHasError(true);
              console.log(err);
            });
          }}
        />
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
          renderItem={({ item }: { item: any }) => <ProductCard navigate={() => { navigation.navigate("EditProduct", { docID: item.id }) }} name={item.name} description={item.description} code={item.sku} type="Product" />}
        />
      </View>

      <StatusModal
        visible={modalVisible}
        message={`Import products successfully`}
        onClose={() => { setModalVisible(false); }}></StatusModal>

      <StatusModal
        visible={hasError}
        message={`Import error, please provide the correct excel format`}
        icon={<WarningIcon width={70} height={70} />}
        onClose={() => { setHasError(false); }}></StatusModal>

    </Body>
  )
}

export default ProductListScreen;