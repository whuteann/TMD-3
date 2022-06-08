import React, { useEffect, useState } from 'react';
import { SectionList, TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import ViewTabQuotation from '../../../components/templates/sales/ViewTabs/ViewTabQuotation';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import { Quotation } from '../../../types/Quotation';
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

const ViewAllQuotationScreen = ({ navigation }: RootNavigationProps<"ViewAllQuotation">) => {

	const [filterBy, setFilterBy] = useState<string>("");
	const [filterString, setFilterString] = useState('');

	const [filteredQuotations, setFilteredQuotations] = useState<[]>([]);

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

			[DRAFT, CONFIRMED, APPROVED, REJECTED, IN_REVIEW].map((status, index) => {
				if (index == 0) {
					filters = ` AND status:'${status}'`;
				} else {
					filters = filters + ` OR status:'${status}'`;
				}
			});
			setFilterString(filters);
		} else {
			setFilterString(` AND status:'${filterBy}'`);
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
			if (filterString !== "") {
				const result = await AlgoliaHelper.quotationIndexRef.search<Quotation>(search, {
					filters: "deleted:false" +  filterString,
					cacheable: true,
					hitsPerPage: LIMIT
				});
		
				
				if (result.page + 1 > result.nbPages) {
					setCursor(undefined);
				} else {
					setCursor(result.page + 1);
				}

				const quotationsGroup: any = [];

				for (const hit of result.hits) {
					const quotation = {
						id: hit.objectID,
						...hit
					} as Quotation;

					let added = false;

					for (let i = 0; i < quotationsGroup.length; i++) {
						let quotationGroup = quotationsGroup[i];

						if (quotationGroup.title == moment(quotation.created_at).format('MMMM YYYY')) {
							added = true;
							quotationGroup.data.push(quotation);
						}
					}

					if (!added) {
						quotationsGroup.push({
							title: moment(quotation.created_at).format('MMMM YYYY'),
							data: [
								quotation
							]
						})
					}
				}
				setFilteredQuotations(quotationsGroup);
			}
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

		const result = await AlgoliaHelper.quotationIndexRef.search<Quotation>(search, {
			filters: "deleted:false" + filterString,
			page: cursor,
			hitsPerPage: LIMIT
		});

		if (result.page + 1 > result.nbPages) {
			setCursor(undefined);
		} else {
			setCursor(result.page + 1);
		}

		let quotationsGroup: any = cloneDeep(filteredQuotations);

		for (const hit of result.hits) {
			const quotation = {
				id: hit.objectID,
				...hit
			} as Quotation;

			let added = false;

			for (let i = 0; i < quotationsGroup.length; i++) {
				let quotationGroup = quotationsGroup[i];

				if (quotationGroup.title == moment(quotation.created_at).format('MMMM YYYY')) {
					added = true;
					quotationGroup.data.push(quotation);
				}
			}

			if (!added) {
				quotationsGroup.push({
					title: moment(quotation.created_at).format('MMMM YYYY'),
					data: [
						quotation
					]
				})
			}
		}

		setFilteredQuotations(quotationsGroup);
		setIsPaginating(false);
	};

	return (
		<Body
			header={<HeaderStack title={`View All Quotations`} navigateProp={navigation} navigateToDashboard={true} />}
			style={tailwind("mt-5")}
			onRefresh={onRefresh}
			fixedScroll={false}>
			<View style={tailwind("mb-5")}>
				<FormDropdownInputField
					label="Filter by"
					value={filterBy}
					items={[DRAFT, IN_REVIEW, APPROVED, REJECTED, CONFIRMED, ARCHIVED]}
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
						: (<TextLabel content={`All Quotations`} style={tailwind("font-bold")} />)
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
					sections={filteredQuotations}
					onEndReachedThreshold={0.8}
					onEndReached={onPaginate}
					keyExtractor={(item: any) => item.id}
					renderItem={({ item }: { item: any, index: number }) => {
						return <ViewTabQuotation
							id={item.display_id}
							nav_id={item.id}
							org={item.customer.name}
							name={item.created_by.name}
							date={item.quotation_date}
							status={item.status}
							data={item}
							navigation={navigation} />
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

export default ViewAllQuotationScreen;