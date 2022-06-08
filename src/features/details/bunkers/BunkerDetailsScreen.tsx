import React from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import InfoDisplay from '../../../components/atoms/display/InfoDisplay';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import { useTailwind } from 'tailwind-rn/dist';
import { useDocument } from '@nandorojo/swr-firestore';
import { Bunker } from '../../../types/Bunker';
import { BUNKERS } from '../../../constants/Firebase';
import { View } from 'react-native';

const BunkerDetailsScreen = ({ navigation, route }: RootNavigationProps<"BunkerDetail">) => {
  const docID: any = route.params?.docID;
  const tailwind = useTailwind();

  const { data: bunker } = useDocument<Bunker>(`${BUNKERS}/${docID}`);

  return (
    <Body header={<HeaderStack title={"Bunker Barge Details"} navigateProp={navigation} />} style={tailwind("mt-6")}>
      <InfoDisplay placeholder="Bunker Barge's Name" info={bunker?.name} />
      <InfoDisplay placeholder="Official No," info={bunker?.official_number} />
      <InfoDisplay placeholder="IMO No." info={bunker?.imo_number} />
      <InfoDisplay placeholder="Flag" info={bunker?.flag} />
      <InfoDisplay placeholder="Call Sign" info={bunker?.call_sign} />
      <InfoDisplay placeholder="Net Tonnage" info={bunker?.net_tonnage} />
      <InfoDisplay placeholder="Gross Tonnage" info={bunker?.gross_tonnage} />
      <InfoDisplay placeholder="SDWT" info={bunker?.sdwt} />
      <InfoDisplay placeholder="LOA" info={bunker?.loa} />
      <InfoDisplay placeholder="Depth" info={bunker?.depth} />
      <InfoDisplay placeholder="Capacity" info={bunker?.capacity} />

      <View style={tailwind("mt-12")}>
        <RegularButton text="Edit" operation={() => { navigation.navigate("EditBunker", { docID: docID }) }} />
      </View>
    </Body>
  )
}

export default BunkerDetailsScreen;