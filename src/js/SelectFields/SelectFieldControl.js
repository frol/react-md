import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';
import TextField from '../TextFields';
import injectInk from '../Inks';

class SelectFieldControl extends Component {
  constructor(props) {
    super(props);

    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  static propTypes = {
    inputStyle: PropTypes.object,
    inputClassName: PropTypes.string,
    below: PropTypes.bool,
    open: PropTypes.bool.isRequired,
    ink: PropTypes.node,
    disabled: PropTypes.bool,
  };

  render() {
    const { inputClassName, below, open, ink, ...props } = this.props;
    delete props.inkDisabled;

    const control = (
      <TextField
        {...props}
        className={classnames('md-select-field-container', {
          'select-field-btn': below,
          'active': below && open,
          'disabled': props.disabled,
        })}
        inputClassName={classnames('md-select-field', inputClassName)}
        readOnly={true}
      />
    );

    return ink ? <div>{control}{ink}</div> : control;
  }
}

export default injectInk(SelectFieldControl);
