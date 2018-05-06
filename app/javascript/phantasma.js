var $ = require("jquery");
neonJs = require('@cityofzion/neon-js');

// Update this data from Phantasma
var dummyInboxInitialData = [
  {
    date: Date.now(),
    message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ...',
    sender: Math.random().toString(16).substring(2)
  },
  {
    date: Date.now(),
    message: 'Etiam eget ligula eu lectus lobortis condimentum. Aliquam ...',
    sender: Math.random().toString(16).substring(2)
  },
  {
    date: Date.now(),
    message: 'Pellentesque habitant morbi tristique senectus et netus et ...',
    sender: Math.random().toString(16).substring(2)
  },
  {
    date: Date.now(),
    message: 'Nulla at risus. Quisque purus magna, auctor et, sagittis ...',
    sender: Math.random().toString(16).substring(2)
  }
];

var dummyWallets = [
  {
    name: 'demo1@phantasma.io',
    address: Math.random().toString(16).substring(2),
    privateKey: Math.random().toString(16).substring(2)
  },
  {
    name: 'demo2@phantasma.io',
    address: Math.random().toString(16).substring(2),
    privateKey: Math.random().toString(16).substring(2)
  }
];

PH_ITEMS_PER_PAGE = 50;

window.timestampToDateString = function(timestamp) {
  return new Date(timestamp).toISOString().replace('T', ' ').substring(0, 19);
}

window.PH = {
  state: {
    mainWallet: 0,
    wallets: [
      {
        name: 'my-new-demo@phantasma.io',
        address: Math.random().toString(16).substring(2),
        privateKey: Math.random().toString(16).substring(2)
      }
    ],
    section: 'inbox',
    inbox: {
      items: [
        {
          title: 'Phantasma Project',
          time: 1525623012,
          body: "A purely peer-to-peer version of electronic cash would allow online payments to be sent directly from one party to another without going through a financial institution. Digital signatures provide part of the solution, but the main benefits are lost if a trusted third party is still required to prevent double-spending. We propose a solution to the double-spending problem using a peer-to-peer network. The network timestamps transactions by hashing them into an ongoing chain of hash-based proof-of-work, forming a record that cannot be changed without redoing the proof-of-work. The longest chain not only serves as proof of the sequence of events witnessed, but proof that it came from the largest pool of CPU power. As long as a majority of CPU power is controlled by nodes that are not cooperating to attack the network, they'll generate the longest chain and outpace attackers.<br/><br/>Cheers,<br/>PH Dev",
          from: Math.random().toString(16).substring(2),
          from_name: 'Mark Marcus',
          to: Math.random().toString(16).substring(2)
        },
        {
          title: 'Phantasma Project #2',
          time: 1525623012,
          body: "A purely peer-to-peer version of electronic cash would allow online payments to be sent directly from one party to another without going through a financial institution. Digital signatures provide part of the solution, but the main benefits are lost if a trusted third party is still required to prevent double-spending. We propose a solution to the double-spending problem using a peer-to-peer network. The network timestamps transactions by hashing them into an ongoing chain of hash-based proof-of-work, forming a record that cannot be changed without redoing the proof-of-work. The longest chain not only serves as proof of the sequence of events witnessed, but proof that it came from the largest pool of CPU power. As long as a majority of CPU power is controlled by nodes that are not cooperating to attack the network, they'll generate the longest chain and outpace attackers.<br/><br/>Cheers,<br/>PH Dev",
          from: Math.random().toString(16).substring(2),
          from_name: 'Ruby Rubicon',
          to: Math.random().toString(16).substring(2)
        }
      ],
      selected: -1
    }
  },
  loaded: false,

  loadDummyData: function() {
    localStorage.setItem("disclaimerConfirm", "1");

    PH.mainWallet = 0;
    PH.wallets = dummyWallets;
    PH.loaded = true;

    PH.saveWallets();

    location.reload();
  },

  saveData: function() {
    localStorage.setItem('state', JSON.stringify(window.PH.state));
  },

  loadData: function() {
    var data = localStorage.getItem('state');
    if (data) {
      window.PH.state = JSON.parse(data);
    }
  },

  saveWallets: function() {
    localStorage.setItem("wallets", JSON.stringify(PH.wallets));

    localStorage.setItem("main_wallet", Math.max(-1, Math.min(PH.wallets.length - 1, PH.mainWallet)));
  },

  addWallet: function(email, priv_key) {
    // TODO: use NEO api
    // and set current wallet to newly created wallet
    return false;
  },

  selectWallet(number) {
    if (number < 0 || number >= PH.wallets.length) {
      console.warn('Illegal wallet selected');
      return;
    }

    PH.mainWallet = number;

    PH.saveWallets();

    location.reload();
  },

  forgetWallet: function() {
    if (PH.mainWallet === -1 || PH.mainWallet >= PH.wallets.length) { return; }

    PH.wallets.splice(PH.mainWallet, 1);

    PH.mainWallet = PH.wallets.length > 0 ? 0 : -1;
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
