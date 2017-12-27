import React, {Component} from 'react';
import {
  View,
} from 'react-native';
import PropTypes from 'prop-types';

import XDate from 'xdate';
import dateutils from '../../dateutils';
import {xdateToData, parseDate} from '../../interface';

import Day from './basic';
import UnitDay from './period';
import MultiDotDay from './multi-dot';

const EmptyArray = [];

//updateDate
//currentDate

class Days extends Component {

  constructor(props) {
    super(props);
  }

  pressDay = (date) => {
    const {
      updateDate,
    } = this.props;

    const day = parseDate(date);
    const minDate = parseDate(this.props.minDate);
    const maxDate = parseDate(this.props.maxDate);
    if (!(minDate && !dateutils.isGTE(day, minDate)) && !(maxDate && !dateutils.isLTE(day, maxDate))) {
      const shouldUpdateMonth = this.props.disableMonthChange === undefined || !this.props.disableMonthChange;
      if (shouldUpdateMonth) {
        updateDate(day);
      }
      if (this.props.onDayPress) {
        this.props.onDayPress(xdateToData(day));
      }
    }
  }

  renderDay(day, id) {
    const {
      date,
    } = this.props;

    const minDate = parseDate(this.props.minDate);
    const maxDate = parseDate(this.props.maxDate);
    let state = '';
    if (this.props.disabledByDefault) {
      state = 'disabled';
    } else if ((minDate && !dateutils.isGTE(day, minDate)) || (maxDate && !dateutils.isLTE(day, maxDate))) {
      state = 'disabled';
    } else if (!dateutils.sameMonth(day, date)) {
      state = 'disabled';
    } else if (dateutils.sameDate(day, XDate())) {
      state = 'today';
    }
    let dayComp;
    if (!dateutils.sameMonth(day, date) && this.props.hideExtraDays) {
      if (this.props.markingType === 'period') {
        dayComp = (<View key={id} style={{flex: 1}}/>);
      } else {
        dayComp = (<View key={id} style={{width: 32}}/>);
      }
    } else {
      const DayComp = this.getDayComponent();
      const date = day.getDate();
      dayComp = (
        <DayComp
          key={id}
          state={state}
          theme={this.props.theme}
          onPress={this.pressDay}
          date={xdateToData(day)}
          marking={this.getDateMarking(day)}
        >
          {date}
        </DayComp>
      );
    }
    return dayComp;
  }

  getDayComponent() {
    if (this.props.dayComponent) {
      return this.props.dayComponent;
    }

    switch (this.props.markingType) {
    case 'period':
      return UnitDay;
    case 'multi-dot':
      return MultiDotDay;
    default:
      return Day;
    }
  }

  getDateMarking(day) {
    if (!this.props.markedDates) {
      return false;
    }
    const dates = this.props.markedDates[day.toString('yyyy-MM-dd')] || EmptyArray;
    if (dates.length || dates) {
      return dates;
    } else {
      return false;
    }
  }

  renderWeekNumber (weekNumber) {
    return (
      <Day key={`week-${weekNumber}`} theme={this.props.theme} state='disabled'>{weekNumber}</Day>
    )
  }

  renderWeek(days, id) {
    const {
      style,
    } = this.props

    let week = []
    days.forEach((day, id2) => {
      week.push(this.renderDay(day, id2))
    }, this)

    if (this.props.showWeekNumbers) {
      week.unshift(this.renderWeekNumber(days[days.length - 1].getWeek()))
    }

    return (
      <View style={style.week} key={id}>{week}</View>
    )
  }

  render() {
    const {
      date,
    } = this.props

    const days = dateutils.page(date, this.props.firstDay)
    const weeks = []
    while (days.length) {
      weeks.push(this.renderWeek(days.splice(0, 7), weeks.length))
    }

    return (
      <View>{weeks}</View>
    )
  }
}

export default Days
