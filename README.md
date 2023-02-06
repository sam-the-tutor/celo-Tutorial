# Make a Vault contract for beginners.

Have you ever wondered how people in real life are able to buy shares from a company they are interested in! Well, in this tutorial, we are going to create a vault smart contract Dapp on the celo blockchain that will enable users to buy and sell shares in our company. Wondering what a decentralized application is! Here is a brief explanation. Without wasting time, lets begin.


## What you will learn in this tutorial.

- Writing a smart contract.
- Deploying a smart contract.
- Interacting with the smart contract on the celo block chain.
- Front end development to interact with our smart contract.


## Prerequisites. 
To get the most out of this tutorial, I assume that you have:

- Basic understanding of how blockchain and smart contracts work.
- Basic programming knowledge in Javascript and Solidity.


## Requirements. 

* Nodejs installed on your machine.
* An IDE such as Vscode or Sublime text.
* Remix IDE.
* CeloExtensionWallet
* terminal or command line.

Remix IDE is an online compiler that allows us to write, run and test our smart contract code, all in the browser. No need for downloading any file to the computer. 

celoExtensionWallet enables us to interact with our smart contract on the Celo blockchain.([more on Celo Blockchain]())


### First, we will develop our smart contract. 

Open up your browser and load the [Remix IDE]().
Here is what the remix looks like, We will create a file called `vault.sol` where our smart contract code will be stored.
Notice a new file extension(`.sol`). It means our file will store Solidity code just like how a .js files stores Javascript code.

Now, we need to write code in our empty file. copy and paste this code into the file.

```solidity
// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;
```
We start by defining the license type of our code. It is remommended to always define a license for the contract code as this is important to guide how the code will be used. The most common license used is `MIT`. 

On the next line, we specify the version to use when compiling our code using the `pragma` keyword. There are several ways how to specify the version. In our example, we are telling the compiler to use any version between 0.7.0 and 0.9.0. you can read more about compilers [here]().


In real life, we need some sort of currency(dollar,EUR) to be able to buy shares in the company. So we will also need to intergrate a test currency that will be used in our smart contract to buy shares.
Paste the code below into our file.

```solidity
interface IERC20Token {
  function transfer(address, uint256) external returns (bool);
  function approve(address, uint256) external returns (bool);
  function transferFrom(address, address, uint256) external returns (bool);
  function totalSupply() external view returns (uint256);
  function balanceOf(address) external view returns (uint256);
  function allowance(address, address) external view returns (uint256);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}
```
We dont need to build our own currency token as there are already prebuilt tokens that we can just use in this example. We will use cUSD(celo dollar) that follows the ERC20 token standard. We specify how we are going to interact with the token through the above `interface` code.
Learn more about [tokens](), [interfaces]() and the token [standards]().

Time to move on.
Lets start writing code for our smart contract.

```solidity
contract Vault {

    address public immutable token;

    uint public totalSupply;

    mapping(address => uint) public balanceOf;

}
```

First, we declare our contract using the `contract` keyword, followed by the name of the contract. In our case, we call it `Vault`.

