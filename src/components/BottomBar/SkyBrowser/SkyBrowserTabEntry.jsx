import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';

import { stopEventPropagation } from '../../../utils/helpers';
import Button from '../../common/Input/Button/Button';
import NumericInput from '../../common/Input/NumericInput/NumericInput';

import SkyBrowserInfoBox from './SkyBrowserInfoBox';

import styles from './SkyBrowserEntry.scss';

function OpacitySlider({ opacity, setOpacity, identifier }) {
  function handleChange(newValue) {
    // Ensure the image has an id, which consists of the index of the image
    const index = Number(identifier);
    if (index) {
      setOpacity(index, newValue);
    }
  }
  return (
    <div className={styles.sliderContainer}>
      <NumericInput
        type="range"
        min={0}
        max={1}
        placeholder="Opacity"
        step={0.01}
        label="Opacity"
        value={opacity}
        onValueChanged={handleChange}
        decimals={2}
      />
    </div>
  );
}

OpacitySlider.propTypes = {
  identifier: PropTypes.string.isRequired,
  opacity: PropTypes.number.isRequired,
  setOpacity: PropTypes.func.isRequired
};

function SkyBrowserTabEntry({
  credits,
  creditsUrl,
  currentBrowserColor,
  dragHandleTitleProps,
  dec,
  fov,
  hasCelestialCoords,
  identifier,
  isActive,
  moveCircleToHoverImage,
  name,
  onSelect,
  opacity,
  ra,
  removeImageSelection,
  setOpacity,
  thumbnail
}) {
  const luaApi = useSelector((state) => state.luaApi);
  function select() {
    if (onSelect && identifier) {
      onSelect(identifier);
    }
  }

  return (
    <div
      className={`${styles.entry} ${styles.tabEntry} ${isActive && styles.active}`}
      style={{ borderLeftColor: currentBrowserColor() }}
      onMouseOver={() => { moveCircleToHoverImage(identifier); }}
      onFocus={() => { moveCircleToHoverImage(identifier); }}
      onMouseOut={() => { luaApi.skybrowser.disableHoverCircle(); }}
      onBlur={() => { luaApi.skybrowser.disableHoverCircle(); }}
      onClick={select}
      onKeyPress={select}
      {...dragHandleTitleProps}
      role="button"
      tabIndex={0}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className={styles.image}>
          <LazyLoadImage src={thumbnail} alt="" className={styles.imageText} onClick={select} />
        </div>
        {!hasCelestialCoords && (
          <span className={styles.skySurvey}>
            Sky Survey
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '10px' }}>
        <div className={styles.imageTitle} style={{ maxWidth: '150px' }}>
          { name || identifier }
        </div>
        <OpacitySlider setOpacity={setOpacity} opacity={opacity} identifier={identifier} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', marginLeft: 'auto' }}>
        <SkyBrowserInfoBox
          className={styles.removeImageButton}
          dec={dec}
          fov={fov}
          hasCelestialCoords={hasCelestialCoords}
          infoPlacement="left"
          ra={ra}
          style={{ display: 'flex', justifyContent: 'center', borderRadius: '4px' }}
          text={credits}
          textUrl={creditsUrl}
          title={(name || identifier)}
        />
        <Button
          onClick={(e) => {
            stopEventPropagation(e);
            removeImageSelection(identifier);
          }}
          className={styles.removeImageButton}
          small
          transparent
        >
          <Icon icon="material-symbols:delete" className="small" />
        </Button>
      </div>
    </div>
  );
}

SkyBrowserTabEntry.propTypes = {
  credits: PropTypes.string,
  creditsUrl: PropTypes.string,
  currentBrowserColor: PropTypes.func.isRequired,
  dec: PropTypes.number,
  dragHandleTitleProps: PropTypes.object.isRequired,
  fov: PropTypes.number,
  hasCelestialCoords: PropTypes.bool.isRequired,
  identifier: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  moveCircleToHoverImage: PropTypes.func.isRequired,
  name: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  opacity: PropTypes.number.isRequired,
  ra: PropTypes.number,
  removeImageSelection: PropTypes.func.isRequired,
  setOpacity: PropTypes.func.isRequired,
  thumbnail: PropTypes.string
};

SkyBrowserTabEntry.defaultProps = {
  isActive: false,
  credits: '',
  creditsUrl: '',
  dec: 0,
  fov: 90,
  name: '',
  ra: 0,
  thumbnail: ''
};

export default SkyBrowserTabEntry;
