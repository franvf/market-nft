//File to check if the owner have a cryptodino NFT in rinkeby network
import React, { Component } from 'react';
import Web3 from 'web3';
import Dino from '../abis/CryptoDino.json' //To connect tbe backend with the frontend we have to import the .json of our contrat
import NFT from '../abis/My_NFT.json'

class rinkeby extends Component{
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
        const networkId = 5777 //BSC testnet id
        const networkData = NFT.networks[networkId] //Get information about this network
        if(networkData){
            const abi = NFT.abi //Contract information
            const address = networkData.address //Contract address
            const contract = new web3.eth.Contract(abi, address) // Mount this contract ??
            this.setState({contract})
            this.setState({address: contract._address})
        } else {
            window.alert("There are not SC deployed on network")
        }
    }

    constructor(props){
        super(props)
        this.state = {
            account: "", //User account
            contract: null, //Contract deployed
            address: "", //Contract address
            contractAddress: "" //Contract address from the user wants to check his NFTs
        }
    }
    myWalletNFTs = async(contractAddress) => {
        try{
            const web3 = window.web3
            const abi = Dino.abi
            const contract = new web3.eth.Contract(abi, contractAddress)
            const nftAmount = await contract.methods.balanceOf(this.state.account).call()
            window.alert("You have: " + nftAmount + " NFTs of this collection")
        } catch (err){
            console.log(err)
        }
    }

    render() {
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
                <div className = "flex justify-center">
                    <div className = "w-1/2 flex flex-col pb-12">
                        <form onSubmit={(event) => {
                            event.preventDefault()
                            const contractAddress = this.contractAddress.value
                            this.myWalletNFTs(contractAddress)
                        }}> 
                            <input type="text"
                                className = "form-control mb-1"
                                placeholder="Contract address"
                                ref={(input) => this.contractAddress = input} />

                            <input type="submit"
                                className = "bbtn btin-block btn-danger btn-sm"
                                value = "Check my NFTs" />
                        </form> 

                    </div>
                </div>
            </div>
        )
    }
}

export default rinkeby;
