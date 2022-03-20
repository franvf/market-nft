import React, { Component } from 'react';
import Web3 from 'web3';
import NFT from '../abis/My_NFT.json'; //To connect tbe backend with the frontend we have to import the .json of our contrat

class creator extends Component {
    async componentDidMount(){
        await this.loadWeb3()
        await this.loadBlockchainData()
    }

    async loadWeb3(){
        if(window.ethereum){
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
        } else if(window.web3){
            window.web3 = Web3(window.web3.currentProvider)
        } else {
            window.alert("No metamask wallet available")
        }
    }

    async loadBlockchainData(){
        const web3 = window.web3
        //Load accounts
        const accounts = await web3.eth.getAccounts() //Get all the accounts in our metamask
        this.setState({account: accounts[0]}) //Current account
        const networkId = 1337 //BSC blockchain id
        const networkData = NFT.networks[networkId] //Get information about this network
        if(networkData){
            const abi = NFT.abi //Contract information
            const address = networkData.address //Contract address
            const contract = new web3.eth.Contract(abi, address) // Mount this contract ??
            this.setState({contract})
        } else {
            window.alert("There are not SC deployed on network")
        }
    }

    constructor(props){
        super(props)
        this.state = {
            account: "",
            contract: null,
            client: "",
            nfts: [],
            amount: 0,
            tokenId: 0,
            price: 0,
            errorMessage: "",
        }
    }


    createMarket = async(tokenId, amount, price) => { //The function parameters are NFT id, amout of it, and the price
        if(tokenId <= 0 || amount <= 0 || price <= 0) return //If some of this variables is empty don't do nothing
        try{
            //Call the function to mint items at the smart contract
            await this.state.contract.methods.mint(tokenId, amount, price).send({from: this.state.account})
            window.location.href="./" //Go to index page once item is minted
        } catch(err){
            console.log(err)
        }
    } 

     render (){
         return(
             <div className = "flex justify-center">
                 <div className = "w-1/2 flex flex-col pb-12">
                    <form onSubmit={(event) => {
                        event.preventDefault()
                        const tokenId = this.tokenId.value
                        const amount = this.amount.value
                        const price = this.price.value
                        const web3 = window.web3
                        const priceToWei = web3.utils.toWei(price, 'ether')
                        this.createMarket(tokenId, amount, priceToWei)
                    }}>

                        <input type="text"
                            className="form-control mb-1"
                            placeholder="TokenId"
                            ref={(input) => this.tokenId = input} />

                        <input type="text"
                            className="form-control mb-1"
                            placeholder='Amount'
                            ref={(input) => this.amount = input} />

                        <input type="text"
                            className="form-control mb-1"
                            placeholder='Price'
                            ref={(input) => this.price = input} />             

                        <input type="submit"
                            className='bbtn btn-block btn-danger btn-sm'
                            value="Create Item" />
                    </form>
                 </div>
             </div>
         )
     }
}

export default creator