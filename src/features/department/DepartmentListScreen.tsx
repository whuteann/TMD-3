import React, { useEffect, useState } from 'react';
import { FlatList, Platform, View } from 'react-native';
import { RootNavigationProps } from '../../navigations/NavigationProps/NavigationProps';
import SearchBar from '../../components/atoms/input/searchbar/SearchBar';
import AddButtonText from '../../components/atoms/buttons/AddButtonText';
import HeaderStack from '../../components/atoms/display/HeaderStack';
import LoadingData from '../../components/atoms/loading/loadingData';
import UserDetailCard from '../../components/templates/departments/users/UserDetailCard';
import { useTailwind } from 'tailwind-rn';
import Body from '../../components/atoms/display/Body';
import { useDispatch, useSelector } from 'react-redux';
import { UserSelector } from '../../redux/reducers/Auth';
import { CREATE_USER } from '../../permissions/Permissions';
import { User } from '../../types/User';
import * as AlgoliaHelper from "../../helpers/AlgoliaHelper";
import { setRefresh } from '../../redux/reducers/Refresh';
import NoData from '../../components/atoms/display/NoData';
import { getWindow } from '../../helpers/GenericHelper';
import { getListStyle } from '../../constants/Style';

const DepartmentListScreen = ({ navigation }: RootNavigationProps<"Departments">) => {
  const tailwind = useTailwind();
  const [cursor, setCursor] = useState<number | undefined>(undefined);
	const [isPaginating, setIsPaginating] = useState<boolean>(false);
	const [search, setSearch] = useState<string>('');
	const [users, setUsers] = useState<User[]>([]);

  const user = useSelector(UserSelector);
	const dispatch = useDispatch();
  const LIMIT = 20;

	useEffect(() => {
		getData()
	}, [search]);
  
	const getData = async () => {
		try {
			const data: User[] = [];
			const result = await AlgoliaHelper.userIndexRef.search<User>(search, {
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

				const user = {
					...hit,
          id: hit.objectID
				} as User;

        data.push(user); 
      }

      setUsers(data);
		} catch {

		}
	}

  const onPaginate = async () => {
    if (isPaginating || !cursor) return;
    setIsPaginating(true);

    const data: User[] = [];
    
    const result = await AlgoliaHelper.userIndexRef.search<User>(search, {
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
      const user = { 
        ...hit,
        id: hit.objectID
      } as User;

      data.push(user);
    }

    setUsers([
      ...users,
      ...data,
    ]);

    setIsPaginating(false);
  };

	// update list
	const onRefresh = async () => {
		dispatch(setRefresh(true));
		await getData();
		dispatch(setRefresh(false));
	}

  if (!users) return <LoadingData message="Loading departments" />;

  return (
    <Body 
      header={<HeaderStack title={"View Departments"} navigateProp={navigation} />}
      onRefresh={onRefresh} 
      fixedScroll={true}
      style={tailwind("mt-6")}>
  
      <SearchBar
        placeholder='Search'
        value={search}
        onChangeText={(value) => { setSearch(value) }} />

      {
        user?.permission?.includes(CREATE_USER)
        ?
          <View style={tailwind("mt-3")}>
            <AddButtonText text={"Create new user"} onPress={() => { navigation.navigate("CreateUser") }} />
          </View>
        :
        <></>
      }

      <View>
        <FlatList
          contentContainerStyle={getListStyle()}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          data={users}
          onEndReachedThreshold={0.8}
          onEndReached = {onPaginate}
          keyExtractor={(item: any, index: number) => index.toString()}
          ListEmptyComponent={<NoData/>}
          ItemSeparatorComponent={() => <View style={tailwind('border-b-2 border-black')}></View>}
          renderItem={({ item }: { item: any }) => <UserDetailCard navigate={() => { navigation.navigate("EditUser", { docID: item.id }) }} name={item.name} role={item.role} email={item.email} />}
          />
      </View>
    </Body>
  )
}

export default DepartmentListScreen;