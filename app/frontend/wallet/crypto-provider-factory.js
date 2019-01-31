const Cardano = require('./cardano-wallet')
const {ADALITE_CONFIG} = require('../config')
const {CRYPTO_PROVIDER} = require('./constants')
const derivationSchemes = require('./derivation-schemes')

const CryptoProviderFactory = (() => {
  const UnknownCryptoProviderError = (message) => {
    const error = new Error(message)
    error.name = 'UnknownCryptoProviderError'
    return error
  }

  const getWallet = async (cryptoProvider, secret) => {
    switch (cryptoProvider) {
      case CRYPTO_PROVIDER.TREZOR:
        return await Cardano.CardanoWallet({
          cryptoProvider: CRYPTO_PROVIDER.TREZOR,
          config: ADALITE_CONFIG,
          network: 'mainnet',
          derivationScheme: derivationSchemes.v2,
        })

      case CRYPTO_PROVIDER.LEDGER:
        return await Cardano.CardanoWallet({
          cryptoProvider: CRYPTO_PROVIDER.LEDGER,
          config: ADALITE_CONFIG,
          network: 'mainnet',
          derivationScheme: derivationSchemes.v2,
        })

      case CRYPTO_PROVIDER.WALLET_SECRET:
        secret = secret.trim()
        return await Cardano.CardanoWallet({
          cryptoProvider: CRYPTO_PROVIDER.WALLET_SECRET,
          mnemonicOrHdNodeString: secret,
          config: ADALITE_CONFIG,
          network: 'mainnet',
          derivationScheme: derivationSchemes.v1,
        })

      default:
        throw UnknownCryptoProviderError(cryptoProvider)
    }
  }

  return {
    getWallet,
  }
})()

module.exports = CryptoProviderFactory
