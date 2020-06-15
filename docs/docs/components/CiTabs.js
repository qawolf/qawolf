import React from 'react';
import Tabs from '@theme/Tabs';

const imageStyle = {
  height: '20px',
  marginRight: '8px',
};
const tabStyle = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
};

const CI_PROVIDERS = [
  {
    label: 'GitHub',
    src: 'https://storage.googleapis.com/docs.qawolf.com/logos/github.png',
    value: 'github',
  },
];

function CiTabs({ children }) {
  const values = CI_PROVIDERS.map((provider) => {
    return {
      label: (
        <div style={tabStyle}>
          <img alt={provider.label} src={provider.src} style={imageStyle} />
          {provider.label}
        </div>
      ),
      value: provider.value,
    };
  });

  return (
    <Tabs block defaultValue="github" values={values}>
      {children}
    </Tabs>
  );
}

export default CiTabs;