Just like other programming languages, Solidity also has data types, and you have to specify the data type of each variable you create.  Common data types in Solidity include address, uint,bytes32,bool. ([Learn more about data types here](https://docs.soliditylang.org/en/latest/types.html).

In the above code, we declare a variable `token`, of data type address(we want it to store the address of our token that we will be using). Then we specify the visibilty of our variable, in this case `public`. `Visibility` defines how the variable will be accessed. There are several types of visibilty, but here we use `public` because we want to access the variable from both from inside and outside  the contract.([Learn more about visiblity](https://docs.soliditylang.org/en/latest/contracts.html#visibility-and-getters))

 `immutable` keyword. When you declare a variable with this type, the value of that variable can't be altered, and it is exactly what we want. We want to make sure that all the customers pay using the same currency in order to buy the shares from our company.Not some one cheating the system to pay with fake money. 

Next line, we declare a variable `totalSupply` that will hold the total number of shares our company has issued out. It is `public`, meaning we can get the value of this variable from outside the contract(this will be helpful when we are interacting with the contract from the frontend). It is of type `uint`. uint variables store only positive numbers as we never want our company to have negative shares.

Lets declare one more variable `balanceOf`. We will track the `amount` of `shares` every user has with this variable. Its public and of type `mapping`. Just like arrays allow us to store values that can be accessed using the index, `mapping` allows us to store `key:value` pairs where the value can be accessed using its key.([more about mapping]()).

```solidity
costructor(address _token){
token = _token;
}
```

We define a `constructor` for our contract in the above code. Constructors are special functions that run only once before the contract is deployed([more about constructors]()). In the constructor, we want to set the contract address of the token(cUSD) that we will be using. 

```solidity
function _mint(address _to, uint _amount) private{
	totalSupply += _amount;
	balanceOf[_to] += _amount
}


function _burn(address _from , uint _amount) private{
	totalSupply -= _amount;
	balanceOf[_from] -= _amount;
}
```
We declare a function `_mint`, it takes in two parameters(the `address of the user` to receive the shares, and the `amount of shares` to give out). It is `private`, as we only want to access them only inside our smart contract. Inside the `_mint` function, two things take place. One is increasing the total number of shares our company has issued out, and updating the number of shares held by a specific user address.

Lets declare another function `_burn`,It is private,and does two things. Decreasing the total number of shares our company has issued out, and  updating the number of shares held by a specific address.

Next lets enable our users to `buy` shares from our company.

```solidity
function deposit(uint _amount) payable external{

	uint shares;

	require(token.transferFrom(
		msg.sender,
		address(this),
		_amount
		),"Transfer failed"
	);
	shares =_amount;

	_mint(msg.sender,shares);
}
```

We define our deposit function, it takes in one parameter(the amount, a user has deposited). For now, we will sell `one share` for `1 cUSD`,meaning the customer gets a number of shares equivalent to the amount he deposits. Inside the function, we declare a variable `shares` of type `uint` to hold the number of shares.

Use the `require` keyword to ensure that the customer pays for the shares before we issue them out([learn more about require]()).

Next, set the number of shares to be equal to the amount the customer has paid, and call the `_mint function` to issue out shares to our customer.

Now,let's enable our customers to `sell` their shares and get back their funds.

```solidity
function withdraw(uint _shares) external{

		require(balanceOf[msg.sender] >= _shares,"You dont have enough shares");

		uint _amount = _shares;
		require(IERC20Token(token).transfer(
			payable(msg.sender),
			_amount
			),"Transfer failed"
		);

	   _burn(msg.sender, _shares);

	}
```

Inside the function, we check to see if the user has the shares he wants to sell.
Then we give out the funds corresponding to the number of shares, finally we call the `_burn` function to deduct the shares from the users account and update the total shares the company holds.

```solidity
function getMyShares() public view returns(uint){
		return balanceOf[msg.sender];
	}
```
We define a function `getMyShares`,this will return a value of `uint` type, which is the total number of shares held by a user. Its a `view` function because it is accessing the `state variables`. [more on view and pure functions]().


This completes our smart contract code. Here is how the complete code should look like.

```solidity
// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
  function transfer(address, uint256) external returns (bool);
  function approve(address, uint256) external returns (bool);
  function transferFrom(address, address, uint256) external returns (bool);
  function totalSupply() external view returns (uint256);
  function balanceOf(address) external view returns (uint256);
  function allowance(address, address) external view returns (uint256);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract Vault {

    address public immutable token;

    uint public totalSupply;

    mapping(address => uint) public balanceOf;


    costructor(address _token){
		token = _token;
	}


	function _mint(address _to, uint _amount) private{
		totalSupply += _amount;
		balanceOf[_to] += _amount
    }


	function _burn(address _from , uint _amount) private{
		totalSupply -= _amount;
		balanceOf[_from] -= _amount;
	}



	function deposit(uint _amount) payable external{

	uint shares;

	require(token.transferFrom(
		msg.sender,
		address(this),
		_amount
		),"Transfer failed"
	);

	shares =_amount;

	_mint(msg.sender,shares);
   }



	function withdraw(uint _shares) external{

		require(balanceOf[msg.sender] >= _shares,"You dont have enough shares");
    uint _amount = _shares;

		require(IERC20Token(token).transfer(
			payable(msg.sender),
			_amount
			),"Transfer failed"
		);

	   _burn(msg.sender, _shares);

	}

	function getMyShares() public view returns(uint){
		return balanceOf[msg.sender];
	}

}
```


Time to deploy our contract and test it out.

1. Install the [celoExtensionWallet]((https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmp
mkbdnfelcpgckmpcaemjcdh?hl=en)

2. Grab some testnet tokens from the [Celo Faucet](https://celo.org/developers/faucet)

3. Install the Celo Remix Plugin.

4. Follow the celo development 101 course on dacade for a guide on how to deploy your smart contract.

After deployment, we will need two things; the `Abi` of the contract, and the `contract address`.
To understand more about Abis, [check out this article]().



# Front End Development.

We will design a simple interface to interact with the smart contract that we have deployed.

We will use a boilerplate for our project.

- clone the boilerplate

```
git clone https://github.com/sam-the-tutor/celo-boilerplate-vault-dapp
```

- navigate to the boilerplate.
```
cd celo-boilerplate-vault-dapp
```

- install the necessary dependencies.
```
npm install
```

- start up a development server on your machine.
```
npm run dev
```

Our project folder contains three folders `contract`,`public` and `src.`
Inside the contract folder, we will have three files
`vault.sol`       - This will hold our contract code.
`vault.abi.json`  - This will hold the ABI bytecode for our contract
`erc20.abi.json`  - This will hold the ABI bytecode for the ERC20 interface we are using for our token.
([Learn about ABIs(Application Binary Interface )]
(https://docs.soliditylang.org/en/develop/abi-spec.html))



 Open the project in your favorite code editor, and lets write some code.

In the `public` folder, open the `index.html` file and paste the following code

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
```

Specify the document type and add some meta tags in the <head> section.
```html
<!-- CSS -->
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css"
      rel="stylesheet"
      integrity="sha384-BmbxuPwQa2lc/FVzBcNJ7UAyJxM6wuqIj61tLrc4wSX0szH/Ev+nYRRuWlolflfl"
      crossorigin="anonymous"
    />
    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap"
      rel="stylesheet"
    />
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.0/font/bootstrap-icons.css"
    />

     <style>
      :root {
        --bs-font-sans-serif: "DM Sans", sans-serif;
      }

      @media (min-width: 576px) {
        .card {
          border: 0;
          box-shadow: rgb(0 0 0 / 5%) 0px 10px 20px;
          border-radius: 10px;
        }

        .card-img-top {
          width: 100%;
          height: 20vw;
          object-fit: cover;
        }
      }
    </style>
```

We import some bootstrap files, google fonts for our html. Bootstrap re-usable components help you to build responsive websites from scratch.([Learn more about bootstrap]()).

```html
   <title>E-Shares</title>
  </head>
   <body>
    <div class="container mt-2" style="max-width: 72em">

      <nav class="navbar bg-white navbar-light">
        <div class="container-fluid">
          <span class="navbar-brand m-0 h4 fw-bold">E-Shares</span>
          <span class="nav-link border rounded-pill bg-light">
            <span id="balance">0</span>
            cUSD
          </span>
        </div>
      </nav>
      <div class="alert alert-warning sticky-top mt-2" role="alert">
    <span id="notification">⌛ Loading...</span>
  </div>
```

We add a title, and a navbar to our html. In the nav bar, we create  elements to display the name of the Dapp, show notifications, and then the balance of the user address.

```html
<main id="vault" class="row" style="margin-top: 3.5%;"></main>
 </div>
    ```

Add a main tag with id `vault`, this is where we shall display all the content.


Inside the main tag, paste the following code.

```html

```







Now open the `main.js` file in the `src` folder and paste in the following code.

```js
import Web3 from 'web3'
import { newKitFromWeb3 } from '@celo/contractkit'
import BigNumber from "bignumber.js"
import vaultAbi from '../contract/vault.abi.json'
import erc20Abi from "../contract/erc20.abi.json"
````

We import the `Web3`,`newKitFromWeb3`, `BigNumber`,`vaultAbi`, `erc20Abi`from their respective libraries

```js
let kit
let contract
````
We define our variables that will store the kit and contract instances that we will create after.

```js
const ERC20_DECIMALS = 18

const vaultContactAddress = "0x9F6654619Fac3Ca99898990a31C3A4bc9B3795C0"
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"
````

We declare a varibale `ERC20_DECIMALS` and assign 18 as its value. Most ERC20 tokens and interfaces use 18 decimals by default.
Next, we declare a variable `vaultContractAddress` to store the address of our contract which we deployed. Replace it with the address of your deployed contract.
The variable `cUSDContractAddress` stores the address of the token(cUSD) that we will be using on our Dapp.

To connect to the celo extension wallet, add the following code to our `main.js` file.

```js
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
````
In our`connectCeloWallet` function, we check if the user has installed the celoExtensionWallet. if not, we notify the user to install it. Otherwise, we notify the user to enable the Dapp to connect to the wallet. 

After the user has approved the Dapp, we get the address connected to the dapp and define it as `kit.defaultAccount`.

Next,we create a contract instance from our `vaultAbi` and `vaultContractAddress`

Read more on how to create `contract` instances to interact with the smart contracts [here].

```js
const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  document.querySelector("#balance").textContent = cUSDBalance
}
````
Using the kit instance we created before, `getTotalBalance` function checks for the token balance of the user address(`kit.defaultAccount`) connected to the Dapp.

The `totalBalance` function returns an object containing the user's `balance` for both `cUSD` and `Celo` tokens. We will only display the cUSd token balance. 

Since, the value retrieved is a `big number`. We have to first format it, by shifting the decimal places `18` places left, and using `toFixed(2)` to display only two decimal places

The function then updates html element with id `balance` with the formatted value.

```js
window.addEventListener('load', async () => {
  notification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  notificationOff()
});
````

We add an event listener to our page. Every time the page loads, we connect to our wallet and get the balance of the address.

```js
async function approve(_price) {
        const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)

        const result = await cUSDContract.methods
          .approve(vaultContactAddress, _price)
          .send({ from: kit.defaultAccount })
        return result
      }
````

Next, we define our `approve` function. This 

```js
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
```

When the user clicks on the `Buy Shares` button. We get the amount that he wants to deposit, then convert it to a big Number.

The user gives permission to the smart contract to spend the fund on his behalf using the `approve` method.

After the permission is granted, we call the `deposit` function that will deduct the `amount` from the user's account and in return issues an equivalent number of `shares`.

```js
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
````

When the use clicks on the `SELL` button, we get the `number` of `shares` that he wants to `sell`. Using the `contract.methods`, we call the `withdraw` function on the smart contract that will `sell` his `shares` and `deposit` an equivalent amount of `cUSD` in the user's account.

```js
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
````

Here, we get the `total number` of `shares` a user has by calling the `getMyShares` function from the smart contract.
We then `update` the element with id `sharesId` to display the value to the user

Thats pretty much all the code we need for our `main.js`.

> NOTICE: We wrap each of the methods in a `try and catch`. We want to be able to get the `errors` and show them to the user in case the `something` goes `wrong` . 


## Hosting the Dapp on github pages

- Build the project
```js
npm run build

 ```
 - Upload your project to github

 - Inside you project on github, click on `settings`, then select `Github Pages`

 - Select the master branch and the `docs` folder as the source.

 - Github will deploy you project, and in a few minutes the Dapp `Url` will be displayed under the `Github Pages` section.



This is final look of the Dapp.

All the code for this project can be found on my [github]() and here is a link to the [demo]().



## Conclusion.
Congratulations!!!!, you now have a fully functional Dapp on the Celo blockchain.
Feel free to play around with the code and add some functionality to the Dapp.



## Author
Samuel Atwebembeire is a back-end and smart-contract developer. I am very passionate about Web3 and AI. Lets connect on [twitter](https://twitter.com/samthetutor2)# celo-Tutorial
# celo-Tutorial
# celo-Tutorial
# celo-Tutorial
