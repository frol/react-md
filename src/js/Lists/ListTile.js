import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

export default class ListTile extends Component {
  constructor(props) {
    super(props);

    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  static propTypes = {
    component: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]).isRequired,
    className: PropTypes.string,
    children: PropTypes.node,
    role: PropTypes.string,
    tabIndex: PropTypes.number,
  };

  static defaultProps = {
    tabIndex: 0,
    role: 'button',
  };

  render() {
    const { component, className, children, ...props } = this.props;
    return React.createElement(component, {
      ...props,
      ['data-ink-target']: true,
      className: classnames('md-list-tile', className),
    }, children);
  }
}
