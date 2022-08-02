import React, { useEffect, useState } from 'react';
import { SectionList, TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import { SearchIcon, XSimpleIcon } from '../../../../assets/svg/SVG';
import { useDispatch } from 'react-redux';
import { setRefresh } from '../../../redux/reducers/Refresh';
import * as AlgoliaHelper from "../../../helpers/AlgoliaHelper";
import NoData from '../../../components/atoms/display/NoData';
import SearchBar from '../../../components/atoms/input/searchbar/SearchBar';
import { getListStyle } from '../../../constants/Style';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import Header from '../../../components/atoms/typography/Header';
import { APPROVED, ARCHIVED, CONFIRMED, DRAFT, IN_REVIEW, REJECTED } from '../../../types/Common';
import { Sales } from '../../../types/Sales';
import ViewTabSales from '../../../components/templates/job/ViewTabs/ViewTabSales';
import AddButtonText from '../../../components/atoms/buttons/AddButtonText';
import ExportModal from '../../../components/templates/job/ExportModal';

const SalesListScreen = ({ navigation }: RootNavigationProps<"SaleList">) => {

	const [filterBy, setFilterBy] = useState<string>("");
	const [filteredSalesSummary, setFilteredSalesSummary] = useState<[]>([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [cursor, setCursor] = useState<number | undefined>(undefined);
	const [isPaginating, setIsPaginating] = useState<boolean>(false);
	const [searchToggle, setSearchToggle] = useState(false);
	const [search, setSearch] = useState<string>('');

	const tailwind = useTailwind();
	const dispatch = useDispatch();
	const LIMIT = 20;

	useEffect(() => {
		getData()
	}, [search]);

	const getData = async () => {
		try {
			const result = await AlgoliaHelper.salesSummaryIndexRef.search<Sales>(search, {
				cacheable: true,
				hitsPerPage: LIMIT
			});


			if (result.page + 1 > result.nbPages) {
				setCursor(undefined);
			} else {
				setCursor(result.page + 1);
			}

			const salesSummariesGroup: any = [];

			for (const hit of result.hits) {
				const salesSummary = {
					id: hit.objectID,
					...hit
				} as Sales;

				let added = false;

				for (let i = 0; i < salesSummariesGroup.length; i++) {
					let salesSummaryGroup = salesSummariesGroup[i];

					if (salesSummaryGroup.title == moment(salesSummary.created_at).format('MMMM YYYY')) {
						added = true;
						salesSummaryGroup.data.push(salesSummary);
					}
				}

				if (!added) {
					salesSummariesGroup.push({
						title: moment(salesSummary.created_at).format('MMMM YYYY'),
						data: [
							salesSummary
						]
					})
				}
			}
			setFilteredSalesSummary(salesSummariesGroup);

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

		const result = await AlgoliaHelper.salesSummaryIndexRef.search<Sales>(search, {
			filters: "deleted:false",
			page: cursor,
			hitsPerPage: LIMIT
		});

		if (result.page + 1 > result.nbPages) {
			setCursor(undefined);
		} else {
			setCursor(result.page + 1);
		}

		let salesSummariesGroup: any = cloneDeep(filteredSalesSummary);

		for (const hit of result.hits) {
			const salesSummary = {
				id: hit.objectID,
				...hit
			} as Sales;

			let added = false;

			for (let i = 0; i < salesSummariesGroup.length; i++) {
				let salesSummaryGroup = salesSummariesGroup[i];

				if (salesSummaryGroup.title == moment(salesSummary.created_at).format('MMMM YYYY')) {
					added = true;
					salesSummaryGroup.data.push(salesSummary);
				}
			}

			if (!added) {
				salesSummariesGroup.push({
					title: moment(salesSummary.created_at).format('MMMM YYYY'),
					data: [
						salesSummary
					]
				})
			}
		}

		setFilteredSalesSummary(salesSummariesGroup);
		setIsPaginating(false);
	};

	return (
		<Body
			header={<HeaderStack title={`View All Sales Summary`} navigateProp={navigation} navigateToDashboard={true} />}
			style={tailwind("mt-5")}
			onRefresh={onRefresh}
			fixedScroll={false}>
			<View style={tailwind("mt-5")}>
				<AddButtonText text='Export Excel' onPress={() => { setModalOpen(true) }} />
			</View>

			<ExportModal visible={modalOpen} onClose={() => { setModalOpen(false) }}  />

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
						: (<TextLabel content={`All Sales Summary`} style={tailwind("font-bold")} />)
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
					sections={filteredSalesSummary}
					onEndReachedThreshold={0.8}
					onEndReached={onPaginate}
					keyExtractor={(item: any) => item.id}
					renderItem={({ item }: { item: any, index: number }) => {
						return <ViewTabSales
							nav_id={item.id}
							org={item.customer.name}
							name={item.customer.contact_persons[0].name}
							navigation={navigation}
							date={item.created_date}
						/>
					}}
					renderSectionHeader={({ section }) => (
						<View style={tailwind("mb-3")}>
							<Header
								title={section['title']}
								color='text-black'
								alignment='text-left' />
						</View>
					)}
					ListEmptyComponent={<NoData />}
				/>
			</View>

		</Body>
	)
}

export default SalesListScreen;