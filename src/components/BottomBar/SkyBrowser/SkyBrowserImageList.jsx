import React from 'react';
import { useSelector } from 'react-redux';
import Input from '../../common/Input/Input/Input';
import { ObjectWordBeginningSubstring } from '../../../utils/StringMatchers';
import SkyBrowserNearestImagesList from './SkyBrowserNearestImagesList';
import SkyBrowserFocusEntry from './SkyBrowserFocusEntry';
import Dropdown from '../../common/DropDown/Dropdown';
import { AutoSizer, Grid } from 'react-virtualized';
import CenteredLabel from '../../common/CenteredLabel/CenteredLabel';

const ImageViewingOptions = {
  withinView: "Images within view",
  all: "All images",
  skySurveys: "Sky surveys"
};

export default function SkyBrowserImageList({
  activeImage,
  currentBrowserColor,
  height,
  moveCircleToHoverImage,
  selectImage
}) {
  const [imageViewingMode, setImageViewingMode] = React.useState(ImageViewingOptions.withinView);
  const [searchString, setSearchString] = React.useState("");
  const imageList = useSelector((state) => state.skybrowser.imageList);
  const luaApi = useSelector((state) => state.luaApi);
  const skySurveys = imageList.filter((img) => !img.hasCelestialCoords);
  const allImages = imageList.filter((img) => img.hasCelestialCoords);
  const entryHeight = 110;
  const entryWidth = 110;
  const inputHeight = 41;

  React.useEffect(() => {
    setSearchString("");
  }, [imageViewingMode]);

  function getImageList() {      
    if (imageViewingMode == ImageViewingOptions.withinView) {
        return (
          <SkyBrowserNearestImagesList
            activeImage={activeImage}
            currentBrowserColor={currentBrowserColor}
            selectImage={selectImage}
            height={height}
            moveCircleToHoverImage={moveCircleToHoverImage}
          />
        );
    }
    else {
      const chosenImageList = imageViewingMode === ImageViewingOptions.all ? allImages : skySurveys;
      const filteredImageList = chosenImageList.filter(img => {
        return ObjectWordBeginningSubstring(Object.values(img), searchString.toLowerCase());
      });

      return (
        <>
          <Input
            value={searchString}
            placeholder={`Search from ${chosenImageList.length.toString()} images...`}
            onChange={(e) => setSearchString(e.target.value)}
            clearable
            autoFocus={true}
          />
          { filteredImageList.length > 0 ?
          <AutoSizer>
            {({ width }) => {
              const noOfCols = Math.floor(width / entryWidth); 
              const rows = Math.ceil(filteredImageList.length / noOfCols);
              const minRows = Math.max(rows, Math.floor((height - inputHeight) / entryHeight));

              return (
                <Grid
                  cellRenderer={({ columnIndex, key, rowIndex, style }) => {
                    const index = columnIndex + (rowIndex * noOfCols);
                    if (index >= filteredImageList.length) {
                      return;
                    }
                    const item = filteredImageList[index];
                    return (
                      <SkyBrowserFocusEntry
                        key={key}
                        {...item}
                        luaApi={luaApi}
                        currentBrowserColor={currentBrowserColor}
                        onSelect={selectImage}
                        isActive={activeImage === item.identifier}
                        moveCircleToHoverImage={moveCircleToHoverImage}
                        style={style}
                      />
                    );
                  }}
                  columnCount={noOfCols}
                  columnWidth={entryWidth}
                  height={height - inputHeight}
                  rowCount={minRows}
                  rowHeight={entryHeight}
                  width={width}
                />
                )
              }}
            </AutoSizer>
            :
            <CenteredLabel>Nothing found. Try another search!</CenteredLabel>
            }
          </>
        );

    }
  }

  return (
    <>
      <Dropdown
        options={Object.values(ImageViewingOptions)} 
        onChange={(anchor) => setImageViewingMode(anchor.value)} 
        value={imageViewingMode} 
        placeholder="Select a viewing mode"
        style={{ marginRight: '2px'}}
      />
      {getImageList()}
    </>
  );
}