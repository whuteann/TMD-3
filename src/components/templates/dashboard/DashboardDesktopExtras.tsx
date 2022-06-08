import React from 'react';
import { View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../atoms/typography/TextLabel';
import DashboardPiechartsSection from './DashboardPiechartsSection';


const DashboardDesktopExtra = () => {

  const currentDate = `${new Date().getDate().toString()}/${+new Date().getMonth().toString() + 1}/${new Date().getFullYear().toString()}`
  const tailwind = useTailwind();

  return (

    <View style={tailwind("w-full")} >
      {/* <View>
        <SearchBar placeholder='Search'/>
      </View>

      <View style={tailwind("mb-5 pt-3")}>
        <View style={tailwind("flex-row items-end")}>
          <TextLabel content="Task List" style={tailwind("text-18px font-bold")} />

          <TouchableOpacity>
            <View style={tailwind("flex-row items-center ml-[190px]")}>
              <TextLabel content="View All Tasks" color='text-primary'/>
              <View style={tailwind("ml-2")} >
                <ArrowNextOrangeIcon height={10} width={10} />
              </View>
            </View>
          </TouchableOpacity>

        </View>

        <TextLabel content={`${currentDate}`} />

        <View style={tailwind("mt-3")}>
          <TaskListTab label="Complete RFQ-1013 Quotation" />
          <TaskListTab label="Call ABC Supplier" />
          <TaskListTab label="Call ABC Supplier" />
        </View>

      </View> */}

      <View style={tailwind("mb-3")} >
        <TextLabel content="Overall Activities" style={tailwind("text-18px font-bold")} />
        <TextLabel content={`${currentDate}`} />
      </View>

      <DashboardPiechartsSection />
    </View>

  )
}

export default DashboardDesktopExtra;