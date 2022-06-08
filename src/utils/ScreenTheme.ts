import { extendTheme } from "native-base";

export default function () {
  return extendTheme({
    fontConfig: {
      Poppins: {
        100: {
          normal: "Poppins100Thin",
        },
        300: {
          normal: "Poppins300Light",
        },
        400: {
          normal: "Poppins400Regular",
        },
        500: {
          normal: "Poppins500Medium",
        },
        600: {
          normal: "Poppins600SemiBold",
        },
        700: {
          normal: "Poppins700Bold",
        },
      },
    },

    fonts: {
      heading: "Poppins",
      body: "Poppins",
      mono: "Poppins",
    },

    colors: {
      primary: {
        50: "#FFFCF7",
        100: "#FDD0A0",
        200: "#FAAE70",
        300: "#F58C4B",
        400: "#EF5913",
        500: "#EF5913",
        600: "#AC2709",
        700: "#8A1606",
        800: "#720903",
      },
    },

    components: {
      Button: {
        // Can simply pass default props to change default behaviour of components.
        baseStyle: {
          color: "white",
          rounded: "xl",
        },
      },
    },
  });
}