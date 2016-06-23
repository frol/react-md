import React from 'react';

export default ComposedComponent => props => {
  console.error(
    'injectInk has been deprecated and will be removed on the next version. ' +
    'Please see the upgrade docs ' +
    'https://github.com/mlaursen/react-md/tree/master/docs/UpgradeGuide.md ' +
    'for more information.'
  );
  return React.createElement(ComposedComponent, props);
};
