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

    renderWeek: PropTypes.func,
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

  onItemPress = (week) => {
    const {
      updateDate,
      date,
      onPress,
    } = this.props

    //Fix for auto dateType change
    let newDate = week.startDate.clone()
    const currentDate = parseDate(date)
    if (week.startDate.getMonth() !== currentDate.getMonth()) {
      newDate = currentDate.setDate(1)
    }
    updateDate(newDate)
    onPress(xdateToData(newDate))
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
      weekGroupCount,
      date,
    } = this.props

    const firstDay = this.props.firstDay || 0
    const currentMonth = parseDate(date).setDate(1)
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
        index: startWeekDay.getWeek(),
      }
      weeks.push(dateItem)
      startWeekDay.addWeeks(1)
    } while (currentMonth.getMonth() === endWeekDay.getMonth())

    return weeks
  }

  renderItem = (week) => {
    const {
      renderWeek,
    } = this.props

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
                          onPress={() => this.onItemPress(week)}
                          disabled={
                            typeof marking.disabled !== 'undefined'
                              ? marking.disabled
                              : this.props.state === 'disabled'
                          } >
          {renderWeek(week, textStyle)}
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
