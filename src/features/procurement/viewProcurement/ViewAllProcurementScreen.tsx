import React, { useEffect, useState } from 'react';
import ViewTabProcurement from '../../../components/templates/procurement/ViewTabs/ViewTabProcurement';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import { SectionList, TouchableOpacity, View } from 'react-native';
import { SearchIcon, XSimpleIcon } from '../../../../assets/svg/SVG';
import { Procurement } from '../../../types/Procurement';
import { useDispatch } from 'react-redux';
import { setRefresh } from '../../../redux/reducers/Refresh';
import { PENDING, REQUESTING, SUBMITTED } from '../../../types/Common';

import moment from 'moment';
import Header from '../../../components/atoms/typography/Header';
import NoData from '../../../components/atoms/display/NoData';
import { getListStyle } from '../../../constants/Style';
import SearchBar from '../../../components/atoms/input/searchbar/SearchBar';
import { cloneDeep } from 'lodash';
import * as AlgoliaHelper from "../../../helpers/AlgoliaHelper";



const ViewAllProcurementSearchScreen = ({ navigation }: RootNavigationProps<"ViewAllProcurement">) => {
	const [filterBy, setFilterBy] = useState<string>("");
	const [filterString, setFilterString] = useState('');

	const [filteredProcurements, setFilteredProcurements] = useState<[]>([]);

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

			[SUBMITTED, PENDING, REQUESTING].map((status, index) => {
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
			if (filterString !== "") {
				const result = await AlgoliaHelper.procurementIndexRef.search<Procurement>(search, {
					filters: filterString,
					cacheable: true,
					hitsPerPage: LIMIT
				});


				if (result.page + 1 > result.nbPages) {
					setCursor(undefined);
				} else {
					setCursor(result.page + 1);
				}

				const ProcurementsGroup: any = [];

				for (const hit of result.hits) {
					const procurement = {
						id: hit.objectID,
						...hit
					} as Procurement;

					let added = false;

					for (let i = 0; i < ProcurementsGroup.length; i++) {
						let procurementGroup = ProcurementsGroup[i];

						if (procurementGroup.title == moment(procurement.created_at).format('MMMM YYYY')) {
							added = true;
							procurementGroup.data.push(procurement);
						}
					}

					if (!added) {
						ProcurementsGroup.push({
							title: moment(procurement.created_at).format('MMMM YYYY'),
							data: [
								procurement
							]
						})
					}
				}
				setFilteredProcurements(ProcurementsGroup);
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

		const result = await AlgoliaHelper.procurementIndexRef.search<Procurement>(search, {
			filters: filterString,
			page: cursor,
			hitsPerPage: LIMIT
		});

		if (result.page + 1 > result.nbPages) {
			setCursor(undefined);
		} else {
			setCursor(result.page + 1);
		}

		let ProcurementsGroup: any = cloneDeep(filteredProcurements);

		for (const hit of result.hits) {
			const procurement = {
				id: hit.objectID,
				...hit
			} as Procurement;

			let added = false;

			for (let i = 0; i < ProcurementsGroup.length; i++) {
				let procurementGroup = ProcurementsGroup[i];

				if (procurementGroup.title == moment(procurement.created_at).format('MMMM YYYY')) {
					added = true;
					procurementGroup.data.push(procurement);
				}
			}

			if (!added) {
				ProcurementsGroup.push({
					title: moment(procurement.created_at).format('MMMM YYYY'),
					data: [
						procurement
					]
				})
			}
		}

		setFilteredProcurements(ProcurementsGroup);
		setIsPaginating(false);
	};

	return (
		<Body
			header={<HeaderStack title={`View All Procurements`} navigateProp={navigation} navigateToDashboard={true}/>}
			style={tailwind("mt-5")}
			onRefresh={onRefresh}
			fixedScroll={false}>
			<View style={tailwind("mb-5")}>
				<FormDropdownInputField
					label="Filter by"
					value={filterBy}
					items={[SUBMITTED, PENDING, REQUESTING]}
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
						: (<TextLabel content={`All Procurements`} style={tailwind("font-bold")} />)
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
					sections={filteredProcurements}
					onEndReachedThreshold={0.8}
					onEndReached={onPaginate}
					keyExtractor={(item: any) => item.id}
					renderItem={({ item }: { item: any, index: number }) => {
						return <ViewTabProcurement
							id={item.secondary_id}
							nav_id={item.id}
							org={item.supplier.name}
							date={item.procurement_date}
							status={item.status}
							navigation={navigation}
						/>
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

export default ViewAllProcurementSearchScreen;