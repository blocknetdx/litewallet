import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import { Modal, ModalBody, ModalHeader } from './modal';
import Localize from './localize';
import * as appActions from '../../actions/app-actions';

const AboutModal = ({ xVaultVersion, ccVersion, hideAboutModal }) => {

  const styles = {
    paragraph: {
      textAlign: 'center',
      paddingLeft: 20,
      paddingRight: 20
    }
  };

  return (
    <Modal onClose={hideAboutModal}>
      <ModalHeader><Localize context={'receive-modal'}>About</Localize></ModalHeader>
      <ModalBody>
        <p style={styles.paragraph}>{Localize.text('XVault v{{version}}', 'aboutModal', {version: xVaultVersion})}</p>
        <p style={styles.paragraph}>{Localize.text('Cloudchains-SPV {{version}}', 'aboutModal', {version: ccVersion})}</p>
        <p style={styles.paragraph}>{Localize.text('Copyright © {{year}} The Blocknet Developers', 'aboutModal', {year: new Date().getFullYear()})}</p>
        <p style={styles.paragraph}>{Localize.text('Learn more at blocknet.co', 'aboutModal')}</p>
      </ModalBody>
    </Modal>
  );
};
AboutModal.propTypes = {
  xVaultVersion: PropTypes.string,
  ccVersion: PropTypes.string,
  hideAboutModal: PropTypes.func
};

export default connect(
  ({ appState }) => ({
    xVaultVersion: appState.xVaultVersion,
    ccVersion: appState.ccVersion
  }),
  dispatch => ({
    hideAboutModal: () => dispatch(appActions.setShowAboutModal(false))
  })
)(AboutModal);