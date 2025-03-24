export interface ICoin {
  symbol: string;
  margin: number;
  charges: number;
  name: string;
  address: string;
  network: string;
  transfer: boolean;
  deposit: boolean;
  withdraw: boolean;
  minWithdraw: number;
  minDeposit: number;
  conversionFee: number;
}

export const coinArray: ICoin[] = [
  {
    symbol: 'BTC',
    margin: 0,
    charges: 0.001,
    name: 'Bitcoin',
    address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
    network: 'Bitcoin',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 0.001,
    minDeposit: 0.0005,
    conversionFee: 0
  },
  {
    symbol: 'ETH',
    margin: 0,
    charges: 0.005,
    name: 'Ethereum',
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    network: 'Ethereum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 0.01,
    minDeposit: 0.005,
    conversionFee: 0
  },
  {
    symbol: 'SOL',
    margin: 2.5,
    charges: 0.0005,
    name: 'Solana',
    address: '4UUVXEKpz89zq4V9a8Q14c5461a3917321',
    network: 'Solana',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 0.1,
    minDeposit: 0.05,
    conversionFee: 0
  },
  {
    symbol: 'ATOM',
    margin: 0,
    charges: 0.0005,
    name: 'Cosmos',
    address: 'cosmos1qyu3aq85c49wvz8g6wz2q273l3c7k9922773xv',
    network: 'Cosmos',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 0.1,
    minDeposit: 0.05,
    conversionFee: 0
  },
  {
    symbol: 'XRP',
    margin: 0,
    charges: 0.0001,
    name: 'Ripple',
    address: 'rPmPErU9wHkFXaZ9XuSnwNQhXvGdB1zFgk',
    network: 'Ripple',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 10,
    minDeposit: 5,
    conversionFee: 0
  },
  {
    symbol: 'BCH',
    margin: 0,
    charges: 0.0005,
    name: 'Bitcoin Cash',
    address: 'bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a',
    network: 'Bitcoin Cash',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 0.01,
    minDeposit: 0.005,
    conversionFee: 0
  },
  {
    symbol: 'BNB',
    margin: 0,
    charges: 0.0001,
    name: 'Binance Coin',
    address: 'bnb1qyu3aq85c49wvz8g6wz2q273l3c7k9922773xv',
    network: 'Binance Smart Chain',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 0.1,
    minDeposit: 0.05,
    conversionFee: 0
  },
  {
    symbol: 'LTC',
    margin: 0,
    charges: 0.001,
    name: 'Litecoin',
    address: 'LZ5V7W9ZRKj67A3Qga8Ziwm3gy9gY3S7nD',
    network: 'Litecoin',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 0.1,
    minDeposit: 0.05,
    conversionFee: 0
  },
  {
    symbol: 'USDT',
    margin: 0,
    charges: 0.0001,
    name: 'Tether',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    network: 'Ethereum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 10,
    minDeposit: 5,
    conversionFee: 0
  },
  {
    symbol: 'ONT',
    margin: 0,
    charges: 0.0003,
    name: 'Ontology',
    address: 'AdTEWj33T9o1i2mz4gKbQbC4911bQk7y4n',
    network: 'Ontology',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 1,
    minDeposit: 0.5,
    conversionFee: 0
  },
  {
    symbol: 'TRX',
    margin: 0,
    charges: 0.0001,
    name: 'Tron',
    address: 'TQYy8M8739Q54v9a8Q14c5461a3917321',
    network: 'Tron',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 100,
    minDeposit: 50,
    conversionFee: 0
  },
  {
    symbol: 'WBTC',
    margin: 0,
    charges: 0.0005,
    name: 'Wrapped Bitcoin',
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    network: 'Ethereum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 0.001,
    minDeposit: 0.0005,
    conversionFee: 0
  },
  {
    symbol: 'LINK',
    margin: 0,
    charges: 0.0002,
    name: 'Chainlink',
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    network: 'Ethereum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 1,
    minDeposit: 0.5,
    conversionFee: 0
  },
  {
    symbol: 'BAT',
    margin: 0,
    charges: 0.0001,
    name: 'Basic Attention Token',
    address: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
    network: 'Ethereum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 10,
    minDeposit: 5,
    conversionFee: 0
  },
  {
    symbol: 'HOT',
    margin: 0,
    charges: 0.0001,
    name: 'Holochain',
    address: '0x492EB03010632Db66B2C438C7934338479B2162E',
    network: 'Ethereum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 1000,
    minDeposit: 500,
    conversionFee: 0
  },
  {
    symbol: 'DOGE',
    margin: 0,
    charges: 0.001,
    name: 'Dogecoin',
    address: 'DFsn839shn9sdn839nsdf98nsd98fn98nsdf98nsdf',
    network: 'Dogecoin',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 50,
    minDeposit: 25,
    conversionFee: 0
  },
  {
    symbol: 'FTM',
    margin: 0,
    charges: 0.0002,
    name: 'Fantom',
    address: '0x4e15361fd6b4bb609fa61880b90f6cd30c38d352',
    network: 'Fantom',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 10,
    minDeposit: 5,
    conversionFee: 0
  },
  {
    symbol: 'MATIC',
    margin: 0,
    charges: 0.0001,
    name: 'Polygon',
    address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
    network: 'Polygon',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 10,
    minDeposit: 5,
    conversionFee: 0
  },
  {
    symbol: 'GALA',
    margin: 0,
    charges: 0.0001,
    name: 'Gala',
    address: '0x07e5Ff063C48Cd80939D70b1F4331d145793C2F5',
    network: 'Ethereum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 100,
    minDeposit: 50,
    conversionFee: 0
  },
  {
    symbol: 'SHIB',
    margin: 0,
    charges: 0.0001,
    name: 'Shiba Inu',
    address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    network: 'Ethereum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 500000,
    minDeposit: 250000,
    conversionFee: 0
  },
  {
    symbol: 'ROSE',
    margin: 0,
    charges: 0.0002,
    name: 'Oasis Network',
    address: 'oasis1qyu3aq85c49wvz8g6wz2q273l3c7k9922773xv',
    network: 'Oasis',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 10,
    minDeposit: 5,
    conversionFee: 0
  },
  {
    symbol: 'CAKE',
    margin: 0,
    charges: 0.0003,
    name: 'PancakeSwap',
    address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    network: 'Binance Smart Chain',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 0.1,
    minDeposit: 0.05,
    conversionFee: 0
  },
  {
    symbol: 'YFI',
    margin: 0,
    charges: 0.0005,
    name: 'Yearn.finance',
    address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
    network: 'Ethereum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 0.001,
    minDeposit: 0.0005,
    conversionFee: 0
  },
  {
    symbol: 'SUSHI',
    margin: 0,
    charges: 0.0002,
    name: 'SushiSwap',
    address: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
    network: 'Ethereum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 1,
    minDeposit: 0.5,
    conversionFee: 0
  },
  {
    symbol: 'DYDX',
    margin: 0,
    charges: 0.0003,
    name: 'dYdX',
    address: '0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e',
    network: 'Ethereum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 1,
    minDeposit: 0.5,
    conversionFee: 0
  },
  {
    symbol: 'LUNA',
    margin: 0,
    charges: 0.0005,
    name: 'Terra',
    address: 'terra1qyu3aq85c49wvz8g6wz2q273l3c7k9922773xv',
    network: 'Terra',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 0.1,
    minDeposit: 0.05,
    conversionFee: 0
  },
  {
    symbol: '1INCH',
    margin: 0,
    charges: 0.0002,
    name: '1inch',
    address: '0x111111111117dC0aa78b770fA6A738034120C302',
    network: 'Ethereum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 1,
    minDeposit: 0.5,
    conversionFee: 0
  },
  {
    symbol: 'COMP',
    margin: 0,
    charges: 0.0003,
    name: 'Compound',
    address: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
    network: 'Ethereum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 0.1,
    minDeposit: 0.05,
    conversionFee: 0
  },
  {
    symbol: 'QNT',
    margin: 0,
    charges: 0.0005,
    name: 'Quant',
    address: '0x4Aba47a7f84C6F552443548c8Da81EE551146551',
    network: 'Ethereum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 0.01,
    minDeposit: 0.005,
    conversionFee: 0
  },
  {
    symbol: 'PAXG',
    margin: 0,
    charges: 0.0004,
    name: 'Pax Gold',
    address: '0x45804880De22913dAFE09f4980848ECE6EcbAf78',
    network: 'Ethereum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 0.01,
    minDeposit: 0.005,
    conversionFee: 0
  },
  {
    symbol: 'UNI',
    margin: 0,
    charges: 0.0002,
    name: 'Uniswap',
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    network: 'Ethereum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 1,
    minDeposit: 0.5,
    conversionFee: 0
  },
  {
    symbol: 'MKR',
    margin: 0,
    charges: 0.0005,
    name: 'Maker',
    address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
    network: 'Ethereum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 0.01,
    minDeposit: 0.005,
    conversionFee: 0
  },
  {
    symbol: 'ONE',
    margin: 0,
    charges: 0.0001,
    name: 'Harmony',
    address: 'one1qyu3aq85c49wvz8g6wz2q273l3c7k9922773xv',
    network: 'Harmony',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 10,
    minDeposit: 5,
    conversionFee: 0
  },
  {
    symbol: 'FLOW',
    margin: 0,
    charges: 0.0002,
    name: 'Flow',
    address: '0xe4475019c83df4050c7f956c5a12eb3ae1d840dd',
    network: 'Flow',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 1,
    minDeposit: 0.5,
    conversionFee: 0
  },
  {
    symbol: 'CELO',
    margin: 0,
    charges: 0.0003,
    name: 'Celo',
    address: '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9',
    network: 'Celo',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 1,
    minDeposit: 0.5,
    conversionFee: 0
  },
  {
    symbol: 'ADA',
    margin: 0,
    charges: 0.0001,
    name: 'Cardano',
    address:
      'addr1q90dpsg4alqvmfl8w7mz3g7h658x2e5q357952x966jmtz7qkz63xq46777q447y7896632y9g720z986',
    network: 'Cardano',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 1,
    minDeposit: 0.5,
    conversionFee: 0
  },
  {
    symbol: 'RDNT',
    margin: 0,
    charges: 0.0001,
    name: 'Radiant',
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    network: 'Ethereum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 10,
    minDeposit: 5,
    conversionFee: 0
  },
  {
    symbol: 'VET',
    margin: 0,
    charges: 0.0001,
    name: 'VeChain',
    address: '0x471ece3750da237f93b8e339c536989b8979a4ce',
    network: 'VeChain',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 100,
    minDeposit: 50,
    conversionFee: 0
  },
  {
    symbol: 'EGLD',
    margin: 0,
    charges: 0.0005,
    name: 'Elrond',
    address: 'erd1qyu3aq85c49wvz8g6wz2q273l3c7k9922773xv',
    network: 'Elrond',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 0.1,
    minDeposit: 50,
    conversionFee: 0
  },
  {
    symbol: 'ALGO',
    margin: 0,
    charges: 0.0002,
    name: 'Algorand',
    address: 'algo1qyu3aq85c49wvz8g6wz2q273l3c7k9922773xv',
    network: 'Algorand',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 10,
    minDeposit: 5,
    conversionFee: 0
  },
  {
    symbol: 'USDC',
    margin: 0,
    charges: 0.0001,
    name: 'USD Coin',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606EB48',
    network: 'Ethereum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 10,
    minDeposit: 5,
    conversionFee: 0
  },
  {
    symbol: 'XLM',
    margin: 0,
    charges: 0.00001,
    name: 'Stellar',
    address: 'GDRXE2BQUC3AZJXQJNRXJ5ZLSRLYKVO2GQ53FQ2K4DKF6UWDJCVJFP7J',
    network: 'Stellar',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 10,
    minDeposit: 5,
    conversionFee: 0
  },
  {
    symbol: 'WAVES',
    margin: 0,
    charges: 0.0002,
    name: 'Waves',
    address: '3P93JTi7mNz7wE1b4mNHhNuykN21Qy7ru4v',
    network: 'Waves',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 5,
    minDeposit: 2.5,
    conversionFee: 0
  },
  {
    symbol: 'FLM',
    margin: 0,
    charges: 0.0001,
    name: 'Flamingo',
    address: '0x2D5d83EC756D7Bea79E05e3f198b4000FEc3FC53',
    network: 'Ethereum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 10,
    minDeposit: 5,
    conversionFee: 0
  },
  {
    symbol: 'ONDO',
    margin: 0,
    charges: 0.0002,
    name: 'Ondo',
    address: '0x814eb9504f58B63A924F7D50fA95dB5fE1B1bB20',
    network: 'Ethereum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 10,
    minDeposit: 5,
    conversionFee: 0
  },
  {
    symbol: 'ZEN',
    margin: 0,
    charges: 0.0003,
    name: 'Horizen',
    address: 'znUi9F34jJ6NdZ9R8eZDP3Qfj3S5E9yEotJ',
    network: 'Horizen',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 0.1,
    minDeposit: 0.05,
    conversionFee: 0
  },
  {
    symbol: 'SAND',
    margin: 0,
    charges: 0.0001,
    name: 'The Sandbox',
    address: '0x3845badAde8e6dFF049820680d1F14bEEd3673d1',
    network: 'Ethereum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 5,
    minDeposit: 2.5,
    conversionFee: 0
  },
  {
    symbol: 'BUSD',
    margin: 0,
    charges: 0.0001,
    name: 'Binance USD',
    address: '0x4fabb145d64652a948d72533023f6e7a623c7c53',
    network: 'Binance Smart Chain',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 10,
    minDeposit: 5,
    conversionFee: 0
  },
  {
    symbol: 'ARB',
    margin: 0,
    charges: 0.0002,
    name: 'Arbitrum',
    address: '0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1',
    network: 'Arbitrum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 1,
    minDeposit: 0.5,
    conversionFee: 0
  },
  {
    symbol: 'SNX',
    margin: 0,
    charges: 0.0003,
    name: 'Synthetix',
    address: '0xC011A72400E58ecD99Ee497CF89E3775d4bd732F',
    network: 'Ethereum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 1,
    minDeposit: 0.5,
    conversionFee: 0
  },
  {
    symbol: 'TUSD',
    margin: 0,
    charges: 0.0001,
    name: 'TrueUSD',
    address: '0x0000000000085d4780B73119b644AE5ecd22b376',
    network: 'Ethereum',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 10,
    minDeposit: 5,
    conversionFee: 0
  },
  {
    symbol: 'NEO',
    margin: 0,
    charges: 0.0001,
    name: 'Neo',
    address: 'ARrXDE55K7gqBnu9tZ93iNjfFz5o6QLjoD',
    network: 'Neo',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 1,
    minDeposit: 0.5,
    conversionFee: 0
  },
  {
    symbol: 'APT',
    margin: 0,
    charges: 0.0003,
    name: 'Aptos',
    address: '0x1A3f337D85F1CFCd7B10D3eD1D42cFaAFc5fCdd1',
    network: 'Aptos',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 1,
    minDeposit: 0.5,
    conversionFee: 0
  },
  {
    symbol: 'FIL',
    margin: 0,
    charges: 0.0005,
    name: 'Filecoin',
    address: 'f1qyu3aq85c49wvz8g6wz2q273l3c7k9922773xv',
    network: 'Filecoin',
    transfer: true,
    deposit: true,
    withdraw: true,
    minWithdraw: 0.1,
    minDeposit: 0.05,
    conversionFee: 0
  },
];