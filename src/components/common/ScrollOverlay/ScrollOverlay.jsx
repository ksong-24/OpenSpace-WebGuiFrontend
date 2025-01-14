import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { defer } from '../../../utils/helpers';

import styles from './ScrollOverlay.scss';

/**
 * Limit the vertical space an element, or a set of element, may take.
 * Adds a scroll bar and indicators for more content.
 *
 * Exposes the global CSS class `scroll-content`, so that it may be styled.
 */
class ScrollOverlay extends Component {
  static get elementId() {
    // eslint-disable-next-line no-plusplus
    return `scroll-overlay-${ScrollOverlay.elementCount++}`;
  }

  constructor(props) {
    super(props);

    this.state = {
      id: ScrollOverlay.elementId,
      atTop: true,
      atBottom: false
    };
    this.setDomNode = this.setDomNode.bind(this);
    this.updateScrollIndicators = this.updateScrollIndicators.bind(this);
  }

  // @TODO (emmbr 2021-05-06): This function is deprecated and should be replaced with
  // something else. Although, I fail to see how this call is actually needed so just
  // comment it out for now. Should be removed if it's actually not needed
  // componentWillReceiveProps() {
  //   // defer this call so that the dom actually renders and the
  //   // properties in `this.node` used in `updateScrollIndicators` are
  //   // updated with the new props.
  //   defer(this.updateScrollIndicators, this.node);
  // }

  setDomNode(node) {
    if (node) {
      this.node = node;
      this.node.addEventListener('scroll', ({ target }) => this.updateScrollIndicators(target));
      defer(this.updateScrollIndicators, this.node);
    }
  }

  get hasScrollBar() {
    if (!this.node || !this.node.scrollHeight) {
      return false;
    }

    return this.node.clientHeight < this.node.scrollHeight;
  }

  get stateClasses() {
    const { atBottom, atTop } = this.state;
    if (!this.hasScrollBar) return false;

    let classes = '';
    if (!atBottom) {
      classes += `${styles.notAtBottom} `;
    }
    if (!atTop) {
      classes += styles.notAtTop;
    }

    return classes;
  }

  /**
   * decide if the scroll indicators should be shown or not
   * @param target - the `.scroll-content` node
   */
  updateScrollIndicators(target) {
    if (!document.body.contains(target)) {
      return;
    }
    // compare using `< 1` instead of `=== 0` because floating point precision
    const bottomHeight = target.scrollTop + target.clientHeight;
    const atBottom = Math.abs(bottomHeight - target.scrollHeight) < 1;
    const atTop = target.scrollTop === 0;
    this.setState({ atTop, atBottom });
  }

  render() {
    const { className, children } = this.props;
    const { id } = this.state;
    return (
      <div
        className={`scroll-content ${className} ${styles.ScrollOverlay} ${this.stateClasses}`}
        id={id}
        ref={this.setDomNode}
      >
        { children }
      </div>
    );
  }
}

ScrollOverlay.elementCount = 0;

ScrollOverlay.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

ScrollOverlay.defaultProps = {
  className: ''
};

export default ScrollOverlay;
