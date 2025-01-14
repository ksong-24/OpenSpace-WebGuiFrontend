import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
/* eslint-disable import/no-webpack-loader-syntax */
import Aim from 'svg-react-loader?name=Aim!../../../icons/aim.svg';
import Anchor from 'svg-react-loader?name=Anchor!../../../icons/anchor.svg';
import Focus from 'svg-react-loader?name=Focus!../../../icons/focus.svg';

import {
  connectFlightController,
  sendFlightControl,
  setNavigationAction,
  setPopoverVisibility,
  subscribeToEngineMode,
  subscribeToSessionRecording,
  unsubscribeToEngineMode,
  unsubscribeToSessionRecording
} from '../../../api/Actions';
import {
  EngineModeCameraPath,
  EngineModeSessionRecordingPlayback,
  EngineModeUserControl,
  NavigationAimKey,
  NavigationAnchorKey,
  RetargetAimKey,
  RetargetAnchorKey,
  ScenePrefixKey,
  SessionStatePaused,
  SessionStatePlaying
} from '../../../api/keys';
import propertyDispatcher from '../../../api/propertyDispatcher';
import { useLocalStorageState } from '../../../utils/customHooks';
import {
  FilterList, FilterListData, FilterListFavorites, FilterListShowMoreButton
} from '../../common/FilterList/FilterList';
import Button from '../../common/Input/Button/Button';
import Checkbox from '../../common/Input/Checkbox/Checkbox';
import LoadingString from '../../common/LoadingString/LoadingString';
import Popover from '../../common/Popover/Popover';
import SettingsPopup from '../../common/SettingsPopup/SettingsPopup';
import SmallLabel from '../../common/SmallLabel/SmallLabel';
import SvgIcon from '../../common/SvgIcon/SvgIcon';
import Picker from '../Picker';

import FocusEntry from './FocusEntry';

import styles from './OriginPicker.scss';

// Tag that each focusable node must have
const InterestingTag = 'GUI.Interesting';

const NavigationActions = {
  Focus: 'Focus',
  Anchor: 'Anchor',
  Aim: 'Aim'
};

