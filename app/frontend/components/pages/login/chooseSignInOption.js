const {h, Component} = require('preact')

const Card = require('../../common/card')
const SignInOptions = require('./signInOptions')

class ChooseSignInOption extends Component {
  render() {
    return h(
      Card,
      {},
      h(
        'div',
        {class: 'choose-sign-in-option'},
        h(
          'div',
          {},
          h('h2', {}, 'How do you want to access '),
          h('h2', {}, 'your Cardano Wallet?')
        ),
        h('div', {}, h(SignInOptions))
      )
    )
  }
}

module.exports = ChooseSignInOption
