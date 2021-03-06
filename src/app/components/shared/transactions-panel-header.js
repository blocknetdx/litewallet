// Copyright (c) 2020 The Blocknet developers
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect, useStore } from 'react-redux';
import * as appActions from '../../actions/app-actions';
import WalletController from '../../modules/wallet-controller-r';
import Wallet from '../../types/wallet-r';
import PanelFilters from './button-filters';
import FilterMenu from './filter-menu';
import { SquareButton } from './buttons';
import {activeViews, transactionFilters} from '../../constants';
import { publicPath } from '../../util/public-path-r';
import {walletSorter} from '../../util';
import {Map as IMap} from 'immutable';
import Localize from './localize';
import Spinner from './spinner';

let TransactionsPanelHeader = ({ selectedFilter, onTransactionFilter, walletController, wallets, balances, setActiveView, setActiveWallet, activeView, activeWallet, loadingTransactions }) => {

  const store = useStore();
  const [transactionFilter] = useState(selectedFilter || transactionFilters.all);
  const [filterMenuActive, setFilterMenuActive] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState(null);

  useEffect(() => {
    setSelectedTicker(activeWallet);
  }, [activeWallet]);

  const onRefreshButton = e => {
    e.preventDefault();
    const then = ticker => {
      walletController.dispatchBalances(appActions.setBalances, store);
      if (ticker)
        walletController.dispatchTransactionsTicker(ticker, appActions.setTransactions, store);
      else
        walletController.dispatchTransactions(appActions.setTransactions, store);
    };
    if(isCoinTransactions && wallet) {
      walletController.updateBalanceInfo(selectedTicker, true, 1000)
        .then(then);
    } else {
      walletController.updateAllBalancesStream(true, then);
    }
  };

  const onFilterButton = () => {
    setFilterMenuActive(!filterMenuActive);
  };

  const onFilterMenuClick = ticker => {
    setSelectedTicker(ticker);
    setFilterMenuActive(false);
    setActiveWallet(ticker);
    setActiveView(activeViews.COIN_TRANSACTIONS);
  };

  const isCoinTransactions = activeView === activeViews.COIN_TRANSACTIONS;
  const wallet = selectedTicker ? wallets.find(w => w.ticker === selectedTicker) : null;
  const headerTitle = isCoinTransactions && wallet ? Localize.text('Latest {{name}} Transactions', 'transactions-panel-header', {name: wallet.name}) : Localize.text('Latest Transactions', 'transactions-panel-header');

  return (
    <div className={'lw-transactions-panel-header'}>
      <div className={'lw-transactions-panel-header-title'}>
        <h1>{headerTitle}</h1>
        {loadingTransactions ?
          <span className={'lw-transactions-panel-refresh-button'}><Spinner doNotSpin={false} /> <span className={'lw-transactions-panel-refresh-button-label'}>{Localize.text('Loading transactions...', 'lw-transactions-panel-refresh-button')}</span></span>
          :
          <a href={'#'} onClick={onRefreshButton} className={'lw-transactions-panel-refresh-button'}><Spinner doNotSpin={true} /></a>
        }
      </div>
      <div className={'lw-transactions-panel-header-filters'}>
        <div className={'lw-transactions-panel-text'}>Show:</div>
        <PanelFilters
          selectedFilter={transactionFilters[transactionFilter.toLowerCase()]}
          filters={Object.values(transactionFilters).map(key => key)}
          onFilterSelected={onTransactionFilter}
        />
        {/*<SquareButton title={Localize.text('Filter', 'transactions-panel-header')} image={`${publicPath}/images/icons/icon-filter.svg`} active={filterMenuActive} onClick={onFilterButton} />*/}
      </div>
      {/*<FilterMenu*/}
      {/*  items={[...wallets]*/}
      {/*  .sort(walletSorter(balances))*/}
      {/*  .map(w => ({id: w.ticker, text: w.name, image: w.imagePath}))*/}
      {/*  }*/}
      {/*  active={filterMenuActive}*/}
      {/*  onClick={onFilterMenuClick}*/}
      {/*/>*/}
    </div>
  );
};

TransactionsPanelHeader.propTypes = {
  selectedFilter: PropTypes.string,
  onTransactionFilter: PropTypes.func,
  walletController: PropTypes.instanceOf(WalletController),
  wallets: PropTypes.arrayOf(PropTypes.instanceOf(Wallet)),
  balances: PropTypes.instanceOf(IMap),
  setActiveView: PropTypes.func,
  setActiveWallet: PropTypes.func,
  activeView: PropTypes.string,
  activeWallet: PropTypes.string,
  loadingTransactions: PropTypes.bool,
};

TransactionsPanelHeader = connect(
  ({ appState }) => ({
    activeView: appState.activeView,
    balances: appState.balances,
    wallets: appState.wallets,
    walletController: appState.walletController,
    activeWallet: appState.activeWallet,
    loadingTransactions: appState.loadingTransactions,
  }),
  dispatch => ({
    setActiveView: activeView => dispatch(appActions.setActiveView(activeView)),
    setActiveWallet: activeWallet => dispatch(appActions.setActiveWallet(activeWallet)),
  })
)(TransactionsPanelHeader);

export default TransactionsPanelHeader;
