import React, { useEffect, useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { useTailwind } from 'tailwind-rn/dist';
import { useDispatch } from 'react-redux';
import { setRefresh } from '../../../redux/reducers/Refresh';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import { SectionList, TouchableOpacity, View } from 'react-native';
import { SearchIcon, XSimpleIcon } from '../../../../assets/svg/SVG';
import { SparesPurchaseVoucher } from '../../../types/SparesPurchaseVoucher';
import ViewTabSparesPV from '../../../components/templates/procurement/ViewTabs/ViewTabSparesPV';
import { APPROVED, DRAFT, IN_REVIEW, REJECTED } from '../../../types/Common';

import moment from 'moment';
import Header from '../../../components/atoms/typography/Header';
import NoData from '../../../components/atoms/display/NoData';
import { getListStyle } from '../../../constants/Style';
import SearchBar from '../../../components/atoms/input/searchbar/SearchBar';
import { cloneDeep } from 'lodash';
import * as AlgoliaHelper from "../../../helpers/AlgoliaHelper";
import { useRefreshContext } from '../../../providers/RefreshProvider';
import { SPARES_PURCHASE_VOUCHERS } from '../../../constants/Firebase';
import { actionDelay } from '../../../helpers/GenericHelper';

const ViewAllSparesPurchaseVoucherScreen = ({ navigation }: RootNavigationProps<"ViewAllSparesPurchaseVoucher">) => {

	const [filterBy, setFilterBy] = useState<string>("");
	const [filterString, setFilterString] = useState('');

	const [filteredsparesPurchaseVouchers, setFilteredsparesPurchaseVouchers] = useState<[]>([]);

	const [cursor, setCursor] = useState<number | undefined>(undefined);
	const [isPaginating, setIsPaginating] = useState<boolean>(false);
	const [searchToggle, setSearchToggle] = useState(false);
	const [search, setSearch] = useState<string>('');

	const tailwind = useTailwind();
	const dispatch = useDispatch();
	const LIMIT = 20;

	const refreshContext = useRefreshContext();

	useEffect(() => {
		if (refreshContext?.toRefresh == SPARES_PURCHASE_VOUCHERS) {

			AlgoliaHelper.clearCache();
			let filters = "";

			setFilterString("item: null");

			setTimeout(() => {
				[DRAFT, IN_REVIEW, APPROVED, REJECTED].map((status, index) => {
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

			[APPROVED, DRAFT, IN_REVIEW, REJECTED].map((status, index) => {
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
				const result = await AlgoliaHelper.sparesPurchaseVoucherIndexRef.search<SparesPurchaseVoucher>(search, {
					filters: filterString,
					cacheable: true,
					hitsPerPage: LIMIT
				});

				if (result.page + 1 > result.nbPages) {
					setCursor(undefined);
				} else {
					setCursor(result.page + 1);
				}

				const sparesPurchaseVouchersGroup: any = [];

				for (const hit of result.hits) {
					const sparesPurchaseVoucher = {
						id: hit.objectID,
						...hit
					} as SparesPurchaseVoucher;

					let added = false;

					for (let i = 0; i < sparesPurchaseVouchersGroup.length; i++) {
						let procurementGroup = sparesPurchaseVouchersGroup[i];

						if (procurementGroup.title == moment(sparesPurchaseVoucher.created_at).format('MMMM YYYY')) {
							added = true;
							procurementGroup.data.push(sparesPurchaseVoucher);
						}
					}

					if (!added) {
						sparesPurchaseVouchersGroup.push({
							title: moment(sparesPurchaseVoucher.created_at).format('MMMM YYYY'),
							data: [
								sparesPurchaseVoucher
							]
						})
					}
				}
				setFilteredsparesPurchaseVouchers(sparesPurchaseVouchersGroup);
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

		const result = await AlgoliaHelper.sparesPurchaseVoucherIndexRef.search<SparesPurchaseVoucher>(search, {
			filters: filterString,
			page: cursor,
			hitsPerPage: LIMIT
		});

		if (result.page + 1 > result.nbPages) {
			setCursor(undefined);
		} else {
			setCursor(result.page + 1);
		}

		let sparesPurchaseVouchersGroup: any = cloneDeep(filteredsparesPurchaseVouchers);

		for (const hit of result.hits) {
			const sparesPurchaseVoucher = {
				id: hit.objectID,
				...hit
			} as SparesPurchaseVoucher;

			let added = false;

			for (let i = 0; i < sparesPurchaseVouchersGroup.length; i++) {
				let procurementGroup = sparesPurchaseVouchersGroup[i];

				if (procurementGroup.title == moment(sparesPurchaseVoucher.created_at).format('MMMM YYYY')) {
					added = true;
					procurementGroup.data.push(sparesPurchaseVoucher);
				}
			}

			if (!added) {
				sparesPurchaseVouchersGroup.push({
					title: moment(sparesPurchaseVoucher.created_at).format('MMMM YYYY'),
					data: [
						sparesPurchaseVoucher
					]
				})
			}
		}

		setFilteredsparesPurchaseVouchers(sparesPurchaseVouchersGroup);
		setIsPaginating(false);
	};

	return (
		<Body
			header={<HeaderStack title={`View All Spares Purchase Vouchers`} navigateProp={navigation} navigateToDashboard={true}/>}
			style={tailwind("mt-5")}
			onRefresh={onRefresh}
			fixedScroll={false}>
			<View style={tailwind("mb-5")}>
				<FormDropdownInputField
					label="Filter by"
					value={filterBy}
					items={[DRAFT, IN_REVIEW,  REJECTED , APPROVED]}
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
						: (<TextLabel content={`All Spares Purchase Vouchers`} style={tailwind("font-bold")} />)
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
					sections={filteredsparesPurchaseVouchers}
					onEndReachedThreshold={0.8}
					onEndReached={onPaginate}
					keyExtractor={(item: any) => item.id}
					renderItem={({ item }: { item: any, index: number }) => {
						return <ViewTabSparesPV
							data={item}
							id={item.display_id}
							nav_id={item.id}
							org={item.supplier.name}
							date={item.purchase_voucher_date}
							name={item.created_by.name}
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

export default ViewAllSparesPurchaseVoucherScreen;