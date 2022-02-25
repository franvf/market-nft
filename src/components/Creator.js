import React, { Component } from 'react';
import Web3 from 'web3';
import { create as ipfsHttpClient } from 'ipfs-http-client'
import NFT from '../abis/My_NFT.json'; //To connect tbe backend with the frontend we have to import the .json of our contrat

class creator extends Component {
    async componentWillMount(){
        await this.loadWeb3()
        await this.loadBlockchainData()
        this.setState({client: 'https://ipfs.infura.io:5001/api/v0' })
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
        const networkId = 5777 //BSC blockchain id
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
            fileUrl: [],
            client: "",
            nfts: [],
            amount: 0,
            tokenId: 0,
            property: "",
            price: 0,
            errorMessage: "",
        }
    }

    setValues = async(tokenId, amount, property, price) => {
        this.setState({amount}) //Save the current amount
        this.setState({tokenId}) //Save the current token id
        this.setState({property}) //Save the current property
        this.setState({price}) //Save the current price
    }

    updateFile = async(pic) =>{ //Function to upload a file
        const file = pic.target.files[0] //Get the path of the image
        const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0') 
        try{
            const added = await client.add(file, {progress: (prog) => console.log(`received: ${prog}`)})
            const url = `https://ipfs.infura.io/ipfs/${added.path}` //File URL
            console.log(url)
            this.setState({fileUrl: url}) //Save the last image in fileUrl variable
        } catch (err) {
            console.log(err.message)
            console.log(this.state.errorMessage)
        }
    }

    createMarket = async() => {
        const tokenId = this.state.tokenId //Get token Id
        const amount = this.state.amount //Get amount
        const fileUrl = this.state.fileUrl //Get image of file
        const property = this.state.property //Get property
        const price = this.state.price //Get current price
        if(tokenId == 0 || amount == 0 || fileUrl == "" || price < 0) return //If some of this variables is empty don't do nothing
        const data = JSON.stringify({tokenId, amount, property, price, image: fileUrl}) //Parse to string the current information
        const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0') 
        try{
            const added = await client.add(data)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            const web3 = window.web3
            const accounts = await web3.eth.getAccounts()
            await this.state.contract.methods.mint(url, tokenId, amount, property, price).send({from: accounts[0]})
            window.location.href="./"
        } catch(err){
            console.log(err.message)
            console.log(this.state.errorMessage)
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
                        const property = this.property.value
                        const price = this.price.value
                        const web3 = window.web3
                        const priceToWei = web3.utils.toWei(price, 'ether')
                        this.setValues(tokenId, amount, property, priceToWei)
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
                            placeholder='Property'
                            ref={(input) => this.property = input} /> 

                        <input type="text"
                            className="form-control mb-1"
                            placeholder='Price'
                            ref={(input) => this.price = input} />             

                        <input type="submit"
                            className='bbtn btn-block btn-danger btn-sm'
                            value="Set values" />
                    </form>

                    <form >

                        <input type="file"
                            className="my-4"
                            onChange={(e) => {this.updateFile(e)}}/>
                            {
                                this.state.fileUrl && (
                                <img className="rounded mt-4" width="250" src={this.state.fileUrl} />
                                )
                            }
                    </form>

                    <form onSubmit={(event) => {
                        event.preventDefault()
                        this.createMarket()
                    }}>

                        <input type="submit"
                            className="bbtn btn-block btn-primary btn-sm"
                            value="Create item" />
                    </form>
                 </div>
             </div>
         )
     }
}

export default creator