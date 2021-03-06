// Copyright (c) 2020 The Blocknet developers
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.
import RPCTransaction from '../types/rpc-transaction';

import Dexie from 'dexie';

/**
 * Litewallet renderer db.
 */
class LWDB extends Dexie {
  /**
   * @type {Dexie.Table}
   */
  transactions = null;

  /**
   * Constructor. Setup db, tables, and indexes.
   */
  constructor(dbname) {
    super(dbname);
    // Increment version on edits: https://dexie.org/docs/Tutorial/Design#database-versioning
    this.version(1).stores({
      transactions: '[txId+n+category],[ticker+time+category],ticker,time,address',
    });
    this.transactions = this.table('transactions');
    this.transactions.mapToClass(RPCTransaction);
  }

  /**
   * Clears all data.
   * @returns {Promise}
   */
  async clear() {
    const all = [];
    for (const table of this.tables)
      all.push(table.clear());
    return Promise.all(all);
  }
}

export default LWDB;
