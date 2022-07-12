import { Platform, TouchableOpacity, View } from "react-native";
import { useTailwind } from "tailwind-rn/dist";
import TextLabel from "../../../atoms/typography/TextLabel";

interface inputProps {
  item: any,
  navigation: any
}

const ViewTabSalesConfirmation: React.FC<inputProps> = ({
  item, navigation
}) => {
	const tailwind = useTailwind();
	return (
		<TouchableOpacity onPress={() => { navigation.navigate("SalesConfirmationSummary", { docID: item.id }); }}>
			<View style={[tailwind("box-card-shadow rounded-lg p-2 bg-white mt-2 mb-5")]}>

				<View style={tailwind("flex-row pr-3")}>
					<View style={tailwind("flex w-[90%]")}>
						<TextLabel content={`${item.confirmed_date}`} style={tailwind("italic text-12px text-gray-400")} />
						<View style={tailwind("flex-row items-center")}>
							<View style={tailwind("flex-wrap w-full")}>
								<TextLabel content={item.secondary_id || ""} style={tailwind("text-xl font-bold text-18px")} />
							</View>
						</View>
					</View>
				</View>

				<View >
					<View style={tailwind("flex-row flex")}>
						<TextLabel content={`•`} style={tailwind("italic text-12px text-gray-400 w-auto mr-1")} />
						<TextLabel content={`${item.customer.name}`} style={Platform.OS != "web" ? tailwind("italic text-12px text-gray-400 w-1/3 flex-wrap mr-1") : tailwind("italic text-12px text-gray-400 w-1/3 flex-wrap mr-2")} />

						<TextLabel content={`•`} style={tailwind("italic text-12px text-gray-400 w-auto mr-1")} />
						<TextLabel content={`${item.created_by.name}`} style={Platform.OS != "web" ? tailwind("italic text-12px text-gray-400 w-1/6 flex-wrap mr-1") : tailwind("italic text-12px text-gray-400 w-2/6 flex-wrap")} />

						<TextLabel content={`•`} style={tailwind("italic text-12px text-gray-400 w-auto mr-1")} />
						<TextLabel content={`${item.status || "Confirmed"}`} style={tailwind("italic text-12px text-gray-400 w-4/12 flex-wrap")} />
					</View>
				</View>
			</View>
		</TouchableOpacity>
	)
}

export default ViewTabSalesConfirmation;