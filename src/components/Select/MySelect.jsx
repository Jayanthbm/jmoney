import Select from "react-select";

const MySelect = ({options, value, onChange, isDisabled = false,isMulti=false,placeholder='',isSearchable=false}) => {
  return (
    <Select
      className="react-select-container"
      classNamePrefix="react-select"
      options={options}
      value={value}
      onChange={onChange}
      isDisabled={isDisabled}
      isMulti={isMulti}
      placeholder={placeholder}
      isSearchable={isSearchable}
    />
  )
}

export default MySelect;