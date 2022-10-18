# <p align="center">Hacktoberfest 2022</p>
👋 Hi Hackers, its a great day if you stumbled on this repository from anywhere

To start contributing to this repository, checkout the [Contributing guidelines](https://github.com/aditya172926/uni3_credit_card/blob/main/CONTRIBUTING.md)

All the Repositories (Smart contracts, Backend and Frontend) are also Open for Contributions

To know more about this project, continue reading...

Give this Repository a ⭐

# <p align="center">Uni3 Borrowing Contracts</p>

Uni3 is a digital credit card that allows people to borrow money from their family, friends,
co-workers or connections. This enables the peer network that financially backs one another
and earns a passive income as lenders.

Website - https://uni3-credit-card.vercel.app/

Smart Contracts Repository - [Uni3 Smart Contracts](https://github.com/aditya172926/uni3_cards_contracts)

Backend Repository - [Uni3 backend](https://github.com/aditya172926/Uni3_card_backend)

## <p align="center">Technologies Used</p>
Website
- Ether js
- React JS
- Uniswap Widget for swapping tokens

Smart Contracts
- Solidity for smart contract development
- Remix for testing
- Hardhat for deployment

For Backend
- Node Js
- Express
- MongoDB for database

## <p align="center">Specifications of the Project</p>
Dapp allows to borrow USDC and other ERC20 tokens.<br>
Other Erc20 tokens support will be implemented with their wrapper addresses such as WBTC, WETH, etc.

Borrowers earn an interest based on the number of installments paid in upon the principle amount. The split payments are as follows
 - 1st installment - Interest Rate = 1%, Treasury Fee = 0.5%
 - 2st installment - Interest Rate = 2%, Treasury Fee = 1.0%
 - 3st installment - Interest Rate = 3%, Treasury Fee = 1.5%

Currently the repayments are done in the same token as the one used to borrow. The lenders can use **Uniswap widget modal** integrated to Swap their ERC20 tokens to desired tokens.

Users can switch between Polygon and Ethereum testnet.

Contracts deployed on Ethereum Goreli Testnet - [Contract Transactions](https://goerli.etherscan.io/address/0xACc7b2B27BF44314248b4d3F8960D93Ce8e137b3), [Smart Contract Repository](https://github.com/aditya172926/uni3_cards_contracts)
