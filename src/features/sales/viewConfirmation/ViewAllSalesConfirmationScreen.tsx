import { useCollection } from '@nandorojo/swr-firestore';
import { useLinkTo } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Platform, SectionList, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useTailwind } from 'tailwind-rn/dist';
import { SearchIcon, XSimpleIcon } from '../../../../assets/svg/SVG';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import NoData from '../../../components/atoms/display/NoData';
import TextInputField from '../../../components/atoms/input/text/TextInputField';
import Header from '../../../components/atoms/typography/Header';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import { getListStyle } from '../../../constants/Style';
import { salesConfirmationRef } from '../../../functions/Firebase';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import { setRefresh } from '../../../redux/reducers/Refresh';
import { SalesConfirmation } from '../../../types/SalesConfirmation';


import SearchBar from '../../../components/atoms/input/searchbar/SearchBar';
import { cloneDeep } from 'lodash';
import * as AlgoliaHelper from "../../../helpers/AlgoliaHelper";
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import { CONFIRMED, NOT_CONFIRMED } from '../../../types/Common';

export const ViewTabSalesConfirmation = ({ item, navigation }) => {
	const tailwind = useTailwind();
	return (
		<TouchableOpacity onPress={() => { navigation.navigate("SalesConfirmationSummary", { docID: item.id }); }}>
			<View style={[tailwind("box-card-shadow rounded-lg p-2 bg-white mt-2 mb-5")]}>

				<View style={tailwind("flex-row pr-3")}>
					<View style={tailwind("flex w-[90%]")}>
						<TextLabel content={`${item.confirmed_date}`} style={tailwind("italic text-12px text-gray-400")} />
						<View style={tailwind("flex-row items-center")}>
							<View style={tailwind("flex-wrap w-full")}>
								<TextLabel content={item.secondary_id || ""} style={tailwind("text-xl font-bold text-18px")} />
							</View>
						</View>
					</View>
				</View>

				<View >
					<View style={tailwind("flex-row flex")}>
						<TextLabel content={`•`} style={tailwind("italic text-12px text-gray-400 w-auto mr-1")} />
						<TextLabel content={`${item.customer.name}`} style={Platform.OS != "web" ? tailwind("italic text-12px text-gray-400 w-1/3 flex-wrap mr-1") : tailwind("italic text-12px text-gray-400 w-1/3 flex-wrap mr-2")} />

						<TextLabel content={`•`} style={tailwind("italic text-12px text-gray-400 w-auto mr-1")} />
						<TextLabel content={`${item.created_by.name}`} style={Platform.OS != "web" ? tailwind("italic text-12px text-gray-400 w-1/6 flex-wrap mr-1") : tailwind("italic text-12px text-gray-400 w-2/6 flex-wrap")} />

						<TextLabel content={`•`} style={tailwind("italic text-12px text-gray-400 w-auto mr-1")} />
						<TextLabel content={`${item.status || "Confirmed"}`} style={tailwind("italic text-12px text-gray-400 w-4/12 flex-wrap")} />
					</View>
				</View>
			</View>
		</TouchableOpacity>
	)
}

