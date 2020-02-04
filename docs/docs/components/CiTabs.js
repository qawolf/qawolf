import React from "react";
import Tabs from "@theme/Tabs";

const imageStyle = {
  height: "20px",
  marginRight: "8px"
};
const tabStyle = {
  alignItems: "center",
  display: "flex",
  justifyContent: "center"
};

const CI_PROVIDERS = [
  {
    label: "Azure",
    src: "https://storage.googleapis.com/docs.qawolf.com/logos/azure.png",
    value: "azure"
  },
  {
    label: "Bitbucket",
    src: "https://storage.googleapis.com/docs.qawolf.com/logos/bitbucket.png",
    value: "bitbucket"
  },
  {
    label: "CircleCI",
    src: "https://storage.googleapis.com/docs.qawolf.com/logos/circle_ci.png",
    value: "circleci"
  },
  {
    label: "GitHub",
    src: "https://storage.googleapis.com/docs.qawolf.com/logos/github.png",
    value: "github"
  },
  {
    label: "GitLab",
    src: "https://storage.googleapis.com/docs.qawolf.com/logos/gitlab.png",
    value: "gitlab"
  },
  {
    label: "Jenkins",
    src: "https://storage.googleapis.com/docs.qawolf.com/logos/jenkins.png",
    value: "jenkins"
  }
];

function CiTabs({ children }) {
  const values = CI_PROVIDERS.map(provider => {
    return {
      label: (
        <div style={tabStyle}>
          <img src={provider.src} style={imageStyle} />
          {provider.label}
        </div>
      ),
      value: provider.value
    };
  });

  return (
    <Tabs block defaultValue="azure" values={values}>
      {children}
    </Tabs>
  );
}

export default CiTabs;
