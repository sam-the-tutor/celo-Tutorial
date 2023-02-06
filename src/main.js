import Web3 from 'web3'
import { newKitFromWeb3 } from '@celo/contractkit'
import BigNumber from "bignumber.js"
import vaultAbi from '../contract/vault.abi.json'
import erc20Abi from "../contract/erc20.abi.json"

const ERC20_DECIMALS = 18

const vaultContactAddress = "0x0e84848c82de0092D52E2147EF6a462aEF033f8a"
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"

let kit
let contract



const connectCeloWallet = async function () {
  if (window.celo) {
    try {
      notification("⚠️ Please approve this DApp to use it.")
      await window.celo.enable()
      notificationOff()
      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(vaultAbi, vaultContactAddress)
      
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
  }
}



//get balance form the smart contract
const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  document.querySelector("#balance").textContent = cUSDBalance
}



//when the window loads for the first time
window.addEventListener('load', async () => {
  notification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  notificationOff()
});






//approve the address to spend the specified amount
async function approve(_price) {
        const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)

        const result = await cUSDContract.methods
          .approve(vaultContactAddress, _price)
          .send({ from: kit.defaultAccount })
        return result
      }



//get number of shares the user has
document
.querySelector("#getShares")
.addEventListener("click", async (e) => {
	notification("Getting number of shares you own..")

      try{

        const result = await contract.methods
            .getMyShares()
            .send({ from: kit.defaultAccount })
            notification("Your address has been whitelisted successfully.")


      }catch(error){
      notification("Your Address is already whitelisted.")
  }
  notificationOff()
})


// //buying shares in the company

document
.querySelector("#buyShares")
.addEventListener("click", async (e) => {
	notification("Waiting for approval to buy shares")
	const amount = document.getElementById("sharesAmount").value
	const price = new BigNumber(amount)
                    .shiftedBy(ERC20_DECIMALS)
                    .toString()

        try{

        	await approve(price)

        }catch(e){
        	 notification(`⚠️ ${error}.`)

        }
           notification(`⌛ Awaiting payment for "${amount}" cUSD`)

      try{

        const result = await contract.methods
            .deposit(amount)
            .send({ from: kit.defaultAccount })
            notification(`You have successfully bought ${amount} shares`)

      }catch(error){
      notification("Purchase of shares failed.")
  }
  notificationOff()
})



//selling shares in the company

document
.querySelector("#sellShares")
.addEventListener("click", async (e) => {
	notification("Selling your shares.")

	const amount = document.getElementById("sharesAmount").value

      try{

        const result = await contract.methods
            .withdraw(amount)
            .send({ from: kit.defaultAccount })
            notification(`You have successfully sold ${amount} shares`)

      }catch(error){
      notification("Sale of shares failed")
  }
  notificationOff()
})



//get the total number of shares one has in the company
document
.querySelector("#getShares")
.addEventListener("click", async (e) => {
	notification("Loading your shares.")

      try{

        const shares = await contract.methods
            .getMyShares()
            .send({ from: kit.defaultAccount })
        document.querySelector("#sharesId").textContent = shares
            
      }catch(error){
      notification("Sale of shares failed")
  }
  notificationOff()
})