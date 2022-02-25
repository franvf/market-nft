// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./ERC19.sol";

contract My_NFT is ERC19 {
    //Global variables
    uint private itemsOnSale;
    uint[] private tokenKeys; //Array to save the different IDs of different NFT
    address private contractOwner;

    //Create new type
    struct Item{
        uint tokenId;
        address nftContract;
        address payable owner;
        address payable creator;
        uint amount;
        string property;
        uint price;
        bool sold;
    }

    //Mappings
    mapping (uint => bool) private isNFTRegistered; //Map to know if an ID is registered
    mapping (address => mapping (uint => bool)) private _isOwner; //Map to know if one address posees an NFT
    mapping (address => uint[]) private _owners; // Mapping the owner to NFT id
    mapping (address => uint) private _numberOfItems; //Mapping to know the number of nfts of each acount 
    mapping (uint => Item) private tokenIdToItem; //Link the tokenID to the item

    //Visibility modifier
    modifier onlyOwner(address _address){
        require(_address == contractOwner, "You don't have permisions");
        _;
    }

    constructor() ERC19("https://ipfs.infura.io/ipfs/${id}"){
        contractOwner = msg.sender;
    }

    function mint(string memory tokenURI, uint256 tokenId, uint256 amount, string memory property, uint price) public onlyOwner(msg.sender) returns(uint){
        require(isNFTRegistered[tokenId] == false, "This NFT was already minted" );
        require(tokenId != 0, "Zero is not allowed as ID, pleas try with another one" );

        _mint(msg.sender, tokenId, amount, "");
        _setTokenURI(tokenId, tokenURI);

        //Set the information in the arrays or mappings
        Item memory item = Item(tokenId, address(this), payable(msg.sender), payable(msg.sender), amount, property, price, false);
        tokenIdToItem[tokenId] = item;  //Insert an item in the mapping current position
        tokenKeys.push(tokenId); //Push the tokenID in the tokenKeys array
        isNFTRegistered[tokenId] = true; //Register the token id on the mapping
        _isOwner[msg.sender][tokenId] = true; //The sender now posees this tokenId
        _owners[msg.sender].push(tokenId); //Register the NFT owner in the mapping
        _numberOfItems[msg.sender]++; //Increment the number of items for the sender
        itemsOnSale++;

        return tokenId;
    }

    function getItemsOnSale() public view returns(Item[] memory){
        Item[] memory itemsToSale = new Item[](itemsOnSale); //Create an array to save the items to sale
        
        //Create the necessary variables
        uint totalItems = tokenKeys.length; 
        uint currentId = 0;
        uint pos = 0;

        for(uint i = 0; i < totalItems; i++){ //Go through all the items
            currentId = tokenKeys[i]; //Get the current id
            bool isItemSold = tokenIdToItem[currentId].sold; //Check if the item is sold
            
            if(!isItemSold && currentId != 0){ //If the item is not sold or burned
                Item memory currentItem = tokenIdToItem[currentId]; //Get this not sold item
                itemsToSale[pos] = currentItem; //Save it into the array
                pos++; //Increment the value of pos variable
            } 
        }

        return itemsToSale;
    }

    function getMyItems() public view returns(Item[] memory){
        
        uint quantityOfItems = _numberOfItems[msg.sender];
        Item[] memory myItems = new Item[](quantityOfItems);
        uint totalItems = tokenKeys.length;
        uint currentId = 0;
        address ownerOfCurrentItem;
        Item memory currentItem;
        uint pos = 0;

        for(uint i = 0; i < totalItems; i++){
            currentId = tokenKeys[i];
            ownerOfCurrentItem = tokenIdToItem[currentId].owner;

            if(ownerOfCurrentItem == msg.sender){
                currentItem = tokenIdToItem[currentId];
                myItems[pos] = currentItem;
                pos++;
            }
        }
        return myItems;
    }

    function isOwner(uint tokenId) public view returns(bool){
        return _isOwner[msg.sender][tokenId];
    }

    function buyNft(uint tokenId) public payable{
        require(isNFTRegistered[tokenId] == true, "This NFT not exists" );
        uint price = tokenIdToItem[tokenId].price;
        address currentOwner = tokenIdToItem[tokenId].owner;
        require(msg.value == price, "Please, introduce a correct price");

        //if the creator != current owner pay a % of total
        address creator = tokenIdToItem[tokenId].creator;
        
        if(creator == currentOwner){
            tokenIdToItem[tokenId].owner.transfer(msg.value);
        } else {
            uint royalty = 0.03 ether;
            price -= royalty;

            tokenIdToItem[tokenId].creator.transfer(royalty); //Pay to the creator the 3% of current price
            tokenIdToItem[tokenId].owner.transfer(price);
        }

        safeTransferFrom(currentOwner, msg.sender, tokenId, 1, "");

        //Modify owner
        tokenIdToItem[tokenId].owner = payable(msg.sender); // review payable: ¿Why if owner is payable intrinsically on the struct, I have to do it payable again)

        //Modify required mappings
        _isOwner[currentOwner][tokenId] = false;
        _isOwner[msg.sender][tokenId] = true;

        //Modify the number of items of each account
        _numberOfItems[currentOwner]--;
        _numberOfItems[msg.sender]++;

        deleteItem(currentOwner, tokenId);
        _owners[msg.sender].push(tokenId);
        
        //Mark this item as sold
        tokenIdToItem[tokenId].sold = true;
        itemsOnSale--;
    } 
    

    function deleteItem(address lastOwner, uint tokenId) private{
        uint size = _owners[lastOwner].length;

        for(uint i = 0; i < size; i++){
            if(_owners[lastOwner][i] == tokenId)
                delete _owners[lastOwner][i];
        }
    }

    function addToMarket(uint tokenId, uint price) public {
        require( tokenIdToItem[tokenId].sold == true, "This item is currently in market" );
        require( _isOwner[msg.sender][tokenId] == true, "You are not this NFT owner" );
        tokenIdToItem[tokenId].price = price;
        tokenIdToItem[tokenId].sold = false;
        itemsOnSale++;
    }

    function removeFromMarket(uint tokenId) public {
        require( tokenIdToItem[tokenId].sold == false, "This item is not currently on sale" );
        require( _isOwner[msg.sender][tokenId] == true, "You are not this NFT owner" );
        tokenIdToItem[tokenId].sold = true;
        itemsOnSale--;
    }

    function burn(uint tokenId) public {
        require(isNFTRegistered[tokenId] == true, "This NFT is not registered");
        require(tokenIdToItem[tokenId].sold == true, "This NFT is currently on market");
        require(_isOwner[msg.sender][tokenId] == true, "You are not the owner of this NFT");

        _burn(msg.sender, tokenId, 1);

        //Update mappings
        isNFTRegistered[tokenId] = false;
        _isOwner[msg.sender][tokenId] = false;
        deleteItem(msg.sender, tokenId);
        _numberOfItems[msg.sender]-=1;
        delete tokenIdToItem[tokenId];

        //Update variables
        deleteTokenKey(tokenId);
    }

    function deleteTokenKey(uint tokenId) private {
        for(uint i = 0; i < tokenKeys.length; i++){
            if(tokenKeys[i] == tokenId)
                tokenKeys[i] = 0;
        }
    }
}