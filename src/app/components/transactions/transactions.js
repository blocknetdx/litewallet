import PropTypes from 'prop-types';
import React from 'react';
import Balance from '../shared/balance';
import { activeViews } from '../../constants';
import TransactionsPanel from '../shared/transactions-panel';

const Transactions = ({ activeView }) => {

  const coinSpecificTransactions = activeView === activeViews.COIN_TRANSACTIONS;

  return (
    <div className={'lw-transactions-container'}>
      <Balance showCoinDetails={coinSpecificTransactions} />

      <TransactionsPanel selectable={true} coinSpecificTransactions={coinSpecificTransactions} />

    </div>
  );
};
Transactions.propTypes = {
  activeView: PropTypes.string
};

export default Transactions;
