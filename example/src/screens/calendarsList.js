import React, { Component } from 'react'

import { CalendarList } from '../components'

export default class CalendarsList extends Component {

  render() {
    return (
      <CalendarList current={'2012-05-16'}
                    pastScrollRange={24}
                    futureScrollRange={24} />
    )
  }
}
