import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FilterList from '../common/FilterList/FilterList';
import styles from './SkyBrowserImageList.scss';
import SkybrowserFocusEntry from './SkybrowserFocusEntry';

class SkyBrowserImageList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      distanceSortThreshold: 0.1
    };

    this.getNearestImages = this.getNearestImages.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.showOnlyNearest) {
      // TODO: this can probably be made more efficient. We don't need to
      // rerender if nothing changed
      return true;
    }
    // Prevent rerendering unless important properties actually changed
    return !(
      this.props.showOnlyNearest === nextProps.showOnlyNearest &&
      this.props.height === nextProps.height &&
      this.props.selectImage === nextProps.selectImage &&
      this.props.activeImage === nextProps.activeImage
    );
  }

  getNearestImages() {
    const { imageList, selectedBrowserData } = this.props;
    const { distanceSortThreshold } = this.state;

    if (!selectedBrowserData || Object.keys(imageList).length === 0) {
      return [];
    }
    const searchRadius = selectedBrowserData.FOV / 2;
    const isWithinFOV = (coord, target, FOV) => coord < target + FOV && coord > target - FOV;

    // Only load images that have coordinates within current window
    const imgsWithinTarget = imageList.filter((img) => {
      if (!img.hasCelestialCoords) {
        return false; // skip
      }
      return isWithinFOV(img.ra, selectedBrowserData.ra, searchRadius)
        && isWithinFOV(img.dec, selectedBrowserData.dec, searchRadius);
    });

    const distPow2 = (a, b) => (a - b) * (a - b);

    const euclidianDistance = (a, b) => {
      let sum = 0;
      for (let i = 0; i < 3; i++) {
        sum += distPow2(a.cartesianDirection[i], b.cartesianDirection[i]);
      }
      return Math.sqrt(sum);
    };

    imgsWithinTarget.sort((a, b) => {
      const distA = euclidianDistance(a, selectedBrowserData);
      const distB = euclidianDistance(b, selectedBrowserData);
      let result = distA > distB;
      // If both the images are within a certain distance of each other
      // assume they are taken of the same object and sort on fov.
      if (euclidianDistance(a, selectedBrowserData) < distanceSortThreshold &&
          euclidianDistance(b, selectedBrowserData) < distanceSortThreshold ) {
        result = a.fov > b.fov
      }
      return result ? 1 : -1;
    });

    return imgsWithinTarget;
  }

  render() {
    const { activeImage, height, imageList, luaApi, showOnlyNearest, selectImage } = this.props;

    const list = showOnlyNearest ? this.getNearestImages() : imageList;
    const skybrowserApi = luaApi.skybrowser;
    // TODO: render hint if no images

    return (
      <FilterList
        className={styles.filterList}
        height={height} // TODO: prevent rerendering every time height changes
        data={list}
        searchText={`Search from ${list.length.toString()} images...`}
        viewComponent={SkybrowserFocusEntry}
        viewComponentProps={{
          skybrowserApi,
          currentTargetColor: this.props.getCurrentTargetColor,
        }}
        onSelect={selectImage}
        active={activeImage}
        searchAutoFocus
      />
    );
  }
}

SkyBrowserImageList.propTypes = {
  api: PropTypes.object,
};

SkyBrowserImageList.defaultProps = {
  api: null,
};

export default SkyBrowserImageList;