import { Box } from "grommet";

export default function SpaceFooter(): JSX.Element {
  return (
    <Box
      height="full"
      style={{ left: 0, position: "absolute", top: 0, zIndex: 0 }}
      width="full"
    >
      <svg
        viewBox="0 0 1680 444"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        height="100%"
        width="100%"
      >
        <g clipPath="url(#clip0)">
          <rect width="1680" height="444" fill="url(#paint0_linear)" />
          <path
            d="M1071 -387H1680V-291.121C1650.68 -300.833 1617.36 -306.17 1579.6 -306.17C1455.66 -306.17 1397.03 -226.566 1342.63 -152.715C1295.57 -88.8186 1251.68 -29.2291 1171.41 -29.2291C1030.99 -29.2291 1052.34 -210.673 1065.39 -321.592L1065.39 -321.599C1068.42 -347.382 1071.01 -369.354 1071.01 -384.35C1071.01 -385.232 1071.01 -386.115 1071 -387Z"
            fill="url(#paint1_linear)"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M936.264 -387L936.264 -384.35C936.264 372.525 1372.53 372.351 1573.55 372.271C1575.59 372.27 1577.61 372.269 1579.6 372.269C1612.81 372.269 1647.08 366.649 1680 355.334V831H0V130.107C37.4036 74.7038 86.2817 36.1364 148.813 36.1364C242.232 36.1364 302.469 149.063 368.854 273.515C450.33 426.259 541.067 596.364 713.776 596.364C908.682 596.364 991.648 427.636 991.648 283.955C991.648 -44.2727 719.044 -292.091 535.991 -292.091C438.698 -292.091 394.604 -272.727 353.289 -254.584C316.87 -238.591 282.611 -223.545 215.977 -223.545C102.194 -223.545 57.0671 -332.515 48.7266 -387H936.264ZM927.033 642.091C977.143 543.227 1012.75 505 1056.26 505C1099.78 505 1153.85 530.045 1153.85 621C1153.85 711.955 1076.04 830.591 960 830.591C843.956 830.591 738.462 745.747 838.681 710.396C876.407 697.118 910.019 675.659 927.033 642.091Z"
            fill="url(#paint2_linear)"
          />
        </g>
        <defs>
          <linearGradient
            id="paint0_linear"
            x1="0"
            y1="0"
            x2="1127"
            y2="1042.07"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#17174D" />
            <stop offset="1" stopColor="#251C75" />
          </linearGradient>
          <linearGradient
            id="paint1_linear"
            x1="5.00679e-05"
            y1="-387"
            x2="1680"
            y2="831"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1D1F59" />
            <stop offset="1" stopColor="#282282" />
          </linearGradient>
          <linearGradient
            id="paint2_linear"
            x1="5.00679e-05"
            y1="-387"
            x2="1680"
            y2="831"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1D1F59" />
            <stop offset="1" stopColor="#282282" />
          </linearGradient>
          <clipPath id="clip0">
            <rect width="1680" height="444" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </Box>
  );
}
