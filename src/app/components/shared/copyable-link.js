// Copyright (c) 2020 The Blocknet developers
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.
import PropTypes from 'prop-types';
import React from 'react';
import { selectAllInElement } from '../../util';
import { connect } from 'react-redux';
import Localize from '../shared/localize';

let CopyableLink = ({ children = '', className = '', hideButton = false, href = '', openExternalLinks = false, style = {} }) => {

  const { api } = window;

  const onTextClick = e => {
    e.preventDefault();
    if(openExternalLinks) {
      api.general_openUrl(href);
    } else {
      selectAllInElement(e.currentTarget, true);
    }
  };

  const onButtonClick = e => {
    e.preventDefault();
    api.general_setClipboard(href || children);
    window.getSelection().removeAllRanges();
    document.activeElement.blur();
  };

  return (
    <span className={`lw-copyable-link-container ${className}`} style={style}>
      <span className={'lw-copyable-link-text'} onClick={onTextClick}>{children}</span> {!hideButton ? <a href={'#'} className={'lw-copyable-link-button'} onClick={onButtonClick}><i title={Localize.text('Copy URL', 'copyable-link')} className={'fas fa-copy'} /></a> : null}
    </span>
  );
};
CopyableLink.propTypes = {
  children: PropTypes.string,
  className: PropTypes.string,
  hideButton: PropTypes.bool,
  href: PropTypes.string,
  openExternalLinks: PropTypes.bool,
  style: PropTypes.object,
  text: PropTypes.string,
};
CopyableLink = connect(
  ({ appState }) => ({
    openExternalLinks: appState.openExternalLinks
  })
)(CopyableLink);

export {
  CopyableLink
};