const ViewAllSalesConfirmationScreen = ({ navigation }: RootNavigationProps<"ViewAllSalesConfirmation">) => {


	const [filteredsalesConfirmations, setFilteredsalesConfirmations] = useState<[]>([]);
	
	const [filterBy, setFilterBy] = useState<string>("");
	const [filterString, setFilterString] = useState('');
	
	const [cursor, setCursor] = useState<number | undefined>(undefined);
	const [isPaginating, setIsPaginating] = useState<boolean>(false);
	const [searchToggle, setSearchToggle] = useState(false);
	const [search, setSearch] = useState<string>('');

	const tailwind = useTailwind();
	const dispatch = useDispatch();
	const LIMIT = 20;

	useEffect(() => {
		if (filterBy == "") {
			let filters = '';

			[CONFIRMED, NOT_CONFIRMED].map((status, index) => {
				if (index == 0) {
					filters = `status:'${status}'`;
				} else {
					filters = filters + ` OR status:'${status}'`;
				}
			});
			setFilterString(filters);
		} else {
			setFilterString(`status:'${filterBy}'`);
		}
	}, [filterBy])

	useEffect(() => {
		getData();
	}, [filterString]);

	useEffect(() => {
		getData()
	}, [search]);

	const getData = async () => {
		try {
			const result = await AlgoliaHelper.salesConfirmationIndexRef.search<SalesConfirmation>(search, {
				filters: filterString,
				cacheable: true,
				hitsPerPage: LIMIT
			});

			if (result.page + 1 > result.nbPages) {
				setCursor(undefined);
			} else {
				setCursor(result.page + 1);
			}

			const salesConfirmationsGroup: any = [];

			for (const hit of result.hits) {
				const salesConfirmation = {
					id: hit.objectID,
					...hit
				} as SalesConfirmation;

				let added = false;

				for (let i = 0; i < salesConfirmationsGroup.length; i++) {
					let salesConfirmationGroup = salesConfirmationsGroup[i];

					if (salesConfirmationGroup.title == moment(salesConfirmation.created_at).format('MMMM YYYY')) {
						added = true;
						salesConfirmationGroup.data.push(salesConfirmation);
					}
				}

				if (!added) {
					salesConfirmationsGroup.push({
						title: moment(salesConfirmation.created_at).format('MMMM YYYY'),
						data: [
							salesConfirmation
						]
					})
				}
			}
			setFilteredsalesConfirmations(salesConfirmationsGroup);
		} catch {

		}
	}

	// update list
	const onRefresh = async () => {
		dispatch(setRefresh(true));
		await getData();
		dispatch(setRefresh(false));
	}

	const onPaginate = async () => {
		if (isPaginating || !cursor) return;
		setIsPaginating(true);

		const result = await AlgoliaHelper.salesConfirmationIndexRef.search<SalesConfirmation>(search, {
			filters: filterString,
			page: cursor,
			hitsPerPage: LIMIT
		});

		if (result.page + 1 > result.nbPages) {
			setCursor(undefined);
		} else {
			setCursor(result.page + 1);
		}

		let salesConfirmationsGroup: any = cloneDeep(filteredsalesConfirmations);

		for (const hit of result.hits) {
			const salesConfirmation = {
				id: hit.objectID,
				...hit
			} as SalesConfirmation;	

			let added = false;

			for (let i = 0; i < salesConfirmationsGroup.length; i++) {
				let salesConfirmationGroup = salesConfirmationsGroup[i];

				if (salesConfirmationGroup.title == moment(salesConfirmation.created_at).format('MMMM YYYY')) {
					added = true;
					salesConfirmationGroup.data.push(salesConfirmation);
				}
			}

			if (!added) {
				salesConfirmationsGroup.push({
					title: moment(salesConfirmation.created_at).format('MMMM YYYY'),
					data: [
						salesConfirmation
					]
				})
			}
		}

		setFilteredsalesConfirmations(salesConfirmationsGroup);
		setIsPaginating(false);
	};

	return (
		<Body
			header={<HeaderStack title={`View All Sales Confirmations`} navigateProp={navigation} navigateToDashboard={true} />}
			style={tailwind("mt-5")}
			onRefresh={onRefresh}
			fixedScroll={false}>
			<View style={tailwind("mb-5")}>
				<FormDropdownInputField
					label="Filter by"
					value={filterBy}
					items={[CONFIRMED, NOT_CONFIRMED]}
					onChangeValue={(val) => { setFilterBy(val) }}
					placeholder='All'
				/>
			</View>
			<View style={tailwind('flex-row items-center justify-center items-center')}>
				{
					searchToggle
						?
						(
							<View style={tailwind('w-11/12')}>
								<SearchBar
									placeholder='Search'
									value={search}
									onChangeText={(value) => { setSearch(value) }} />
							</View>
						)
						: (<TextLabel content={`All Sales Confirmations`} style={tailwind("font-bold")} />)
				}


				<View>
					<TouchableOpacity onPress={() => setSearchToggle(!searchToggle)}>
						{
							!searchToggle
								?
								<SearchIcon width={25} height={25} />
								:
								<View style={tailwind('mx-2 mb-3')}>
									<XSimpleIcon width={25} height={25} />
								</View>
						}
					</TouchableOpacity>
				</View>
			</View>

			<View>
				<SectionList
					style={{ paddingLeft: 3, paddingRight: 3, paddingBottom: 3 }}
					contentContainerStyle={getListStyle()}
					scrollEnabled={true}
					showsVerticalScrollIndicator={false}
					sections={filteredsalesConfirmations}
					onEndReachedThreshold={0.8}
					onEndReached={onPaginate}
					keyExtractor={(item: any) => item.id}
					renderItem={({ item }: { item: any, index: number }) => {
						return <ViewTabSalesConfirmation item={item} navigation={navigation} />
					}}
					renderSectionHeader={({ section }) => (
						<Header
							title={section['title']}
							color='text-black'
							alignment='text-left' />
					)}
					ListEmptyComponent={<NoData />}
				/>
			</View>

		</Body>
	)
}


export default ViewAllSalesConfirmationScreen;