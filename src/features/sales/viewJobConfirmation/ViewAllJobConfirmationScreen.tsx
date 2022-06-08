import React, { useEffect, useState } from 'react';
import { SectionList, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useTailwind } from 'tailwind-rn/dist';
import { SearchIcon, XSimpleIcon } from '../../../../assets/svg/SVG';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import ViewTabJob from '../../../components/templates/sales/ViewTabs/ViewTabJob';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import { setRefresh } from '../../../redux/reducers/Refresh';
import { JobConfirmation } from '../../../types/JobConfirmation';
import { ISSUED_INV, NO_INVOICE } from '../../../types/Common';

import moment from 'moment';
import Header from '../../../components/atoms/typography/Header';
import NoData from '../../../components/atoms/display/NoData';
import { getListStyle } from '../../../constants/Style';
import SearchBar from '../../../components/atoms/input/searchbar/SearchBar';
import { cloneDeep } from 'lodash';
import * as AlgoliaHelper from "../../../helpers/AlgoliaHelper";

const ViewAllJobConfirmationScreen = ({ navigation }: RootNavigationProps<"ViewAllJobConfirmation">) => {
	const [filterBy, setFilterBy] = useState<string>("");
	const [filterString, setFilterString] = useState('');

	const [filteredjobConfirmations, setFilteredjobConfirmations] = useState<[]>([]);

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

			[NO_INVOICE, ISSUED_INV].map((status, index) => {
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
				const result = await AlgoliaHelper.jobConfirmationIndexRef.search<JobConfirmation>(search, {
					filters: filterString,
					cacheable: true,
					hitsPerPage: LIMIT
				});


				if (result.page + 1 > result.nbPages) {
					setCursor(undefined);
				} else {
					setCursor(result.page + 1);
				}

				const jobConfirmationsGroup: any = [];

				for (const hit of result.hits) {
					const jobConfirmation = {
						id: hit.objectID,
						...hit
					} as JobConfirmation;

					let added = false;

					for (let i = 0; i < jobConfirmationsGroup.length; i++) {
						let jobConfirmationGroup = jobConfirmationsGroup[i];

						if (jobConfirmationGroup.title == moment(jobConfirmation.created_at).format('MMMM YYYY')) {
							added = true;
							jobConfirmationGroup.data.push(jobConfirmation);
						}
					}

					if (!added) {
						jobConfirmationsGroup.push({
							title: moment(jobConfirmation.created_at).format('MMMM YYYY'),
							data: [
								jobConfirmation
							]
						})
					}
				}
				setFilteredjobConfirmations(jobConfirmationsGroup);
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

		const result = await AlgoliaHelper.jobConfirmationIndexRef.search<JobConfirmation>(search, {
			filters: filterString,
			page: cursor,
			hitsPerPage: LIMIT
		});

		if (result.page + 1 > result.nbPages) {
			setCursor(undefined);
		} else {
			setCursor(result.page + 1);
		}

		let jobConfirmationsGroup: any = cloneDeep(filteredjobConfirmations);

		for (const hit of result.hits) {
			const jobConfirmation = {
				id: hit.objectID,
				...hit
			} as JobConfirmation;

			let added = false;

			for (let i = 0; i < jobConfirmationsGroup.length; i++) {
				let jobConfirmationGroup = jobConfirmationsGroup[i];

				if (jobConfirmationGroup.title == moment(jobConfirmation.created_at).format('MMMM YYYY')) {
					added = true;
					jobConfirmationGroup.data.push(jobConfirmation);
				}
			}

			if (!added) {
				jobConfirmationsGroup.push({
					title: moment(jobConfirmation.created_at).format('MMMM YYYY'),
					data: [
						jobConfirmation
					]
				})
			}
		}

		setFilteredjobConfirmations(jobConfirmationsGroup);
		setIsPaginating(false);
	};

	return (
		<Body
			header={<HeaderStack title={`View All Job Confirmations`} navigateProp={navigation} navigateToDashboard={true} />}
			style={tailwind("mt-5")}
			onRefresh={onRefresh}
			fixedScroll={false}>
			<View style={tailwind("mb-5")}>
				<FormDropdownInputField
					label="Filter by"
					value={filterBy}
					items={[NO_INVOICE, ISSUED_INV]}
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
						: (<TextLabel content={`All Job Confirmations`} style={tailwind("font-bold")} />)
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
					sections={filteredjobConfirmations}
					onEndReachedThreshold={0.8}
					onEndReached={onPaginate}
					keyExtractor={(item: any) => item.id}
					renderItem={({ item }: { item: any, index: number }) => {
						return <ViewTabJob
							key={item.id}
							id={item.secondary_id}
							nav_id={item.id}
							org={item.customer.name}
							name={item.created_by.name}
							date={item.confirmed_date}
							status={item.status}
							data={item}
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

export default ViewAllJobConfirmationScreen;