type WolfColors = {
  backLeg?: string;
  belly?: string;
  chin: string;
  ear: string;
  earFill: string;
  eye: string;
  face: string;
  head: string;
  innerEye?: string;
  mouth: string;
  noseOpacity?: string;
  paw?: string;
  pawOutline?: string;
  strokeOpacity: string;
  tail?: string;
  tailOutline?: string;
};

export const getWolfColors = (variant: string | null): WolfColors => {
  switch (variant) {
    case "black":
      return {
        chin: "#39393A",
        ear: "#0A0A0B",
        earFill: "#FFFFFF",
        eye: "#7C4BDE",
        face: "#484848",
        head: "#161616",
        innerEye: "#161616",
        mouth: "#0A0A0B",
        noseOpacity: "0.138",
        paw: "#232323",
        pawOutline: "#3C3C3C",
        strokeOpacity: "0.4",
        tailOutline: "#3C3C3C",
      };
    case "blue":
      return {
        chin: "#285867",
        ear: "#0E3C4B",
        earFill: "#FFFFFF",
        eye: "#CBB088",
        face: "#2F687A",
        head: "#114B5F",
        mouth: "#383838",
        paw: "#1E586C",
        pawOutline: "#2B6579",
        strokeOpacity: "1",
        tailOutline: "#1E586C",
      };
    case "brown":
      return {
        chin: "#8B8080",
        ear: "#706160",
        earFill: "#FFFFFF",
        eye: "#90f0c4",
        face: "#9D9898",
        head: "#8B8080",
        mouth: "#383838",
        paw: "#988D8D",
        pawOutline: "#A59A9A",
        strokeOpacity: "1",
        tailOutline: "#988D8D",
      };
    case "gray":
      return {
        chin: "#79868F",
        ear: "#616E77",
        earFill: "#FFFFFF",
        eye: "#44E0E5",
        face: "#8F9CA5",
        head: "#79868F",
        mouth: "#254D61",
        paw: "#86939C",
        pawOutline: "#93A0A9",
        strokeOpacity: "0.6",
        tailOutline: "#86939C",
      };

    case "husky":
      return {
        chin: "#D2D2D2",
        ear: "#262626",
        earFill: "#FFFFFF",
        eye: "#44E5E7",
        face: "#DFDEDE",
        head: "#343434",
        mouth: "#383838",
        paw: "#414141",
        pawOutline: "#5A5A5A",
        strokeOpacity: "0.5",
        tailOutline: "#5A5A5A",
      };
    default:
      return {
        backLeg: "#C0C7DD",
        belly: "#D7DCE7",
        chin: "#DDE2F1",
        ear: "#7281AC",
        earFill: "#7281AC",
        eye: "#44E0E5",
        face: "#EBEEF8",
        head: "#C4CCE1",
        mouth: "#254D61",
        paw: "#E9EDF5",
        pawOutline: "#ffffff",
        strokeOpacity: "0.6",
        tail: "#ADB6CD",
        tailOutline: "#F5F6F9",
      };
  }
};
