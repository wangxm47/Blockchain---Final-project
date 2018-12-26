window.App = {
    web3Provider: null,
    contracts: {},
    web3: null,
    auctions: [],
    init: async function () {
        // Load pets.
        return await App.initWeb3();
    },

    initWeb3: async function () {
        // Is there an injected web3 instance?
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
        } else {
            // If no injected web3 instance is detected, fall back to Ganache
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(App.web3Provider);
        return App.initContract();
    },

    initContract: function () {
        // 加载Adoption.json，保存了Adoption的ABI（接口说明）信息及部署后的网络(地址)信息，它在编译合约的时候生成ABI，在部署的时候追加网络信息
        $.getJSON('Auction.json', function (data) {
            // 用Adoption.json数据创建一个可交互的TruffleContract合约实例。
            var AuctionArtifact = data;
            App.contracts.Auction = TruffleContract(AuctionArtifact);

            // Set the provider for our contract
            App.contracts.Auction.setProvider(App.web3Provider);
        });
    },

    initNewAuction: function (id,name, time, Auctioneer, Charity, charitable) {
        App.contracts.Auction.new(name, time, Auctioneer, Charity, charitable).then(function (instance) {
            console.log(instance.address);
            App.auctions.push(instance.address);
            var auction = new Object();
            auction.id = id;
            auction.name = name;
            auction.Auctioneer = Auctioneer;
            var date = new Date(Date());
            date.setMinutes(date.getMinutes() + time);
            auction.time = date.toLocaleString('cn-CN');
            auction.charitable = charitable;
            auction.Charity = Charity;
            auction.highestBid = 0;
            Seed.submissions.push(auction);
            console.log(Seed.submissions);
        }).catch(function (err) {
            alert(err.message.substring(err.message.indexOf("revert")+7));
        })
    },

    Bid: function (index, val) {
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }

            var account = accounts[0];
            App.contracts.Auction.at(App.auctions[index]).then(function (instance) {
                ins = instance;
                return ins.bid({
                    from: account,
                    value: web3.toWei(val, "ether")
                });
            }).then(function (result) {
                if (result) {
                    alert("竞价成功!");
                    Seed.submissions.find(function (element) {
                        return element.id == index;
                    }).highestBid = val;
                }
            }).catch(function (err) {
                alert(err.message.substring(err.message.indexOf("revert")+7));
            });
        });
    },

    end: function (index) {
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }

            var account = accounts[0];
            App.contracts.Auction.at(App.auctions[index]).then(function (instance) {
                ins = instance;
                return ins.AuctionEnd({
                    from: account
                });
            }).then(function (result) {
                if (result) {
                    alert("已成功结束拍卖!");
                    var i = Seed.submissions.findIndex(function (element) {
                        return element.id == index;
                    });
                    Seed.submissions.splice(i, 1);
                }
            }).catch(function (err) {
                alert(err.message.substring(err.message.indexOf("revert")+7));
            });
        });
    },

    get_account: function () {
        var accounts = web3.eth.accounts;
        console.log(accounts);
        var account = accounts[0];
        return account;
    }
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});