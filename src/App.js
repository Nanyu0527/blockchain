import React, { useEffect, useState, useMemo } from 'react';
import Web3 from 'web3';
import ResourceTokenABI from './abis/ResourceToken.json';
import ResourceManagementABI from './abis/ResourceManagement.json';
import UserManagementABI from './abis/UserManagement.json';
import detectEthereumProvider from '@metamask/detect-provider';
import Address from 'ipaddr.js';

const App = () => {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState(null);
    const [resourceToken, setResourceToken] = useState(null);
    const [resourceManagement, setResourceManagement] = useState(null);
    const [userManagement, setUserManagement] = useState(null);
    // const [userInfo, setUserInfo] = useState({ isVerified: false, isexist: false, tokens: 0 });
    const [resourceCount, setResourceCount] = useState(0);
    const [resources, setResources] = useState([]);
    const [usertokens, setUsertokens] = useState(0);
    const [verified, setVerified] = useState(false);
    const [registered, setRegistered] = useState(false);
    // const [count, setCount] = useState(0);

    useEffect(() => {
        const init = async () => {
            const provider = await detectEthereumProvider();
            if (provider) {
                const web3 = new Web3(provider);
                setWeb3(web3);
                
                const accounts = await web3.eth.requestAccounts();
                setAccount(accounts[0]);

                const networkId = await web3.eth.net.getId();
                const resourceTokenAddress = '0x476D26F54f472f89891cB28771F0Af71ab47F5Cc';
                const resourceManagementAddress = '0xCF6b4c3d7c6E17F18bcc69D93aF229FA94534Ca7';
                const userManagementAddress = '0x41a447dB51772A00477091DE354Ea6d0256BDA7e';

                const _resourceToken = new web3.eth.Contract(ResourceTokenABI, resourceTokenAddress);
                const _resourceManagement = new web3.eth.Contract(ResourceManagementABI, resourceManagementAddress);
                const _userManagement = new web3.eth.Contract(UserManagementABI, userManagementAddress);

                setResourceToken(_resourceToken);
                setResourceManagement(_resourceManagement);
                setUserManagement(_userManagement);

                // Load user info
                try{
                    let user = await _userManagement.methods.get_userTokens(accounts[0]).call();
                    if(user!=null){
                        setUsertokens(user);
                    }
                }catch(error){
                    console.error('Error set user tokens:', error);
                    alert('set User info error');
                }
                
                let u = await _userManagement.methods.users(accounts[0]).call();
                if(u.isVerified){
                    setVerified(true);
                }
                
                // Load resources
                let Count = await _resourceManagement.methods.get_resourceCount().call();
                setResourceCount(Count);
                let loadedResources = [];
                for (let i = 1; i <= resourceCount; i++) {
                    let resource = await _resourceManagement.methods.get_resource(i).call();
                    loadedResources.push(resource);
                }
                setResources(loadedResources);
            } else {
                console.error('Please install MetaMask!');
            }
            
        };
        init();
        return () => {

        }
    }, []);

    useEffect(() => {
        if(account !== null && userManagement !== null){
            fetchUserInfo();
        }
        else setUsertokens(0);
    }, [account,userManagement]);

    const fetchUserInfo = async () => {
        let user = await userManagement.methods.get_userTokens(account).call();
        if(user!=null) {
            setUsertokens(user);
        }
    };

    const updatetoken = useMemo(() => {
        // alert(usertokens);
        return Number(usertokens);
    },[usertokens]);

        
    const fetchResourceInfo = async () => {
        let Count = await resourceManagement.methods.get_resourceCount().call();
        setResourceCount(Count);
        if(Count > 0){
            let rsc = await resourceManagement.methods.get_resource(Number(Count)).call();
            setResources([...resources, rsc]);
        }
    }
    
    const registerUser = async () => {
        try {
            await userManagement.methods.register().send({ from: account });
            setRegistered(true);
            alert('User registered successfully!');
        } catch (error) {
            console.error('Error registering user:', error);
            alert('Registration failed. You may have registered before!');
        }
    };

    const verifyIdentity = async () => {
        try {
            await userManagement.methods.verifyIdentity().send({ from: account });
            setVerified(true);
            alert('Identity verified successfully!');
        } catch (error) {
            console.error('Error verifying identity:', error);
            alert('Identity verification failed. Please try again.');
        }
    };

    const buyTokens = async (amount) => {
        try {
            const cost = amount * 100; // Assuming token price is 100 wei
            await userManagement.methods.buyTokens(amount).send({ from: account, value: cost });
            fetchUserInfo();
            alert('Tokens bought successfully!');
        } catch (error) {
            console.error('Error buying tokens:', error);
            alert('Token purchase failed. Please try again.');
        }
    };

    const uploadResource = async (title, price) => {
        try {
            await resourceManagement.methods.uploadResource(title, price).send({ from: account });
            fetchResourceInfo();
            alert('Resource uploaded successfully!');
        } catch (error) {
            console.error('Error uploading resource:', error);
            alert('Resource upload failed. Please try again.');
        }
    };

    const buyResource = async (resourceId) => {
        try {
            await resourceManagement.methods.buyResource(Number(resourceId)).send({ from: account });
            fetchUserInfo();
            alert('Resource bought successfully!');
        } catch (error) {
            console.error('Error buying resource:', error);
            alert('Resource purchase failed. Please try again.');
        }
    };

    const withdrawTokens = async () => {
        try {
            await userManagement.methods.withdrawTokens().send({ from: account });
            alert('Tokens withdrawn successfully!');
            fetchUserInfo();
        } catch (error) {
            console.error('Error withdrawing tokens:', error);
            alert('Token withdrawal failed. Please try again.');
        }
    };

    return (
        <div>
            <h1>Resource Sharing dApp</h1>
            <div>
                <h2>User Actions</h2>
                <p>Tokens: {updatetoken}</p>
                <p>{verified ? "Verified User" : (registered?"Common User":"Geust")}</p>
                <button onClick={registerUser}>Register</button>
                <button onClick={verifyIdentity}>Verify Identity</button>
                <button onClick={() => buyTokens(10)}>Buy 10 Tokens</button>
                <button onClick={withdrawTokens}>Withdraw Tokens</button>
            </div>
            <div>
                <h2>Upload Resource</h2>
                <input id="title" placeholder="Title" />
                <input id="price" placeholder="Price" />
                <button onClick={() => uploadResource(document.getElementById("title").value, document.getElementById("price").value)}>Upload</button>
            </div>
            <div>
                <h2>Buy Resource</h2>
                <ul>
                    {resources.map((resource, index) => (
                        <li key={index}>
                            {resource.title} - {Number(resource.price)} tokens -  from {(verified && index>2 )? "Verified User" : "Common User"}
                            <button onClick={() => buyResource(resource.id)}>Buy</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default App;