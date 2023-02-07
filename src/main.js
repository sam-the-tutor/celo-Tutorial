import Web3 from 'web3'
import { newKitFromWeb3 } from '@celo/contractkit'
import BigNumber from "bignumber.js"
import vaultAbi from '../contract/vault.abi.json'
import erc20Abi from "../contract/erc20.abi.json"

const ERC20_DECIMALS = 18

const vaultContactAddress = "0x6D9518e651F904C2286412A8AE220bb88E0a33e2"
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"

let kit
let contract
let accounts

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


const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  document.querySelector("#balance").textContent = cUSDBalance
}


window.addEventListener('load', async () => {
  notification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  await getAllfunds()
  notificationOff()
});


async function approve(_price) {
        const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)

        const result = await cUSDContract.methods
          .approve(vaultContactAddress, _price)
          .send({ from: kit.defaultAccount })
        return result
      }


document
.querySelector("#buyShares")
.addEventListener("click", async (e) => {
	notification("Waiting for approval to buy shares")

	const price = new BigNumber(document.getElementById("sharesAmount").value)
                    .shiftedBy(ERC20_DECIMALS)
                    .toString()

        try{

        	await approve(price)
          notification(`Awaiting payment to buy shares`)

          const result = await contract.methods
            .depositFunds(price)
            .send({ from: kit.defaultAccount })
            notification(`You have successfully bought shares`)

        }catch(error){
        	 notification(`⚠️ ${error}.`)

        }
    
  notificationOff()
})


document
.querySelector("#sellShares")
.addEventListener("click", async (e) => {
	notification("Selling your shares.")

	const amount = document.getElementById("sellAmount").value

      try{

        const result = await contract.methods
            .withdraw(amount)
            .send({ from: kit.defaultAccount })
            notification(`You have successfully sold shares`)

      }catch(error){
      notification("Sale of shares failed")
  }
  notificationOff()
})


document
.querySelector("#getShares")
.addEventListener("click", async (e) => {
	notification("Loading your shares.")

      try{

        const shares = await contract.methods
            .getMyShares()
            .call()
        document.querySelector("#allShares").textContent = shares
            
      }catch(error){
      notification("Sale of shares failed")
  }
  notificationOff()
})


function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}


function getAllfunds(){

  try{

      const shares = await contract.methods
            .getContractBalance()
            .call()
        document.querySelector("#totalFunds").textContent = `Total Funds: ${shares} cUSD`
            
  }catch(error){
    notification(error)
  }
}





