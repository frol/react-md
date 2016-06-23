import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';
import TextField from '../TextFields';

export default class SelectFieldControl extends Component {
  constructor(props) {
    super(props);

    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  static propTypes = {
    className: PropTypes.string,
    below: PropTypes.bool,
    open: PropTypes.bool.isRequired,
    disabled: PropTypes.bool,
  };

  render() {
    const { className, below, open, ...props } = this.props;
    return (
      <TextField
        {...props}
        data-ink-target={true}
        inputClassName={classnames('md-select-field', className)}
        className={classnames('md-select-field-container', {
          'select-field-btn': below,
          'active': below && open,
          'disabled': props.disabled,
        })}
        readOnly={true}
      />
    );
  }
}
