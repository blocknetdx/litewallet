/* global after, before, beforeEach, describe, it, should */

import 'should';
import escapeRegExp from 'lodash/escapeRegExp';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

import CCWalletConf from '../src/app/types/ccwalletconf';
import CloudChains from '../src/server/modules/cloudchains';
import {DEFAULT_MASTER_PORT, platforms, ccBinDirs, ccBinNames} from '../src/app/constants';
import fakeExecFile from './fake-exec-file';
import FakeRPCController from './fake-rpc-controller';
import SimpleStorage from '../src/server/modules/storage';
import {storageKeys} from '../src/server/constants';

describe('CCWalletConf Test Suite', function() {
  const confDataBLOCK = {
    "rpcPassword": "test",
    "fee": 1.0E-4,
    "rpcUsername": "user",
    "rpcPort": 41414,
    "feeFlat": true,
    "rpcEnabled": true,
    "addressCount": 20
  };
  it('CCWalletConf()', function() {
    const ticker = 'BLOCK';
    const confBLOCK = new CCWalletConf(ticker, confDataBLOCK);
    confBLOCK.rpcPassword.should.be.equal('test');
    confBLOCK.fee.should.be.equal(1.0E-4);
    confBLOCK.rpcUsername.should.be.equal('user');
    confBLOCK.rpcPort.should.be.equal(41414);
    confBLOCK.feeFlat.should.be.equal(true);
    confBLOCK.rpcEnabled.should.be.equal(true);
    confBLOCK.addressCount.should.be.equal(20);
    confBLOCK.ticker().should.be.equal(ticker);
  });
});

