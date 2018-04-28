var $ = require("jquery");
neonJs = require('@cityofzion/neon-js');

// Update this data from Phantasma
var dummyInboxInitialData = [
  {
    date: Date.now(),
    message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ...',
    sender: Math.random().toString(24).substring(2)
  },
  {
    date: Date.now(),
    message: 'Etiam eget ligula eu lectus lobortis condimentum. Aliquam ...',
    sender: Math.random().toString(24).substring(2)
  },
  {
    date: Date.now(),
    message: 'Pellentesque habitant morbi tristique senectus et netus et ...',
    sender: Math.random().toString(24).substring(2)
  },
  {
    date: Date.now(),
    message: 'Nulla at risus. Quisque purus magna, auctor et, sagittis ...',
    sender: Math.random().toString(24).substring(2)
  }
];

var dummyWallets = [
  {
    name: 'demo1@phantasma.io',
    address: Math.random().toString(24).substring(2),
    privateKey: Math.random().toString(24).substring(2)
  },
  {
    name: 'demo2@phantasma.io',
    address: Math.random().toString(24).substring(2),
    privateKey: Math.random().toString(24).substring(2)
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

  loadDummyData: function() {
    localStorage.setItem("disclaimerConfirm", "1");

    PH.mainWallet = 0;
    PH.wallets = dummyWallets;
    PH.loaded = true;

    PH.saveWallets();

    location.reload();
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

    PH.loaded = true;

    PH.wallets = JSON.parse(localStorage.getItem("wallets"));
    PH.mainWallet = Math.max(-1, Math.min(PH.wallets.length - 1, parseInt(localStorage.getItem("main_wallet"))));

    PH.saveWallets();
  },

  inboxPane: {
    page: 0,
    pages: 1,
    items: []
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
