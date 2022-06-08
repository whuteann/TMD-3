import React, { useEffect, useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import SearchBar from '../../../components/atoms/input/searchbar/SearchBar';
import AddButtonText from '../../../components/atoms/buttons/AddButtonText';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import Body from '../../../components/atoms/display/Body';
import { useTailwind } from 'tailwind-rn/dist';
import Header from '../../../components/atoms/typography/Header';
import CardSpace from '../../../components/atoms/space/CardSpace';
import BunkerCard from '../../../components/templates/details/bunkers/index/BunkerCard';
import { Bunker } from '../../../types/Bunker';
import { useDispatch } from 'react-redux';
import { setRefresh } from '../../../redux/reducers/Refresh';
import { FlatList, View } from 'react-native';
import * as AlgoliaHelper from "../../../helpers/AlgoliaHelper";
import { getListStyle } from '../../../constants/Style';

const BunkerBargeListScreen = ({ navigation }: RootNavigationProps<"BunkerBargeList">) => {
  const [search, setSearch] = useState('');
	const [bunkers, setBunkers] = useState<Bunker[]>([]);

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
			const data: Bunker[] = [];
			const result = await AlgoliaHelper.bunkerIndexRef.search<Bunker>(search, {
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

				const bunker = {
          ...hit,
          id: hit.objectID
				} as Bunker;

        data.push(bunker); 
      }

      setBunkers(data);
		} catch {

		}
	}

  const onPaginate = async () => {
    if (isPaginating || !cursor) return;
    setIsPaginating(true);

    const data: Bunker[] = [];
    
    const result = await AlgoliaHelper.bunkerIndexRef.search<Bunker>(search, {
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
      const bunker = { 
        ...hit,
        id: hit.objectID 
      } as Bunker;

      data.push(bunker);
    }

    setBunkers([
      ...bunkers,
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
      header={<HeaderStack title={"Bunker Barge Details"} navigateProp={navigation} />} 
      onRefresh={onRefresh}
      style={tailwind("mt-6")}
      fixedScroll={true}>
      <SearchBar 
        placeholder='Search' 
        value={ search }
        onChangeText={ (value) => setSearch(value) } />
      
      <AddButtonText 
        text={"Create new bunker barge"} 
        onPress={() => { navigation.navigate("CreateBunker") }} />
      
      <Header 
        title="Bunker Barges" 
        alignment='text-left' 
        color='text-black'
        style={tailwind('my-3')} />
      
      <View style={tailwind('w-full mt-3')}>
        <FlatList
          contentContainerStyle={ getListStyle() }
          ItemSeparatorComponent={ () => <CardSpace /> }
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          data={bunkers}
          onEndReachedThreshold={0.8}
          onEndReached={onPaginate}
          keyExtractor={(item: any, index: number) => index.toString()}
          renderItem={({ item }: { item: any }) => { console.log(item); return <BunkerCard title={item.name} navigate={() => { navigation.navigate("BunkerDetail", { docID: item.id }) }} status="" />}}
        />
      </View>
    </Body>
  )
}

export default BunkerBargeListScreen;