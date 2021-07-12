import {parseUnits} from 'ethers/lib/utils';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async ({deployments, getNamedAccounts, getUnnamedAccounts, ethers}) => {
  const {deploy, execute} = deployments;
  const {creator} = await getNamedAccounts();
  console.log('creator', creator);

  const usdc = await deploy('USDC', {
    contract: 'MockERC20',
    from: creator,
    log: true,
    args: ['USD Coin', 'USDC', 6],
  });

  const busd = await deploy('USDT', {
    contract: 'MockERC20',
    from: creator,
    log: true,
    args: ['Tether USD', 'USDT', 6],
  });

  const dai = await deploy('DAI', {
    contract: 'MockERC20',
    from: creator,
    log: true,
    args: ['DAI Stablecoin', 'DAI', 18],
  });

  const [alice, bob] = await getUnnamedAccounts();
  console.log({alice, bob});

  await execute('USDC', {from: alice, log: true}, 'mint', parseUnits('10000000', 6));
  await execute('USDT', {from: alice, log: true}, 'mint', parseUnits('10000000', 6));
  await execute('DAI', {from: alice, log: true}, 'mint', parseUnits('10000000', 18));
  await execute('USDC', {from: bob, log: true}, 'mint', parseUnits('10000000', 6));
  await execute('USDT', {from: bob, log: true}, 'mint', parseUnits('10000000', 6));
  await execute('DAI', {from: bob, log: true}, 'mint', parseUnits('10000000', 18));
};

export default func;

func.skip = async (hre) => {
  return hre.network.name != 'localhost' && hre.network.name != 'hardhat';
};
