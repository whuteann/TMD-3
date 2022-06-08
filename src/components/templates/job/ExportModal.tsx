import moment from "moment";
import React, { useEffect, useState } from "react";
import { Modal, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { useTailwind } from "tailwind-rn";
import { XSimpleIcon } from "../../../../assets/svg/SVG";
import { UserSelector } from "../../../redux/reducers/Auth";
import { generateSalesSummaryExcel } from "../../../services/ExcelServices";
import RegularButton from "../../atoms/buttons/RegularButton";
import DropdownField from "../../atoms/input/dropdown/DropdownField";
import TextLabel from "../../atoms/typography/TextLabel";
import FormDouble from "../../molecules/alignment/FormDouble";

interface ExportModalProps {
  visible: boolean,
  onClose: () => void,
  // invoices: Array<Quotation>
}

const ExportModal = (props: ExportModalProps) => {
  const {
    visible,
    onClose,
    // invoices
  } = props;
  const tailwind = useTailwind();
  const [month, setMonth] = useState<"January" | "February" | "March" | "April" | "May" | "June" | "July" | "August" | "September" | "October" | "November" | "December" | "">("");
  const [year, setYear] = useState("");
  const [yearList, setYearList] = useState<Array<string>>([]);
  const [error, setError] = useState(false);
  const user = useSelector(UserSelector);

  useEffect(() => {
    let years: Array<string> = [];
    for (let start = 2022; start <= Number(moment().format("YYYY")); start++) {
      years.push(start.toString());
    }
    setYearList(years);
  }, [])

  const closeModal = () => {
    onClose();
    setError(false);
    setMonth("");
    setYear("");
  }

  const onExport = () => {
    if (year && month) {
      let monthNum: number = 0;
      switch (month) {
        case "January":
          monthNum = 0;
          break;
        case "February":
          monthNum = 1;
          break;
        case "March":
          monthNum = 2;
          break;
        case "April":
          monthNum = 3;
          break;
        case "May":
          monthNum = 4;
          break;
        case "June":
          monthNum = 5;
          break;
        case "July":
          monthNum = 6;
          break;
        case "August":
          monthNum = 7;
          break;
        case "September":
          monthNum = 8;
          break;
        case "October":
          monthNum = 9;
          break;
        case "November":
          monthNum = 10;
          break;
        case "December":
          monthNum = 11;
          break;
      }

      generateSalesSummaryExcel(
        monthNum,
        Number(year),
        user?.email!, () => {

        }, () => {

        });
      // buildExcel(invoices);

      closeModal();
    } else {
      setError(true);
    }
  }

  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => {
          onClose();
        }}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, tailwind(`${Platform.OS == "web" ? "w-[25%]" : "w-[80%]"}  p-5 bg-gray-secondary`)]}>

            <View style={tailwind("w-[90%]")}>
              <View style={tailwind("w-full items-end mb-5")}>
                <TouchableOpacity onPress={() => { closeModal(); }}>
                  <XSimpleIcon height={20} width={20} />
                </TouchableOpacity>
              </View>
              <View style={tailwind('my-2')}>
                <FormDouble
                  left={
                    <DropdownField
                      items={["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]}
                      placeholder={"Select Month"}
                      value={month}
                      onChangeValue={(val) => { setMonth(val) }}
                    />
                  }
                  right={
                    <DropdownField
                      items={yearList}
                      placeholder={"Select Year"}
                      value={year}
                      onChangeValue={(val) => { setYear(val) }}
                    />
                  }
                />
                {
                  error
                    ?
                    <TextLabel content={"Please select a month and a year"} color='text-red-500' />
                    :
                    <></>
                }
              </View>
              <RegularButton text={"Export"} operation={() => { onExport() }} />
            </View>

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    // backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});

export default ExportModal;