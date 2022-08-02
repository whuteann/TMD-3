import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Platform, SectionList, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useTailwind } from 'tailwind-rn/dist';
import { SearchIcon, XSimpleIcon } from '../../../../assets/svg/SVG';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import NoData from '../../../components/atoms/display/NoData';
import Header from '../../../components/atoms/typography/Header';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import { getListStyle } from '../../../constants/Style';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import { setRefresh } from '../../../redux/reducers/Refresh';
import { SalesConfirmation } from '../../../types/SalesConfirmation';
import SearchBar from '../../../components/atoms/input/searchbar/SearchBar';
import { cloneDeep } from 'lodash';
import * as AlgoliaHelper from "../../../helpers/AlgoliaHelper";
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import { CONFIRMED, NOT_CONFIRMED } from '../../../types/Common';
import ViewTabSalesConfirmation from '../../../components/templates/sales/ViewTabs/ViewTabSales';
import { useRefreshContext } from '../../../providers/RefreshProvider';
import { SALES_CONFIRMATIONS } from '../../../constants/Firebase';
import { actionDelay } from '../../../helpers/GenericHelper';


export const ViewAllSalesConfirmationScreen = ({ navigation }: RootNavigationProps<"ViewAllSalesConfirmation">) => {

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

	const refreshContext = useRefreshContext();

	useEffect(() => {
		if (refreshContext?.toRefresh == SALES_CONFIRMATIONS) {
			
			let filters = "";
			setFilterString("item: null");

			AlgoliaHelper.clearCache();
			
			setTimeout(() => {
				[CONFIRMED, NOT_CONFIRMED].map((status, index) => {
					if (index == 0) {
						filters = `status:'${status}'`;
					} else {
						filters = filters + ` OR status:'${status}'`;
					}
				});
				setFilterString(filters);
			}, actionDelay);
		}
	}, [refreshContext?.refresh])

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
								<View style={tailwind('mx-2 mb-5')}>
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