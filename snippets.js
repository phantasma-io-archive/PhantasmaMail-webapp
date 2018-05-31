
var sb = Neon.create.scriptBuilder();
sb.emitAppCall('ed07cffad18f1308db51920d99a2af60ac66a7b3', 'totalSupply', []);
neonJs.rpc.Query.invokeScript(sb.str).execute("https://seed1.neo.org:20331").then((a) => { console.log(a) });





curl \
-H "Content-Type: application/json" \
-X POST \
-d '{"jsonrpc":"2.0","id":"123","method":"getversion","params":[]}' \
http://192.168.1.148:30333


// Preamble to use private net

Neon.add.network('PrivateNet')
Neon.add.network({ name: 'PrivateNet' })

var privNetConfig = {
  name: 'PrivateNet',
  extra: {
    neonDB: 'http://89.115.152.211:5000',
    neoscan: 'http://89.115.152.211:30333/api/main_net'
  }
}

var privateNet = new neonJs.rpc.Network(privNetConfig)
Neon.add.network(privateNet)




// Invoke a contract

config = {
  net: 'MainNet',
  script: {
    scriptHash: 'ed07cffad18f1308db51920d99a2af60ac66a7b3',
    operation: 'totalSupply',
    args: [
    //  Neon.u.reverseHex(Neon.u.str2hexstring(PH.neoWallet.scriptHash))
    //  neonJs.sc.ContractParam.byteArray(PH.neoWallet.scriptHash, 'string'),
    //  neonJs.sc.ContractParam.byteArray('6464724724846584654655', 'string'),
    ]
  },
  account: PH.neoWallet,
  gas: 0
};

Neon.doInvoke(config).then(res => {
  console.log(res);
  console.log(res.response);
});





// Transfer assets

intent = neonJs.api.makeIntent({ NEO: 0.1 }, 'Acrzq2zCsrTYfxkAw11Usj8ccD9ocEyBVE')

config = {
  net: 'MainNet', // The network to perform the action, MainNet or TestNet.
  account: PH.neoWallet,
  intents: intent
}

Neon.sendAsset(config)
.then(config => {
  console.log(config)
})
.catch(config => {
  console.log(config)
})




// Transfer assets

neonJs.api.default.sendAsset({
  net: 'MainNet',
  account: PH.neoWallet,
  intents: neonJs.api.makeIntent({
    NEO: 0.1,
  }, 'Acrzq2zCsrTYfxkAw11Usj8ccD9ocEyBVE'),
})
.then(config => {
  console.log(config)
})