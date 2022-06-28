import { useState, useEffect } from "react";
import PrimaryButton from "../components/primary-button";
import TipButton from "../components/tip-button";
import Keyboard from "../components/keyboard";

import abi from "../utils/Keyboards.json";
import { ethers } from "ethers";
import addressesEqual from "../utils/addressesEqual";
import { UserCircleIcon } from "@heroicons/react/solid";
import getKeyboardsContract from "../utils/getKeyboardsContract";
import toast from "react-hot-toast";
import { useMetaMaskAccount } from "../components/meta-mask-account-provider"

export default function Home() {
    const { ethereum, connectedAccount, connectAccount} = useMetaMaskAccount();
    // const [ethereum, setEthereum] = useState(undefined);
    // const [connectedAccount, setConnectedAccount] = useState(undefined);
    const [keyboards, setKeyboards] = useState([])
    const [newKeyboard, setNewKeyboard] = useState("")
    const [keyboardsLoading, setKeyboardsLoading] = useState(false);
    const keyboardsContract = getKeyboardsContract(ethereum);

    const contractAddress = '0x3c8108f86c5f40174f29420082de93bd93caa58f';
    const contractABI =abi.abi;

    // const handleAccounts = (accounts) => {
    //   if(accounts.length > 0){
    //     const account = accounts[0];
    //     console.log('We have an authorized account: ', account);
    //     setConnectedAccount(account);
    //   }
    //   else{
    //     console.log("No authorized accounts yet")
    //   }
    // };

    // const getConnectedAccount = async() =>{
    //   if(window.ethereum){
    //     setEthereum(window.ethereum);
    //   }

    //   if(ethereum){
    //     const accounts = await ethereum.request({method: 'eth_accounts'});
    //     handleAccounts(accounts);
    //   }
    // };
    // useEffect(() => getConnectedAccount(), []);

    // const connectAccount = async() => {
    //   if(!ethereum){
    //     alert('Metamask is required to connect an account');
    //     return;
    //   }

    //   const accounts= await ethereum.request({method: 'eth_requestAccounts'});
    //   handleAccounts(accounts);
    // };


    const getKeyboards = async () => {
      if(keyboardsContract && connectedAccount) {
        setKeyboardsLoading(true);
        try{
          // const provider = new ethers.providers.Web3Provider(ethereum);
          // const signer = provider.getSigner();
          // const keyboardsContract = new ethers.Contract(contractAddress, contractABI, signer);

          const keyboards = await keyboardsContract.getKeyboards();
          console.log('Retreived keyboards...', keyboards)
          setKeyboards(keyboards)
        } finally {
          setKeyboardsLoading(false);
        }
      }
    }
    useEffect(() => getKeyboards(), [!!keyboardsContract, connectedAccount])

    const addContractEventHandlers = () => {
      if(keyboardsContract && connectedAccount) {
        keyboardsContract.on('KeyboardCreated', async (keyboard) => {
          if(connectedAccount && !addressesEqual(keyboard.owner, connectedAccount)){
            toast('Somebody created a new keyboard!', {id: JSON.stringify(keyboard)})
          }
          await getKeyboards();
        })

        keyboardsContract.on('TipSent', (recipient, amount) => {
          if(addressesEqual(recipient, connectedAccount)) {
            toast(`You received a tip of ${ethers.utils.formatEther(amount)} eth!`, { id: recipient + amount });
          }
        })
      }
    }
    useEffect(addContractEventHandlers, [!!keyboardsContract, connectedAccount]);

    const submitCreate = async (e) =>{
      e.preventDefault();
      
      if(!ethereum){
        console.error('Ethereum object is required to create a keyboard');
        return;
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const keyboardsContract = new ethers.Contract(contractAddress, contractABI, signer);

      const createTxn = await keyboardsContract.create(newKeyboard);
      console.log('Create transaction started...', createTxn.hash);

      await createTxn.wait();
      console.log('Created keyboard!', createTxn.hash);

      await getKeyboards();
    };

    if (!ethereum) {
      return <p>Please install MetaMask to connect to this site</p>
    }
    
      if (!connectedAccount) {
        return <PrimaryButton onClick={connectAccount}>Connect MetaMask Wallet</PrimaryButton>
      }
    
      if (keyboards.length > 0) {
        return (
          <div className="flex flex-col gap-4">
            <PrimaryButton type="link" href="/create">Create a Keyboard!</PrimaryButton>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
              {keyboards.map(
                ([kind, isPBT, filter, owner], i) => (
                  <div key={i} className="relative">
                    <Keyboard key={i} kind={kind} isPBT={isPBT} filter={filter} />
                    <span className="absolute top-1 right-6">
                      {
                        addressesEqual(owner, connectedAccount) ?
                        <UserCircleIcon className="h-5 w-5 test-indigo-100" /> :
                        <TipButton keyboardsContract={keyboardsContract} index={i} />
                      }
                    </span>
                    </div>
                )
              )}
            </div>
          </div>
        )
      }
    
      if(keyboardsLoading){
        return(
          <div className="flex flex-col gap-4">
            <PrimaryButton type="link" href="/create">Create a Keyboard!</PrimaryButton>
            <p>Loading Keyboards...</p>
          </div>
        )
      }
      // No keyboards yet
      return (
        <div className="flex flex-col gap-4">
          <PrimaryButton type="link" href="/create">Create a Keyboard!</PrimaryButton>
          <p>No keyboards yet!</p>
        </div>
      )
    
    
}