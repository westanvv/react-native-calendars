import React, {Component} from 'react';
import {
  View,
  ViewPropTypes
} from 'react-native';
import PropTypes from 'prop-types';

import XDate from 'xdate';
import {xdateToData, parseDate} from '../interface';
import styleConstructor from './style';
import * as CONSTANTS from '../constants';

import CalendarHeader from './header';
import Days from './days';
import Months from './months';

import shouldComponentUpdate from './updater';

//Fallback when RN version is < 0.44
const viewPropTypes = ViewPropTypes || View.propTypes;

class Calendar extends Component {
  static propTypes = {
    // Specify theme properties to override specific styles for calendar parts. Default = {}
    theme: PropTypes.object,
    // Collection of dates that have to be marked. Default = {}
    markedDates: PropTypes.object,

    // Specify style for calendar container element. Default = {}
    style: viewPropTypes.style,
    // Initially visible month. Default = Date()
    current: PropTypes.any,
    // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
    minDate: PropTypes.any,
    // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
    maxDate: PropTypes.any,

    // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
    firstDay: PropTypes.number,

    // Date marking style [simple/period]. Default = 'simple'
    markingType: PropTypes.string,

    // Hide month navigation arrows. Default = false
    hideArrows: PropTypes.bool,
    // Display loading indicador. Default = false
    displayLoadingIndicator: PropTypes.bool,
    // Do not show days of other months in month page. Default = false
    hideExtraDays: PropTypes.bool,

    // Handler which gets executed on day press. Default = undefined
    onDayPress: PropTypes.func,
    // Handler which gets executed when visible month changes in calendar. Default = undefined
    onMonthChange: PropTypes.func,
    onVisibleMonthsChange: PropTypes.func,
    // Replace default arrows with custom ones (direction can be 'left' or 'right')
    renderArrow: PropTypes.func,
    // Provide custom day rendering component
    dayComponent: PropTypes.any,
    // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
    monthFormat: PropTypes.string,
    // Disables changing month when click on days of other months (when hideExtraDays is false). Default = false
    disableMonthChange: PropTypes.bool,
    //  Hide day names. Default = false
    hideDayNames: PropTypes.bool,
    // Disable days by default. Default = false
    disabledByDefault: PropTypes.bool,
    // Show week numbers. Default = false
    showWeekNumbers: PropTypes.bool,

    allowChangeDataType: PropTypes.bool,
    dataType: PropTypes.oneOf(CONSTANTS.DATA_TYPES.list),
    // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
    monthItemFormat: PropTypes.string,
    monthRowItems: PropTypes.number,
  };

  static defaultProps = {
    // Show week numbers. Default = false
    showWeekNumbers: true,
    allowChangeDataType: true,
    dataType: CONSTANTS.DATA_TYPES.day,
    monthItemFormat: 'MMMM',
    monthRowItems: 3,
  };

  constructor(props) {
    super(props);

    this.style = styleConstructor(this.props.theme);
    let currentMonth;
    if (props.current) {
      currentMonth = parseDate(props.current);
    } else {
      currentMonth = XDate();
    }
    this.state = {
      currentMonth,
      currentDataType: props.dataType,
    };

    this.updateMonth = this.updateMonth.bind(this);
    this.addMonth = this.addMonth.bind(this);
    this.shouldComponentUpdate = shouldComponentUpdate;
  }

  componentWillReceiveProps(nextProps) {
    const current= parseDate(nextProps.current);
    if (current && current.toString('yyyy MM') !== this.state.currentMonth.toString('yyyy MM')) {
      this.setState({
        currentMonth: current.clone()
      });
    }
  }

  updateDataType = (type) => {
    this.setState({
      currentDataType: type
    });
  }

  updateMonth(day, doNotTriggerListeners) {
    if (day.toString('yyyy MM') === this.state.currentMonth.toString('yyyy MM')) {
      return;
    }
    this.setState({
      currentMonth: day.clone()
    }, () => {
      if (!doNotTriggerListeners) {
        const currMont = this.state.currentMonth.clone();
        if (this.props.onMonthChange) {
          this.props.onMonthChange(xdateToData(currMont));
        }
        if (this.props.onVisibleMonthsChange) {
          this.props.onVisibleMonthsChange([xdateToData(currMont)]);
        }
      }
    });
  }

  addMonth(count) {
    this.updateMonth(this.state.currentMonth.clone().addMonths(count, true));
  }

  get renderContent() {
    const {
      currentDataType,
    } = this.state;

    const {
      currentMonth,
    } = this.state;

    if (currentDataType === CONSTANTS.DATA_TYPES.day) {
      return (
        <Days {...this.props}
               style={this.style}
               currentMonth={currentMonth}
               updateMonth={this.updateMonth}/>
      );
    }

    if (currentDataType === CONSTANTS.DATA_TYPES.month) {
      return (
        <Months {...this.props}
                 style={this.style}
                 currentMonth={currentMonth}
                 updateMonth={this.updateMonth} />
      );
    }

    return <View />;
  }

  render() {
    const {
      allowChangeDataType,
    } = this.props;

    const {
      currentDataType,
    } = this.state;

    let indicator;
    const current = parseDate(this.props.current);
    if (current) {
      const lastMonthOfDay = current.clone().addMonths(1, true).setDate(1).addDays(-1).toString('yyyy-MM-dd');
      if (this.props.displayLoadingIndicator &&
          !(this.props.markedDates && this.props.markedDates[lastMonthOfDay])) {
        indicator = true;
      }
    }

    return (
      <View style={[this.style.container, this.props.style]}>
        <CalendarHeader
          theme={this.props.theme}
          hideArrows={this.props.hideArrows}
          month={this.state.currentMonth}
          addMonth={this.addMonth}
          showIndicator={indicator}
          firstDay={this.props.firstDay}
          renderArrow={this.props.renderArrow}
          monthFormat={this.props.monthFormat}
          allowChangeDataType={allowChangeDataType}
          dataType={currentDataType}
          updateDataType={this.updateDataType}
          hideDayNames={this.props.hideDayNames}
          weekNumbers={this.props.showWeekNumbers}
        />
        {this.renderContent}

      </View>);
  }
}

export default Calendar;
