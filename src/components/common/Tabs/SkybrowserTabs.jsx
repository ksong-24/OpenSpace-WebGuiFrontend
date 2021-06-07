import React, { Component } from 'react';
import styles from './SkybrowserTabs.scss';
import Button from '../Input/Button/Button';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import { excludeKeys } from '../../../utils/helpers';
import PropTypes from 'prop-types';
import ScrollOverlay from '../../common/ScrollOverlay/ScrollOverlay';
import CenteredLabel from '../../common/CenteredLabel/CenteredLabel';
import { Resizable } from 're-resizable';
import TooltipSkybrowser from '../../common/Tooltip/TooltipSkybrowser';

class SkybrowserTabs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            height: 160,
            currentHeight: 160,
            showButtonInfo1: false,
            showButtonInfo2: false,
            showButtonInfo3: false,
            showButtonInfo4: false,
        }
        this.createTabs = this.createTabs.bind(this);
        this.onResizeStop = this.onResizeStop.bind(this);
        this.onResize = this.onResize.bind(this);
        this.setRef = this.setRef.bind(this);
        this.showTooltip = this.showTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
    }

    get inheritedProps() {
        const doNotInclude = 'closeCallback className position size title';
        return excludeKeys(this.props, doNotInclude);
    }

    get position() {
        if (!this.wrapper) return { top: '0px', left: '0px' };
        const { top, right} = this.wrapper.getBoundingClientRect();
        return { top: `${top}`, left: `${right}`};
    }

    setRef(what) {
        return (element) => {
          this[what] = element;
        };
    }

    showTooltip(buttonNumber) {
        if(buttonNumber == 1) this.setState({showButtonInfo1 : !this.state.showButtonInfo1});
        else if(buttonNumber == 2) this.setState({showButtonInfo2 : !this.state.showButtonInfo2});
        else if(buttonNumber == 3) this.setState({showButtonInfo3 : !this.state.showButtonInfop3});
        else this.setState({showButtonInfo4 : !this.state.showButtonInfo4})
       
    }
 
    hideTooltip(buttonNumber) {
        if(buttonNumber == 1) this.setState({showButtonInfo1 : false});
        else if(buttonNumber == 2) this.setState({showButtonInfo2 : false});
        else if(buttonNumber == 3) this.setState({showButtonInfo3 : false});
        else this.setState({showButtonInfo4 : false})
    }

    createTabs() {

        const { showButtonInfo1, showButtonInfo2, showButtonInfo3, showButtonInfo4 } = this.state;
        const { targets, currentTarget} = this.props;
        const { lockTarget, unlockTarget, createTargetBrowserPair, adjustCameraToTarget, select2dImagesAs3d, centerTarget, selectTab} = this.props.viewComponentProps;

        const allTabs = Object.keys(targets).map((target, index) => {

            let targetColor = 'rgb(' + targets[target].color + ')';
            let targetIsLocked = targets[target].isLocked;

            return(
                <div key={index} 
                style={currentTarget === target ? {borderTopRightRadius: "4px", borderTop:  "3px solid " + targetColor}:{}}>
                    <div className={ currentTarget === target ? styles.tabActive : styles.tab } onClick={() => selectTab(target)}>
                    <span className={styles.tabHeader}>
                    <span className={styles.tabTitle}> { targets[target].name } </span>
                    { currentTarget === target ? ( 
                   <span className={styles.tabButtons} ref={this.setRef('wrapper')}>
                    <Button onClick={() => adjustCameraToTarget(target)} onMouseLeave={() => this.hideTooltip(1)} className={styles.tabButton} transparent small>
                        <MaterialIcon icon="filter_center_focus" className="small" onMouseEnter={() => this.showTooltip(1)} />
                        { showButtonInfo1 && <TooltipSkybrowser
                            placement="bottom-right"
                            style={this.position}>
                            {"Center focus on target"}
                            </TooltipSkybrowser>
                        }
                    </Button>
                    <Button onClick={() => centerTarget(target)} onMouseLeave={() => this.hideTooltip(2)} className={styles.tabButton} transparent small >
                        <MaterialIcon onMouseEnter={() => this.showTooltip(2)} icon="adjust" className="small"/>
                        { showButtonInfo2 && <TooltipSkybrowser
                            placement="bottom-right"
                            style={this.position}>
                            {"Center target"}
                            </TooltipSkybrowser>
                        }
                    </Button>
                    <Button onClick={targetIsLocked ? () => unlockTarget(target) : () => lockTarget(target) } onMouseLeave={() => this.hideTooltip(3)}
                    className={targetIsLocked ? styles.tabButtonActive : styles.tabButton } transparent small>
                        <MaterialIcon onMouseEnter={() => this.showTooltip(3)} icon="lock" className="small"/>
                        { showButtonInfo3 && <TooltipSkybrowser
                            placement="bottom-right"
                            style={this.position}>
                            {"Lock target's position"}
                            </TooltipSkybrowser>
                        }   
                    </Button>
                    <Button onClick={() => select2dImagesAs3d(target)} onMouseLeave={() => this.hideTooltip(4)} className={styles.tabButton} transparent small>
                        <MaterialIcon onMouseEnter={() => this.showTooltip(4)} icon="get_app" className="small"/>
                        { showButtonInfo4 && <TooltipSkybrowser
                            placement="bottom-right"
                            style={this.position}>
                            {"Add images to 3D space"}
                            </TooltipSkybrowser>
                        }  
                    </Button>
                    <Button onClick={() => this.handleDeleteTab(target)} className={styles.closeTabButton} transparent small>
                        <MaterialIcon icon="close" className="small" />
                    </Button>
                    </span>
                    ) : (
                    <Button onClick={() => this.handleDeleteTab(target)} className={styles.closeTabButton} transparent small>
                        <MaterialIcon icon="close" className="small"/>
                    </Button>
                    )}
                    </span>
                   </div>
                </div>
            );
        });
        return (
            <div className={styles.navTabs}>
                {allTabs}
                <Button onClick={() => createTargetBrowserPair()} className={styles.addTabButton} transparent>
                    <MaterialIcon icon="add" />
                </Button>
            </div>
        );
    }
    onResizeStop(e, direction, ref, delta) {
        this.setState({
            height: this.state.height + delta.height
        })

    }

    onResize(e, direction, ref, delta) {
        this.setState({
            currentHeight: this.state.height + delta.height
        })
        this.props.viewComponentProps.setCurrentTabHeight(this.state.currentHeight);
    }

    render() {
        const {data, currentPopoverHeight} = this.props;
        const EntryComponent = this.props.viewComponent;

        return(
            <section {...this.inheritedProps} className={styles.tabContainer}>
                <Resizable
                enable={{ top: true, bottom: false }}
                handleClasses={{ top: styles.topHandle }}
                size={{ height: this.state.currentHeight }}
                minHeight={130}
                maxHeight={currentPopoverHeight}
                onResizeStop={this.onResizeStop}
                onResize={this.onResize}>
                {this.createTabs()}
                <div className={styles.tabContent} style={{ height: this.state.currentHeight }}>
                    <ScrollOverlay>
                        { data.length === 0 ? ( 
                        <CenteredLabel>There are no loaded images in this Skybrowser.</CenteredLabel>
                        ) : (
                        <ul>
                            { data.map(entry => (
                                <EntryComponent
                                {...entry}
                                {...this.props.viewComponentProps}
                                key={entry.identifier}
                                onSelect={this.props.onSelect}
                                />
                            ))}
                        </ul>
                        )}
                    </ScrollOverlay>
                </div>
            </Resizable>
            </section>
        )

    };

}

SkybrowserTabs.propTypes = {
    children: PropTypes.node,
    data: PropTypes.array.isRequired,
    viewComponent: PropTypes.elementType,
    viewComponentProps: PropTypes.object,

};

SkybrowserTabs.defaultProps = {
    children: '',
    viewComponent: (props) => (<li>{ JSON.stringify(props) }</li>),
    viewComponentProps: {},
};

export default SkybrowserTabs;
