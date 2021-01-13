import { Box } from "grommet";

export default function Space(): JSX.Element {
  return (
    <Box
      height="full"
      style={{ left: 0, position: "absolute", top: 0, zIndex: -1 }}
      width="full"
    >
      <svg
        viewBox="0 0 1680 983"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        height="100%"
        width="100%"
      >
        <rect width="1680" height="983" fill="url(#paint0_linear)" />
        <mask
          id="mask0"
          mask-type="alpha"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="1680"
          height="983"
        >
          <rect width="1680" height="983" fill="url(#paint1_linear)" />
        </mask>
        <g mask="url(#mask0)">
          <g opacity="0.75">
            <path
              d="M608.995 -118H0V-22.1214C29.321 -31.8326 62.6393 -37.1702 100.398 -37.1702C224.341 -37.1702 282.973 42.4341 337.368 116.285C384.43 180.181 428.32 239.771 508.594 239.771C649.005 239.771 627.659 58.3265 614.611 -52.5918L614.61 -52.5991C611.577 -78.3824 608.992 -100.354 608.992 -115.35C608.992 -116.232 608.993 -117.115 608.995 -118Z"
              fill="url(#paint2_linear)"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M743.736 -118L743.736 -115.35C743.736 641.525 307.467 641.351 106.455 641.271C104.411 641.27 102.392 641.269 100.398 641.269C67.1882 641.269 32.9186 635.649 0 624.334V1100H1680V399.107C1642.6 343.704 1593.72 305.136 1531.19 305.136C1437.77 305.136 1377.53 418.063 1311.15 542.515C1229.67 695.259 1138.93 865.364 966.224 865.364C771.318 865.364 688.352 696.636 688.352 552.955C688.352 224.727 960.956 -23.0909 1144.01 -23.0909C1241.3 -23.0909 1285.4 -3.72727 1326.71 14.4164C1363.13 30.4094 1397.39 45.4546 1464.02 45.4546C1577.81 45.4546 1622.93 -63.5152 1631.27 -118H743.736ZM752.967 911.091C702.857 812.227 667.253 774 623.736 774C580.22 774 526.154 799.045 526.154 890C526.154 980.955 603.956 1099.59 720 1099.59C836.044 1099.59 941.538 1014.75 841.319 979.396C803.593 966.118 769.981 944.659 752.967 911.091Z"
              fill="url(#paint3_linear)"
            />
          </g>
        </g>
        <defs>
          <linearGradient
            id="paint0_linear"
            x1="0"
            y1="0"
            x2="1667.6"
            y2="503.673"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#17174D" />
            <stop offset="1" stopColor="#251C75" />
          </linearGradient>
          <linearGradient
            id="paint1_linear"
            x1="0"
            y1="0"
            x2="1667.6"
            y2="503.673"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#17174D" />
            <stop offset="1" stopColor="#251C75" />
          </linearGradient>
          <linearGradient
            id="paint2_linear"
            x1="0"
            y1="-118"
            x2="1680"
            y2="373"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1D1F59" />
            <stop offset="1" stopColor="#282282" />
          </linearGradient>
          <linearGradient
            id="paint3_linear"
            x1="0"
            y1="-118"
            x2="1680"
            y2="373"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1D1F59" />
            <stop offset="1" stopColor="#282282" />
          </linearGradient>
        </defs>
      </svg>
    </Box>
  );
}
