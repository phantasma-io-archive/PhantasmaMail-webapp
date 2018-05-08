var $ = require("jquery");
neonJs = require('@cityofzion/neon-js');

var demoSender = {
                   name: 'Saturn Moshi',
                   address: Math.random().toString(16).substring(2)
                 };

window.PH = {
  state: {
    mainWallet: -1,
    wallets: [], // [demoWallet],
    section: 'inbox',
    topSection: 'mail',
    inbox: {
      items: [
        {
          title: 'Abstract',
          time: 1525623012,
          body: "A purely peer-to-peer version of electronic cash would allow online payments to be sent directly from one party to another without going through a financial institution. Digital signatures provide part of the solution, but the main benefits are lost if a trusted third party is still required to prevent double-spending. We propose a solution to the double-spending problem using a peer-to-peer network. The network timestamps transactions by hashing them into an ongoing chain of hash-based proof-of-work, forming a record that cannot be changed without redoing the proof-of-work. The longest chain not only serves as proof of the sequence of events witnessed, but proof that it came from the largest pool of CPU power. As long as a majority of CPU power is controlled by nodes that are not cooperating to attack the network, they'll generate the longest chain and outpace attackers.<br/><br/>Cheers,<br/>PH Dev",
          from: demoSender.address,
          from_name: demoSender.name,
          to: 'xxx'
        },
        {
          title: 'Introduction',
          time: 1525623012,
          body: "Commerce on the Internet has come to rely almost exclusively on financial institutions serving as trusted third parties to process electronic payments. While the system works well enough for most transactions, it still suffers from the inherent weaknesses of the trust based model. Completely non-reversible transactions are not really possible, since financial institutions cannot avoid mediating disputes. The cost of mediation increases transaction costs, limiting the minimum practical transaction size and cutting off the possibility for small casual transactions, and there is a broader cost in the loss of ability to make non-reversible payments for nonreversible services. With the possibility of reversal, the need for trust spreads. Merchants must be wary of their customers, hassling them for more information than they would otherwise need. A certain percentage of fraud is accepted as unavoidable. These costs and payment uncertainties can be avoided in person by using physical currency, but no mechanism exists to make payments over a communications channel without a trusted party.",
          from: demoSender.address,
          from_name: demoSender.name,
          to: 'xxx'
        }
      ],
      selected: -1
    }
  },

  loaded: false,

  saveData: function() {
    localStorage.setItem('state', JSON.stringify(window.PH.state));
  },

  loadData: function() {
    var data = localStorage.getItem('state');
    if (data) {
      window.PH.state = JSON.parse(data);
    }
  },

  onLoad: function() {
    if (PH.loaded) { return; }

    PH.loadData();
    PH.loaded = true;
    PH.saveData();
  },

  fetchInbox: function(callback) {
    // TODO: use NEO api
    // Set inboxPane.items

    if (callback) {
      callback();
    }
  },

  afterLoad: function(callback) {
    if (PH.loaded) {
      callback();
    } else {
      document.body.addEventListener("ph-local-data-loaded", callback);
    }
  },

  trunc: function(str, length) {
    if (!length) {
      length = 24;
    }

    if (str.length <= length) { return str; }

    return str.substring(0, length - 3) + '...';
  }
};

$(document).ready(function(){
  PH.onLoad();

  // Launch "ph-local-data-loaded" event
  var event;
  if (document.createEvent) {
    event = document.createEvent("HTMLEvents");
    event.initEvent("ph-local-data-loaded", true, true);
  } else {
    event = document.createEventObject();
    event.eventType = "ph-local-data-loaded";
  }

  event.eventName = "ph-local-data-loaded";

  if (document.createEvent) {
    document.body.dispatchEvent(event);
  } else {
    document.body.fireEvent("on" + event.eventType, event);
  }
});
