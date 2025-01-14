import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';

import { setPopoverVisibility, setShowAbout } from '../../api/Actions';
import api from '../../api/api';
import environment from '../../api/Environment';
import Button from '../common/Input/Button/Button';
import Popover from '../common/Popover/Popover';
import { useContextRefs } from '../GettingStartedTour/GettingStartedContext';

import styles from './SystemMenu.scss';

function SystemMenu({ showTutorial }) {
  const [showMenu, setShowMenu] = React.useState(false);
  const refs = useContextRefs();

  const luaApi = useSelector((state) => state.luaApi);
  const keybindsIsVisible = useSelector((state) => state.local.popovers.keybinds.visible);

  const dispatch = useDispatch();

  const openlinkScript = (url) => {
    let startString = 'open';
    if (navigator.platform === 'Win32') {
      startString = 'start';
    }
    const script = `os.execute('${startString} ${url}')`;
    return script;
  };

  function onClick(func, value) {
    setShowMenu(!showMenu);
    func(value);
  }

  function quit() {
    if (!luaApi) { return; }
    luaApi.toggleShutdown();
  }

  async function console() {
    if (!luaApi) { return; }
    const data = await luaApi.getPropertyValue('LuaConsole.IsVisible');
    const visible = data[1] || false;
    luaApi.setPropertyValue('LuaConsole.IsVisible', !visible);
  }

  async function nativeGui() {
    if (!luaApi) { return; }
    const data = await luaApi.getPropertyValue('Modules.ImGUI.Enabled');
    const visible = data[1] || false;
    luaApi.setPropertyValue('Modules.ImGUI.Enabled', !visible);
  }

  function openTutorials() {
    const script = openlinkScript('http://wiki.openspaceproject.com/docs/tutorials/users/');
    api.executeLuaScript(script);
  }

  function openFeedback() {
    const script = openlinkScript('http://data.openspaceproject.com/feedback');
    api.executeLuaScript(script);
  }

  function showAbout() {
    dispatch(setShowAbout(true));
  }

  function setShowKeybinds(visible) {
    dispatch(setPopoverVisibility({
      popover: 'keybinds',
      visible
    }));
  }

  // function saveChange() {
  //   if (!luaApi) { return; }
  //   luaApi.saveSettingsToProfile();
  // }

  return (
    <div className={styles.SystemMenu}>
      { showMenu && (
        <Popover className={styles.popover} arrow="arrow bottom leftside" attached>
          <nav className={styles.links}>
            <button type="button" onClick={() => { onClick(showAbout); }}>
              About OpenSpace
            </button>
            <button type="button" onClick={() => { onClick(openTutorials); }}>
              Open Web Tutorials
            </button>
            {showTutorial && (
              <button
                type="button"
                style={{ position: 'relative' }}
                onClick={() => { onClick(showTutorial, true); }}
                ref={(el) => { refs.current.Tutorial = el; }}
              >
                Open Getting Started Tour
              </button>
            )}
            <button type="button" onClick={() => onClick(openFeedback)}>
              Send Feedback
            </button>
            <hr className={Popover.styles.delimiter} />
            <button type="button" onClick={() => { onClick(setShowKeybinds, !keybindsIsVisible); }}>
              <Icon className={styles.linkIcon} icon="material-symbols:keyboard" />
              {keybindsIsVisible ? 'Hide' : 'Show'}
              {' '}
              keybindings
            </button>
            {
              environment.developmentMode && (
                <div>
                  <hr className={Popover.styles.delimiter} />
                  <div className={styles.devModeNotifier}>GUI running in dev mode</div>
                </div>
              )
            }
            <hr className={Popover.styles.delimiter} />

            <button type="button" onClick={() => onClick(console)}>
              Toggle console
              {' '}
              <span className={styles.shortcut}>~</span>
            </button>
            <button type="button" onClick={() => { onClick(nativeGui); }}>
              Toggle native GUI
              {' '}
              <span className={styles.shortcut}>F1</span>
            </button>
            {/*              <button onClick={saveChange}>
              Save settings to profile
            </button> */}
            <hr className={Popover.styles.delimiter} />
            <button type="button" onClick={() => { onClick(quit); }}>
              <Icon icon="material-symbols:exit-to-app" className={styles.linkIcon} />
              Quit OpenSpace
              {' '}
              <span className={styles.shortcut}>ESC</span>
            </button>
          </nav>
        </Popover>
      )}
      <Button
        ref={(el) => { refs.current.System = el; }}
        className={styles.button}
        transparent
        onClick={() => setShowMenu(!showMenu)}
      >
        <Icon icon="material-symbols:more-vert" className={styles.icon} />
      </Button>
    </div>
  );
}

SystemMenu.propTypes = {
  showTutorial: PropTypes.func
};

SystemMenu.defaultProps = {
  showTutorial: undefined
};

export default SystemMenu;
