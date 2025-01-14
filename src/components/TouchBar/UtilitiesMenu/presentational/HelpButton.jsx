import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

import { instructionImage } from '../../../../api/resources';
import SmallLabel from '../../../common/SmallLabel/SmallLabel';

import styles from '../style/UtilitiesButtons.scss';

function HelpButton() {
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (showInstructions) {
      const timeout = setTimeout(() => {
        setShowInstructions(false);
      }, 9500); // match with animation-delay in UtilitiesButtons.scss
      return () => { clearTimeout(timeout); };
    }
    return () => {};
  }, [showInstructions]);

  return (
    <div
      className={`${styles.UtilitiesButton}
      ${showInstructions && styles.active}`}
      onClick={() => setShowInstructions(!showInstructions)}
      role="button"
      tabIndex="0"
    >
      <Icon icon="material-symbols:help-outline" className={styles.Icon} />
      { showInstructions && <img src={instructionImage} className={styles.Instructions} alt="instructions" />}
      <SmallLabel>Help</SmallLabel>
    </div>
  );
}

export default HelpButton;
