// src/pages/Transactions/TransactionFilters.jsx

import React from "react";
import Select from "react-select";
import { AnimatePresence, motion } from "framer-motion";

const TransactionFilters = ({
  showFilters,
  categoryOptions,
  selectedCategories,
  onCategoryChange,
  payeeOptions,
  selectedPayees,
  onPayeeChange,
}) => (
  <AnimatePresence>
    {showFilters && (
      <motion.div
        className="filters-wrapper"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Select
          isMulti
          options={categoryOptions}
          value={selectedCategories}
          onChange={onCategoryChange}
          placeholder="Filter by Categories"
          className="react-select-container"
          classNamePrefix="react-select"
        />
        <Select
          isMulti
          options={payeeOptions}
          value={selectedPayees}
          onChange={onPayeeChange}
          placeholder="Filter by Payees"
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </motion.div>
    )}
  </AnimatePresence>
);

export default React.memo(TransactionFilters);
