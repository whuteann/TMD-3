
import React, { useEffect, useState } from 'react';
import ViewTabInvoice from '../../../components/templates/sales/ViewTabs/ViewTabInvoice';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import { useTailwind } from 'tailwind-rn/dist';
import { SectionList, TouchableOpacity, View } from 'react-native';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import { SearchIcon, XSimpleIcon } from '../../../../assets/svg/SVG';
import { useDispatch } from 'react-redux';
import { setRefresh } from '../../../redux/reducers/Refresh';
import Header from '../../../components/atoms/typography/Header';
import SearchBar from '../../../components/atoms/input/searchbar/SearchBar';
import { APPROVED, DRAFT, IN_REVIEW, REJECTED } from '../../../types/Common';
import { getListStyle } from '../../../constants/Style';
import NoData from '../../../components/atoms/display/NoData';
import { cloneDeep } from 'lodash';
import * as AlgoliaHelper from "../../../helpers/AlgoliaHelper";
import moment from 'moment';
import { Invoice } from '../../../types/Invoice';

const ViewAllInvoiceScreen = ({ navigation }: RootNavigationProps<"ViewAllInvoice">) => {

	const [filterBy, setFilterBy] = useState<string>("");
	const [filterString, setFilterString] = useState('');

	const [filteredInvoices, setFilteredInvoices] = useState<[]>([]);

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

			[DRAFT, APPROVED, REJECTED, IN_REVIEW].map((status, index) => {
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
				const result = await AlgoliaHelper.invoiceIndexRef.search<Invoice>(search, {
					filters: filterString,
					cacheable: true,
					hitsPerPage: LIMIT
				});


				if (result.page + 1 > result.nbPages) {
					setCursor(undefined);
				} else {
					setCursor(result.page + 1);
				}

				const invoicesGroup: any = [];

				for (const hit of result.hits) {
					const invoice = {
						id: hit.objectID,
						...hit
					} as Invoice;

					let added = false;

					for (let i = 0; i < invoicesGroup.length; i++) {
						let invoiceGroup = invoicesGroup[i];

						if (invoiceGroup.title == moment(invoice.created_at).format('MMMM YYYY')) {
							added = true;
							invoiceGroup.data.push(invoice);
						}
					}

					if (!added) {
						invoicesGroup.push({
							title: moment(invoice.created_at).format('MMMM YYYY'),
							data: [
								invoice
							]
						})
					}
				}
				setFilteredInvoices(invoicesGroup);
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

		const result = await AlgoliaHelper.invoiceIndexRef.search<Invoice>(search, {
			filters: filterString,
			page: cursor,
			hitsPerPage: LIMIT
		});

		if (result.page + 1 > result.nbPages) {
			setCursor(undefined);
		} else {
			setCursor(result.page + 1);
		}

		let invoicesGroup: any = cloneDeep(filteredInvoices);

		for (const hit of result.hits) {
			const invoice = {
				id: hit.objectID,
				...hit
			} as Invoice;

			let added = false;

			for (let i = 0; i < invoicesGroup.length; i++) {
				let invoiceGroup = invoicesGroup[i];

				if (invoiceGroup.title == moment(invoice.created_at).format('MMMM YYYY')) {
					added = true;
					invoiceGroup.data.push(invoice);
				}
			}

			if (!added) {
				invoicesGroup.push({
					title: moment(invoice.created_at).format('MMMM YYYY'),
					data: [
						invoice
					]
				})
			}
		}

		setFilteredInvoices(invoicesGroup);
		setIsPaginating(false);
	};

	return (
		<Body
			header={<HeaderStack title={`View All Invoices`} navigateProp={navigation} navigateToDashboard={true} />}
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
						: (<TextLabel content={`All Invoices`} style={tailwind("font-bold")} />)
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
					sections={filteredInvoices}
					onEndReachedThreshold={0.8}
					onEndReached={onPaginate}
					keyExtractor={(item: any, index: any) => `${item.id}.${index}`}
					renderItem={({ item }: { item: any, index: number }) => {
						return <ViewTabInvoice
							id={item.id}
							display_id={item.display_id}
							org={item.customer_name}
							name={item.created_by ? item.created_by.name : ""}
							date={item.invoice_date}
							status={item.status}
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

export default ViewAllInvoiceScreen;