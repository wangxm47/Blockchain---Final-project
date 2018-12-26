const submissionComponent = {
  template: ` <div id="AuctionTemplate">
      <div class="col-sm-6 col-md-4 col-lg-4">
        <div class="panel panel-default panel-pet">
          <div class="panel-heading">
            <h3 class="panel-title">{{submission.name}}</h3>
          </div>
          <div class="panel-body">
            <img alt="140x140" data-src="holder.js/140x140" class="img-rounded img-center" style="width: 100%;" src="images/auction.jpg"
              data-holder-rendered="true">
            <br /><br />
            <strong>拍卖者:</strong> <span class="Auctioneer" style="font-size: 14px">{{submission.Auctioneer}}</span><br />
            <strong>结束时间:</strong> <span class="auctionEndTime" style="font-size: 14px">{{submission.time}}</span><br />
            <strong>是否为慈善拍卖:</strong> <span class="charitable" style="font-size: 14px" v-if = "submission.charitable">是</span><span v-else>否</span><br />
            <strong v-if = "submission.charitable">慈善组织:</strong> <span class="Charity" style="font-size: 14px" v-if = "submission.charitable">{{submission.Charity}}</span><br />
            <strong>当前最高价:</strong> <span class="highestBid" style="font-size: 14px">{{submission.highestBid}}</span><br /><br />
            <button class="btn btn-default btn-auction" type="button" id="submission.id" @click="Bid(submission.id)">出价</button>
            <button class="btn btn-default btn-end" type="button" id="submission.id"@click="end(submission.id)">结束拍卖</button>
          </div>
        </div>
      </div>
    </div>`,
  props: ['submission', 'submissions'],
  methods: {
    Bid: function (id) {
      var temp = submissions.find(function (element) {
        return element.id == id;
      });
      var val = prompt("出价(应比当前最高价高):", temp.highestBid);
      if (val == null) {
        return;
      } else {
        App.Bid(temp.id, parseInt(val));
      }
    },
    end: function (id) {
      var temp = submissions.find(function (element) {
        return element.id == id;
      });

      App.end(temp.id);
    }
  }
};
var id = 0;
// var auction = {
//   id: 0,
//   name: "",
//   Auctioneer: "",
//   time: "",
//   charitable: false,
//   Charity: "",
//   highestBid: 0
// }
new Vue({
  el: '#AuctionsRow',
  data: {
    submissions: Seed.submissions
  },
  components: {
    'submission-component': submissionComponent
  }
});

new Vue({
  el: '#add',
  data: {
    charitable: ($("#new_charitable").val() == "是")
  },
  methods: {
    change: function () {
      this.charitable = ($("#new_charitable").val() == "是");
    },
    add_new_auction: function () {
      if ($("#new_name").val() == "") {
        alert("拍卖品不能为空!");
        $("#new_Charity").val() = $("#new_time").val() = $("#new_Auctioneer").val() = $("#new_name").val() = "";
        return;
      } else if ($("#new_Auctioneer").val() == "") {
        alert("拍卖者不能为空!");
        $("#new_Charity").val() = $("#new_time").val() = $("#new_Auctioneer").val() = $("#new_name").val() = "";
        return;
      } else if ($("#new_time").val() == "") {
        alert("拍卖时间不能为空!");
        $("#new_Charity").val() = $("#new_time").val() = $("#new_Auctioneer").val() = $("#new_name").val() = "";
        return;
      } else if (parseInt($("#new_time").val()) <= 0) {
        alert("拍卖时间必须大于0分钟!");
        $("#new_Charity").val() = $("#new_time").val() = $("#new_Auctioneer").val() = $("#new_name").val() = "";
        return;
      } else if (this.charitable && $("#new_Charity").val() == "") {
        alert("慈善机构不能为空!");
        $("#new_Charity").val() = $("#new_time").val() = $("#new_Auctioneer").val() = $("#new_name").val() = "";
        return;
      }

      var name = $("#new_name").val();
      var Auctioneer = App.get_account();
      var date = new Date(Date());
      var time = $("#new_time").val();

      var charitable = this.charitable;
      var Charity = $("#new_Charity").val();
      App.initNewAuction(id,name, parseInt(time), Auctioneer, Charity, charitable)
      
      id++;

      $("#new_Charity").val("");
      $("#new_time").val("");
      $("#new_Auctioneer").val("");
      $("#new_name").val("");
    }
  },
});