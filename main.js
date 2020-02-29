const {Blockchain,Transaction,Block} = require('./blockchain');

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const myKey =  ec.keyFromPrivate('2202ad745ed21e9aebd20efe03bdb858e794ae6c7b759ebf445cf16c084b2d49');
const myWalletAddress = myKey.getPublic('hex');


 let savjeeCoin =  new Blockchain();

 const tx1=  new Transaction(myWalletAddress,'public key goes here',20);
 tx1.signTransaction(myKey);
 savjeeCoin.addTransaction(tx1);

 console.log("\n Starting The Miner....");
 savjeeCoin.minePendingTransactions(myWalletAddress);

//  savjeeCoin.chain[1].transactions[0].amount =1;

 console.log("Balance:" + savjeeCoin.getBalanceOfAddress(myWalletAddress));

 console.log('IS chain Valid?' ,savjeeCoin.isChainValid());












