// src/components/Views/MonthYearSelector.jsx

import React from "react";
import Select from "react-select";
import { getMonthOptions, getYearOptions } from "../../utils";

const MonthYearSelector = ({ showYear = true, showMonth = true, yearValue, onYearChange, monthValue, onMonthChange, disabled }) => {
  return (
    <div className="filters-wrapper">
      {showYear && (
        <Select
          className="react-select-container"
          classNamePrefix="react-select"
          options={getYearOptions()}
          value={yearValue}
          onChange={onYearChange}
          isDisabled={disabled}
        />
      )}
      {showMonth && (
        <Select
          className="react-select-container"
          classNamePrefix="react-select"
          options={getMonthOptions()}
          value={monthValue}
          onChange={onMonthChange}
          isDisabled={disabled}
        />
      )}
    </div>
  )
}

export default MonthYearSelector;