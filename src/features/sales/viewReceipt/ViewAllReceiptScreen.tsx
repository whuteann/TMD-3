import React, { useEffect, useState } from 'react';
import ViewTabReceipt from '../../../components/templates/sales/ViewTabs/ViewTabReceipt';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import { SectionList, TouchableOpacity, View } from 'react-native';
import { SearchIcon, XSimpleIcon } from '../../../../assets/svg/SVG';
import { useTailwind } from 'tailwind-rn/dist';
import { useDispatch } from 'react-redux';
import { setRefresh } from '../../../redux/reducers/Refresh';
import moment from 'moment';
import { getListStyle } from '../../../constants/Style';
import Header from '../../../components/atoms/typography/Header';
import NoData from '../../../components/atoms/display/NoData';

import SearchBar from '../../../components/atoms/input/searchbar/SearchBar';
import { cloneDeep } from 'lodash';
import * as AlgoliaHelper from "../../../helpers/AlgoliaHelper";
import { Invoice } from '../../../types/Invoice';
import { useRefreshContext } from '../../../providers/RefreshProvider';
import { RECEIPTS } from '../../../constants/Firebase';
import { actionDelay } from '../../../helpers/GenericHelper';


const ViewAllReceiptScreen = ({ navigation }: RootNavigationProps<"ViewAllReceipt">) => {

	const [filteredReceipts, setFilteredReceipts] = useState<[]>([]);

	const [cursor, setCursor] = useState<number | undefined>(undefined);
	const [isPaginating, setIsPaginating] = useState<boolean>(false);
	const [searchToggle, setSearchToggle] = useState(false);
	const [search, setSearch] = useState<string>('');

	const tailwind = useTailwind();
	const dispatch = useDispatch();
	const LIMIT = 20;

	const refreshContext = useRefreshContext();

	useEffect(() => {
		if (refreshContext?.toRefresh == RECEIPTS) {

			AlgoliaHelper.clearCache();

			setTimeout(() => {
				getData();
			}, actionDelay);
		}
	}, [refreshContext?.refresh])

	useEffect(() => {
		getData()
	}, [search]);

	const getData = async () => {
		try {
			const result = await AlgoliaHelper.receiptIndexRef.search<Invoice>(search, {
				cacheable: true,
				hitsPerPage: LIMIT
			});

			if (result.page + 1 > result.nbPages) {
				setCursor(undefined);
			} else {
				setCursor(result.page + 1);
			}

			const ReceiptsGroup: any = [];

			for (const hit of result.hits) {
				const receipt = {
					id: hit.objectID,
					...hit
				} as Invoice;

				let added = false;

				for (let i = 0; i < ReceiptsGroup.length; i++) {
					let receiptGroup = ReceiptsGroup[i];

					if (receiptGroup.title == moment(receipt.created_at).format('MMMM YYYY')) {
						added = true;
						receiptGroup.data.push(receipt);
					}
				}

				if (!added) {
					ReceiptsGroup.push({
						title: moment(receipt.created_at).format('MMMM YYYY'),
						data: [
							receipt
						]
					})
				}
			}
			setFilteredReceipts(ReceiptsGroup);
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

		const result = await AlgoliaHelper.receiptIndexRef.search<Invoice>(search, {
			page: cursor,
			hitsPerPage: LIMIT
		});

		if (result.page + 1 > result.nbPages) {
			setCursor(undefined);
		} else {
			setCursor(result.page + 1);
		}

		let ReceiptsGroup: any = cloneDeep(filteredReceipts);

		for (const hit of result.hits) {
			const receipt = {
				id: hit.objectID,
				...hit
			} as Invoice;

			let added = false;

			for (let i = 0; i < ReceiptsGroup.length; i++) {
				let receiptGroup = ReceiptsGroup[i];

				if (receiptGroup.title == moment(receipt.created_at).format('MMMM YYYY')) {
					added = true;
					receiptGroup.data.push(receipt);
				}
			}

			if (!added) {
				ReceiptsGroup.push({
					title: moment(receipt.created_at).format('MMMM YYYY'),
					data: [
						receipt
					]
				})
			}
		}

		setFilteredReceipts(ReceiptsGroup);
		setIsPaginating(false);
	};

	return (
		<Body
			header={<HeaderStack title={`View All Receipts`} navigateProp={navigation} navigateToDashboard={true}/>}
			style={tailwind("mt-5")}
			onRefresh={onRefresh}
			fixedScroll={false}>

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
						: (<TextLabel content={`All Receipts`} style={tailwind("font-bold")} />)
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
					sections={filteredReceipts}
					onEndReachedThreshold={0.8}
					onEndReached={onPaginate}
					keyExtractor={(item: any) => item.id}
					renderItem={({ item }: { item: any, index: number }) => {
						return <ViewTabReceipt
							id={item.id}
							display_id={item.display_id || ""}
							org={item.customer.name}
							name={item.created_by.name}
							date={item.receipt_date}
							navigation={navigation}
							data={item}
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

export default ViewAllReceiptScreen;