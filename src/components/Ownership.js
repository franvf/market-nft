import React, { Component } from 'react';
import Web3 from 'web3';
import NFT from '../abis/My_NFT.json'; //To connect tbe backend with the frontend we have to import the .json of our contrat
import axios from 'axios';

class ownership extends Component{
    async componentWillMount(){
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
        const networkId = 80001 //BSC testnet id
        const networkData = NFT.networks[networkId] //Get information about this network
        if(networkData){
            const abi = NFT.abi //Contract information
            const address = networkData.address //Contract address
            const contract = new web3.eth.Contract(abi, address) // Mount this contract ??
            this.setState({contract})
            this.setState({address: contract._address})
            this.loadMyNFTs()
        } else {
            window.alert("There are not SC deployed on network")
        }
    }

    async loadMyNFTs(){
        const data = await this.state.contract.methods.getMyItems().call({from: this.state.account})
        console.log(data)
        //Map unsold items
        const items = await Promise.all(data.map(async i =>{ //Go trhough all the elements in items, i is each item
            console.log(i)
            const tokenUri = await this.state.contract.methods.tokenURI(i.tokenId).call({from: this.state.account}) //Set the uri of actual item tokenId (struct variable)
            const meta = await axios.get(tokenUri)
            let item = { //Define NFT info
                tokenId: i.tokenId,
                owner: i.owner,
                amount: i.amount,
                property: i.property,
                image: meta.data.image,
            }
            return item
        }))
        this.setState({nfts: items})
        console.log(this.state.nfts)
    }

    constructor(props){
        super(props)
        this.state = {
            account: '',
            address: "",
            contract: null,
            isOwner: false,
            nfts: [],
        }
    }

    addItemToMakret = async(tokenId, price) => {
        try{
            await this.state.contract.methods.addToMarket(tokenId, price).send({from: this.state.account})
        } catch (err) {
            this.setState({errorMessage: err.message})
            console.log(this.state.errorMessage)
        } 
    }

    removeItemFromMakret = async(tokenId) => {
        try{
            await this.state.contract.methods.removeFromMarket(tokenId).send({from: this.state.account})
        } catch (err) {
            this.setState({errorMessage: err.message})
            console.log(this.state.errorMessage)
        } 
    }

    burnToken = async(tokenId) => {
        try{
            await this.state.contract.methods.burn(tokenId).send({from: this.state.account})
            window.location.href="./Form"
        } catch(err){
            this.setState({errorMessage: err.message})
            console.log(this.state.errorMessage)
        }
    }

    render(){
        return(
            <div>
            <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
              <a
                className="navbar-brand col-sm-3 col-md-2 mr-0"
                target="_blank"
                rel="noopener noreferrer"
              >
                DApp
              </a>
              <ul className="navbar-nav px-3"> 
                <li className = "nav-item text-nowrap d-none d-sm-none d-sm-block">
                  <small className="text-red"> 
                    <span id="account">{this.state.address} </span>
                  </small>
                </li>
              </ul>
            </nav>
                <div className="container-fluid mt-5">
                    <div className="row">
                        <main role="main" className="col-lg- d-flex text-center">
                            <div className="content mr-auto ml-auto">
                            {
                                this.state.nfts.map((nft, i)=> (
                                    <div key={i} className="border shadow rounded-xl overflow-hidden">
                                        <img src={nft.image} width="100" />
                                        <div className="p-4">
                                            <div style={{ height: '100' }}>
                                                <p className="text-gray-300">Token Id: {nft.tokenId}</p>
                                                <p className="text-gray-300">Amount: {nft.amount}</p>
                                                <p className="text-gray-300">Property: {nft.property}</p>
                                            </div>
                                            <form onSubmit={(event) => {
                                                event.preventDefault()
                                                const price = nft.price.value
                                                const web3 = window.web3
                                                const ethers = web3.utils.toWei(price, 'ether')
                                                this.addItemToMakret(nft.tokenId, ethers)
                                            }}>

                                                <input type="text" 
                                                className="form-control mb-1"
                                                placeholder="New Price"
                                                ref={(input) => nft.price = input} />

                                                <input type="submit"
                                                    className="bbtn btn-block btn-primary btn-sm"
                                                    value="Add item to market" />
                                            </form>
                                            <form onSubmit={(event) => {
                                                event.preventDefault()
                                                this.removeItemFromMakret(nft.tokenId)
                                            }}>

                                                <input type="submit"
                                                    className="bbtn btn-block btn-danger btn-sm"
                                                    value="Remove Item From Market" />
                                            </form>
                                            <form onSubmit={(event) => {
                                                event.preventDefault()
                                                this.burnToken(nft.tokenId)
                                            }}>

                                                <input type="submit"
                                                    className="bbtn btn-block btn-danger btn-sm"
                                                    value="Burn Item" />
                                            </form>
                                            
                                        </div>
                                    </div>
                                ))      
                            }                                
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        )
    }

}

export default ownership;