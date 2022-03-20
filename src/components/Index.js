import React, { Component } from 'react';
import Web3 from 'web3';
import NFT from '../abis/My_NFT.json'; //To connect the backend with the frontend we have to import the contract abi file
import axios from 'axios';

class index extends Component{
    
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
        const web3 = window.web3 //Create web3 object

        const accounts = await web3.eth.getAccounts() //Get all the accounts in our metamask
        this.setState({account: accounts[0]}) //Current account
        const networkId = 1337 //Id of network in use (Default network)
        const networkData = NFT.networks[networkId] //Get information about this network
        if(networkData){
            const abi = NFT.abi //Contract information
            const address = networkData.address //Contract address
            const contract = new web3.eth.Contract(abi, address) // Get the contract
            this.setState({contract}) //Store the contract in global variable
            console.log(contract) //Display in cosole the contract info 
            this.setState({address: contract._address}) //Store the address where the contract is deployed
            this.loadNFTs() //Call function loadNFTs
        } else {
            window.alert("There are not SC deployed on network")
        }
    }

    async loadNFTs(){
        const data = await this.state.contract.methods.getItemsOnSale().call({from: this.state.account})
        console.log(data)
        //Map unsold items
        const items = await Promise.all(data.map(async i =>{ //Go trhough all the elements in items, i is each item
            const tokenUri = await this.state.contract.methods.uri(i.tokenId).call() //Get the uri of actual item tokenId (struct variable)
            const meta = await axios.get(tokenUri) //Get the information in metadata files
            let item = { //Define the info of our NFT
                tokenId: i.tokenId, //NFT id stored in the item struct
                owner: i.owner, //NFT owner stored in item struct
                amount: i.amount, //Amount of items stored in item struct
                property: meta.data.attributes[0].trait_type, //Property stored in metadata file
                price: i.price, //Price stored in item struct
                image: meta.data.image, //Image stored in metadata file
            } 
            return item //Get each item
        }))
        this.setState({nfts: items}) //Store in nfts array all items
        console.log(this.state.nfts) //Show in console the array
    }

    constructor(props){
        super(props)
        this.state = {
            account: '',
            address: "",
            contract: null,
            nfts: [],
        }
    }

    buyNft = async(nft) => { //The nft is the argument of this function
        const tokenId = nft.tokenId //Get the NFT id
        const price = nft.price //Get the NFT price
        try{
            //Call the function buyNft from the smart contract with the id to buy.
            //Send this call from the current account and send the price as value
            await this.state.contract.methods.buyNft(tokenId).send({from: this.state.account, value: price})
            window.location.href="./" //Once the item is bought return to the main page.
        } catch(err){
            console.log(err) //If an error occurs show it in the console
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
                                                <p className="text-gray-300">Owner: {nft.owner}</p>
                                                <p className="text-gray-300">Amount: {nft.amount}</p>
                                                <p className="text-gray-300">Property: {nft.property}</p>
                                                <p className="text-gray-300">Price: {window.web3.utils.fromWei(nft.price, 'ether')} ether</p>
                                            </div>
                                            <form onSubmit={(event) => {
                                                event.preventDefault()
                                                this.buyNft(nft)
                                            }}>

                                                <input type="submit"
                                                    className="bbtn btn-block btn-primary btn-sm"
                                                    value="Buy item" />
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

export default index;