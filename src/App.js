// import React from 'react';

// function App() {
//   return (
//     <div>
//       <h1>Hello, React!</h1>
//       <p>This is a simple React app.</p>
//     </div>
//   );
// }

// export default App;
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import ResourceTokenABI from './abis/ResourceToken.json';
import ResourceManagementABI from './abis/ResourceManagement.json';
import UserManagementABI from './abis/UserManagement.json';
import detectEthereumProvider from '@metamask/detect-provider';

const App = () => {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState(null);
    const [resourceToken, setResourceToken] = useState(null);
    const [resourceManagement, setResourceManagement] = useState(null);
    const [userManagement, setUserManagement] = useState(null);
    const [userInfo, setUserInfo] = useState({ isVerified: false, tokens: 0, rewards: 0 });
    const [resourceCount, setResourceCount] = useState(0);
    const [resources, setResources] = useState([]);

    useEffect(() => {
        const init = async () => {
            const provider = await detectEthereumProvider();
            if (provider) {
                const web3 = new Web3(provider);
                setWeb3(web3);
                const accounts = await web3.eth.requestAccounts();
                setAccount(accounts[0]);

                const networkId = await web3.eth.net.getId();
                const resourceTokenAddress = '0xe2899bddFD890e320e643044c6b95B9B0b84157A';
                const resourceManagementAddress = '0x93f8dddd876c7dBE3323723500e83E202A7C96CC';
                const userManagementAddress = '0x1c91347f2A44538ce62453BEBd9Aa907C662b4bD';

                const resourceToken = new web3.eth.Contract(ResourceTokenABI, resourceTokenAddress);
                const resourceManagement = new web3.eth.Contract(ResourceManagementABI, resourceManagementAddress);
                const userManagement = new web3.eth.Contract(UserManagementABI, userManagementAddress);

                setResourceToken(resourceToken);
                setResourceManagement(resourceManagement);
                setUserManagement(userManagement);

                // Load user info
                const user = await userManagement.methods.users(accounts[0]).call();
                setUserInfo(user);

                // Load resources
                const count = await resourceManagement.methods.resourceCount().call();
                setResourceCount(count);
                const loadedResources = [];
                for (let i = 1; i <= count; i++) {
                    const resource = await resourceManagement.methods.resources(i).call();
                    loadedResources.push(resource);
                }
                setResources(loadedResources);
            } else {
                console.error('Please install MetaMask!');
            }
        };
        init();
    }, []);

    const registerUser = async () => {
        await userManagement.methods.register().send({ from: account });
        alert('User registered successfully!');
    };

    const verifyIdentity = async () => {
        await userManagement.methods.verifyIdentity().send({ from: account });
        alert('Identity verified successfully!');
    };

    const buyTokens = async (amount) => {
        const cost = amount * 100; // Assuming token price is 100 wei
        await userManagement.methods.buyTokens(amount).send({ from: account, value: cost });
        alert('Tokens bought successfully!');
    };

    const uploadResource = async (title, price) => {
        await resourceManagement.methods.uploadResource(title, price).send({ from: account });
        alert('Resource uploaded successfully!');
    };

    const buyResource = async (resourceId) => {
        await resourceManagement.methods.buyResource(resourceId).send({ from: account });
        alert('Resource bought successfully!');
    };

    const withdrawRewards = async () => {
        await userManagement.methods.withdrawRewards().send({ from: account });
        alert('Rewards withdrawn successfully!');
    };

    return (
        <div>
            <h1>Resource Management dApp</h1>
            <div>
                <h2>User Actions</h2>
                <button onClick={registerUser}>Register</button>
                <button onClick={verifyIdentity}>Verify Identity</button>
                <button onClick={() => buyTokens(10)}>Buy 10 Tokens</button>
                <button onClick={withdrawRewards}>Withdraw Rewards</button>
            </div>
            <div>
                <h2>Upload Resource</h2>
                <input id="title" placeholder="Title" />
                <input id="price" placeholder="Price" />
                <button onClick={() => uploadResource(document.getElementById('title').value, document.getElementById('price').value)}>Upload</button>
            </div>
            <div>
                <h2>Buy Resource</h2>
                <ul>
                    {resources.map((resource, index) => (
                        <li key={index}>
                            {resource.title} - {resource.price} tokens
                            <button onClick={() => buyResource(index + 1)}>Buy</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default App;