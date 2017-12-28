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

class Weeks extends Component {

  static propTypes = {
    // Specify theme properties to override specific styles for calendar parts. Default = {}
    theme: PropTypes.object,
    markedDates: PropTypes.any,
    onPress: PropTypes.func,
    date: PropTypes.object,

    renderWeekItem: PropTypes.func,
    updateDate: PropTypes.func,
    weekGroupCount: PropTypes.number,
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

  onItemPress = (week) => {
    const {
      updateDate,
      onPress,
    } = this.props

    updateDate(week.middleDate)
    onPress(xdateToData(week.middleDate))
  }

  getDateMarking = (week) => {
    const {
      markedDates,
    } = this.props

    let marking = {}
    if (markedDates) {
      marking = Object.keys(markedDates).reduce((accumulator, currentValue) => ({
        ...accumulator,
        ...(dateutils.inWeek(parseDate(currentValue), week.startDate, week.endDate) ? markedDates[currentValue] : {}),
      }), {})
    }

    return marking
  }

  getWeeks = () => {
    const {
      weekGroupCount,
      date,
    } = this.props

    const firstDay = this.props.firstDay || 0
    const currentDate = parseDate(date)
    const currentMonth = currentDate.setDate(1)
    const currentDay = currentMonth.getDay()

    let weeks = []

    //Moving date to the first day of the week
    const startWeekDay = currentMonth.clone().addDays(-(currentDay < firstDay ? 7 - firstDay + currentDay : currentDay - firstDay))
    let endWeekDay
    do {
      endWeekDay = startWeekDay.clone().addDays(7 * weekGroupCount - 1)

      const dateItem = {
        startDate: startWeekDay.clone(),
        endDate: endWeekDay.clone(),
        //Fix for auto dateType change
        middleDate: startWeekDay.getMonth() !== currentDate.getMonth() ? currentMonth.clone() : startWeekDay.clone(),
        index: startWeekDay.getWeek(),
      }
      weeks.push(dateItem)
      startWeekDay.addWeeks(1)
    } while (currentMonth.getMonth() === endWeekDay.getMonth())

    return weeks
  }

  renderItem = (week) => {
    const {
      renderWeekItem,
      disabledByDefault,
    } = this.props

    const minDate = parseDate(this.props.minDate)
    const maxDate = parseDate(this.props.maxDate)

    let state = ''
    if (disabledByDefault) {
      state = 'disabled'
    } else if ((minDate && !dateutils.isGTE(week.startDate, minDate)) || (maxDate && !dateutils.isLTE(week.endDate, maxDate))) {
      state = 'disabled'
    } else if (dateutils.inWeek(XDate(), week.startDate, week.endDate)) {
      state = 'today'
    }

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
    } else if (typeof marking.disabled !== 'undefined' ? marking.disabled : state === 'disabled') {
      textStyle.push(this.style.disabledText)
    } else if (state === 'today') {
      textStyle.push(this.style.todayText)
    }

    return (
      <View style={this.style.item} key={week.index}>
        <TouchableOpacity style={containerStyle}
                          onPress={() => this.onItemPress(week)}
                          disabled={
                            typeof marking.disabled !== 'undefined'
                              ? marking.disabled
                              : state === 'disabled'
                          } >
          {renderWeekItem(week, textStyle)}
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
