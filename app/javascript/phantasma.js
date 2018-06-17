var $ = require("jquery");
neonJs = require('@cityofzion/neon-js');
Neon = neonJs.default;

window.PH = {
  version: 'w1',
  // https://github.com/PhantasmaProtocol/PhantasmaNeo/blob/version2/PhantasmaContract/Contract.cs
  contractScriptHash: 'ed07cffad18f1308db51920d99a2af60ac66a7b3',
  state: {
    mainWallet: -1,
    wallets: [],
    section: 'inbox',
    topSection: 'mail',
    inbox: {
      items: [],
      filter: '',
      selected: -1
    },
    outbox: {
      items: [],
      filter: '',
      selected: -1
    }
  },

  neoWallet: null, // Actual NeonJS wallet

  loaded: false,

  saveData: function() {
    var filtered = PH.itemsFiltered();

    if (PH.state[PH.state.section].selected >= filtered.length) {
      PH.state[PH.state.section].selected = filtered.length - 1;
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
    var items = PH.state[PH.state.section].items.sort(function(a, b) {
      try {
        return b.date.localeCompare(a.date);
      } catch(e) {
        return 0;
      }
    });

    var filter = PH.state[PH.state.section].filter.toLowerCase();
    if (filter.length === 0) {
      return items;
    }

    return items.filter(function(item) {
      return item.subject.toLowerCase().indexOf(filter) !== -1 ||
             item.content.toLowerCase().indexOf(filter) !== -1 ||
             item.fromAddress.toLowerCase().indexOf(filter) !== -1 ||
             item.fromInbox.toLowerCase().indexOf(filter) !== -1 ||
             item.toAddress.toLowerCase().indexOf(filter) !== -1 ||
             item.toInbox.toLowerCase().indexOf(filter) !== -1;
    });
  },

  getCurrentWallet: function() {
    return PH.state.mainWallet === -1 ? null : PH.state.wallets[PH.state.mainWallet];
  },

  contract: {
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
        if (callback) {
          callback(res);
        }
      });
    },

    getName: function(callback) {
      var config = {
        scriptHash: PH.contractScriptHash,
        operation: 'name',
        args: []
      };

      var script = Neon.create.script(config);

      neonJs.rpc.Query.invokeScript(script, false).execute('http://seed1.cityofzion.io:8080')
      .then(res => {
        if (callback) {
          callback(Neon.u.hexstring2str(res.result.stack[0].value));
        }
      });
    },

    getNameDecimalsSymbolSupply: function(callback) {
      var scriptHash = PH.contractScriptHash;

      var getName = { scriptHash, operation: 'name', args: [] };
      var getDecimals = { scriptHash, operation: 'decimals', args: [] };
      var getSymbol = { scriptHash, operation: 'symbol', args: [] };
      var getTotalSupply = { scriptHash, operation: 'totalSupply', args: [] };

      var script = Neon.create.script([getName, getDecimals, getSymbol, getTotalSupply]);

      neonJs.rpc.Query.invokeScript(script, false).execute('http://seed1.cityofzion.io:8080')
      .then(res => {
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
      var config = {
        scriptHash: PH.contractScriptHash,
        operation: 'validateAddress',
        args: [
          neonJs.sc.ContractParam.byteArray(address, 'address')
        ]
      };

      var script = Neon.create.script(config);

      neonJs.rpc.Query.invokeScript(script, false).execute('http://seed1.cityofzion.io:8080')
      .then(res => {
        if (callback) {
          callback(res.result.stack[0].value == '1');
        }
      });
    },

    validateMailboxName: function(callback) {
      var friendlyName = PH.state.wallets[PH.state.mainWallet].name;

      var config = {
        scriptHash: PH.contractScriptHash,
        operation: 'validateMailboxName',
        args: [
          neonJs.sc.ContractParam.byteArray(Neon.u.str2hexstring(friendlyName), 'string'),
        ]
      };

      var script = Neon.create.script(config);

      neonJs.rpc.Query.invokeScript(script, false).execute('http://seed1.cityofzion.io:8080')
      .then(res => {
        if (callback) {
          callback(Neon.u.hexstring2str(res.result.stack[0].value));
        }
      });
    },
    // End of test functions.

    registerMailbox: function(friendlyName, optCallback) {
      var config = {
        net: 'MainNet',
        script: Neon.create.script({
          scriptHash: PH.contractScriptHash,
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
        if (optCallback) {
          var result = false;
          try {
            result = res.response.result && res.response.txid.length > 0;
          } catch(e) {}

          optCallback(result);
        }
      });
    },

    getMailboxFromAddress: function(callback) {
      var config = {
        scriptHash: PH.contractScriptHash,
        operation: 'getMailboxFromAddress',
        args: [
          neonJs.sc.ContractParam.byteArray(PH.neoWallet.address, 'address'),
        ]
      };

      var script = Neon.create.script(config);

      neonJs.rpc.Query.invokeScript(script, false).execute('http://seed1.cityofzion.io:8080')
      .then(res => {
        var ret = null;
        try {
          ret = Neon.u.hexstring2str(res.result.stack[0].value);
          if (ret.length === 0) {
            ret = null;
          }
        } catch(e) {}

        callback(ret);
      });
    },

    getAddressFromMailbox: function(friendlyName, callback) {
      var config = {
        scriptHash: PH.contractScriptHash,
        operation: 'getAddressFromMailbox',
        args: [
          neonJs.sc.ContractParam.byteArray(Neon.u.str2hexstring(friendlyName), 'string')
        ]
      };

      var script = Neon.create.script(config);

      neonJs.rpc.Query.invokeScript(script, false).execute('http://seed1.cityofzion.io:8080')
      .then(res => {
        var ret = null;
        try {
          ret = res.result.stack[0].value;
          if (ret.length === 0) {
            ret = null;
          }

          ret = Neon.create.account(ret).address;
        } catch(e) {}

        callback(ret);
      });
    },

    getInboxCount: function(callback) {
      var friendlyName = PH.state.wallets[PH.state.mainWallet].name;

      var config = {
        scriptHash: PH.contractScriptHash,
        operation: 'getInboxCount',
        args: [
          neonJs.sc.ContractParam.byteArray(Neon.u.str2hexstring(friendlyName), 'string')
        ]
      };

      var script = Neon.create.script(config);

      neonJs.rpc.Query.invokeScript(script, false).execute('http://seed1.cityofzion.io:8080')
      .then(res => {
        var ret = 0;
        try {
          ret = parseInt(res.result.stack[0].value);
          if (isNaN(ret) || ret < 0) {
            ret = 0;
          }
        } catch(e) {}

        callback(ret);
      });
    },

    getInboxContent: function(number, callback) {
      var friendlyName = PH.state.wallets[PH.state.mainWallet].name;

      var config = {
        scriptHash: PH.contractScriptHash,
        operation: 'getInboxContent',
        args: [
          neonJs.sc.ContractParam.byteArray(Neon.u.str2hexstring(friendlyName), 'string'),
          neonJs.sc.ContractParam.integer(number + 1)
        ]
      };

      var script = Neon.create.script(config);

      neonJs.rpc.Query.invokeScript(script, false).execute('http://seed1.cityofzion.io:8080')
      .then(res => {
        var ret = null;
        try {
          ret = JSON.parse(atob(Neon.u.hexstring2str(res.result.stack[0].value)));
          if (ret.constructor != Object) {
            ret = null;
          }
        } catch(e) {}

        if (!ret) {
          console.warn('Malformed message');

          ret = {
            subject: 'ERROR',
            date: '2018-01-01T10:10:10.203Z',
            content: 'ERROR',
            fromAddress: 'ERROR',
            fromInbox: 'ERROR',
            toAddress: PH.neoWallet.address,
            toInbox: friendlyName
          };
        }

        callback(ret);
      });
    },

    getOutboxCount: function(callback) {
      var friendlyName = PH.state.wallets[PH.state.mainWallet].name;

      var config = {
        scriptHash: PH.contractScriptHash,
        operation: 'getOutboxCount',
        args: [
          neonJs.sc.ContractParam.byteArray(Neon.u.str2hexstring(friendlyName), 'string')
        ]
      };

      var script = Neon.create.script(config);

      neonJs.rpc.Query.invokeScript(script, false).execute('http://seed1.cityofzion.io:8080')
      .then(res => {
        var ret = 0;
        try {
          ret = parseInt(res.result.stack[0].value);
          if (isNaN(ret) || ret < 0) {
            ret = 0;
          }
        } catch(e) {}

        callback(ret);
      });
    },

    getOutboxContent: function(number, callback) {
      var friendlyName = PH.state.wallets[PH.state.mainWallet].name;

      var config = {
        scriptHash: PH.contractScriptHash,
        operation: 'getOutboxContent',
        args: [
          neonJs.sc.ContractParam.byteArray(Neon.u.str2hexstring(friendlyName), 'string'),
          neonJs.sc.ContractParam.integer(number + 1)
        ]
      };

      var script = Neon.create.script(config);

      neonJs.rpc.Query.invokeScript(script, false).execute('http://seed1.cityofzion.io:8080')
      .then(res => {
        var ret = null;
        try {
          ret = JSON.parse(atob(Neon.u.hexstring2str(res.result.stack[0].value)));
          if (ret.constructor != Object) {
            ret = null;
          }
        } catch(e) {}

        if (!ret) {
          console.warn('Malformed message');

          ret = {
            subject: 'ERROR',
            date: '2018-01-01T10:10:10.203Z',
            content: 'ERROR',
            fromAddress: 'ERROR',
            fromInbox: 'ERROR',
            toAddress: PH.neoWallet.address,
            toInbox: friendlyName
          };
        }

        callback(ret);
      });
    },

    sendMessage: function(subject, content, toInbox, optCallback) {
      PH.contract.getAddressFromMailbox(toInbox, function(toAddress) {
        if (toAddress) {
          var dat = {
                      subject: subject,
                      date: new Date().toISOString(),
                      content: content,
                      fromAddress: PH.neoWallet.address,
                      fromInbox: PH.state.wallets[PH.state.mainWallet].name,
                      toAddress: toAddress,
                      toInbox: toInbox,
                      v: PH.version
                    };

          var message = JSON.stringify(dat);

          var config = {
            net: 'MainNet',
            script: Neon.create.script({
              scriptHash: PH.contractScriptHash,
              operation: 'sendMessage',
              args: [
                neonJs.sc.ContractParam.byteArray(PH.neoWallet.address, 'address'),
                neonJs.sc.ContractParam.byteArray(Neon.u.str2hexstring(toInbox), 'string'),
                neonJs.sc.ContractParam.byteArray(Neon.u.str2hexstring(btoa(message)), 'string'),
              ]
            }),
            account: PH.neoWallet,
            gas: 0
          }

          Neon.doInvoke(config).then(res => {
            if (optCallback) {
              var result = false;
              try {
                result = res.response.result && res.response.txid.length > 0;
              } catch(e) {}

              optCallback(result);
            }
          });
        } else {
          console.warn('Could not resolve address for mailbox ' + toInbox);
        }
      });
    },

    fetchInbox: function(callback) {
      PH.contract.getInboxCount(function(count) {
        console.log('Found ' + count + ' messages');

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

          console.log('Fetching received message #' + (index1 + 1));
          PH.contract.getInboxContent(index1, function(content) {
            content['idx'] = index1;
            acc1.push(content);

            recursiveInboxFetch(acc1, index1 + 1, count1, callback1);
          });
        };

        recursiveInboxFetch([], 0, count, callback);
      });
    },

    fetchOutbox: function(callback) {
      PH.contract.getOutboxCount(function(count) {
        console.log('Found ' + count + ' messages');

        recursiveOutboxFetch = function(acc1, index1, count1, callback1) {
          if (count1 === index1) {
            // Finished
            PH.state.outbox.items = acc1;
            PH.saveData();
            if (callback1) {
              callback1();
            }
            return;
          }

          console.log('Fetching sent message #' + (index1 + 1));
          PH.contract.getOutboxContent(index1, function(content) {
            content['idx'] = index1;
            acc1.push(content);

            recursiveOutboxFetch(acc1, index1 + 1, count1, callback1);
          });
        };

        recursiveOutboxFetch([], 0, count, callback);
      });
    },

    removeInboxMessage: function(index, callback) {
      console.log(index)
      var config = {
        net: 'MainNet',
        script: Neon.create.script({
          scriptHash: PH.contractScriptHash,
          operation: 'removeInboxMessage',
          args: [
            neonJs.sc.ContractParam.byteArray(PH.neoWallet.address, 'address'),
            neonJs.sc.ContractParam.integer(index)
          ]
        }),
        account: PH.neoWallet,
        gas: 0
      }

      Neon.doInvoke(config).then(res => {
        console.log(res);
        callback();
      });
    },

    removeOutboxMessage: function(index, callback) {
      console.log(index)
      var config = {
        net: 'MainNet',
        script: Neon.create.script({
          scriptHash: PH.contractScriptHash,
          operation: 'removeOutboxMessage',
          args: [
            neonJs.sc.ContractParam.byteArray(PH.neoWallet.address, 'address'),
            neonJs.sc.ContractParam.integer(index)
          ]
        }),
        account: PH.neoWallet,
        gas: 0
      }

      Neon.doInvoke(config).then(res => {
        console.log(res);
        callback();
      });
    },

    deleteMessage: function(index, optCallback) {
      if (!(PH.state.section === 'inbox' || PH.state.section === 'outbox')) {
        console.warn('deleteCurrentMessage - invalid invocation - wrong section');
        return;
      }
      var removeFunc = PH.state.section === 'inbox' ? PH.contract.removeInboxMessage : PH.contract.removeOutboxMessage;

      removeFunc(index, function() {
        if (optCallback) {
          optCallback();
        }
      });
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
