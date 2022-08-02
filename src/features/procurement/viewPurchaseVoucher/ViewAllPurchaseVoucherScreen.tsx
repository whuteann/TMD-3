import React, { useEffect, useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import ViewTabPV from '../../../components/templates/procurement/ViewTabs/ViewTabPV';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { useTailwind } from 'tailwind-rn/dist';
import { useDispatch } from 'react-redux';
import { setRefresh } from '../../../redux/reducers/Refresh';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import {  SectionList, TouchableOpacity, View } from 'react-native';
import { SearchIcon, XSimpleIcon } from '../../../../assets/svg/SVG';
import { PurchaseVoucher } from '../../../types/PurchaseVoucher';
import { APPROVED, ARCHIVED, CONFIRMED, DRAFT, IN_REVIEW, REJECTED } from '../../../types/Common';

import moment from 'moment';
import Header from '../../../components/atoms/typography/Header';
import NoData from '../../../components/atoms/display/NoData';
import { getListStyle } from '../../../constants/Style';
import SearchBar from '../../../components/atoms/input/searchbar/SearchBar';
import { cloneDeep } from 'lodash';
import * as AlgoliaHelper from "../../../helpers/AlgoliaHelper";
import { useRefreshContext } from '../../../providers/RefreshProvider';
import { PURCHASE_VOUCHERS } from '../../../constants/Firebase';
import { actionDelay } from '../../../helpers/GenericHelper';

const ViewAllPurchaseVoucherScreen = ({ navigation }: RootNavigationProps<"ViewAllPurchaseVoucher">) => {

	const [filterBy, setFilterBy] = useState<string>("");
	const [filterString, setFilterString] = useState('');

	const [filteredPurchaseVouchers, setFilteredPurchaseVouchers] = useState<[]>([]);

	const [cursor, setCursor] = useState<number | undefined>(undefined);
	const [isPaginating, setIsPaginating] = useState<boolean>(false);
	const [searchToggle, setSearchToggle] = useState(false);
	const [search, setSearch] = useState<string>('');

	const tailwind = useTailwind();
	const dispatch = useDispatch();
	const LIMIT = 20;

	const refreshContext = useRefreshContext();

	useEffect(() => {
		if (refreshContext?.toRefresh == PURCHASE_VOUCHERS) {

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

			[DRAFT, IN_REVIEW, APPROVED, REJECTED].map((status, index) => {
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
				const result = await AlgoliaHelper.purchaseVoucherIndexRef.search<PurchaseVoucher>(search, {
					filters: filterString,
					cacheable: true,
					hitsPerPage: LIMIT
				});


				if (result.page + 1 > result.nbPages) {
					setCursor(undefined);
				} else {
					setCursor(result.page + 1);
				}

				const PurchaseVouchersGroup: any = [];

				for (const hit of result.hits) {
					const purchaseVoucher = {
						id: hit.objectID,
						...hit
					} as PurchaseVoucher;

					let added = false;

					for (let i = 0; i < PurchaseVouchersGroup.length; i++) {
						let purchaseVoucherGroup = PurchaseVouchersGroup[i];

						if (purchaseVoucherGroup.title == moment(purchaseVoucher.created_at).format('MMMM YYYY')) {
							added = true;
							purchaseVoucherGroup.data.push(purchaseVoucher);
						}
					}

					if (!added) {
						PurchaseVouchersGroup.push({
							title: moment(purchaseVoucher.created_at).format('MMMM YYYY'),
							data: [
								purchaseVoucher
							]
						})
					}
				}
				setFilteredPurchaseVouchers(PurchaseVouchersGroup);
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

		const result = await AlgoliaHelper.purchaseVoucherIndexRef.search<PurchaseVoucher>(search, {
			filters: filterString,
			page: cursor,
			hitsPerPage: LIMIT
		});

		if (result.page + 1 > result.nbPages) {
			setCursor(undefined);
		} else {
			setCursor(result.page + 1);
		}

		let PurchaseVouchersGroup: any = cloneDeep(filteredPurchaseVouchers);

		for (const hit of result.hits) {
			const purchaseVoucher = {
				id: hit.objectID,
				...hit
			} as PurchaseVoucher;

			let added = false;

			for (let i = 0; i < PurchaseVouchersGroup.length; i++) {
				let purchaseVoucherGroup = PurchaseVouchersGroup[i];

				if (purchaseVoucherGroup.title == moment(purchaseVoucher.created_at).format('MMMM YYYY')) {
					added = true;
					purchaseVoucherGroup.data.push(purchaseVoucher);
				}
			}

			if (!added) {
				PurchaseVouchersGroup.push({
					title: moment(purchaseVoucher.created_at).format('MMMM YYYY'),
					data: [
						purchaseVoucher
					]
				})
			}
		}

		setFilteredPurchaseVouchers(PurchaseVouchersGroup);
		setIsPaginating(false);
	};

	return (
		<Body
			header={<HeaderStack title={`View All Purchase Vouchers`} navigateProp={navigation} navigateToDashboard={true} />}
			style={tailwind("mt-5")}
			onRefresh={onRefresh}
			fixedScroll={false}>
			<View style={tailwind("mb-5")}>
				<FormDropdownInputField
					label="Filter by"
					value={filterBy}
					items={[DRAFT, IN_REVIEW, APPROVED, REJECTED]}
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
						: (<TextLabel content={`All Purchase Vouchers`} style={tailwind("font-bold")} />)
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
					sections={filteredPurchaseVouchers}
					onEndReachedThreshold={0.8}
					onEndReached={onPaginate}
					keyExtractor={(item: any) => item.id}
					renderItem={({ item }: { item: any, index: number }) => {
						return <ViewTabPV
							data={item}
							id={item.display_id}
							nav_id={item.id}
							org={item.supplier.name}
							date={item.purchase_voucher_date}
							name={item.created_by ? item.created_by.name : ""}
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

export default ViewAllPurchaseVoucherScreen;