import React, { Component } from 'react'
import {
  TouchableOpacity,
  Text,
  View,
} from 'react-native'
import PropTypes from 'prop-types'

import styleConstructor from './style'
import { parseDate, xdateToData } from '../../interface'

class Weeks extends Component {

  static propTypes = {
    // TODO: disabled props should be removed
    state: PropTypes.oneOf([ 'disabled', 'today', '' ]),

    // Specify theme properties to override specific styles for calendar parts. Default = {}
    theme: PropTypes.object,
    markedDates: PropTypes.any,
    onPress: PropTypes.func,
    date: PropTypes.object,

    weekItemFormat: PropTypes.oneOfType([ PropTypes.string, PropTypes.func ]),
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

  onItemPress = (itemDate) => {
    const {
      updateDate,
      onPress,
    } = this.props

    updateDate(itemDate)
    onPress(xdateToData(itemDate))
  }

  getDateMarking = (week) => {
    const {
      markedDates,
    } = this.props

    let marking = {}
    if (markedDates) {
      let check = false
      const startWeekDay = week.startDate.clone()
      do {
        marking = markedDates[startWeekDay.toString('yyyy-MM-dd')] || []
        if (marking && marking.constructor === Array && marking.length) {
          marking = {
            marking: true,
          }
        }
        check = Object.keys(marking).length > 0
        startWeekDay.addDays(1)
      } while (!check && startWeekDay.getDay() !== 0)
    }

    return marking
  }

  getWeeks = () => {
    const {
      date,
    } = this.props

    const month = parseDate(date).setDate(1)
    const monthNext = month.clone().addMonths(1).setDate(1)
    const lastWeek = monthNext.getDay() !== 0 ? monthNext.getWeek() : monthNext.getWeek() - 1
    let weeks = []

    do {
      const startWeekDay = month.clone()
      startWeekDay.addDays(-startWeekDay.getDay())

      weeks.push({
        date: startWeekDay.clone().addDays(1),
        startDate: startWeekDay.clone(),
        endDate: startWeekDay.clone().addDays(6),
        index: month.getWeek(),
      })
      month.addWeeks(1)
    } while (month.getWeek() !== (lastWeek + 1))

    return weeks
  }

  renderItem = (week) => {
    const {
      weekItemFormat,
    } = this.props

    const itemText = typeof weekItemFormat === 'function' ?  weekItemFormat(week) : week.date.toString(weekItemFormat)
    const containerStyle = [ this.style.base ]
    const textStyle = [ this.style.text ]
    const dotStyle = [ this.style.dot ]

    const marking = this.getDateMarking(week)
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
      <View style={this.style.month} key={week.index}>
        <TouchableOpacity style={containerStyle}
                          onPress={() => this.onItemPress(week.date)}
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
    const weeks = this.getWeeks()

    return (
      <View>
        {weeks && weeks.map(item => this.renderItem(item))}
      </View>
    )
  }
}

export default Weeks
