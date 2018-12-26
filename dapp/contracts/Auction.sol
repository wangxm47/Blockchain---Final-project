pragma solidity ^0.4.22;

contract Auction {
    // 拍卖的参数。
    //拍卖品的名字
    string name;
    //拍卖者
    address public Auctioneer;
    //慈善机构
    address public Charity;
    // 时间是unix的绝对时间戳（自1970-01-01以来的秒数）
    // 或以秒为单位的时间段。
    uint public auctionEndTime;

    // 拍卖的当前状态
    //是否为慈善拍卖
    bool charitable;
    //当前出价最高者
    address private highestBidder;
    //最高价
    uint public highestBid;

    // 拍卖结束后设为 true，将禁止所有的变更
    bool ended;

    // 变更触发的事件
    event HighestBidChange(address bidder, uint amount);
    event AuctionEnded(address winner, uint amount);

    // 以下是所谓的 natspec 注释，可以通过三个斜杠来识别。
    // 当用户被要求确认交易时将显示。

    /// 以拍卖者地址 `_Auctioneer` 的名义，
    /// 创建一个简单的拍卖，拍卖时间为 `_biddingTime`分钟 。
    constructor(
        string _name,
        uint _biddingTime,
        address _Auctioneer,
        address _Charity,
        bool _charitable
    ) public {
        name = _name;
        Auctioneer = _Auctioneer;
        charitable = _charitable;
        if(charitable){
            Charity = _Charity;
        }
        auctionEndTime = now + _biddingTime*60;
    }

    /// 退款（当该出价已被超越）
    function Refund() private returns(bool) {
        return highestBidder.send(highestBid);
    }

    /// 对拍卖进行出价，具体的出价随交易一起发送。
    /// 如果没有在拍卖中胜出，则返还出价。
    function bid() public payable returns(bool result){
        // 参数不是必要的。因为所有的信息已经包含在了交易中。
        // 对于能接收以太币的函数，关键字 payable 是必须的。

        // 如果拍卖已结束，撤销函数的调用。
        require(
            now <= auctionEndTime,
            "Auction already ended."
        );

        // 如果出价不够高，返还你的钱
        require(
            msg.value > highestBid,
            "There already is a higher bid."
        );
        //出价者不能为拍卖者
        require(
            msg.sender != Auctioneer,
            "Auctioneer can't join the auction!"
        );
        //出价者不能为慈善机构 
        require(
            msg.sender != Charity,
            "Charity can't join the auction!"
        );
        if (highestBid != 0) {
            require(
                Refund(),
                "Refund fail!"
            );
        }
        highestBidder = msg.sender;
        highestBid = msg.value;
        emit HighestBidChange(msg.sender, msg.value);
        return true;
    }


    /// 结束拍卖，并把最高的出价发送给受益人
    function AuctionEnd() public returns(bool result){
        // 对于可与其他合约交互的函数（意味着它会调用其他函数或发送以太币），
        // 一个好的指导方针是将其结构分为三个阶段：
        // 1. 检查条件
        // 2. 执行动作 (可能会改变条件)
        // 3. 与其他合约交互
        // 如果这些阶段相混合，其他的合约可能会回调当前合约并修改状态，
        // 或者导致某些效果（比如支付以太币）多次生效。
        // 如果合约内调用的函数包含了与外部合约的交互，
        // 则它也会被认为是与外部合约有交互的。

        // 1. 条件
        require(msg.sender==Auctioneer,"Only Auctioneer can end this Auction!");
        require(now >= auctionEndTime, "Auction not yet ended.");
        require(!ended, "auctionEnd has already been called.");

        // 2. 生效
        ended = true;
        emit AuctionEnded(highestBidder, highestBid);

        // 3. 交互
        if(charitable){
            Charity.transfer(highestBid);
        }
        else{
            Auctioneer.transfer(highestBid);    
        }
        return true;
    }
    
}
