import { useRef, useState } from 'react';
import { Contract, ethers } from "./../ethers-5.6.esm.min.js";
import { socialBreezeABI, socialBreezeAddress } from '../constants.js';
import './App.scss';

function App() {
  const [count, setCount] = useState(0)
  const inputRef = useRef();

  async function connect() {
    if(typeof window.ethereum !== "undefined"){
    console.log("Yeahhhh, I can see Metamask here!");
    window.ethereum.request({method: "eth_requestAccounts"});
    const connectBtn = document.getElementById("connectButton").innerHTML = "Connected"
    }
    else {
      console.log("Please install Metamask");
      connectBtn.innerHTML = "Please install Metamask";
    }
  }

  // Fund function
  async function fund() {
    // const ethAmount = document.getElementById("ethAmount").value;
    const ethAmount = `${inputRef.current.value}`
    console.log(`Funding BuyMeACoffee Dapp with ${ethAmount}`);
    try {
      if (inputRef.current.value == "") {
        alert("Please fill in the donation value");
      }
    } catch (error) {
      console.log(error);
    }
    
    if(typeof window.ethereum !== "undefined"){
      // What are the things that we need to connect to a contract
      // 1. Provider, connection to the blockchain
      // 2. Signer/someone to do perform the transaction and pay gas
      // 3. ABI and Address of the contract
      const provider = new ethers.providers.Web3Provider(window.ethereum); //This will return the object that Metamask injects in the window
      //Here our provider is Metamask or which ever RPC provider we are using 
      const signer = provider.getSigner() //This will return which ever wallet/Metamask account is connected to the provider
      const contract = new ethers.Contract(socialBreezeAddress, socialBreezeABI, signer);
      try {
        const transactionResponse = await contract.fund({ value: ethers.utils.parseEther(ethAmount) });
        await listenToTransactionMine(transactionResponse, provider);
        console.log("Done!");
      } catch (error) {
        console.log(error)
      }
    }
  }

  // Balance Function
  let contractBalance;
  async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const socialBreezeBalance = await provider.getBalance(socialBreezeAddress)
      console.log(ethers.utils.formatEther(socialBreezeBalance));
      contractBalance = ethers.utils.formatEther(socialBreezeBalance);
    }
  }

  // Withdraw Function
  async function withdrawFunds() {
    if (typeof window.ethereum !== "undefined") {
      console.log("Withdrawing funds...")
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(socialBreezeAddress, socialBreezeABI, signer);
      try {
        const withdrawResponse = await contract.withdraw();
        console.log(withdrawResponse);
        await listenForTransactionMine(withdrawResponse, provider)
      } catch (error) {
        console.log(error)
      }
     
    }
  }

  function listenToTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    // We have to define how we are going to listen to the transactions happening in the blockchain
    // Ethers comes with a way to listen for event and listen for transactions
    return new Promise(( resolve, reject ) => {
      provider.once(transactionResponse.hash, (transactionReceipt) => { //We'll be waiting for this transactionReceipt and then we'll run the listener function
          console.log(`Completed with ${transactionReceipt.confirmations} confirmations`);
          resolve();
      } ) 
    })
    
  }

  return (
    <div className="App">
      What's GOOOOOOOD!
      <button id='connectButton' onClick={connect}>
        Connect
      </button>
      <button onClick={fund}>
        Fund
      </button>
      <button onClick={getBalance}>Balance</button>
      <button onClick={withdrawFunds}>Withdraw</button>
      <div className="ethAmountWrapper">
        <label htmlFor="fund">Eth Amount</label>
        <input type="text" ref={inputRef} id="ethAmount" placeholder="0.1" />
      </div>
    </div>
  )
}

export default App;
