import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import XDate from 'xdate';
import PropTypes from 'prop-types';

import styleConstructor from './style';
import * as CONSTANTS from '../../constants';
import { weekDayNames } from '../../dateutils';

class CalendarHeader extends Component {
  static propTypes = {
    theme: PropTypes.object,
    hideArrows: PropTypes.bool,
    month: PropTypes.instanceOf(XDate),
    addMonth: PropTypes.func,
    showIndicator: PropTypes.bool,
    firstDay: PropTypes.number,
    renderArrow: PropTypes.func,
    hideDayNames: PropTypes.bool,
    weekNumbers: PropTypes.bool,
    allowChangeDataType: PropTypes.bool,
    dataType: PropTypes.oneOf(CONSTANTS.DATA_TYPES.list),
    updateDataType: PropTypes.func,
  };

  static defaultProps = {
    updateDataType: () => {},
  };

  constructor(props) {
    super(props);
    this.style = styleConstructor(props.theme);
    this.addMonth = this.addMonth.bind(this);
    this.substractMonth = this.substractMonth.bind(this);
  }

  addMonth() {
    this.props.addMonth(1);
  }

  substractMonth() {
    this.props.addMonth(-1);
  }

  shouldComponentUpdate(nextProps) {
    if (
      nextProps.month.toString('yyyy MM') !==
      this.props.month.toString('yyyy MM')
    ) {
      return true;
    }
    if (nextProps.showIndicator !== this.props.showIndicator) {
      return true;
    }
    if (nextProps.dataType !== this.props.dataType) {
      return true;
    }

    return false;
  }

  updateDataType = () => {
    const {
      dataType,
      updateDataType,
    } = this.props;

    let newDataType = CONSTANTS.DATA_TYPES.day;
    switch(dataType) {
      case CONSTANTS.DATA_TYPES.day:
        newDataType = CONSTANTS.DATA_TYPES.month;
        break;
    }

    updateDataType(newDataType);
  }

  get title() {
    const {
      dataType,
      showIndicator,
    } = this.props;

    let title = '';
    switch(dataType) {
      case CONSTANTS.DATA_TYPES.day:
        title = this.props.month.toString(this.props.monthFormat ? this.props.monthFormat : 'MMMM yyyy');
        break;

      case CONSTANTS.DATA_TYPES.month:
        title = this.props.month.toString('yyyy');
        break;
    }

    const indicator = showIndicator && <ActivityIndicator />;

    return (
      <View style={{ flexDirection: 'row' }}>
        <Text style={this.style.monthText}>{title}</Text>
        {indicator}
      </View>
    );
  }

  render() {
    const {
      allowChangeDataType,
      dataType,
    } = this.props;

    let leftArrow = <View />;
    let rightArrow = <View />;
    let weekDaysNames = weekDayNames(this.props.firstDay);
    if (!this.props.hideArrows) {
      leftArrow = (
        <TouchableOpacity
          onPress={this.substractMonth}
          style={this.style.arrow}
        >
          {this.props.renderArrow
            ? this.props.renderArrow('left')
            : <Image
                source={require('../img/previous.png')}
                style={this.style.arrowImage}
              />}
        </TouchableOpacity>
      );
      rightArrow = (
        <TouchableOpacity onPress={this.addMonth} style={this.style.arrow}>
          {this.props.renderArrow
            ? this.props.renderArrow('right')
            : <Image
                source={require('../img/next.png')}
                style={this.style.arrowImage}
              />}
        </TouchableOpacity>
      );
    }

    return (
      <View>
        <View style={this.style.header}>
          {leftArrow}
          {allowChangeDataType
            ? <TouchableOpacity onPress={this.updateDataType} style={this.style.arrow}>{this.title}</TouchableOpacity>
            : this.title
          }
          {rightArrow}
        </View>
        {
          dataType === CONSTANTS.DATA_TYPES.day && !this.props.hideDayNames &&
            <View style={this.style.week}>
              {this.props.weekNumbers && <Text style={this.style.dayHeader}></Text>}
              {weekDaysNames.map((day, idx) => (
                <Text key={idx} style={this.style.dayHeader} numberOfLines={1}>{day}</Text>
              ))}
            </View>
        }
      </View>
    );
  }
}

export default CalendarHeader;
