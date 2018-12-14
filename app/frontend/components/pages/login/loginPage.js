const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const {getTranslation} = require('../../../translations')

const AboutOverlay = require('./aboutOverlay')
const KeyFileAuth = require('./keyFileAuth')
const MnemonicAuth = require('./mnemonicAuth')
const HardwareAuth = require('./hardwareAuth')
const DemoWalletWarningDialog = require('./demoWalletWarningDialog')
const GenerateMnemonicDialog = require('./generateMnemonicDialog')
const LogoutNotification = require('./logoutNotification')
const ChooseSignInOption = require('./chooseSignInOption')
const Card = require('../../common/card')

const MnemonicDescription = () =>
  h(
    'div',
    {},
    'Encrypted key file is not the most secure access method. For enhanced security, we recommend you to use a ',
    h('a', {}, 'hardware walet'),
    '.',
  )

const UseHardwareWalletDescription = (mainText) =>
  h(
    'div',
    {},
    h('div', {}, mainText),
    h(
      'a',
      {
        href: 'https://github.com/vacuumlabs/adalite/wiki/AdaLite-FAQ#hardware-wallets',
      },
      'What is a Hardware Wallet',
    ),
    h('a', {href: 'https://wiki.trezor.io/Cardano_(ADA)'}, 'How to use Trezor T with AdaLite'),
    h(
      'div',
      {},
      'If you want to purchase Trezor, please consider supporting us by using our ',
      h('a', {href: 'https://shop.trezor.io/?offer_id=10&aff_id=1071'}, 'affiliate link'),
      '.',
    ),
  )

const NoAuthSelectedDescription = () =>
  UseHardwareWalletDescription(
    'AdaLite supports 3 means of accessing your wallet. For enhanced security, we recommend you to use a hardware wallet.',
  )

const HardwareWalletDescription = () =>
  UseHardwareWalletDescription(
    'Hardware Wallet is the recommended method to access your wallet. Hardware wallets provide the best security level for storing your cryptocurrencies.',
  )

class LoginPage extends Component {
  render({
    loadWallet,
    walletLoadingError,
    authMethod,
    setAuthMethod,
    enableTrezor,
    showDemoWalletWarningDialog,
    logoutNotificationOpen,
    displayAboutOverlay,
    showGenerateMnemonicDialog,
  }) {
    return h(
      'div',
      {class: 'intro'},
      h(
        'div',
        {class: 'sign-in-option-wrapper'},
        !authMethod && h(ChooseSignInOption),
        !!authMethod &&
          h(Card, {
            activeTab: authMethod,
            onTabChange: setAuthMethod,
            tabs: [
              {key: 'mnemonic', name: 'Mnemonic', content: h(MnemonicAuth)},
              {
                key: 'trezor',
                name: 'Hardware Wallet',
                content: h(HardwareAuth, {enableTrezor, loadWallet}),
              },
              {key: 'file', name: 'Key file', content: h(KeyFileAuth)},
            ],
          }),
        displayAboutOverlay && h(AboutOverlay),
        showDemoWalletWarningDialog && h(DemoWalletWarningDialog),
        logoutNotificationOpen && h(LogoutNotification),
      ),
      h(
        'div',
        {class: 'sign-in-option-description'},
        !authMethod && h(NoAuthSelectedDescription, {}),
        authMethod === 'mnemonic' && h(MnemonicDescription, {}),
        authMethod === 'trezor' && h(HardwareWalletDescription, {}),
        authMethod === 'file' && h(MnemonicDescription, {}),
      ),
    )
  }
}

// class LoginPage extends Component {
//   render({
//     loadWallet,
//     walletLoadingError,
//     authMethod,
//     setAuthMethod,
//     enableTrezor,
//     showDemoWalletWarningDialog,
//     logoutNotificationOpen,
//     displayAboutOverlay
//   }) {
//
//         walletLoadingError &&
//           h(
//             'p',
//             {class: 'alert error'},
//             getTranslation(walletLoadingError.code, walletLoadingError.params)
//           ),
//       ),
//       displayAboutOverlay && h(AboutOverlay),
//       showDemoWalletWarningDialog && h(DemoWalletWarningDialog),
//       logoutNotificationOpen && h(LogoutNotification)
//     )
//   }
// }

module.exports = connect(
  (state) => ({
    authMethod: state.authMethod,
    enableTrezor: state.enableTrezor,
    showDemoWalletWarningDialog: state.showDemoWalletWarningDialog,
    logoutNotificationOpen: state.logoutNotificationOpen,
    walletLoadingError: state.walletLoadingError,
    displayAboutOverlay: state.displayAboutOverlay,
    showGenerateMnemonicDialog: state.showGenerateMnemonicDialog,
  }),
  actions,
)(LoginPage)
