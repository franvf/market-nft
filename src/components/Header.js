import React from 'react';
import {Menu, Button, Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom';

export default() => {
    return(
        <Menu stackable style={{marginTop: '50px'}}>
            <Button color='blue' as={Link} to='/'>Marketplace</Button>
            <Button color='green' as={Link} to='/Creator'>Upload new NFT</Button>
            <Button color='pink' as={Link} to='/Offers'>Offers</Button>
            <Button color='orange' as={Link} to='/Ownership'>Your Collection</Button>
            <Button color='yellow' as={Link} to='/rinkeby'>Rinkeby</Button>
            <Button color='red' as={Link} to='/pdf'>PDF</Button>
        </Menu>
    );
}