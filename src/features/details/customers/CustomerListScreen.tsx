import React, { useEffect, useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import { FlatList, View } from 'react-native';

import SearchBar from '../../../components/atoms/input/searchbar/SearchBar';
import AddButtonText from '../../../components/atoms/buttons/AddButtonText';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import Body from '../../../components/atoms/display/Body';
import { useTailwind } from 'tailwind-rn/dist';
import CustomerCard from '../../../components/templates/details/customers/index/CustomerCard';
import CardSpace from '../../../components/atoms/space/CardSpace';
import { useDispatch } from 'react-redux';
import { setRefresh } from '../../../redux/reducers/Refresh';
import * as AlgoliaHelper from "../../../helpers/AlgoliaHelper";
import { Customer } from '../../../types/Customer';
import { getListStyle } from '../../../constants/Style';
import { functions } from '../../../functions/Firebase';
import UploadFileButton from '../../../components/molecules/buttons/UploadFileButton';
import StatusModal from '../../../components/atoms/modal/StatusModal';
import { revalidateCollection } from '@nandorojo/swr-firestore';
import { CUSTOMERS } from '../../../constants/Firebase';
import { WarningIcon } from '../../../../assets/svg/SVG';

const CustomerListScreen = ({ navigation }: RootNavigationProps<"CustomerList">) => {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [hasError, setHasError] = useState<boolean>(false);

  const tailwind = useTailwind();
  const dispatch = useDispatch();

  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [isPaginating, setIsPaginating] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const LIMIT = 20;

  useEffect(() => {
    getData()
  }, [search]);

  const getData = async () => {
    try {
      const data: Customer[] = [];
      const result = await AlgoliaHelper.customerIndexRef.search<Customer>(search, {
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

        const customer = {
          ...hit,
          id: hit.objectID
        } as Customer;

        data.push(customer);
      }

      setCustomers(data);
    } catch {

    }
  }

  const onPaginate = async () => {
    if (isPaginating || !cursor) return;
    setIsPaginating(true);

    const data: Customer[] = [];

    const result = await AlgoliaHelper.customerIndexRef.search<Customer>(search, {
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
      const customer = {
        ...hit,
        id: hit.objectID
      } as Customer;

      data.push(customer);
    }

    setCustomers([
      ...customers,
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
      header={<HeaderStack title={"Customer Details"} navigateProp={navigation} />}
      style={tailwind("mt-6")}
      onRefresh={onRefresh}
      fixedScroll={true}>
      <SearchBar
        placeholder='Search'
        value={search}
        onChangeText={(value) => setSearch(value)} />

      <View style={tailwind('mt-3')}>
        <AddButtonText text='Create new customer' onPress={() => { navigation.navigate("CreateCustomer") }} />
      </View>

      <View style={tailwind('mt-3')}>
        <UploadFileButton
          buttonText='Upload Excel'
          onSuccess={(uri) => {
            const data = {
              uri: uri
            }
            const importCustomersFunc = functions.httpsCallable('importCustomers');
            importCustomersFunc(data).then(res => {
              setModalVisible(true);
              revalidateCollection(CUSTOMERS);
              console.log(res.data);
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
          data={customers}
          onEndReachedThreshold={0.8}
          onEndReached={onPaginate}
          keyExtractor={(item: any, index: number) => index.toString()}
          renderItem={({ item }: { item: any }) => <CustomerCard {...item} navigate={() => { navigation.navigate("EditCustomer", { docID: item.id }) }} />}
        />
      </View>

      <StatusModal
        visible={modalVisible}
        message={`Import customers successfully`}
        onClose={() => { setModalVisible(false); navigation.navigate("Dashboard") }}></StatusModal>

      <StatusModal
        visible={hasError}
        message={`Import error, please provide the correct excel format`}
        icon={<WarningIcon width={70} height={70} />}
        onClose={() => { setHasError(false); }}></StatusModal>
    </Body>
  );
}

export default CustomerListScreen;