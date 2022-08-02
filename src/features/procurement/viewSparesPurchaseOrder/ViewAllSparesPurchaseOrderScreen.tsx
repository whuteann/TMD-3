
import React, { useEffect, useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import { SectionList, TouchableOpacity, View } from 'react-native';
import { SearchIcon, XSimpleIcon } from '../../../../assets/svg/SVG';
import { useDispatch } from 'react-redux';
import { setRefresh } from '../../../redux/reducers/Refresh';
import { SparesPurchaseOrder } from '../../../types/SparesPurchaseOrder';
import ViewTabSparesPO from '../../../components/templates/procurement/ViewTabs/ViewTabSparesPO';

import moment from 'moment';
import Header from '../../../components/atoms/typography/Header';
import NoData from '../../../components/atoms/display/NoData';
import { getListStyle } from '../../../constants/Style';
import SearchBar from '../../../components/atoms/input/searchbar/SearchBar';
import { cloneDeep } from 'lodash';
import * as AlgoliaHelper from "../../../helpers/AlgoliaHelper";
import { APPROVED, APPROVED_DOC, DOC_SUBMITTED, DRAFT, IN_REVIEW, NO_PURCHASE_VOUCHER, PV_ISSUED, PV_PENDING, REJECTED, VERIFIED, VERIFIED_DOC } from '../../../types/Common';
import { useRefreshContext } from '../../../providers/RefreshProvider';
import { SPARES_PURCHASE_ORDERS } from '../../../constants/Firebase';
import { actionDelay } from '../../../helpers/GenericHelper';

const ViewAllSparesPurchaseOrderScreen = ({ navigation }: RootNavigationProps<"ViewPurchaseOrderSummary">) => {
	const [filterBy, setFilterBy] = useState<string>("");
	const [filterString, setFilterString] = useState('');

	const [filteredsparesPurchaseOrders, setFilteredsparesPurchaseOrders] = useState<[]>([]);

	const [cursor, setCursor] = useState<number | undefined>(undefined);
	const [isPaginating, setIsPaginating] = useState<boolean>(false);
	const [searchToggle, setSearchToggle] = useState(false);
	const [search, setSearch] = useState<string>('');

	const tailwind = useTailwind();
	const dispatch = useDispatch();
	const LIMIT = 20;

	const refreshContext = useRefreshContext();

	useEffect(() => {
		if (refreshContext?.toRefresh == SPARES_PURCHASE_ORDERS) {

			AlgoliaHelper.clearCache();
			let filters = "";

			setFilterString("item: null");

			setTimeout(() => {
				[IN_REVIEW,  DRAFT,  APPROVED,  REJECTED, VERIFIED,  DOC_SUBMITTED,  VERIFIED_DOC,  APPROVED_DOC,  NO_PURCHASE_VOUCHER,  PV_ISSUED,  PV_PENDING].map((status, index) => {
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

			[IN_REVIEW,  DRAFT,  APPROVED,  REJECTED, VERIFIED,  DOC_SUBMITTED,  VERIFIED_DOC,  APPROVED_DOC,  NO_PURCHASE_VOUCHER,  PV_ISSUED,  PV_PENDING].map((status, index) => {
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
				const result = await AlgoliaHelper.sparesPurchaseOrderIndexRef.search<SparesPurchaseOrder>(search, {
					filters: filterString,
					cacheable: true,
					hitsPerPage: LIMIT
				});

				if (result.page + 1 > result.nbPages) {
					setCursor(undefined);
				} else {
					setCursor(result.page + 1);
				}

				const sparesPurchaseOrdersGroup: any = [];

				for (const hit of result.hits) {
					const sparePurchaseOrder = {
						id: hit.objectID,
						...hit
					} as SparesPurchaseOrder;

					let added = false;

					for (let i = 0; i < sparesPurchaseOrdersGroup.length; i++) {
						let sparePurchaseOrderGroup = sparesPurchaseOrdersGroup[i];

						if (sparePurchaseOrderGroup.title == moment(sparePurchaseOrder.created_at).format('MMMM YYYY')) {
							added = true;
							sparePurchaseOrderGroup.data.push(sparePurchaseOrder);
						}
					}

					if (!added) {
						sparesPurchaseOrdersGroup.push({
							title: moment(sparePurchaseOrder.created_at).format('MMMM YYYY'),
							data: [
								sparePurchaseOrder
							]
						})
					}
				}
				setFilteredsparesPurchaseOrders(sparesPurchaseOrdersGroup);
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

		const result = await AlgoliaHelper.sparesPurchaseOrderIndexRef.search<SparesPurchaseOrder>(search, {
			filters: filterString,
			page: cursor,
			hitsPerPage: LIMIT
		});

		if (result.page + 1 > result.nbPages) {
			setCursor(undefined);
		} else {
			setCursor(result.page + 1);
		}

		let sparesPurchaseOrdersGroup: any = cloneDeep(filteredsparesPurchaseOrders);

		for (const hit of result.hits) {
			const sparePurchaseOrder = {
				id: hit.objectID,
				...hit
			} as SparesPurchaseOrder;

			let added = false;

			for (let i = 0; i < sparesPurchaseOrdersGroup.length; i++) {
				let sparePurchaseOrderGroup = sparesPurchaseOrdersGroup[i];

				if (sparePurchaseOrderGroup.title == moment(sparePurchaseOrder.created_at).format('MMMM YYYY')) {
					added = true;
					sparePurchaseOrderGroup.data.push(sparePurchaseOrder);
				}
			}

			if (!added) {
				sparesPurchaseOrdersGroup.push({
					title: moment(sparePurchaseOrder.created_at).format('MMMM YYYY'),
					data: [
						sparePurchaseOrder
					]
				})
			}
		}

		setFilteredsparesPurchaseOrders(sparesPurchaseOrdersGroup);
		setIsPaginating(false);
	};

	return (
		<Body
			header={<HeaderStack title={`View All Spares Purchase Orders`} navigateProp={navigation} navigateToDashboard={true}/>}
			style={tailwind("mt-5")}
			onRefresh={onRefresh}
			fixedScroll={false}>
			<View style={tailwind("mb-5")}>
				<FormDropdownInputField
					label="Filter by"
					value={filterBy}
					items={[IN_REVIEW,  DRAFT,  APPROVED,  REJECTED, VERIFIED,  DOC_SUBMITTED,  VERIFIED_DOC,  APPROVED_DOC,  NO_PURCHASE_VOUCHER,  PV_ISSUED]}
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
						: (<TextLabel content={`All Spares Purchase Orders`} style={tailwind("font-bold")} />)
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
					sections={filteredsparesPurchaseOrders}
					onEndReachedThreshold={0.8}
					onEndReached={onPaginate}
					keyExtractor={(item: any) => item.id}
					renderItem={({ item }: { item: any, index: number }) => {
						return <ViewTabSparesPO
						id={item.display_id}
						nav_id={item.id}
						org={item.supplier.name}
						name={item.created_by.name}
						date={item.purchase_order_date}
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

export default ViewAllSparesPurchaseOrderScreen;