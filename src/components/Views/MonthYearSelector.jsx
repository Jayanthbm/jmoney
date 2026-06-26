// src/components/Views/MonthYearSelector.jsx

import { getMonthOptions, getYearOptions } from "../../utils";

import MySelect from "../Select/MySelect";
import React from "react";

const MonthYearSelector = ({ showYear = true, showMonth = true, yearValue, onYearChange, monthValue, onMonthChange, disabled }) => {
  return (
    <div className="filters-wrapper">
      {showYear && (
        <MySelect
          options={getYearOptions()}
          value={yearValue}
          onChange={onYearChange}
          isDisabled={disabled}
        />
      )}
      {showMonth && (
        <MySelect
          options={getMonthOptions(yearValue.value)}
          value={monthValue}
          onChange={onMonthChange}
          isDisabled={disabled}
        />
      )}
    </div>
  )
}

export default MonthYearSelector;