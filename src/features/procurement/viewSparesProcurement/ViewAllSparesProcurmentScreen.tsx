import React, { useEffect, useState } from 'react';
import { SectionList, TouchableOpacity, View } from 'react-native';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import ViewTabSparesProcurement from '../../../components/templates/procurement/ViewTabs/ViewTabSparesProcurement';
import Body from '../../../components/atoms/display/Body';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import { SearchIcon, XSimpleIcon } from '../../../../assets/svg/SVG';
import { setRefresh } from '../../../redux/reducers/Refresh';
import { SparesProcurement } from '../../../types/SparesProcurement';
import { useDispatch } from 'react-redux';
import { useTailwind } from 'tailwind-rn/dist';

import moment from 'moment';
import Header from '../../../components/atoms/typography/Header';
import NoData from '../../../components/atoms/display/NoData';
import { getListStyle } from '../../../constants/Style';
import SearchBar from '../../../components/atoms/input/searchbar/SearchBar';
import { cloneDeep } from 'lodash';
import * as AlgoliaHelper from "../../../helpers/AlgoliaHelper";
import { APPROVED, DRAFT, IN_REVIEW, PENDING, REJECTED, REJECTING, SUBMITTED } from '../../../types/Common';
import { useRefreshContext } from '../../../providers/RefreshProvider';
import { SPARES_PROCUREMENTS } from '../../../constants/Firebase';
import { actionDelay } from '../../../helpers/GenericHelper';

const ViewAllSparesProcurementSearchScreen = ({ navigation }: RootNavigationProps<"ViewAllSparesProcurement">) => {

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

	const refreshContext = useRefreshContext();

	useEffect(() => {
		if (refreshContext?.toRefresh == SPARES_PROCUREMENTS) {

			AlgoliaHelper.clearCache();
			let filters = "";

			setFilterString("item: null");

			setTimeout(() => {
				[IN_REVIEW, DRAFT, APPROVED, REJECTED, PENDING, SUBMITTED].map((status, index) => {
					if (index == 0) {
						filters = `status:'${status}'`;
					} else {
						filters = filters + `OR status:'${status}'`;
					}
				});
				setFilterString(filters);
			}, actionDelay);
		}
	}, [refreshContext?.refresh])

	useEffect(() => {
		if (filterBy == "") {
			let filters = '';

			[IN_REVIEW, DRAFT, APPROVED, REJECTED, PENDING, SUBMITTED].map((status, index) => {
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
				const result = await AlgoliaHelper.sparesProcurementIndexRef.search<SparesProcurement>(search, {
					filters: filterString,
					cacheable: true,
					hitsPerPage: LIMIT
				});

				if (result.page + 1 > result.nbPages) {
					setCursor(undefined);
				} else {
					setCursor(result.page + 1);
				}

				const sparesProcurementsGroup: any = [];

				for (const hit of result.hits) {
					const sparesProcurement = {
						id: hit.objectID,
						...hit
					} as SparesProcurement;

					let added = false;

					for (let i = 0; i < sparesProcurementsGroup.length; i++) {
						let sparesProcurementGroup = sparesProcurementsGroup[i];

						if (sparesProcurementGroup.title == moment(sparesProcurement.created_at).format('MMMM YYYY')) {
							added = true;
							sparesProcurementGroup.data.push(sparesProcurement);
						}
					}

					if (!added) {
						sparesProcurementsGroup.push({
							title: moment(sparesProcurement.created_at).format('MMMM YYYY'),
							data: [
								sparesProcurement
							]
						})
					}
				}
				setFilteredProcurements(sparesProcurementsGroup);
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

		const result = await AlgoliaHelper.sparesProcurementIndexRef.search<SparesProcurement>(search, {
			filters: filterString,
			page: cursor,
			hitsPerPage: LIMIT
		});

		if (result.page + 1 > result.nbPages) {
			setCursor(undefined);
		} else {
			setCursor(result.page + 1);
		}

		let sparesProcurementsGroup: any = cloneDeep(filteredProcurements);

		for (const hit of result.hits) {
			const sparesProcurement = {
				id: hit.objectID,
				...hit
			} as SparesProcurement;

			let added = false;

			for (let i = 0; i < sparesProcurementsGroup.length; i++) {
				let sparesProcurementGroup = sparesProcurementsGroup[i];

				if (sparesProcurementGroup.title == moment(sparesProcurement.created_at).format('MMMM YYYY')) {
					added = true;
					sparesProcurementGroup.data.push(sparesProcurement);
				}
			}

			if (!added) {
				sparesProcurementsGroup.push({
					title: moment(sparesProcurement.created_at).format('MMMM YYYY'),
					data: [
						sparesProcurement
					]
				})
			}
		}

		setFilteredProcurements(sparesProcurementsGroup);
		setIsPaginating(false);
	};

	return (
		<Body
			header={<HeaderStack title={`View All Spares Procurements`} navigateProp={navigation} navigateToDashboard={true}/>}
			style={tailwind("mt-5")}
			onRefresh={onRefresh}
			fixedScroll={false}>
			<View style={tailwind("mb-5")}>
				<FormDropdownInputField
					label="Filter by"
					value={filterBy}
					items={[IN_REVIEW, DRAFT, APPROVED, REJECTED, PENDING, SUBMITTED]}
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
						: (<TextLabel content={`All Spares Procurements`} style={tailwind("font-bold")} />)
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
					sections={filteredProcurements}
					onEndReachedThreshold={0.8}
					onEndReached={onPaginate}
					keyExtractor={(item: any) => item.id}
					renderItem={({ item }: { item: any, index: number }) => {
						return <ViewTabSparesProcurement
							id={item.display_id}
							nav_id={item.id}
							name={item.created_by.name}
							org={item.suppliers ? item.suppliers[0].supplier.name : ""}
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


export default ViewAllSparesProcurementSearchScreen;