const {h, Component} = require('preact')
const connect = require('unistore/preact').connect

const actions = require('../../../actions')

const Token = ({icon, text}) => h('span', {}, h('span', {}, icon), h('span', {}, text))

const SignInOption = ({token, icon, name, text, onClick}) =>
  h(
    'div',
    {class: 'sign-in-option', onClick},
    h(
      'div',
      {},
      token && h(Token, {...token}),
      h('div', {}, icon),
      h('h4', {}, name),
      h('div', {}, text)
    )
  )

class SignInOptions extends Component {
  render({onChoose, setAuthMethod}) {
    return h(
      'div',
      {class: 'sign-in-options'},
      h(SignInOption, {
        onClick: () => setAuthMethod('mnemonic'),
        token: {icon: 'S', text: 'fastest'},
        icon: 'a',
        name: 'Mnemonic',
        text: '12 or 27 word passphrase',
      }),
      h(SignInOption, {
        onClick: () => setAuthMethod('trezor'),
        token: {icon: 'V', text: 'recommended'},
        icon: 'b',
        name: 'Hardware Wallet',
        text: 'Supporting Trezor T',
      }),
      h(SignInOption, {
        onClick: () => setAuthMethod('file'),
        icon: 'c',
        name: 'Key file',
        text: 'Encrypted .JSON file',
      })
    )
  }
}

module.exports = connect(
  {},
  actions
)(SignInOptions)
