import PropTypes from 'prop-types';
import React from 'react';
import styles from './SmallLabel.scss';
import {useTutorial} from './../../GettingStartedTour/GettingStartedContext'

const SmallLabel = (props) => {
  const { children, refKey } = props;
  const refs = useTutorial();

  return (
    <span ref={ el => refKey ? refs.current[refKey] = el : null} {...props} className={styles.SmallLabel}>
      { children }
    </span>
  );
};

SmallLabel.propTypes = {
  children: PropTypes.node,
};

SmallLabel.defaultProps = {
  children: [],
};

export default SmallLabel;
