// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../../node_modules/@openzeppelin/contracts/utils/Strings.sol";

contract My_NFT is ERC1155 {
    
    //State variables
    uint private itemsOnSale; //Variable to count number of items on sale
    uint[] private tokenKeys; //Array to save the different IDs of different NFT
    address private contractOwner;//Variable to store the contract owner
    string private _uri = "https://gateway.pinata.cloud/ipfs/QmPZ2uYTeqsSGtGCDdvp1T9WA9gVzK5QvgsGvjemeiTd1m"; //NFT metadata URL.

    //Struct to create a new type called Item.
    struct Item{
        uint tokenId; // NFT identification number
        address payable owner; //Who currently possess the NFT
        address payable creator; //Who mint the NFT 
        uint amount; // Number of identical NFTs
        uint price; //Current NFT price
        bool sold; //Variable to control if NFT is sold or not
    }

    //Mappings
    mapping (uint => bool) private isNFTRegistered; //Mapiing to know if an ID is registered
    mapping (address => mapping (uint => bool)) private _isOwner; //Mapiing to know if one address posees an NFT
    mapping (address => uint[]) private _owners; // Mapping the owner to NFT id
    mapping (address => uint) private _numberOfItems; //Mapping to know the number of nfts of each acount 
    mapping (uint => Item) private tokenIdToItem; //Link the tokenID to the item

    //Events
    event minted(address holder, uint tokenId); //Event to inform that an item have been minted.
    event itemBought(address buyer, uint tokenId); //Event to inform that an item have been bought.
    event itemAddedToMkt(uint tokenId, uint price); //Event to inform that an item have been aded to market
    event itemRemovedFromMkt(uint tokenId); //Event to inform that an item have been removed from market

    //Function modifier
    modifier onlyOwner(address _address){
        require(_address == contractOwner, "You don't have permisions to execute this function");
        _;
    }

    constructor() ERC1155(_uri){
        contractOwner = msg.sender; //The contract owner is who executes the constructor
    }

    function mint(uint tokenId, uint amount, uint price) public onlyOwner(msg.sender) returns(uint){
        
        require(isNFTRegistered[tokenId] == false, "This NFT was already minted" );
        require(tokenId > 0, "Zero is not allowed as ID, pleas try with another one" );

        _mint(msg.sender, tokenId, amount, ""); //Call to ERC1155 mint function

        //Set the information in the arrays or mappings
        Item memory item = Item(tokenId, payable(msg.sender), payable(msg.sender), amount, price, false); //Create a new item
        tokenIdToItem[tokenId] = item;  //Link an item with its ID.
        tokenKeys.push(tokenId); //Push the tokenID in the tokenKeys array
        isNFTRegistered[tokenId] = true; //Register the token id on the mapping
        _isOwner[msg.sender][tokenId] = true; //The sender now posees this tokenId
        _owners[msg.sender].push(tokenId); //Register the NFT owner in the mapping
        _numberOfItems[msg.sender]++; //Increment the number of items for the sender
        itemsOnSale++; //Incremente the number of items on sale

        emit minted(msg.sender, tokenId); //Emit the event to inform the network
        
        return tokenId; //Return the token id mited
    }

    function getItemsOnSale() public view returns(Item[] memory){
        Item[] memory itemsToSale = new Item[](itemsOnSale); //Create an static array to save the items to sale
        
        //Create and initialize the necessary variables
        uint totalItems = tokenKeys.length; 
        uint currentId = 0;
        uint pos = 0;

        for(uint i = 0; i < totalItems; i++){ //Go through all the items
            currentId = tokenKeys[i]; //Get the current id
            bool isItemSold = tokenIdToItem[currentId].sold; //Check if the item is sold
            
            if(!isItemSold){ //If the item is not sold
                Item memory currentItem = tokenIdToItem[currentId]; //Get this not sold item
                itemsToSale[pos] = currentItem; //Store the current item into the array
                pos++; //Increment the value of pos variable
            } 
        }

        return itemsToSale; //Return the array with items on sale.
    }

    function getMyItems() public view returns(Item[] memory){
        
        uint quantityOfItems = _numberOfItems[msg.sender]; //Get the number of items acquired by the current user
        Item[] memory myItems = new Item[](quantityOfItems); //Create an static array to store the items
        uint totalItems = tokenKeys.length; //Get the total number of items
        uint currentId = 0; //Define currentId variable
        address ownerOfCurrentItem; //Variable to store the owner of the current item
        Item memory currentItem; //Variable to control the current item
        uint pos = 0; //Variable to control the position in my_items array

        for(uint i = 0; i < totalItems; i++){ //Iterate through all elements
            currentId = tokenKeys[i]; //Get the ID on position i
            ownerOfCurrentItem = tokenIdToItem[currentId].owner; //Get the owner of the current item

            if(ownerOfCurrentItem == msg.sender){ //If the item owner is who executes the function
                currentItem = tokenIdToItem[currentId]; //Get the current item
                myItems[pos] = currentItem; //Add the current item to myItems array
                pos++; //Increment the position variable
            }
        }
        return myItems; //Return myItems array.
    }

    function isOwner(uint tokenId) public view returns(bool){
        return _isOwner[msg.sender][tokenId];
    }

    function buyNft(uint tokenId) public payable{
        require(isNFTRegistered[tokenId] == true, "This NFT not exists" ); 
        uint price = tokenIdToItem[tokenId].price; //Get the price of the item to buy
        address currentOwner = tokenIdToItem[tokenId].owner; //Get the NFT current owner
        require(msg.value == price, "Please, introduce a correct price"); 

        address creator = tokenIdToItem[tokenId].creator; //Get the NFT creator
        
        if(creator == currentOwner){ //If who creates the item is the current owner
            tokenIdToItem[tokenId].owner.transfer(msg.value); //Pay the entire price to the owner
        } else { //If who possess the NFT is not who creates it 
            uint royalty = (price * 3) / 100; //Set a royaltie of 3%
            price -= royalty; //The price is the current price less the royaltie
            
            tokenIdToItem[tokenId].creator.transfer(royalty); //Pay to the creator 
            tokenIdToItem[tokenId].owner.transfer(price); //Pay to the current owner
        }

        _safeTransferFrom(currentOwner, msg.sender, tokenId, 1, ""); //Call to safeTransferFrom function in ERC-1155 contract

        tokenIdToItem[tokenId].owner = payable(msg.sender); //Change the owner of the item
        _isOwner[currentOwner][tokenId] = false; //The current owner is not the item owner
        _isOwner[msg.sender][tokenId] = true; //Who buy the NFT is the current owner
        _numberOfItems[currentOwner]--; //Subtract an item from the item counter to the current owner
        _numberOfItems[msg.sender]++; //Add one item to the buyer counter
        deleteItem(currentOwner, tokenId); //Cal the function delete item
        _owners[msg.sender].push(tokenId); //Add the tokenId to the items acquired by the buyer
        tokenIdToItem[tokenId].sold = true; //Item marked as sold
        itemsOnSale--; //Subtract the items on sale

        emit itemBought(msg.sender, tokenId); //Trigger the event
    } 
    

    function deleteItem(address lastOwner, uint tokenId) private returns(uint) {
        uint size = _owners[lastOwner].length; // Get the number of items of lastOwner

        for(uint i = 0; i < size; i++){ //Go through all these items
            if(_owners[lastOwner][i] == tokenId){ //If the item to delete is reached
                delete _owners[lastOwner][i]; //Delete the item
                return tokenId; //Return the item removed to avoid more than necessary iterations
            } 
        }
        return 0; //If item is not removed return 0
    }

    function addToMarket(uint tokenId, uint price) public {
        require( tokenIdToItem[tokenId].sold == true, "This item is currently in market" );
        require( _isOwner[msg.sender][tokenId] == true, "You are not this NFT owner" );
        tokenIdToItem[tokenId].price = price; //Adjust the price of the item
        tokenIdToItem[tokenId].sold = false; //Item is not currently sold
        itemsOnSale++; //Increment the number of items on sale
        emit itemAddedToMkt(tokenId, price); ////Emit the event
    }

    function removeFromMarket(uint tokenId) public {
        require( tokenIdToItem[tokenId].sold == false, "This item is not currently on sale" );
        require( _isOwner[msg.sender][tokenId] == true, "You are not this NFT owner" );
        tokenIdToItem[tokenId].sold = true; //Item marked as sold
        itemsOnSale--; //Subtract the number of items on sale
        emit itemRemovedFromMkt(tokenId); //Emit the event
    }

    function uri(uint256 tokenId) public view virtual override returns (string memory) {
        return(string(abi.encodePacked(_uri,"/", Strings.toString(tokenId),".json")));
    }

    function setURI(string memory newURI) public onlyOwner(msg.sender) {
        _uri = newURI;
    }
}