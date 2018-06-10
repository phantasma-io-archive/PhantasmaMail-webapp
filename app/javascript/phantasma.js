var $ = require("jquery");
neonJs = require('@cityofzion/neon-js');
Neon = neonJs.default;

var demoSender = {
                   name: 'Saturn Moshi',
                   address: Math.random().toString(16).substring(2)
                 };

var dummyContent = [
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
  ];

window.PH = {
  state: {
    mainWallet: -1,
    wallets: [],
    section: 'inbox',
    topSection: 'mail',
    inbox: {
      items: [],
      filter: '',
      selected: -1
    }
  },

  neoWallet: null, // Actual NeonJS wallet

  loaded: false,

  saveData: function() {
    var filtered = PH.itemsFiltered();
    if (PH.state.inbox.selected >= filtered.length) {
      PH.state.inbox.selected = filtered.length - 1;
    }

    localStorage.setItem('state', JSON.stringify(PH.state));
  },

  loadData: function() {
    var data = localStorage.getItem('state');
    if (data) {
      PH.state = JSON.parse(data);

      if (PH.neoWallet === null && PH.state.mainWallet !== -1) {
        try {
          PH.neoWallet = Neon.create.account(PH.state.wallets[PH.state.mainWallet].privateKey);
        } catch (e) {}
      }
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
  },

  itemsFiltered: function() {
    var filter = PH.state.inbox.filter.toLowerCase();
    if (filter.length === 0) { return PH.state.inbox.items; }

    return PH.state.inbox.items.filter(function(item) {
      return item.title.toLowerCase().indexOf(filter) !== -1 ||
             item.body.toLowerCase().indexOf(filter) !== -1 ||
             item.from.toLowerCase().indexOf(filter) !== -1 ||
             item.from_name.toLowerCase().indexOf(filter) !== -1 ||
             item.to.toLowerCase().indexOf(filter) !== -1;
    });
  },

  getCurrentWallet: function() {
    return PH.state.mainWallet === -1 ? null : PH.state.wallets[PH.state.mainWallet];
  },

  contract: {
    // See https://github.com/PhantasmaProtocol/PhantasmaNeo/blob/version2/PhantasmaContract/Contract.cs
    scriptHash: 'ed07cffad18f1308db51920d99a2af60ac66a7b3',

    // Start of test functions:
    tranferGas: function(destAddress, gasAmount /* float */, callback) {
      var intent = neonJs.api.makeIntent({ GAS: gasAmount }, destAddress);

      var config = {
        net: 'MainNet',
        account: PH.neoWallet,
        intents: intent
      };

      Neon.sendAsset(config)
      .then(res => {
        console.log(res);

        if (callback) {
          callback(res);
        }
      });
    },

    tranferNeo: function(destAddress, neoAmount /* integer */, callback) {
      var intent = neonJs.api.makeIntent({ NEO: neoAmount }, destAddress);

      var config = {
        net: 'MainNet',
        account: PH.neoWallet,
        intents: intent
      };

      Neon.sendAsset(config)
      .then(res => {
        console.log(res);

        if (callback) {
          callback(res);
        }
      });
    },

    claimGas: function(callback) {
      var config = {
        net: 'MainNet',
        account: PH.neoWallet
      };

      Neon.claimGas(config)
      .then(res => {
        console.log(res);

        if (callback) {
          callback(res);
        }
      });
    },

    getName: function(callback) {
      var props = {
        scriptHash: PH.contract.scriptHash,
        operation: 'name',
        args: []
      };

      var script = Neon.create.script(props);

      neonJs.rpc.Query.invokeScript(script, false).execute('http://seed1.cityofzion.io:8080')
      .then(res => {
        console.log(res);

        if (callback) {
          callback(Neon.u.hexstring2str(res.result.stack[0].value));
        }
      });
    },

    getNameDecimalsSymbolSupply: function(callback) {
      var scriptHash = PH.contract.scriptHash;

      var getName = { scriptHash, operation: 'name', args: [] };
      var getDecimals = { scriptHash, operation: 'decimals', args: [] };
      var getSymbol = { scriptHash, operation: 'symbol', args: [] };
      var getTotalSupply = { scriptHash, operation: 'totalSupply', args: [] };

      var script = Neon.create.script([getName, getDecimals, getSymbol, getTotalSupply]);

      neonJs.rpc.Query.invokeScript(script, false).execute('http://seed1.cityofzion.io:8080')
      .then(res => {
        console.log(res);

        if (callback) {
          callback([
            Neon.u.hexstring2str(res.result.stack[0].value),
            parseInt(res.result.stack[1].value),
            Neon.u.hexstring2str(res.result.stack[2].value),
            Neon.u.fixed82num(res.result.stack[3].value),
          ]);
        }
      });
    },

    validateAddress: function(address, callback) {
      var props = {
        scriptHash: PH.contract.scriptHash,
        operation: 'validateAddress',
        args: [
          neonJs.sc.ContractParam.byteArray(address, 'address')
        ]
      };

      var script = Neon.create.script(props);

      neonJs.rpc.Query.invokeScript(script, false).execute('http://seed1.cityofzion.io:8080')
      .then(res => {
        console.log(res);

        if (callback) {
          callback(res.result.stack[0].value == '1');
        }
      });
    },

    validateMailboxName: function(callback) {
      var friendlyName = PH.state.wallets[PH.state.mainWallet].name;

      var props = {
        scriptHash: PH.contract.scriptHash,
        operation: 'validateMailboxName',
        args: [
          neonJs.sc.ContractParam.byteArray(Neon.u.str2hexstring(friendlyName), 'string'),
        ]
      };

      var script = Neon.create.script(props);

      neonJs.rpc.Query.invokeScript(script, false).execute('http://seed1.cityofzion.io:8080')
      .then(res => {
        console.log(res);

        if (callback) {
          callback(Neon.u.hexstring2str(res.result.stack[0].value));
        }
      });
    },
    // End of test functions.

    registerMailbox: function(callback) {
      var friendlyName = PH.state.wallets[PH.state.mainWallet].name;

      var config = {
        net: 'MainNet',
        script: Neon.create.script({
          scriptHash: PH.contract.scriptHash,
          operation: 'registerMailbox',
          args: [
            neonJs.sc.ContractParam.byteArray(PH.neoWallet.address, 'address'),
            neonJs.sc.ContractParam.byteArray(Neon.u.str2hexstring(friendlyName), 'string'),
          ]
        }),
        account: PH.neoWallet,
        gas: 0
      }

      Neon.doInvoke(config).then(res => {
        console.log(res)

        if (callback) {
          callback();
        }
      })
    },

    getMailboxFromAddress: function(callback) {
      var props = {
        scriptHash: PH.contract.scriptHash,
        operation: 'getMailboxFromAddress',
        args: [
          neonJs.sc.ContractParam.byteArray(PH.neoWallet.address, 'address'),
        ]
      };

      var script = Neon.create.script(props);

      neonJs.rpc.Query.invokeScript(script, false).execute('http://seed1.cityofzion.io:8080')
      .then(res => {
        console.log(res);

        if (callback) {
          var ret = null;
          try {
            ret = Neon.u.hexstring2str(res.result.stack[0].value);
            if (ret.length === 0) {
              ret = null;
            }
          } catch(e) {}

          callback(ret);
        }
      });
    },

    getAddressFromMailbox: function(callback) {
      var friendlyName = PH.state.wallets[PH.state.mainWallet].name;

      var props = {
        scriptHash: PH.contract.scriptHash,
        operation: 'getAddressFromMailbox',
        args: [
          neonJs.sc.ContractParam.byteArray(Neon.u.str2hexstring(friendlyName), 'string')
        ]
      };

      var script = Neon.create.script(props);

      neonJs.rpc.Query.invokeScript(script, false).execute('http://seed1.cityofzion.io:8080')
      .then(res => {
        console.log(res);

        if (callback) {
          var ret = null;
          try {
            ret = Neon.u.str2ab(res.result.stack[0].value);
            if (ret.length === 0) {
              ret = null;
            }
          } catch(e) {}

          callback(ret);
        }
      });
    },

    getInboxCount: function(callback) {
      var friendlyName = PH.state.wallets[PH.state.mainWallet].name;

      var props = {
        scriptHash: PH.contract.scriptHash,
        operation: 'getInboxCount',
        args: [
          neonJs.sc.ContractParam.byteArray(Neon.u.str2hexstring(friendlyName), 'string')
        ]
      };

      var script = Neon.create.script(props);

      neonJs.rpc.Query.invokeScript(script, false).execute('http://seed1.cityofzion.io:8080')
      .then(res => {
        console.log(res);

        if (callback) {
          var ret = 0;
          try {
            ret = parseInt(res.result.stack[0].value);
          } catch(e) {}

          callback(ret);
        }
      });
    },

    sendMessage: function(destFriendlyName, message, callback) {
      var config = {
        net: 'MainNet',
        script: Neon.create.script({
          scriptHash: PH.contract.scriptHash,
          operation: 'sendMessage',
          args: [
            neonJs.sc.ContractParam.byteArray(PH.neoWallet.address, 'address'),
            neonJs.sc.ContractParam.byteArray(Neon.u.str2hexstring(destFriendlyName), 'string'),
            neonJs.sc.ContractParam.byteArray(Neon.u.str2hexstring(btoa(message)), 'string'),
          ]
        }),
        account: PH.neoWallet,
        gas: 0
      }

      Neon.doInvoke(config).then(res => {
        console.log(res)

        if (callback) {
          callback(res);
        }
      });
    },




    // TODO: not working yet
    getMailContent: function(index, callback) {
      // TODO:

      if (callback) {
        // TODO
        return callback(dummyContent[index]);
      }
    },

    // TODO: not working yet
    sendMessage: function(recipient, message, callback) {
      // TODO
      if (callback) {
        callback();
      }
    },

    // TODO: not working yet
    fetchInbox: function(callback) {
      //PH.contract.getMailCount(function(count) {
      (function() {
        recursiveInboxFetch = function(acc1, index1, count1, callback1) {
          if (count1 === index1) {
            // Finished
            PH.state.inbox.items = acc1;
            PH.saveData();
            if (callback1) {
              callback1();
            }
            return;
          }

          PH.contract.getMailContent(index1, function(content) {
            acc1.push(content);
            recursiveInboxFetch(acc1, index1 + 1, count1, callback1);
          });
        };
        recursiveInboxFetch([], 0, count, callback);
      })();
//      });
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
