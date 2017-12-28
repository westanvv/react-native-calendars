import React, { Component } from 'react'
import {
  TouchableOpacity,
  View,
} from 'react-native'
import PropTypes from 'prop-types'
import XDate from 'xdate'
import dateutils from '../../dateutils'

import styleConstructor from './style'
import { parseDate, xdateToData } from '../../interface'

class Months extends Component {

  static propTypes = {
    // Specify theme properties to override specific styles for calendar parts. Default = {}
    theme: PropTypes.object,
    markedDates: PropTypes.any,
    onPress: PropTypes.func,
    date: PropTypes.object,

    renderMonthItem: PropTypes.func,
    monthRowItems: PropTypes.number,
    updateDate: PropTypes.func,
  }

  static defaultProps = {
    onPress: () => {},
  }

  constructor(props) {
    super(props)

    this.style = styleConstructor(props.theme)
  }

  shouldComponentUpdate(nextProps) {
    const changed = [ 'children', 'markedDates', 'onPress', 'date' ].reduce((prev, next) => {
      if (prev) {
        return prev
      } else if (nextProps[next] && this.props[next] && nextProps[next].toString() !== this.props[next].toString()) {
        return next
      }
      return prev
    }, false)

    return !!changed
  }

  onItemPress = (monthIndex) => {
    const {
      updateDate,
      onPress,
      date,
    } = this.props

    const newDate = parseDate(date)
    newDate.setMonth(monthIndex)

    updateDate(newDate)
    onPress(xdateToData(newDate))
  }

  getDateMarking = (monthIndex) => {
    const {
      markedDates,
    } = this.props

    let marking = {}
    if (markedDates) {
      marking = Object.keys(markedDates).reduce((accumulator, currentValue) => ({
        ...accumulator,
        ...(parseDate(currentValue).getMonth() === monthIndex ? markedDates[currentValue] : {}),
      }), {})
    }

    return marking
  }

  renderItem = (monthIndex) => {
    const {
      renderMonthItem,
      date,
      disabledByDefault,
    } = this.props

    const currentDate = parseDate(date).setMonth(monthIndex)
    const minDate = parseDate(this.props.minDate)
    const maxDate = parseDate(this.props.maxDate)

    let state = ''
    if (disabledByDefault) {
      state = 'disabled'
    } else if ((minDate && !dateutils.isGTE(currentDate, minDate)) || (maxDate && !dateutils.isLTE(currentDate, maxDate))) {
      state = 'disabled'
    } else if (dateutils.sameMonth(XDate(), currentDate)) {
      state = 'today'
    }

    const containerStyle = [ this.style.base ]
    const textStyle = [ this.style.text ]
    const dotStyle = [ this.style.dot ]

    const marking = this.getDateMarking(monthIndex)
    let dot
    if (marking.marked) {
      dotStyle.push(this.style.visibleDot)
      if (marking.dotColor) {
        dotStyle.push({ backgroundColor: marking.dotColor })
      }
      dot = <View style={dotStyle} />
    }

    if (marking.selected) {
      containerStyle.push(this.style.selected)
      dotStyle.push(this.style.selectedDot)
      textStyle.push(this.style.selectedText)
    } else if (typeof marking.disabled !== 'undefined' ? marking.disabled : state === 'disabled') {
      textStyle.push(this.style.disabledText)
    } else if (state === 'today') {
      textStyle.push(this.style.todayText)
    }

    return (
      <View style={this.style.month} key={monthIndex}>
        <TouchableOpacity style={containerStyle}
                          onPress={() => this.onItemPress(monthIndex)}
                          disabled={
                            typeof marking.disabled !== 'undefined'
                              ? marking.disabled
                              : state === 'disabled'
                          } >
          {renderMonthItem(currentDate, textStyle)}
          {dot}
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    const {
      monthRowItems,
    } = this.props

    let months = []
    let monthIndex = 0

    while (monthIndex < 12) {
      let row = []
      for (let index = 0; index < monthRowItems; index++) {
        row.push(this.renderItem(monthIndex))
        monthIndex++
      }
      months.push(
        <View style={this.style.monthRow} key={months.length}>{row}</View>
      )
    }

    return (
      <View>{months}</View>
    )
  }
}

export default Months
