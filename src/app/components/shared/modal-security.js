// Copyright (c) 2020 The Blocknet developers
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.
import Alert from '../../modules/alert';
import CloudChains from '../../modules/cloudchains-r';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Modal, ModalBody, ModalHeader } from './modal';
import Localize from './localize';
import * as appActions from '../../actions/app-actions';
import { Button } from './buttons';
import { LoginInput } from './inputs';
import { checkPassword } from '../../util';

const SecurityModal = ({ cloudChains, hideSecurityModal }) => {

  const [ hiddenOldPassword, setHiddenOldPassword ] = useState(true);
  const [ hidden, setHidden ] = useState(true);
  const [ oldPassword, setOldPassword ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ passwordRepeat, setPasswordRepeat ] = useState('');
  const [ processing, setProcessing ] = useState(false);

  const passwordsMatch = password && password === passwordRepeat;
  const [ totalScore ] = checkPassword(password);

  const passwordsGood = oldPassword !== '' && totalScore >= 9 && passwordsMatch;

  const onSubmit = async e => {
    e.preventDefault();

    if (!cloudChains) {
      const title = Localize.text('Issue', 'security modal');
      const msg = Localize.text('The CloudChains daemon is not ready', 'security modal');
      await Alert.error(title, msg);
      return;
    }
    try {
      if (!await cloudChains.changePassword(oldPassword, password)) {
        const title = Localize.text('Issue', 'security modal');
        const msg = Localize.text('Failed to change the password, is the CloudChains wallet daemon running?', 'security modal');
        await Alert.error(title, msg);
        return;
      }
    } catch (err) {
      await Alert.error(Localize.text('Issue', 'security modal'), Localize.text(err.message, 'security modal'));
      return;
    }

    hideSecurityModal();

    const title = Localize.text('Security', 'security modal');
    const msg = Localize.text('Password updated successfully. Mnemonic re-encrypted', 'security modal');
    await Alert.info(title, msg);
  };

  const styles = {
    buttonContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 50,
      marginBottom: 40
    },
    label: {
      marginTop: 10
    }
  };

  return (
    <Modal disableCloseOnOutsideClick={true} onClose={hideSecurityModal}>
      <ModalHeader><Localize context={'security-modal'}>Security</Localize></ModalHeader>
      <ModalBody>
        <form onSubmit={onSubmit}>
          <p><Localize context={'security-modal'}>Below, you can update your password. Your new password must include an uppercase character, a lowercase character, a number, a special character, and be at least eight characters long.</Localize></p>
          <label style={styles.label} className={'lw-color-secondary-6'}><Localize context={'security-modal'}>Please specify your current password</Localize>:</label>
          <LoginInput placeholder={Localize.text('Current password', 'login')}
                      className={'lw-color-secondary-10'}
                      autoFocus={true}
                      value={oldPassword}
                      type={'password'}
                      hidden={hiddenOldPassword}
                      setHidden={setHiddenOldPassword}
                      readOnly={processing}
                      onChange={setOldPassword} />
          <label style={styles.label} className={'lw-color-secondary-6'}><Localize context={'security-modal'}>Set new wallet password</Localize>:</label>
          <LoginInput placeholder={Localize.text('Enter password', 'login')}
                      className={'lw-color-secondary-10'}
                      value={password}
                      type={'password'}
                      hidden={hidden}
                      setHidden={setHidden}
                      readOnly={processing}
                      onChange={setPassword} />
          <label style={styles.label} className={'lw-color-secondary-6'}><Localize context={'security-modal'}>Confirm new password</Localize>:</label>
          <LoginInput placeholder={Localize.text('Repeat password', 'login')}
                      className={'lw-color-secondary-10'}
                      value={passwordRepeat}
                      type={'password'}
                      hidden={hidden}
                      readOnly={processing}
                      onChange={setPasswordRepeat} />
          <div style={styles.buttonContainer}>
            <Button disabled={!passwordsGood} type={'submit'}><Localize context={'backup-modal'}>Save changes</Localize></Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
};
SecurityModal.propTypes = {
  cloudChains: PropTypes.instanceOf(CloudChains),
  hideSecurityModal: PropTypes.func
};

export default connect(
  ({ appState }) => ({
    cloudChains: appState.cloudChains,
  }),
  dispatch => ({
    hideSecurityModal: () => dispatch(appActions.setShowSecurityModal(false))
  })
)(SecurityModal);
