/**
 * Arbitrum Goerli
 */

import IconETH from "@src/assets/tokens/eth.svg";
import IconWETH from "@src/assets/tokens/weth.png";

import Icon1inch from "@src/assets/dapps/1inch.svg";
import IconAave from "@src/assets/dapps/aave.svg";
import IconCurve from "@src/assets/dapps/curve.png";
import IconUniswap from "@src/assets/dapps/uniswap.svg";
import IconYearn from "@src/assets/dapps/yearn.svg";

export const wethAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";

export const assetsList = [
    {
        icon: IconETH,
        symbol: "ETH",
        address: "0x0000000000000000000000000000000000000000",
    },
    // {
    //     icon: IconWETH,
    //     symbol: "WETH",
    //     address: wethAddress,
    // },
];

export const dappsList = [
    {
        icon: Icon1inch,
        title: "1inch",
        category: "DeFi",
        link: "https://app.1inch.io",
    },
    {
        icon: IconUniswap,
        title: "Uniswap",
        category: "DeFi",
        link: "https://app.uniswap.org/",
    },
    {
        icon: IconCurve,
        title: "Curve",
        category: "DeFi",
        link: "https://curve.fi",
    },
    {
        icon: IconYearn,
        title: "Yearn",
        category: "DeFi",
        link: "https://yearn.finance/",
    },
    {
        icon: IconAave,
        title: "Aave",
        category: "DeFi",
        link: "https://app.aave.com/",
    },
];

export default {
    assetsList,
    dappsList,
    // provider: `https://arb-goerli.g.alchemy.com/v2/demo`,
    provider: `https://goerli-rollup.arbitrum.io/rpc`,
    defaultSalt: 0,
    feeMultiplier: 3,
    defaultTip: 10 * 10 ** 9,
    // TODO,
    upgradeDelay: 10,
    guardianDelay: 100,
    guardianSalt: "",
    chainId: 421613,
    scanUrl: "https://goerli.arbiscan.io",
    bundlerUrl: "https://bundler-arb-goerli.soulwallets.me/rpc/",
    contracts: {
        logic: "0xaD1021AD721cb98E682F51489b1aD84395F3e495",
        guardianLogic: "0xFeA560e88BfC3700A4d09F2bA337F4496D9a8ca5",
        entryPoint: "0x0f8425222890A6D2548e095102b4C0B9F4A08c82",
        paymaster: "0x6C8AC88860fA6CebFB44C598c3E2c55cEE08b734",
        create2Factory: "0xce0042B868300000d44A59004Da54A005ffdcf9f",
        weth: wethAddress,
    },
};
