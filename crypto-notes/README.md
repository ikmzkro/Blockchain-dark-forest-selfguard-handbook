# Install
```
npm i
```

# Env
```
SIGNED_ACOUNT_ADDRESS_ON_ETHERIUM=
PRIVATE_KEY=
```

# Commands
```
tsc && node ecdsa/ecdsaVerify.js
tsc && node ecdh/ecdh.js
tsc && node ethereum/ethereumAddressGenerator.js
tsc && node ethereum/hdWallet.js
tsc && node sss/shamirsSecretSharing.js
```

# Refs
```
# TSS ECDSA
https://tech.andgo.co.jp/entry/2024/05/25/140838

# SSS
https://kimh.github.io/blog/jp/security/protect-your-secret-key-with-shamirs-secret-sharing-jp/
https://github.com/fireblocks/mpc-lib/blob/main/src/common/crypto/shamir_secret_sharing/verifiable_secret_sharing.c

# EIP-7702
https://blog.thirdweb.com/eip-7702/
https://medium.com/gaudiy-web3-and-ai-lab-jp/41354a13779a
```