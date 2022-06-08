import React, { useEffect, useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { useTailwind } from 'tailwind-rn/dist';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import { SectionList, TouchableOpacity, View } from 'react-native';
import { SearchIcon, XSimpleIcon } from '../../../../assets/svg/SVG';
import { useDispatch } from 'react-redux';
import { setRefresh } from '../../../redux/reducers/Refresh';
import { APPROVED, DRAFT, IN_REVIEW, NO_PURCHASE_VOUCHER, PV_ISSUED, PV_PENDING, REJECTED, UserRole } from '../../../types/Common';


import moment from 'moment';
import Header from '../../../components/atoms/typography/Header';
import NoData from '../../../components/atoms/display/NoData';
import { getListStyle } from '../../../constants/Style';
import SearchBar from '../../../components/atoms/input/searchbar/SearchBar';
import { cloneDeep } from 'lodash';
import * as AlgoliaHelper from "../../../helpers/AlgoliaHelper";
import { PurchaseOrder } from '../../../types/PurchaseOrder';
import ViewTabPO from '../../../components/templates/procurement/ViewTabs/ViewTabPO';

const ViewAllPurchaseOrderScreen = ({ navigation }: RootNavigationProps<"ViewPurchaseOrderSummary">) => {
	const [filterBy, setFilterBy] = useState<string>("");
	const [filterString, setFilterString] = useState('');

	const [filteredPurchaseOrders, setFilteredPurchaseOrders] = useState<[]>([]);

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

			[NO_PURCHASE_VOUCHER, PV_ISSUED, PV_PENDING, APPROVED, IN_REVIEW, REJECTED, DRAFT].map((status, index) => {
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
				const result = await AlgoliaHelper.purchaseOrderIndexRef.search<PurchaseOrder>(search, {
					filters: filterString,
					cacheable: true,
					hitsPerPage: LIMIT
				});

				if (result.page + 1 > result.nbPages) {
					setCursor(undefined);
				} else {
					setCursor(result.page + 1);
				}

				const PurchaseOrdersGroup: any = [];

				for (const hit of result.hits) {
					const purchaseOrder = {
						id: hit.objectID,
						...hit
					} as PurchaseOrder;

					let added = false;

					for (let i = 0; i < PurchaseOrdersGroup.length; i++) {
						let purchaseOrderGroup = PurchaseOrdersGroup[i];

						if (purchaseOrderGroup.title == moment(purchaseOrder.created_at).format('MMMM YYYY')) {
							added = true;
							purchaseOrderGroup.data.push(purchaseOrder);
						}
					}

					if (!added) {
						PurchaseOrdersGroup.push({
							title: moment(purchaseOrder.created_at).format('MMMM YYYY'),
							data: [
								purchaseOrder
							]
						})
					}
				}
				setFilteredPurchaseOrders(PurchaseOrdersGroup);
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

		const result = await AlgoliaHelper.purchaseOrderIndexRef.search<PurchaseOrder>(search, {
			filters: filterString,
			page: cursor,
			hitsPerPage: LIMIT
		});

		if (result.page + 1 > result.nbPages) {
			setCursor(undefined);
		} else {
			setCursor(result.page + 1);
		}

		let PurchaseOrdersGroup: any = cloneDeep(filteredPurchaseOrders);

		for (const hit of result.hits) {
			const purchaseOrder = {
				id: hit.objectID,
				...hit
			} as PurchaseOrder;

			let added = false;

			for (let i = 0; i < PurchaseOrdersGroup.length; i++) {
				let purchaseOrderGroup = PurchaseOrdersGroup[i];

				if (purchaseOrderGroup.title == moment(purchaseOrder.created_at).format('MMMM YYYY')) {
					added = true;
					purchaseOrderGroup.data.push(purchaseOrder);
				}
			}

			if (!added) {
				PurchaseOrdersGroup.push({
					title: moment(purchaseOrder.created_at).format('MMMM YYYY'),
					data: [
						purchaseOrder
					]
				})
			}
		}

		setFilteredPurchaseOrders(PurchaseOrdersGroup);
		setIsPaginating(false);
	};

	return (
		<Body
			header={<HeaderStack title={`View All Purchase Orders`} navigateProp={navigation} navigateToDashboard={true}/>}
			style={tailwind("mt-5")}
			onRefresh={onRefresh}
			fixedScroll={false}>
			<View style={tailwind("mb-5")}>
				<FormDropdownInputField
					label="Filter by"
					value={filterBy}
					items={[NO_PURCHASE_VOUCHER, PV_ISSUED, PV_PENDING, APPROVED, IN_REVIEW, REJECTED, DRAFT]}
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
						: (<TextLabel content={`All Purchase Orders`} style={tailwind("font-bold")} />)
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
					sections={filteredPurchaseOrders}
					onEndReachedThreshold={0.8}
					onEndReached={onPaginate}
					keyExtractor={(item: any) => item.id}
					renderItem={({ item }: { item: any, index: number }) => {
						return <ViewTabPO
						data={item}
						id={item.display_id}
						nav_id={item.id}
						org={item.supplier.name}
						name={item.created_by.name}
						date={item.purchase_order_date}
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

export default ViewAllPurchaseOrderScreen;