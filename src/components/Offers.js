import React, { Component } from 'react';
import Web3 from 'web3';
import { ethers } from "ethers";
import NFT from '../abis/My_NFT.json' //To connect the backend with the frontend we have to import the .json of our contrat
import axios from 'axios';


class offers extends Component{
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
        const networkId = 1337 //BSC testnet id
        const networkData = NFT.networks[networkId] //Get information about this network
        if(networkData){
            const abi = NFT.abi //Contract information
            const address = networkData.address //Contract address
            const contract = new web3.eth.Contract(abi, address) // Mount this contract ??
            this.setState({contract})
            this.setState({address: contract._address})
            this.ownerOf()
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
            freepizza: 1,
            freehd: 2,
            signature: ""
        }
    }

    ownerOf = async() => {
        const items = await this.state.contract.methods.getMyItems().call({from: this.state.account})
        //Get information about all the items owned
        await Promise.all(items.map(async i => { //Go trhough all the elements, i is each item
          const tokenUri = await this.state.contract.methods.uri(i.tokenId).call() //Get the uri of actual item tokenId (struct variable)
          const meta = await axios.get(tokenUri) //Get the information in metadata files
               this.setState({nfts: [...this.state.nfts,  meta.data.attributes[0].trait_type]}) //Push in the nfts array the property
        }))
    }

    signMessage = async(message, property) => {
      try {   
        const provider = new ethers.providers.Web3Provider(window.ethereum); //Define a provider (Allows client-blockchain communication)
        const signer = provider.getSigner(); //Who sign the transaction
        const signature = await signer.signMessage(message); //Sign the message

        if(property == "Hot-dog") { //If property is Hot-dog
          this.setState({freehd: freehd-1}) //Subtract one to freehd variable
        } else if(property == "Pizza"){ //If property is pizza
          this.setState({freepizza: 0}) //Freepizza variables is zero
        }

        console.log(signature)
      } catch (err) {
        console.log(err);
      }
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
                    </li>
                  </ul>
                </nav>
                <h3> Your offers: </h3>
                <div className="row text-center"> 
                    {this.state.nfts.map(nft =>{
                        if(nft == "Pizza"){
                            return(
                                <div>
                                  <p> You have {this.state.freepizza} free pizza this month</p>
                                  <form onSubmit={(event) => {
                                    event.preventDefault()
                                    this.signMessage("Claim your monthly pizza", nft)
                                  }}>

                                  <input type="submit"
                                      className="bbtn btn-block btn-primary btn-sm"
                                      value="Sign transaction" />
                              </form>
                              </div>
                            );
                        }
                        if(nft == "Hot-dog"){
                            return(
                              <div>
                                <br></br>
                                <p> You have {this.state.freehd} free hot-dogs this month</p>
                                <form onSubmit={(event) => {
                                  event.preventDefault()
                                  this.signMessage("Claim your monthly hot-dog", nft)
                                }}>

                                  <input type="submit"
                                    className="bbtn btn-block btn-primary btn-sm"
                                    value="Sign transaction" />
                                </form>
                              </div>
                            );
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