const SHA256 = require('crypto-js/sha256'); 
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
class Transaction{
    constructor(fromAddress, toAddress, amount)
    {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !==  this.fromAddress){
            throw new Error ('You cannot sign transactions from other wallets!!');
        }

        const hashTx = this.calculateHash();
        const sig =  signingKey.sign(hashTx,'base64');
        this.signature= sig.toDER('hex');

    }

    isValid(){
        if(this.fromAddress === null) return true;

        if(!this.signature || this.signature.length === 0){
            throw new Error("No signature in this transaction");
        }

        const publicKey = ec.keyFromPublic(this.fromAddress,'hex');
        return publicKey.verify(this.calculateHash(),this.signature);
    }
}
class Block{
    constructor(timestamp, transactions , previoushash= '')
    {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previoushash = previoushash;
        this.hash = this.calculateHash();
        this.nonce =0;
    }
    calculateHash()
    {
        return SHA256(this.index + this.previoushash +  this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }
    mineBlock(difficulty)
    {
        while(this.hash.substring(0,difficulty) !==  Array(difficulty +1 ).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block Mined:" + this.hash);
    }


    hashValidTransaction(){
        for(const tx of this.transactions)
        {
                if(!tx.isValid()){
                    return false;
                }
        }
        return true;
    }
}

class Blockchain
{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty =2;
        this.pendingTransacions = [];
        this.miningReward= 100;
    }
     createGenesisBlock(){
        return new Block("01/01/2017","Genesis Block","0");
     }
    
     getLatestBlock(){
       return this.chain[this.chain.length - 1]; 
     }


    minePendingTransactions(miningRewardAddress){
        
        const rewardTx =new  Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransacions.push(rewardTx);
        let block = new Block(Date.now,this.pendingTransacions,this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);
        console.log("Block Successfully Mined!!");
        this.chain.push(block);

        this.pendingTransacions = [
           new Transaction(null,miningRewardAddress,this.miningReward)
        ];

    }

    addTransaction(transaction){
        if(!transaction.fromAddress || !transaction.toAddress)
        {
            throw new Error('Transaction must inlcude from and to  Adresss');
        }

        if(!transaction.isValid())
        {
            throw new Error('Cannot add invalid transaction to chain');
        }

        if(transaction.amount <= 0)
        {
                throw new Error('Transaction Amount must be higher than 0');
        }
          
        // Making sure that the amount sent is not greater than existing balance
        // if (this.getBalanceOfAddress(transaction.fromAddress) < transaction.amount) {
        //     throw new Error('Not enough balance');
        // }
        this.pendingTransacions.push(transaction);
    }

    getBalanceOfAddress(address){
        let balance =0;
        for(const block of this.chain){
            for(const  trans of block.transactions){
                if(trans.fromAddress === address)
                {
                    balance -= trans.amount;

                }

                if(trans.toAddress === address)
                {
                    balance+= trans.amount;
                    
                }
            }
        }
        return balance;
    }

     isChainValid(){
         for(let i=1;i<this.chain.length;i++)
        {
             const currentBlock  = this.chain[i];
             const previousBlock = this.chain[i-1];

             if(!currentBlock.hashValidTransaction()){
                 return false;
             }

             if(currentBlock.hash !== currentBlock.calculateHash()){
                 return false;
             }
             if(currentBlock.previoushash !== previousBlock.hash){
                 return false;
             }

        }
        return true;
     }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction= Transaction;
module.exports.Block = Block;