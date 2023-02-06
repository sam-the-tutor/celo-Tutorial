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


    constructor(address _token){
        token = _token;
    }


    function _mint(address _to, uint _amount) private{
        totalSupply += _amount;
        balanceOf[_to] += _amount;
    }


    function _burn(address _from , uint _amount) private{
        totalSupply -= _amount;
        balanceOf[_from] -= _amount;
    }



    function deposit(uint _amount) payable external{

    uint shares;

    require(IERC20Token(token).transferFrom(
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