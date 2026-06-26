// src/pages/Transactions/TransactionControls.jsx

import React from "react";
import Button from "../../components/Button/Button";
import { IoIosAddCircle, IoIosFunnel, IoIosSearch } from "react-icons/io";
import { useMediaQuery } from "react-responsive";

const TransactionControls = ({
  onSearchToggle,
  showSearch,
  onFilterToggle,
  showFilters,
  onAddTransaction,
}) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <div className="transaction-controls">
      <div className="left-buttons">
        <Button
          icon={<IoIosSearch />}
          text={isMobile ? null : "Search Transactions"}
          variant="primary"
          onClick={onSearchToggle}
          ariaLabel="Toggle search"
        />
        <Button
          icon={<IoIosFunnel />}
          text={isMobile ? null : "Filter Transactions"}
          variant="primary"
          onClick={onFilterToggle}
          ariaLabel="Toggle filters"
        />
      </div>
      <div className="right-button">
        <Button
          icon={<IoIosAddCircle />}
          text={isMobile ? null : "Add Transaction"}
          variant="primary"
          onClick={onAddTransaction}
          ariaLabel="Add transaction"
        />
      </div>
    </div>
  );
};

export default React.memo(TransactionControls);
