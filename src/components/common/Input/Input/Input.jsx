import React, { Component } from 'react';
import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';

import { excludeKeys } from '../../../../utils/helpers';

import styles from './Input.scss';

class Input extends Component {
  static get nextId() {
    return Input.idCounter++;
  }

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      id: `input-${Input.nextId}`
    };

    this.onChange = this.onChange.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.setInputRef = this.setInputRef.bind(this);
    this.clear = this.clear.bind(this);
  }

  componentDidUpdate(prevProps) {
    // Update state value variable when we get new props
    if (prevProps.value !== this.props.value) {
      this.setState({ value: this.props.value });
    }
  }

  /**
   * callback for input
   * @param event InputEvent
   */
  onChange(event) {
    const { value } = event.target;

    // update state so that input is re-rendered with new content
    this.setState({ value });

    // send to the onChange (if any)!
    this.props.onChange(event);
  }

  onKeyUp(event) {
    if (event.key === 'Enter') {
      this.props.onEnter(event);
    }
  }

  get hasInput() {
    return this.state.value !== '';
  }

  /**
   * filter out props that shouldn't be inherited by the input element
   * @returns {*}
   */
  get inheritProps() {
    const doNotInclude = 'children onEnter wide onChange loading value clearable';
    return excludeKeys(this.props, doNotInclude);
  }

  /**
   * callback to keep save a reference of the input field
   * @param node
   */
  setInputRef(node) {
    this.inputNode = node;
  }

  /**
   * clear the input field
   */
  clear() {
    this.setState({ value: '' });

    // trigger onchange event on input
    this.inputNode.value = '';
    const event = new CustomEvent('clear');
    this.inputNode.dispatchEvent(event);
    this.onChange(event);
    this.inputNode.focus();
  }

  render() {
    const {
      placeholder, className, wide, loading, clearable, label, children
    } = this.props;
    const { value, id } = this.state;
    return (
      <div className={`${styles.group} ${wide ? styles.wide : ''}`}>
        <input
          {...this.inheritProps}
          className={`${className} ${styles.input}
                      ${this.hasInput ? styles.hasinput : ''}
                      ${loading ? styles.loading : ''}
                      ${wide ? styles.wide : ''}`}
          id={id}
          onChange={this.onChange}
          onKeyUp={this.onKeyUp}
          value={value}
          ref={this.setInputRef}
        />
        <label htmlFor={id} className={`${styles.label} ${this.hasInput && styles.hasinput}`}>
          { label || placeholder }
        </label>
        <div className={styles.buttonsContainer}>
          { children }
          { clearable && (
            <Icon
              icon="material-symbols:cancel"
              className={`${styles.clearbutton} ${this.hasInput && styles.hasinput}`}
              onClick={this.clear}
              tabIndex="0"
              role="button"
              title="Clear input field"
            />
          )}
        </div>
      </div>
    );
  }
}

Input.idCounter = Input.idCounter || 1;

Input.propTypes = {
  onChange: PropTypes.func,
  onEnter: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
  clearable: PropTypes.bool,
  label: PropTypes.node,
  loading: PropTypes.bool,
  placeholder: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  wide: PropTypes.bool
};

Input.defaultProps = {
  onChange: () => {},
  onEnter: () => {},
  children: [],
  className: '',
  clearable: false,
  label: null,
  loading: false,
  value: '',
  wide: true
};

export default Input;
