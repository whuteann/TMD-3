import React, { useEffect, useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';

import SearchBar from '../../../components/atoms/input/searchbar/SearchBar';
import AddButtonText from '../../../components/atoms/buttons/AddButtonText';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import Body from '../../../components/atoms/display/Body';
import { useTailwind } from 'tailwind-rn/dist';
import CardSpace from '../../../components/atoms/space/CardSpace';
import { useDispatch } from 'react-redux';
import { setRefresh } from '../../../redux/reducers/Refresh';
import SupplierCard from '../../../components/templates/details/suppliers/index/SupplierCard';
import { FlatList, View } from 'react-native';
import { Supplier } from '../../../types/Supplier';
import * as AlgoliaHelper from "../../../helpers/AlgoliaHelper";
import { getListStyle } from '../../../constants/Style';
import UploadFileButton from '../../../components/molecules/buttons/UploadFileButton';
import { functions } from '../../../functions/Firebase';
import StatusModal from '../../../components/atoms/modal/StatusModal';
import { revalidateCollection } from '@nandorojo/swr-firestore';
import { SUPPLIERS } from '../../../constants/Firebase';
import { WarningIcon } from '../../../../assets/svg/SVG';

const SupplierListScreen = ({ navigation }: RootNavigationProps<"SupplierList">) => {
  const [search, setSearch] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const tailwind = useTailwind();
  const dispatch = useDispatch();

  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [isPaginating, setIsPaginating] = useState<boolean>(false);
  const LIMIT = 20;

  useEffect(() => {
    getData()
  }, [search]);

  const getData = async () => {
    try {
      const data: Supplier[] = [];
      const result = await AlgoliaHelper.supplierIndexRef.search<Supplier>(search, {
        filters: "deleted:false",
        cacheable: true,
        hitsPerPage: LIMIT
      });

      if (result.page + 1 > result.nbPages) {
        setCursor(undefined);
      } else {
        setCursor(result.page + 1);
      }

      for (const hit of result.hits) {
        let status: string | null = null;

        const supplier = {
          ...hit,
          id: hit.objectID
        } as Supplier;

        data.push(supplier);
      }

      setSuppliers(data);
    } catch {

    }
  }

  const onPaginate = async () => {
    if (isPaginating || !cursor) return;
    setIsPaginating(true);

    const data: Supplier[] = [];

    const result = await AlgoliaHelper.supplierIndexRef.search<Supplier>(search, {
      filters: "deleted:false",
      page: cursor,
      hitsPerPage: LIMIT
    });

    if (result.page + 1 > result.nbPages) {
      setCursor(undefined);
    } else {
      setCursor(result.page + 1);
    }

    for (const hit of result.hits) {
      const supplier = {
        ...hit,
        id: hit.objectID
      } as Supplier;

      data.push(supplier);
    }

    setSuppliers([
      ...suppliers,
      ...data,
    ]);

    setIsPaginating(false);
  };

  const onRefresh = async () => {
    dispatch(setRefresh(true));
    await getData();
    dispatch(setRefresh(false));
  }

  return (
    <Body
      header={<HeaderStack title={"Supplier Details"} navigateProp={navigation} />}
      style={tailwind("mt-6")}
      onRefresh={onRefresh}
      fixedScroll={true}>
      <SearchBar
        placeholder='Search'
        value={search}
        onChangeText={(value) => setSearch(value)} />

      <View style={tailwind('mt-3')}>
        <AddButtonText text='Create new supplier' onPress={() => { navigation.navigate("CreateSupplier") }} />
      </View>

      <View style={tailwind('mt-3')}>
        <UploadFileButton
          buttonText='Upload Excel'
          onSuccess={(uri) => {
            const data = {
              uri: uri
            }
            const importSuppliersFunc = functions.httpsCallable('importSuppliers');
            importSuppliersFunc(data).then(res => {
              console.log(res.data);
              revalidateCollection(SUPPLIERS);
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
          contentContainerStyle={getListStyle()}
          ItemSeparatorComponent={() => <CardSpace />}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          data={suppliers}
          onEndReachedThreshold={0.8}
          onEndReached={onPaginate}
          keyExtractor={(item: any, index: number) => index.toString()}
          renderItem={({ item }: { item: any }) => <SupplierCard {...item} navigate={() => { navigation.navigate("EditSupplier", { docID: item.id }) }} />}
        />
      </View>

      <StatusModal
        visible={modalVisible}
        message={`Import suppliers successfully`}
        onClose={() => { setModalVisible(false); }}></StatusModal>

      <StatusModal
        visible={hasError}
        message={`Import error, please provide the correct excel format`}
        icon={<WarningIcon width={70} height={70} />}
        onClose={() => { setHasError(false); }}></StatusModal>
    </Body>
  );
}

export default SupplierListScreen;