import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';

/**
 * The `TableBody` component is used for managing the state of all
 * `TableRow` inside of it.
 */
export default class TableBody extends Component {
  constructor(props, context) {
    super(props, context);
  }

  static propTypes = {
    /**
     * An optional style to apply to the tbody.
     */
    style: PropTypes.object,

    /**
     * An optional className to apply to the tbody.
     */
    className: PropTypes.string,

    /**
     * A list or a single item of `TableRow` components to render.
     */
    children: PropTypes.node.isRequired,
  };

  static contextTypes = {
    allSelected: PropTypes.bool.isRequired,
    selectedRows: PropTypes.arrayOf(PropTypes.bool).isRequired,
    toggleSelectedRow: PropTypes.func.isRequired,
  };

  render() {
    const { children, className, ...props } = this.props;
    const { selectedRows, toggleSelectedRow } = this.context;

    const rows = React.Children.map(children, (row, i) => {
      const uncontrolled = typeof row.props.selected === 'undefined';

      // Update the row to inject the selected prop from context if it is uncontrolled.
      // Also update the onCheckbox click function to additionally toggle the row if uncontrolled.
      return React.cloneElement(row, {
        ...row.props,
        key: row.key || i,
        selected: uncontrolled ? selectedRows[i] : row.props.selected,
        onCheckboxClick: e => {
          row.props.onCheckboxClick && row.props.onCheckboxClick(i, e);

          if(uncontrolled) {
            toggleSelectedRow(i);
          }
        },
      });
    });

    return (
      <tbody {...props} className={classnames('md-table-body', className)}>
        {rows}
      </tbody>
    );
  }
}
