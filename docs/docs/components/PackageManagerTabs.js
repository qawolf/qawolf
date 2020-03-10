import React from 'react';
import Tabs from '@theme/Tabs';

const imageStyle = {
  height: '24px',
};
const tabStyle = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
};

const PACKAGE_MANAGERS = [
  {
    label: 'npm',
    src: 'https://storage.googleapis.com/docs.qawolf.com/logos/npm.png',
    value: 'npm',
  },
  {
    label: 'Yarn',
    src: 'https://storage.googleapis.com/docs.qawolf.com/logos/yarn.png',
    value: 'yarn',
  },
];

function PackageManagerTabs({ children }) {
  const values = PACKAGE_MANAGERS.map(provider => {
    return {
      label: (
        <div style={tabStyle}>
          <img alt={provider.label} src={provider.src} style={imageStyle} />
        </div>
      ),
      value: provider.value,
    };
  });

  return (
    <Tabs block defaultValue="npm" values={values}>
      {children}
    </Tabs>
  );
}

export default PackageManagerTabs;
