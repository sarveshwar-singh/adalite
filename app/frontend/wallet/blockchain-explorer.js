const request = require('./helpers/request')
const range = require('./helpers/range')
const NamedError = require('../helpers/NamedError')
const debugLog = require('../helpers/debugLog')
const hashCode = require('../helpers/hashCode')

const blockchainExplorer = (ADALITE_CONFIG, walletState) => {
  const state = Object.assign(walletState, {
    addressInfos: {},
  })
  const gapLimit = ADALITE_CONFIG.ADALITE_GAP_LIMIT

  async function getTxHistory(addresses) {
    const transactions = []

    const chunks = range(0, Math.ceil(addresses.length / gapLimit))
    const addressInfos = (await Promise.all(
      chunks.map(async (index) => {
        const beginIndex = index * gapLimit
        return await getAddressInfos(addresses.slice(beginIndex, beginIndex + gapLimit))
      })
    )).reduce(
      (acc, elem) => {
        return {
          caTxList: [...acc.caTxList, ...elem.caTxList],
        }
      },
      {caTxList: []}
    )

    addressInfos.caTxList.forEach((tx) => {
      transactions[tx.ctbId] = tx
    })

    for (const t of Object.values(transactions)) {
      let effect = 0 //effect on wallet balance accumulated
      for (const input of t.ctbInputs) {
        if (addresses.includes(input[0])) {
          effect -= +input[1].getCoin
        }
      }
      for (const output of t.ctbOutputs) {
        if (addresses.includes(output[0])) {
          effect += +output[1].getCoin
        }
      }
      t.effect = effect
      t.fee = t.ctbInputSum.getCoin - t.ctbOutputSum.getCoin
    }
    return Object.values(transactions).sort((a, b) => b.ctbTimeIssued - a.ctbTimeIssued)
  }

  async function fetchTxInfo(txHash) {
    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/txs/summary/${txHash}`
    const response = await request(url)

    return response.Right
  }

  async function fetchTxRaw(txId) {
    // eslint-disable-next-line no-undef
    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/txs/raw/${txId}`
    const result = await request(url)
    return Buffer.from(result.Right, 'hex')
  }

  async function getOverallTxCount(addresses) {
    return (await getTxHistory(addresses)).length
  }

  async function isSomeAddressUsed(addresses) {
    return (await getAddressInfos(addresses)).caTxNum > 0
  }

  async function getAddressInfos(addresses) {
    const hash = hashCode(JSON.stringify(addresses))
    const addressInfos = state.addressInfos[hash]
    const maxAddressInfoAge = 15000

    if (!addressInfos || Date.now() - addressInfos.timestamp > maxAddressInfoAge) {
      state.addressInfos[hash] = {
        timestamp: Date.now(),
        data: await fetchBulkAddressInfo(addresses),
      }
    }

    return state.addressInfos[hash].data
  }

  async function isAddressUsed(address) {
    const addressInfo = await getAddressInfo(address)

    return addressInfo.caTxNum > 0
  }

  function getAddressInfo(address) {
    const addressInfo = state.addressInfos[address]
    const maxAddressInfoAge = 15000

    if (!addressInfo || Date.now() - addressInfo.timestamp > maxAddressInfoAge) {
      state.addressInfos[address] = {
        timestamp: Date.now(),
        data: fetchAddressInfo(address),
      }
    }

    return state.addressInfos[address].data
  }

  async function getBalance(addresses) {
    const utxos = await fetchUnspentTxOutputs(addresses)
    const balance = utxos.reduce((acc, utxo) => acc + utxo.coins, 0)
    return balance
  }

  async function submitTxRaw(txHash, txBody) {
    const response = await request(
      `${ADALITE_CONFIG.ADALITE_SERVER_URL}/api/txs/submit`,
      'POST',
      JSON.stringify({
        txHash,
        txBody,
      }),
      {
        'Content-Type': 'application/json',
      }
    )

    if (!response.Right) {
      debugLog(`Unexpected tx submission response: ${response}`)
      throw NamedError('TransactionRejectedByNetwork')
    }

    return response.Right
  }

  async function fetchUnspentTxOutputs(addresses) {
    const chunks = range(0, Math.ceil(addresses.length / gapLimit))

    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/bulk/addresses/utxo`
    const response = (await Promise.all(
      chunks.map(async (index) => {
        const beginIndex = index * gapLimit
        const response = await request(
          url,
          'POST',
          JSON.stringify(addresses.slice(beginIndex, beginIndex + gapLimit)),
          {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        )
        return response.Right
      })
    )).reduce((acc, cur) => acc.concat(cur), [])

    return response.map((elem) => {
      return {
        txHash: elem.cuId,
        address: elem.cuAddress,
        coins: parseInt(elem.cuCoins.getCoin, 10),
        outputIndex: elem.cuOutIndex,
      }
    })
  }

  async function fetchAddressInfo(address) {
    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/addresses/summary/${address}`
    const result = await request(url)

    return result.Right
  }

  async function fetchBulkAddressInfo(addresses) {
    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/bulk/addresses/summary`
    const result = await request(url, 'POST', JSON.stringify(addresses), {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    })
    return result.Right
  }

  return {
    getTxHistory,
    fetchTxRaw,
    getOverallTxCount,
    fetchUnspentTxOutputs,
    isAddressUsed,
    isSomeAddressUsed,
    submitTxRaw,
    getBalance,
    fetchTxInfo,
  }
}

module.exports = blockchainExplorer