describe('CloudChains Test Suite', function() {
  const tmp = path.join(os.tmpdir(), 'tests_cloudchains_test_suite');
  before(function() {
    if (fs.pathExistsSync(tmp))
      fs.removeSync(tmp);
    fs.mkdirSync(tmp);
  });

  const dir = path.join(tmp, 'CloudChains');
  const settingsDir = path.join(dir, 'settings');
  const ccFunc = () => { return dir; };
  const storage = new SimpleStorage(); // memory only

  it('CloudChains.constructor()', function() {
    const cc = new CloudChains(ccFunc, storage);
    cc.getCloudChainsDir().should.be.equal(dir);
    cc._cloudChainsDir.should.be.equal(dir);
    cc.getSettingsDir().should.be.equal(settingsDir);
    cc._cloudChainsSettingsDir.should.be.equal(settingsDir);
  });

  describe('CloudChains install directories', function() {
    beforeEach(function() {
      if (fs.pathExistsSync(dir))
        fs.removeSync(dir);
      storage.clear();
    });
    it('CloudChains.isInstalled()', function() {
      const cc = new CloudChains(ccFunc, storage);
      cc.isInstalled().should.be.false();
      cc.hasSettings().should.be.false();
      fs.mkdirpSync(settingsDir); // create directories outside app
      cc.isInstalled().should.be.true();
      cc.hasSettings().should.be.true();
    });
    it('CloudChains.getCloudChainsDir()', function() {
      fs.mkdirpSync(settingsDir); // create directories outside app
      const cc = new CloudChains(ccFunc, storage);
      cc.getCloudChainsDir().should.be.equal(dir);
    });
    it('CloudChains.getSettingsDir()', function() {
      fs.mkdirpSync(settingsDir); // create directories outside app
      const cc = new CloudChains(ccFunc, storage);
      cc.getCloudChainsDir().should.be.equal(dir);
    });
  });

  describe('CloudChains wallet confs', function() {
    const configMaster = path.join(settingsDir, 'config-master.json');
    const configBLOCK = path.join(settingsDir, 'config-BLOCK.json');
    const configBTC = path.join(settingsDir, 'config-BTC.json');
    beforeEach(function() {
      if (fs.pathExistsSync(settingsDir))
        fs.removeSync(settingsDir);
      fs.mkdirpSync(settingsDir);
      fs.writeFileSync(configMaster, JSON.stringify({
        "rpcPassword": "test",
        "fee": 1.0E-4,
        "rpcUsername": "user",
        "rpcPort": -1000,
        "feeFlat": true,
        "rpcEnabled": true,
        "addressCount": 20
      }));
      fs.writeFileSync(configBLOCK, JSON.stringify({
        "rpcPassword": "test",
        "fee": 1.0E-4,
        "rpcUsername": "user",
        "rpcPort": 41414,
        "feeFlat": true,
        "rpcEnabled": true,
        "addressCount": 20
      }));
      fs.writeFileSync(configBTC, JSON.stringify({
        "rpcPassword": "",
        "fee": 1.0E-4,
        "rpcUsername": "",
        "rpcPort": 8332,
        "feeFlat": true,
        "rpcEnabled": false,
        "addressCount": 20
      }));
      storage.clear();
    });

    it('CloudChains.getWalletConf()', function() {
      const cc = new CloudChains(ccFunc, storage);
      should.not.exist(cc.getWalletConf('missing'));
      cc.loadConfs().should.be.true();
      cc.getWalletConf('BLOCK').should.be.eql(new CCWalletConf('BLOCK', fs.readJsonSync(configBLOCK)));
    });
    it('CloudChains.getMasterConf()', function() {
      const cc = new CloudChains(ccFunc, storage);
      cc.loadConfs().should.be.true();
      cc.getMasterConf().should.be.eql(new CCWalletConf('master', fs.readJsonSync(configMaster)));
    });
    it('CloudChains.isWalletCreated()', function() {
      const cc = new CloudChains(ccFunc, storage);
      storage.setItem(storageKeys.PASSWORD, 'one_two_three');
      storage.setItem(storageKeys.SALT, 'one_two_three');
      storage.setItem(storageKeys.MNEMONIC, 'one_two_three');
      cc.isWalletCreated().should.be.true();
    });
    it('CloudChains.isWalletCreated() should fail on missing password', function() {
      const cc = new CloudChains(ccFunc, storage);
      storage.setItem(storageKeys.PASSWORD, null);
      storage.setItem(storageKeys.SALT, 'one_two_three');
      storage.setItem(storageKeys.MNEMONIC, 'one_two_three');
      cc.isWalletCreated().should.be.false();
    });
    it('CloudChains.isWalletCreated() should fail on missing password salt', function() {
      const cc = new CloudChains(ccFunc, storage);
      storage.setItem(storageKeys.PASSWORD, 'one_two_three');
      storage.setItem(storageKeys.SALT, null);
      storage.setItem(storageKeys.MNEMONIC, 'one_two_three');
      cc.isWalletCreated().should.be.false();
    });
    it('CloudChains.isWalletCreated() should fail on empty values', function() {
      const cc = new CloudChains(ccFunc, storage);
      storage.setItem(storageKeys.PASSWORD, '');
      storage.setItem(storageKeys.SALT, 'one_two_three');
      cc.isWalletCreated().should.be.false();
      storage.setItem(storageKeys.PASSWORD, 'one_two_three');
      storage.setItem(storageKeys.SALT, '');
      cc.isWalletCreated().should.be.false();
    });
    it('CloudChains.saveWalletCredentials()', function() {
      const cc = new CloudChains(ccFunc, storage);
      cc.saveWalletCredentials('a', 'b', 'c');
      storage.getItem(storageKeys.PASSWORD).should.be.equal('a');
      storage.getItem(storageKeys.SALT).should.be.equal('b');
      storage.getItem(storageKeys.MNEMONIC).should.be.equal('c');
    });
    it('CloudChains.getStoredPassword()', function() {
      const cc = new CloudChains(ccFunc, storage);
      storage.setItem(storageKeys.PASSWORD, 'one_two_three');
      cc.getStoredPassword().should.be.equal('one_two_three');
    });
    it('CloudChains.getStoredSalt()', function() {
      const cc = new CloudChains(ccFunc, storage);
      storage.setItem(storageKeys.SALT, 'one_two_three');
      cc.getStoredSalt().should.be.equal('one_two_three');
    });
    it('CloudChains.getStoredMnemonic()', function() {
      const cc = new CloudChains(ccFunc, storage);
      storage.setItem(storageKeys.MNEMONIC, 'one_two_three');
      cc.getStoredMnemonic().should.be.equal('one_two_three');
    });
    it('CloudChains.loadConfs()', function() {
      const cc = new CloudChains(ccFunc, storage);
      cc.loadConfs().should.be.true();
      cc.getWalletConfs().length.should.be.equal(2); // master conf should not be picked up here
      const masterConf = cc.getMasterConf();
      masterConf.ticker().should.be.equal('master'); // master conf should be valid
      masterConf.rpcPort.should.equal(DEFAULT_MASTER_PORT); // master conf should have correct port
    });
    it('CloudChains.checkUpdateMasterConf', function() {
      const ticker = 'master';
      const rpcEnabled = true;
      const rpcUsername = 'someusername';
      const rpcPassword = 'somepassword';
      const rpcPort = DEFAULT_MASTER_PORT;
      const goodConf = new CCWalletConf(ticker, {
        rpcEnabled,
        rpcUsername,
        rpcPassword,
        rpcPort
      });
      const badConfs = [
        new CCWalletConf(ticker, {
          rpcEnabled: false,
          rpcUsername,
          rpcPassword,
          rpcPort
        }),
        new CCWalletConf(ticker, {
          rpcEnabled,
          rpcUsername: '',
          rpcPassword,
          rpcPort
        }),
        new CCWalletConf(ticker, {
          rpcEnabled,
          rpcUsername,
          rpcPassword: '',
          rpcPort
        }),
        new CCWalletConf(ticker, {
          rpcEnabled,
          rpcUsername,
          rpcPassword,
          rpcPort: -1000
        })
      ];
      const cc = new CloudChains(ccFunc, storage);
      cc.checkUpdateMasterConf.should.be.a.Function();
      const returnedConf = cc.checkUpdateMasterConf(goodConf);
      // If conf is good, check that the same conf is returned
      returnedConf.should.equal(goodConf);
      for(const badConf of badConfs) {
        let savedTo = '';
        let savedData;
        const fakeWriteJsonSync = (filePath, data) => {
          savedTo = filePath;
          savedData = data;
        };
        const fakeFilePath = 'filepath';
        const fixedConf = cc.checkUpdateMasterConf(badConf, fakeFilePath, fakeWriteJsonSync);
        // Check that the conf is now valid
        fixedConf.should.not.equal(badConf);
        fixedConf.rpcEnabled.should.be.true();
        fixedConf.rpcUsername.length.should.be.greaterThan(0);
        fixedConf.rpcPassword.length.should.be.greaterThan(0);
        fixedConf.rpcPort.should.equal(DEFAULT_MASTER_PORT);
        // Check that writeJsonSync was called
        savedTo.should.equal(fakeFilePath);
        savedData.should.equal(fixedConf);
      }
    });
  });

  describe('CloudChains CLI methods', function() {
    beforeEach(function() {
      storage.clear();
    });

    const platformArr = Object
      .keys(platforms)
      .reduce((arr, key) => [...arr, platforms[key]], []);

    it('CloudChains.getCLIDir()', function() {
      const cc = new CloudChains(ccFunc, storage);
      cc.getCLIDir.should.be.a.Function();
      for(const platform of platformArr) {
        cc._platform = platform;
        const cliDir = cc.getCLIDir();
        // Check that the dir is a valid string
        cliDir.should.be.a.String();
        cliDir.length.should.be.greaterThan(0);
        // Check that the dir is platform-specific
        const platformNamePatt = new RegExp(escapeRegExp(ccBinDirs[platform]) + '$');
        platformNamePatt.test(cliDir).should.be.true();
      }
    });

    it('CloudChains.getCCSPVFilePath()', function() {
      const cc = new CloudChains(ccFunc, storage);
      cc.getCCSPVFilePath.should.be.a.Function();
      for(const platform of platformArr) {
        cc._platform = platform;
        const filePath = cc.getCCSPVFilePath();
        // Check that the dir is a valid string
        filePath.should.be.a.String();
        filePath.length.should.be.greaterThan(0);
        // Check that the file is platform-specific
        const platformNamePatt = new RegExp(escapeRegExp(ccBinNames[platform]));
        platformNamePatt.test(filePath).should.be.true();
      }
    });

    it('CloudChains.getCCSPVVersion()', async function() {
      const cc = new CloudChains(ccFunc, storage);
      const { execFile, mockErr, mockWrite, mockClose } = fakeExecFile();
      cc._execFile = execFile;
      cc.getCCSPVVersion.should.be.a.Function();
      const testVersion = '1.2.3';
      // If there is an error opening the CLI
      const versionWhenError = await new Promise((resolve, reject) => {
        cc.getCCSPVVersion()
          .then(resolve)
          .catch(reject);
        mockErr();
      });
      versionWhenError.should.equal('unknown');
      // If no version is outputted by the CLI
      const versionWhenNoOutput = await new Promise((resolve, reject) => {
        cc.getCCSPVVersion()
          .then(resolve)
          .catch(reject);
        mockClose();
      });
      versionWhenNoOutput.should.equal('');
      // If a version is outputted by the CLI
      const version = await new Promise((resolve, reject) => {
        cc.getCCSPVVersion()
          .then(resolve)
          .catch(reject);
        mockWrite(testVersion);
        mockClose();
      });
      version.should.equal(testVersion);
    });

    it('CloudChains.isWalletRPCRunning()', function() {
      const cc = new CloudChains(ccFunc, storage);
      cc.loadConfs();
      cc._rpc = new FakeRPCController();
      cc.isWalletRPCRunning().should.finally.be.true();
    });
    it('CloudChains.isWalletRPCRunning() should not be running without master conf', function() {
      const cc = new CloudChains(ccFunc, storage);
      cc._rpc = new FakeRPCController();
      cc.isWalletRPCRunning().should.finally.be.false();
    });
    it('CloudChains.isWalletRPCRunning() should not be running with bad rpc', function() {
      const cc = new CloudChains(ccFunc, storage);
      cc._rpc = new FakeRPCController();
      cc._rpc.ccHelp = null;
      cc.isWalletRPCRunning().should.finally.be.false();
    });

    it('CloudChains.spvIsRunning()', function() {
      const cc = new CloudChains(ccFunc, storage);
      cc.spvIsRunning.should.be.a.Function();

      {
        // If there was no child process started
        const running = cc.spvIsRunning();
        running.should.be.false();
      }

      {
        // If there was a child process started but it was closed
        const { execFile, mockExitCode } = fakeExecFile();
        cc._cli = execFile('somepath', [], () => {});
        mockExitCode(0);
        const running = cc.spvIsRunning();
        running.should.be.false();
      }

      {
        // If there was a child process started and it is still running
        const { execFile } = fakeExecFile();
        cc._cli = execFile('somepath', [], () => {});
        const running = cc.spvIsRunning();
        running.should.be.true();
      }
    });

    it('CloudChains.startSPV()', async function() {
      const cc = new CloudChains(ccFunc, storage);
      const { execFile, mockErr, mockWrite, mockClose } = fakeExecFile();
      cc._execFile = execFile;
      cc.startSPV.should.be.a.Function();
      const password = 'password';

      {
        // If there is an error opening the CLI
        const success = await new Promise((resolve, reject) => {
          cc.startSPV(password)
            .then(resolve)
            .catch(reject);
          mockErr();
        });
        success.should.be.false();
      }

      {
        // If the process closes
        const success = await new Promise((resolve, reject) => {
          cc.startSPV()
            .then(resolve)
            .catch(reject);
          mockClose();
        });
        success.should.be.false();
      }

      {
        // If the CLI successfully starts up without a password
        const success = await new Promise((resolve, reject) => {
          cc.startSPV()
            .then(resolve)
            .catch(reject);
          mockWrite('selection');
        });
        success.should.be.true();
      }

      {
        // If the CLI successfully starts up with a password
        const success = await new Promise((resolve, reject) => {
          cc.startSPV(password)
            .then(resolve)
            .catch(reject);
          mockWrite('master rpc server');
        });
        success.should.be.true();
      }

    });

    it('CloudChains.stopSPV()', function() {
      const cc = new CloudChains(ccFunc, storage);
      cc.stopSPV.should.be.a.Function();
      // If there is no running CLI process
      cc.stopSPV().should.be.false();
      // If there is a running CLI process
      const { execFile, wasKilled } = fakeExecFile();
      cc._cli = execFile('somepath', [], () => {});
      cc.stopSPV();
      wasKilled().should.be.true();
    });

    it('CloudChains.createSPVWallet()', async function() {
      const cc = new CloudChains(ccFunc, storage);
      const { execFile, mockErr, mockWrite, mockClose } = fakeExecFile();
      cc._execFile = execFile;
      cc.createSPVWallet.should.be.a.Function();
      const password = 'password';
      const testMnemonic = 'some mnemonic here';

      {
        // If there is an error opening the CLI
        const res = await new Promise((resolve, reject) => {
          cc.createSPVWallet(password)
            .then(resolve)
            .catch(reject);
          mockErr();
        });
        res.should.equal('');
      }

      {
        // If the wallet is not successfully created
        const res = await new Promise((resolve, reject) => {
          cc.createSPVWallet(password)
            .then(resolve)
            .catch(reject);
          mockClose();
        });
        res.should.equal('');
      }

      {
        // If the wallet is successfully created
        const res = await new Promise((resolve, reject) => {
          cc.createSPVWallet(password)
            .then(resolve)
            .catch(reject);
          mockWrite(`mnemonic = ${testMnemonic}`);
          mockClose();
        });
        res.should.equal(testMnemonic);
      }
    });

    it('CloudChains.enableAllWallets()', async function() {
      const cc = new CloudChains(ccFunc, storage);
      const { execFile, mockErr, mockWrite, mockClose } = fakeExecFile();
      cc._execFile = execFile;
      cc.enableAllWallets.should.be.a.Function();

      {
        // If there is an error opening the CLI
        const success = await new Promise((resolve, reject) => {
          cc.enableAllWallets()
            .then(resolve)
            .catch(reject);
          mockErr();
        });
        success.should.be.false();
      }

      {
        // If the process closes
        const success = await new Promise((resolve, reject) => {
          cc.enableAllWallets()
            .then(resolve)
            .catch(reject);
          mockClose();
        });
        success.should.be.false();
      }

      {
        // If the CLI successfully enables the wallets
        const success = await new Promise((resolve, reject) => {
          cc.enableAllWallets()
            .then(resolve)
            .catch(reject);
          mockWrite('selection');
        });
        success.should.be.true();
      }

    });

    it('CloudChains._isCLIAvailable()', function() {
      const cc = new CloudChains(ccFunc, storage);
      cc._cli = {};
      cc._isCLIAvailable().should.be.true();
      cc._cli = null;
      cc._isCLIAvailable().should.be.false();
    });

  });

  after(function() {
    if (fs.pathExistsSync(tmp))
      fs.removeSync(tmp);
  });
});