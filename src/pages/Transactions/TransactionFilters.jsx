// src/pages/Transactions/TransactionFilters.jsx

import { AnimatePresence, motion } from "framer-motion";

import MySelect from "../../components/Select/MySelect";
import React from "react";

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
        <MySelect
          isMulti
          options={categoryOptions}
          value={selectedCategories}
          onChange={onCategoryChange}
          placeholder="Filter by Categories"
          isSearchable={true}
        />
        <MySelect
          isMulti
          options={payeeOptions}
          value={selectedPayees}
          onChange={onPayeeChange}
          placeholder="Filter by Payees"
          isSearchable={true}
        />
      </motion.div>
    )}
  </AnimatePresence>
);

export default React.memo(TransactionFilters);
