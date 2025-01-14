import React, { Component } from 'react';
import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';

import Button from '../../../common/Input/Button/Button';

import FloatingWindow from './FloatingWindow';
import PaneRightHandSide from './PaneRightHandSide';
import PopoverResizeable from './PopoverResizeable';

import styles from './WindowThreeStates.scss';

const WindowStyle = {
  DETACHED: 'DETACHED',
  PANE: 'PANE',
  ATTACHED: 'ATTACHED'
};

class WindowThreeStates extends Component {
  constructor(props) {
    super(props);
    this.state = {
      windowStyle: WindowStyle.ATTACHED,
      windowWidth: 350
    };

    this.setAsPane = this.setAsPane.bind(this);
    this.setAsDetached = this.setAsDetached.bind(this);
    this.setAsAttached = this.setAsAttached.bind(this);
    this.createTopBar = this.createTopBar.bind(this);
  }

  componentDidMount() {
    // Reset height when component is mounted
    this.props.sizeCallback(this.state.windowWidth, this.props.defaultHeight);
    switch (this.props.defaultStyle) {
      case WindowStyle.ATTACHED:
        this.setAsAttached();
        break;
      case WindowStyle.DETACHED:
        this.setAsDetached();
        break;
      case WindowStyle.PANE:
        this.setAsPane();
        break;
      default:
        this.setAsAttached();
        break;
    }
  }

  get asPopup() {
    const {
      children, height, minHeight, sizeCallback
    } = this.props;
    return (
      <PopoverResizeable
        sizeCallback={sizeCallback}
        size={{ height: `${height}px`, width: `${this.state.windowWidth}px` }}
        minHeight={minHeight}
      >
        {this.createTopBar()}
        {children}
      </PopoverResizeable>
    );
  }

  get asWindow() {
    const {
      children, height, minHeight, sizeCallback
    } = this.props;
    return (
      <FloatingWindow
        sizeCallback={sizeCallback}
        defaultSize={{ height, width: `${this.state.windowWidth}px` }}
        minHeight={minHeight}
      >
        {this.createTopBar()}
        {children}
      </FloatingWindow>
    );
  }

  get asSideview() {
    const { children, sizeCallback } = this.props;
    return (
      <PaneRightHandSide
        width={`${this.state.windowWidth}px`}
        sizeCallback={sizeCallback}
      >
        {this.createTopBar()}
        {children}
      </PaneRightHandSide>
    );
  }

  setAsDetached() {
    this.setState({ windowStyle: WindowStyle.DETACHED });
    this.props.sizeCallback(this.state.windowWidth, this.props.defaultHeight);
  }

  setAsPane() {
    this.setState({ windowStyle: WindowStyle.PANE });
  }

  setAsAttached() {
    this.setState({ windowStyle: WindowStyle.ATTACHED });
    this.props.sizeCallback(this.state.windowWidth, this.props.defaultHeight);
  }

  createTopBar() {
    const { windowStyle } = this.state;
    const { acceptedStyles } = this.props;

    const hasDetached = acceptedStyles.find((item) => item === WindowStyle.DETACHED);
    const detachedButton = hasDetached && windowStyle !== WindowStyle.DETACHED && (
      <Button onClick={this.setAsDetached} transparent small>
        <Icon icon="material-symbols:filter-none-outline" />
      </Button>
    );
    const hasPane = acceptedStyles.find((item) => item === WindowStyle.PANE);
    const paneButton = hasPane && windowStyle !== WindowStyle.PANE && (
      <Button onClick={this.setAsPane} transparent small>
        <Icon icon="material-symbols:exit-to-app" />
      </Button>
    );
    const hasAttached = acceptedStyles.find((item) => item === WindowStyle.ATTACHED);
    const attachedButton = hasAttached && windowStyle !== WindowStyle.ATTACHED && (
      <Button onClick={this.setAsAttached} transparent small>
        <Icon icon="material-symbols:open-in-browser" />
      </Button>
    );
    const closeCallbackButton = (
      <Button onClick={this.props.closeCallback} transparent small>
        <Icon icon="material-symbols:close" />
      </Button>
    );

    return (
      <header className={`header ${styles.topMenu}`}>
        <div className={styles.title}>{this.props.title}</div>
        <div>
          {detachedButton}
          {attachedButton}
          {paneButton}
          {closeCallbackButton}
        </div>
      </header>
    );
  }

  render() {
    const { windowStyle } = this.state;

    switch (windowStyle) {
      case WindowStyle.ATTACHED:
        return this.asPopup;
      case WindowStyle.DETACHED:
        return this.asWindow;
      case WindowStyle.PANE:
        return this.asSideview;
      default:
        return this.asPopup;
    }
  }
}

WindowThreeStates.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  closeCallback: PropTypes.func,
  sizeCallback: PropTypes.func,
  defaultHeight: PropTypes.number,
  defaultStyle: PropTypes.string,
  height: PropTypes.number,
  minHeight: PropTypes.number,
  acceptedStyles: PropTypes.array
};

WindowThreeStates.defaultProps = {
  title: '',
  closeCallback: null,
  sizeCallback: null,
  defaultHeight: 440,
  height: 440,
  minHeight: 100,
  defaultStyle: WindowStyle.ATTACHED,
  acceptedStyles: [WindowStyle.ATTACHED, WindowStyle.DETACHED, WindowStyle.PANE]
};

WindowThreeStates.styles = styles;

export default WindowThreeStates;
