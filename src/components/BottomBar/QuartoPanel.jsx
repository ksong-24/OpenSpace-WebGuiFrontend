import React from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';

import Popover from '../common/Popover/Popover';

import Picker from './Picker';

import styles from './QuartoPanel.scss';

export default function QuartoPanel() {
  const [popoverVisible, setPopoverVisible] = React.useState(false);
  const luaApi = useSelector((state) => state.luaApi);
  luaApi?.clearKey(['Left', 'Right', 'Space']);

  function togglePopover() {
    setPopoverVisible(!popoverVisible);
  }

  function popover() {
    return (
      <Popover
        className={`${styles.Popover}`}
        title="Quarto Presentation"
        closeCallback={togglePopover}
        detachable
        attached
      >
        <div id="actionscroller">
          <iframe src="http://localhost:5668" title="quarto" height="630" width="864" />
        </div>
      </Popover>
    );
  }

  return (
    <div className={styles.Wrapper}>
      <Picker
        className={`${popoverVisible && styles.Active}`}
        onClick={togglePopover}
      >
        <div>
          <Icon className={styles.Icon} icon="emojione-monotone:letter-q" alt="dashboard" />
        </div>
      </Picker>
      { popoverVisible && popover() }
    </div>
  );
}
