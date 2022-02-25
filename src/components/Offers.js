import React, { Component } from 'react';
import Web3 from 'web3';
import NFT from '../abis/My_NFT.json' //To connect the backend with the frontend we have to import the .json of our contrat

class offers extends Component{
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
            this.owner()
        } else {
            window.alert("There are not SC deployed on network")
        }
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

    owner = async() => {
        const data = await this.state.contract.methods.getMyItems().call({from: this.state.account})
        //Get information about all the items owned
        const items = await Promise.all(data.map(async i => {
               this.setState({nfts: [...this.state.nfts, i.property]}) //Push in the nfts array the property of owned nfts
        }))
    }

    render(){ 
        if(this.state.nfts.length > 0){
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
                <h3> Your offers: </h3>
                <div className="row text-center"> 
                    {this.state.nfts.map(nft =>{
                        if(nft == "pizza"){
                            return(
                                <p> You have 1 free pizza this month</p>
                            )
                        }

                        if(nft == "hot-dog"){
                            return(
                                <p> You have 2 free hot-dog this month</p>
                            )
                        }
                    })}
                </div>
                </div>
            )
        } else {
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
                <p> You don't have any offer available</p>
                </div>
            )
        }
        
    }

}

export default offers;