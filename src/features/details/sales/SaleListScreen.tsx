import React, { useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';

import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import { SearchIcon } from '../../../../assets/svg/SVG';
import { useDispatch } from 'react-redux';
import { setRefresh } from '../../../redux/reducers/Refresh';
import { useCollection } from '@nandorojo/swr-firestore';
import MonthTabView from '../../../components/molecules/display/MonthTabView';
import TextInputField from '../../../components/atoms/input/text/TextInputField';
import ViewTabSales from '../../../components/templates/job/ViewTabs/ViewTabSales';
import { Sales } from '../../../types/Sales';
import { QUOTATIONS, SALES } from '../../../constants/Firebase';
import AddButtonText from '../../../components/atoms/buttons/AddButtonText';
import ExportModal from '../../../components/templates/job/ExportModal';
import { Quotation } from '../../../types/Quotation';

const SalesListScreen = ({ navigation }: RootNavigationProps<"Sales">) => {
	const tailwind = useTailwind();
	const [searchToggle, setSearchToggle] = useState(false);
	const [filterBy, setFilterBy] = useState("");
	const [modalOpen, setModalOpen] = useState(false);
	const LIMIT = 20;
	const dispatch = useDispatch();

	// const { data: invoices } = useCollection<Quotation>(QUOTATIONS, {
	// 	where: ["status", "==", "Archived"],
	// 	ignoreFirestoreDocumentSnapshotField: false,
	// }, {
	// 	refreshInterval: 0,
	// 	revalidateOnFocus: false,
	// 	refreshWhenHidden: false,
	// 	refreshWhenOffline: false,
	// })

	const { data, mutate } = useCollection<Sales>(SALES, {
		ignoreFirestoreDocumentSnapshotField: false,
		limit: LIMIT,
		orderBy: ["created_at", "desc"],
	}, {
		refreshInterval: 0,
		revalidateOnFocus: false,
		refreshWhenHidden: false,
		refreshWhenOffline: false,
	})

	const onRefresh = async () => {
		dispatch(setRefresh(true));
		await mutate();
		dispatch(setRefresh(false));
	}

	const renderItem = (item: any) => {
		return <ViewTabSales nav_id={item.id} org={item.customer.name} name={item.customer.contact_persons[0].name} navigation={navigation} date={item.created_date} />;
	}

	const content = () => {
		return (
			<View>
				<MonthTabView month="January"
					items={
						<FlatList
							style={{ paddingLeft: 3, paddingRight: 3, paddingBottom: 3 }}
							contentContainerStyle={{ paddingLeft: 3, paddingRight: 3, paddingBottom: 3 }}
							scrollEnabled={true}
							showsVerticalScrollIndicator={false}
							data={data}
							keyExtractor={(item: any) => item.id}
							renderItem={({ item }: { item: any, index: number }) => renderItem(item)}
						/>
					}
				/>
			</View>
		)
	}

	return (
		<Body header={<HeaderStack title={`Job Status`} navigateProp={navigation} />} style={tailwind("mt-5")} onRefresh={onRefresh} >
			<View style={tailwind("mb-5")}>
				<FormDropdownInputField
					label="Filter by"
					value={filterBy}
					items={["Procurement"]}
					onChangeValue={(val) => { setFilterBy(val) }}
					placeholder='All'
				/>
			</View>

			<AddButtonText text='Export Excel' onPress={() => { setModalOpen(true) }} />
			<View style={tailwind("mb-6")} />

			<ExportModal visible={modalOpen} onClose={() => { setModalOpen(false) }}  />

			<View style={tailwind("flex-row items-center")}>
				{searchToggle ? (
					<View style={tailwind("w-7/12")}>
						<TextInputField placeholder="Search..." value="" onChangeText={() => { }} />
					</View>
				)
					: (<TextLabel content={`All Jobs`} style={tailwind("font-bold")} />)}


				<View style={tailwind("flex-col items-end flex-grow ")}>
					<TouchableOpacity onPress={() => setSearchToggle(!searchToggle)}>
						<SearchIcon width={25} height={25} />
					</TouchableOpacity>
				</View>
			</View>

			{content()}

		</Body>
	)
}

export default SalesListScreen;