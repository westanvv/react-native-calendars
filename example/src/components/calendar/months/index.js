import React, { Component } from 'react'
import {
  TouchableOpacity,
  Text,
  View,
} from 'react-native'
import PropTypes from 'prop-types'
import XDate from 'xdate'

import styleConstructor from './style'
import { parseDate, xdateToData } from '../../interface'

class Months extends Component {

  static propTypes = {
    // TODO: disabled props should be removed
    state: PropTypes.oneOf([ 'disabled', 'today', '' ]),

    // Specify theme properties to override specific styles for calendar parts. Default = {}
    theme: PropTypes.object,
    marking: PropTypes.any,
    onPress: PropTypes.func,
    date: PropTypes.object,

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
    const changed = [ 'state', 'children', 'markedDates', 'onPress', 'date' ].reduce((prev, next) => {
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
      date,
    } = this.props

    let marking = {}
    if (markedDates) {
      marking = markedDates[parseDate(date).setMonth(monthIndex).toString('yyyy-MM-dd')] || []
    }
    if (marking && marking.constructor === Array && marking.length) {
      marking = {
        marking: true,
      }
    }

    return marking
  }

  renderItem = (monthIndex) => {
    const {
      monthItemFormat,
    } = this.props

    const date = new XDate().setMonth(monthIndex)
    const itemText = date.toString(monthItemFormat)
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
    } else if (typeof marking.disabled !== 'undefined' ? marking.disabled : this.props.state === 'disabled') {
      textStyle.push(this.style.disabledText)
    } else if (this.props.state === 'today') {
      textStyle.push(this.style.todayText)
    }

    return (
      <View style={this.style.month} key={monthIndex}>
        <TouchableOpacity style={containerStyle}
                          onPress={() => this.onItemPress(monthIndex)}
                          disabled={
                            typeof marking.disabled !== 'undefined'
                              ? marking.disabled
                              : this.props.state === 'disabled'
                          } >
          <Text style={textStyle}>{itemText}</Text>
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