function OriginPicker() {
  const [closeAfterSelection, setCloseAfterSelection] = useLocalStorageState('closeAfterSelection', false);

  const engineMode = useSelector((state) => state.engineMode.mode || EngineModeUserControl);
  const luaApi = useSelector((state) => state.luaApi);
  const allNodes = useSelector((state) => {
    const scene = state.propertyTree.propertyOwners.Scene;
    const uris = scene ? scene.subowners : [];

    // Get all the nodes in the scene
    return uris.map((uri) => ({
      ...state.propertyTree.propertyOwners[uri],
      key: uri
    }));
  });
  const favorites = useSelector((state) => {
    const { propertyOwners } = state.propertyTree;
    const scene = propertyOwners.Scene;
    const uris = scene ? scene.subowners : [];

    function hasInterestingTag(uri) {
      return propertyOwners[uri].tags.some((tag) => tag.includes(InterestingTag));
    }
    // Find interesting nodes
    const urisWithTags = uris.filter((uri) => hasInterestingTag(uri));
    return urisWithTags.map((uri) => ({
      ...propertyOwners[uri],
      key: uri
    }));
  });
  const anchor = useSelector((state) => {
    const anchorProp = state.propertyTree.properties[NavigationAnchorKey];
    return anchorProp && anchorProp.value;
  });
  const anchorName = useSelector((state) => {
    const anchorNode = state.propertyTree.propertyOwners[ScenePrefixKey + anchor];
    return anchorNode ? anchorNode.name : anchor;
  });
  const aim = useSelector((state) => {
    const aimProp = state.propertyTree.properties[NavigationAimKey];
    return aimProp && aimProp.value;
  });
  const aimName = useSelector((state) => {
    const aimNode = state.propertyTree.propertyOwners[ScenePrefixKey + aim];
    return aimNode ? aimNode.name : aim;
  });
  const popoverVisible = useSelector((state) => state.local.popovers.originPicker.visible);
  const sessionRecordingState = useSelector((state) => state.sessionRecording.recordingState);
  const navigationAction = useSelector((state) => state.local.originPicker.action);
  // Searchable nodes => nodes that are not hidden in the GUI
  const searchableNodes = useSelector(
    (state) => allNodes.filter((node) => {
      const isHiddenProp = state.propertyTree.properties[`${node.key}.GuiHidden`];
      const isHidden = isHiddenProp && isHiddenProp.value;
      return !isHidden;
    })
  );

  const dispatch = useDispatch();
  // Use refs so these aren't recalculated each render and trigger useEffect
  const anchorDispatcher = React.useRef(propertyDispatcher(dispatch, NavigationAnchorKey));
  const aimDispatcher = React.useRef(propertyDispatcher(dispatch, NavigationAimKey));
  const retargetAnchorDispatcher = React.useRef(propertyDispatcher(dispatch, RetargetAnchorKey));
  const retargetAimDispatcher = React.useRef(propertyDispatcher(dispatch, RetargetAimKey));

  const cappedAnchorName = anchorName?.substring(0, 20);

  React.useEffect(() => {
    dispatch(subscribeToSessionRecording());
    dispatch(subscribeToEngineMode());
    return () => {
      dispatch(unsubscribeToSessionRecording());
      dispatch(unsubscribeToEngineMode());
    };
  }, []);

  React.useEffect(() => {
    anchorDispatcher.current.subscribe();
    return () => anchorDispatcher.current.unsubscribe();
  }, [anchorDispatcher.current]);

  React.useEffect(() => {
    aimDispatcher.current.subscribe();
    return () => aimDispatcher.current.unsubscribe();
  }, [aimDispatcher.current]);

  function dispatchPopoverVisibility(visible) {
    dispatch(setPopoverVisibility({
      popover: 'originPicker',
      visible
    }));
  }

  function closePopoverIfSet() {
    if (closeAfterSelection) {
      dispatchPopoverVisibility(false);
    }
  }

  function hasDistinctAim() {
    return (aim !== '') && (aim !== anchor);
  }

  function togglePopover() {
    dispatchPopoverVisibility(!popoverVisible);
    if (!popoverVisible) {
      dispatch(connectFlightController());
    }
  }

  function onSelect(identifier, evt) {
    const updateViewPayload = {
      type: 'updateView',
      focus: '',
      aim: '',
      anchor: ''
    };

    if (navigationAction === NavigationActions.Focus) {
      updateViewPayload.aim = '';
      updateViewPayload.focus = identifier;
      updateViewPayload.anchor = '';
    } else if (navigationAction === NavigationActions.Anchor) {
      if (aim === '') {
        updateViewPayload.aim = anchor;
      }
      updateViewPayload.anchor = identifier;
    } else if (navigationAction === NavigationActions.Aim) {
      updateViewPayload.aim = identifier;
      updateViewPayload.anchor = anchor;
    }

    if (!evt.shiftKey) {
      if (navigationAction === NavigationActions.Aim) {
        retargetAimDispatcher.current.set(null);
      } else {
        retargetAnchorDispatcher.current.set(null);
      }
    }

    const shouldRetargetAim = !evt.shiftKey && updateViewPayload.aim != null;
    const shouldRetargetAnchor = !evt.shiftKey && updateViewPayload.aim == null;

    updateViewPayload.retargetAim = shouldRetargetAim;
    updateViewPayload.retargetAnchor = shouldRetargetAnchor;
    updateViewPayload.resetVelocities = !evt.ctrlKey;

    dispatch(sendFlightControl(updateViewPayload));

    if (updateViewPayload.aim) {
      anchorDispatcher.current.set(updateViewPayload.anchor);
      aimDispatcher.current.set(updateViewPayload.aim);
    } else if (updateViewPayload.anchor !== '') {
      anchorDispatcher.current.set(updateViewPayload.anchor);
    } else {
      anchorDispatcher.current.set(updateViewPayload.focus);
      aimDispatcher.current.set(updateViewPayload.aim);
    }
    closePopoverIfSet();
  }

  function dispatchSetNavigationAction(action) {
    dispatch(setNavigationAction(action));
  }

  function focusPicker() {
    return (
      <div className={styles.Grid}>
        <SvgIcon className={styles.Icon}><Focus /></SvgIcon>
        <div className={Picker.Title}>
          <span className={Picker.Name}>
            <LoadingString loading={anchor === undefined}>
              {cappedAnchorName}
            </LoadingString>
          </span>
          <SmallLabel>Focus</SmallLabel>
        </div>
      </div>
    );
  }

  function anchorAndAimPicker() {
    return (
      <div className={styles.Grid}>
        <SvgIcon className={styles.Icon}><Anchor /></SvgIcon>
        <div className={Picker.Title}>
          <span className={Picker.Name}>
            <LoadingString loading={anchor === undefined}>
              {cappedAnchorName}
            </LoadingString>
          </span>
          <SmallLabel>Anchor</SmallLabel>
        </div>
        <SvgIcon style={{ marginLeft: 10 }} className={styles.Icon}><Aim /></SvgIcon>
        <div className={Picker.Title}>
          <span className={Picker.Name}>
            <LoadingString loading={anchor === undefined}>
              {aimName}
            </LoadingString>
          </span>
          <SmallLabel>Aim</SmallLabel>
        </div>
      </div>
    );
  }

  function cameraPathPicker() {
    const cancelFlight = () => {
      luaApi.pathnavigation.stopPath();
    };

    return (
      <div
        className={`${styles.Grid} ${styles.cancelButton}`}
        onClick={cancelFlight}
        onKeyPress={cancelFlight}
        role="button"
        tabIndex={0}
      >
        <Icon className={styles.Icon} icon="material-symbols:airplanemode-inactive" />
        <div className={Picker.Title}>
          <span className={Picker.Name}>
            <LoadingString loading={anchor === undefined}>
              Cancel
            </LoadingString>
          </span>
          <div>
            <SmallLabel>
              <SvgIcon><Anchor /></SvgIcon>
              {' '}
              <LoadingString loading={anchor === undefined}>
                {cappedAnchorName}
              </LoadingString>
            </SmallLabel>
          </div>
        </div>
      </div>
    );
  }

  function pickerContent() {
    if (engineMode === EngineModeCameraPath) {
      return cameraPathPicker();
    }
    return hasDistinctAim() ? anchorAndAimPicker() : focusPicker();
  }

  // OBS same as timepicker
  function pickerStyle() {
    const isSessionRecordingPlaying = (engineMode === EngineModeSessionRecordingPlayback) &&
      (sessionRecordingState === SessionStatePlaying);

    const isSessionRecordingPaused = (engineMode === EngineModeSessionRecordingPlayback) &&
      (sessionRecordingState === SessionStatePaused);

    const isCameraPathPlaying = (engineMode === EngineModeCameraPath);

    if (isSessionRecordingPaused) { // TODO: add camera path paused check
      return Picker.DisabledOrange;
    }
    if (isCameraPathPlaying) {
      return Picker.Blue;
    }
    if (isSessionRecordingPlaying) {
      return Picker.DisabledBlue;
    }
    return '';
  }

  function settingsButton() {
    return (
      <SettingsPopup>
        <Checkbox
          checked={closeAfterSelection}
          left={false}
          disabled={false}
          setChecked={() => setCloseAfterSelection((current) => !current)}
          wide
          style={{ padding: '2px' }}
        >
          Close window after selecting
        </Checkbox>
      </SettingsPopup>
    );
  }

  function popover() {
    const defaultList = favorites.slice();

    // Make sure current anchor is in the default list
    if (anchor !== undefined && !defaultList.find((node) => node.identifier === anchor)) {
      const anchorNode = allNodes.find((node) => node.identifier === anchor);
      if (anchorNode) {
        defaultList.push(anchorNode);
      }
    }

    // Make sure current aim is in the default list
    if (hasDistinctAim() && !defaultList.find((node) => node.identifier === aim)) {
      const aimNode = allNodes.find((node) => node.identifier === aim);
      if (aimNode) {
        defaultList.push(aimNode);
      }
    }

    const sortedDefaultList = defaultList.slice(0).sort((a, b) => a.name.localeCompare(b.name));
    const sortedNodes = searchableNodes.slice(0).sort((a, b) => a.name.localeCompare(b.name));

    const searchPlaceholder = {
      Focus: 'Search for a new focus...',
      Anchor: 'Search for a new anchor...',
      Aim: 'Search for a new aim...'
    }[navigationAction];

    const isInFocusMode = navigationAction === NavigationActions.Focus;
    const active = navigationAction === NavigationActions.Aim ? aim : anchor;

    return (
      <Popover
        closeCallback={togglePopover}
        title="Navigation"
        className={Picker.Popover}
        detachable
        attached
        headerButton={settingsButton()}
      >
        <div>
          <Button
            className={styles.NavigationButton}
            onClick={() => dispatchSetNavigationAction(NavigationActions.Focus)}
            title="Select focus"
            transparent={navigationAction !== NavigationActions.Focus}
          >
            <SvgIcon className={styles.ButtonIcon}><Focus /></SvgIcon>
          </Button>
          <Button
            className={styles.NavigationButton}
            onClick={() => dispatchSetNavigationAction(NavigationActions.Anchor)}
            title="Select anchor"
            transparent={navigationAction !== NavigationActions.Anchor}
          >
            <SvgIcon className={styles.ButtonIcon}><Anchor /></SvgIcon>
          </Button>
          <Button
            className={styles.NavigationButton}
            onClick={() => dispatchSetNavigationAction(NavigationActions.Aim)}
            title="Select aim"
            transparent={navigationAction !== NavigationActions.Aim}
          >
            <SvgIcon className={styles.ButtonIcon}><Aim /></SvgIcon>
          </Button>
        </div>
        <FilterList
          className={styles.list}
          searchText={searchPlaceholder}
        >
          <FilterListShowMoreButton />
          <FilterListFavorites>
            {sortedDefaultList.map((entry) => (
              <FocusEntry
                onSelect={onSelect}
                active={active}
                showNavigationButtons={isInFocusMode}
                closePopoverIfSet={closePopoverIfSet}
                {...entry}
              />
            ))}
          </FilterListFavorites>
          <FilterListData>
            {sortedNodes.map((entry) => (
              <FocusEntry
                onSelect={onSelect}
                active={active}
                showNavigationButtons={isInFocusMode}
                closePopoverIfSet={closePopoverIfSet}
                {...entry}
              />
            ))}
          </FilterListData>
        </FilterList>
      </Popover>
    );
  }

  const enabled = (engineMode === EngineModeUserControl);
  const popoverEnabledAndVisible = popoverVisible && enabled;

  const pickerClasses = [
    styles.originPicker,
    popoverEnabledAndVisible ? Picker.Active : '',
    enabled ? '' : pickerStyle()
  ].join(' ');

  return (
    <div className={Picker.Wrapper}>
      <Picker refKey="Origin" onClick={() => togglePopover()} className={pickerClasses}>
        {pickerContent()}
      </Picker>
      {popoverEnabledAndVisible && popover()}
    </div>
  );
}

export default OriginPicker;
