const {h} = require('preact')
const {CRYPTO_PROVIDER} = require('../../../wallet/constants')

const LoadByHardwareWalletSection = ({loadWallet}) => {
  const TrezorAffiliateLink = (title) =>
    h('a', {href: 'https://shop.trezor.io/?offer_id=10&aff_id=1071', target: 'blank'}, title)

  const isWebusbSupported = navigator.usb !== undefined

  return h(
    'div',
    {class: 'auth-section'},
    h(
      'div',
      undefined,
      'Hardware wallets provide the best security level for storing your cryptocurrencies.'
    ),
    h(
      'div',
      undefined,
      h(
        'div',
        {class: 'margin-top'},
        'AdaLite supports Trezor model T (firmware version >= 2.0.8).'
      ),
      h(
        'div',
        {class: 'centered-row margin-top'},
        h(
          'button',
          {
            onClick: () => loadWallet({cryptoProvider: CRYPTO_PROVIDER.TREZOR}),
          },
          h(
            'div',
            undefined,
            h('span', undefined, 'use '),
            h('span', {class: 'hw-wallet-btn-text'}, 'TREZOR')
          )
        ),
        h(
          'button',
          {
            onClick: () => loadWallet({cryptoProvider: CRYPTO_PROVIDER.LEDGER}),
            disabled: !isWebusbSupported,
          },
          h(
            'div',
            undefined,
            h('span', undefined, 'use '),
            h('span', {class: 'hw-wallet-btn-text'}, 'LEDGER')
          )
        )
      ),
      h(
        'div',
        {class: 'margin-top'},
        'You can support us by purchasing Trezor using our affiliate ',
        TrezorAffiliateLink('link'),
        '.'
      )
    )
  )
}

module.exports = LoadByHardwareWalletSection
