import React, { Component } from 'react'
import { ActivityIndicator } from 'react-native'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import XDate from 'xdate'
import PropTypes from 'prop-types'

import styleConstructor from './style'
import * as CONSTANTS from '../../constants'
import { weekDayNames } from '../../dateutils'

class CalendarHeader extends Component {

  static propTypes = {
    theme: PropTypes.object,
    hideArrows: PropTypes.bool,
    date: PropTypes.instanceOf(XDate),
    addDate: PropTypes.func,
    showIndicator: PropTypes.bool,
    firstDay: PropTypes.number,
    renderArrow: PropTypes.func,
    hideDayNames: PropTypes.bool,
    weekNumbers: PropTypes.bool,
    allowChangeDateType: PropTypes.bool,
    dateType: PropTypes.oneOf(Object.keys(CONSTANTS.DATA_TYPES)),
    updateDataType: PropTypes.func,
  }

  static defaultProps = {
    updateDataType: () => {},
  }

  constructor(props) {
    super(props)

    this.style = styleConstructor(props.theme)
  }

  addDate = () => {
    this.props.addDate(1)
  }

  subtractDate = () => {
    this.props.addDate(-1)
  }

  shouldComponentUpdate(nextProps) {
    if (
      nextProps.date.toString() !== this.props.date.toString() ||
      nextProps.showIndicator !== this.props.showIndicator ||
      nextProps.dateType !== this.props.dateType
    ) {
      return true
    }

    return false
  }

  updateDataType = () => {
    const {
      dateType,
      updateDataType,
    } = this.props

    let newDataType = CONSTANTS.DATA_TYPES.day
    switch (dateType) {
      case CONSTANTS.DATA_TYPES.day:
        newDataType = CONSTANTS.DATA_TYPES.week
        break

      case CONSTANTS.DATA_TYPES.week:
        newDataType = CONSTANTS.DATA_TYPES.month
        break
    }

    updateDataType(newDataType)
  }

  get title() {
    const {
      dateType,
      showIndicator,
    } = this.props

    let title = ''
    switch (dateType) {
      case CONSTANTS.DATA_TYPES.day:
        title = this.props.date.toString(this.props.monthFormat ? this.props.monthFormat : 'MMMM yyyy')
        break

      case CONSTANTS.DATA_TYPES.week:
        title = this.props.date.toString(this.props.monthFormat ? this.props.monthFormat : 'MMMM yyyy')
        break

      case CONSTANTS.DATA_TYPES.month:
        title = this.props.date.toString('yyyy')
        break
    }

    const indicator = showIndicator && <ActivityIndicator />

    return (
      <View style={{ flexDirection: 'row' }}>
        <Text style={this.style.monthText}>{title}</Text>
        {indicator}
      </View>
    )
  }

  get leftArrow() {
    const {
      hideArrows,
      renderArrow,
    } = this.props

    if (hideArrows) {
      return (
        <View />
      )
    } else {
      return (
        <TouchableOpacity onPress={this.subtractDate}
                          style={this.style.arrow}>
          {renderArrow
            ? renderArrow('left')
            : <Image source={require('../img/previous.png')}
                     style={this.style.arrowImage} />
          }
        </TouchableOpacity>
      )
    }
  }

  get rightArrow() {
    const {
      hideArrows,
      renderArrow,
    } = this.props

    if (hideArrows) {
      return (
        <View />
      )
    } else {
      return (
        <TouchableOpacity onPress={this.addDate}
                          style={this.style.arrow}>
          {renderArrow
            ? renderArrow('right')
            : <Image source={require('../img/next.png')}
                     style={this.style.arrowImage} />
          }
        </TouchableOpacity>
      )
    }
  }

  render() {
    const {
      allowChangeDateType,
      dateType,
    } = this.props

    let weekDaysNames = weekDayNames(this.props.firstDay)

    return (
      <View>
        <View style={this.style.header}>
          {this.leftArrow}
          {
            allowChangeDateType
              ? <TouchableOpacity onPress={this.updateDataType}
                                  style={this.style.arrow}>
                  {this.title}
                </TouchableOpacity>
              : this.title
          }
          {this.rightArrow}
        </View>
        {
          dateType === CONSTANTS.DATA_TYPES.day && !this.props.hideDayNames &&
            <View style={this.style.week}>
              {this.props.weekNumbers && <Text style={this.style.dayHeader} />}
              {weekDaysNames.map((day, idx) => (
                <Text key={idx} style={this.style.dayHeader} numberOfLines={1}>{day}</Text>
              ))}
            </View>
        }
      </View>
    )
  }
}

export default CalendarHeader
