var $ = require("jquery");
neonJs = require('@cityofzion/neon-js');

// Update this data from Phantasma
var dummyInboxInitialData = [
  {
    date: Date.now(),
    message: 'Lorem ipsum',
    sender: Math.random().toString(16).substring(2)
  },
  {
    date: Date.now(),
    message: 'Lorem ipsum 2',
    sender: Math.random().toString(16).substring(2)
  },
  {
    date: Date.now(),
    message: 'Lorem ipsum 3',
    sender: Math.random().toString(16).substring(2)
  },
  {
    date: Date.now(),
    message: 'Lorem ipsum 4',
    sender: Math.random().toString(16).substring(2)
  }
];

PH_ITEMS_PER_PAGE = 50;

window.timestampToDateString = function(timestamp) {
  return new Date(timestamp).toISOString().replace('T', ' ').substring(0, 19);
}

window.PH = {
  mainWallet: -1,
  wallets: [],
  loaded: false,

  saveWallets: function() {
    localStorage.setItem("wallets", JSON.stringify(PH.wallets));
    localStorage.setItem("main_wallet", PH.mainWallet);
  },

  addWallet: function(email, priv_key) {
    // TODO: use NEO api
    // and set current wallet to newly created wallet
    return false;
  },

  forgetWallet: function() {
    if (PH.mainWallet === -1 || PH.mainWallet >= PH.wallets.length) { return; }

    PH.wallets.splice(PH.mainWallet, 1);

    PH.mainWallet = PH.wallets.length > 0 ? 0 : -1;
  },

  onLoad: function() {
    if (PH.loaded) { return; }

    if (typeof(Storage) !== "undefined" && localStorage.getItem("wallets")) {
      PH.wallets = JSON.parse(localStorage.getItem("wallets"));
      PH.mainWallet = PH.wallets.length > 0 ? 0 : -1;
    }

    PH.saveWallets();

    PH.loaded = true;

    PH.fetchInbox();
  },

  inboxPane: {
    page: 0,
    pages: Math.max(Math.floor((dummyInboxInitialData.length + PH_ITEMS_PER_PAGE - 1) / PH_ITEMS_PER_PAGE), 1),
    items: dummyInboxInitialData
  },

  fetchInbox: function(callback) {
    // TODO: use NEO api
    // Set inboxPane.items

    if (callback) {
      callback();
    }
  }
};

$(document).ready(function(){
  PH.onLoad();
});
