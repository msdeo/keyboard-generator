import { ethers } from "ethers";
import abi from "../utils/Keyboards.json"

const contractAddress = '0x3c8108f86c5f40174f29420082de93bd93caa58f';
const contractABI = abi.abi;

export default function getKeyboardsContract(ethereum) {
    if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        return new ethers.Contract(contractAddress, contractABI, signer);
    } else {
        return undefined;
    }
}