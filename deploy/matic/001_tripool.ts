import {DeployFunction} from 'hardhat-deploy/types';
import {constants} from 'ethers';

const func: DeployFunction = async ({deployments, getNamedAccounts, wellknown, ethers}) => {
  const {deploy, execute, get} = deployments;
  const {creator} = await getNamedAccounts();
  console.log('> creator', creator);
  console.log('> Deploy tri-pool');
  console.log(wellknown.addresses);

  const feeDistributor = await get('FeeDistributor');
  const stableSwapLib = await get('IronSwapLib');

  const pool = await deploy('3pool', {
    contract: 'IronSwap',
    from: creator,
    log: true,
    args: [],
    libraries: {
      IronSwapLib: stableSwapLib.address,
    },
  });

  await execute(
    '3pool',
    {from: creator, log: true},
    'initialize',
    [wellknown.addresses.usdc, wellknown.addresses.usdt, wellknown.addresses.dai], //_coins,
    [6, 6, 18], //token decimals
    'IRON Stableswap 3USD', // pool token name
    'IS3USD', //_pool_token
    800, // _A
    1e6, //_fee 0.01%
    5000000000, //_admin_fee 50%
    5e7, // withdrawal fee 0.4%
    feeDistributor.address
  );

  await execute(
    'FeeDistributor',
    {from: creator, log: true},
    'setSwapConfig',
    wellknown.addresses.usdt,
    0,
    pool.address,
    constants.AddressZero
  );

  await execute(
    'FeeDistributor',
    {from: creator, log: true},
    'setSwapConfig',
    wellknown.addresses.dai,
    0,
    pool.address,
    constants.AddressZero
  );

  const triPool = await ethers.getContract('3pool');
  console.log('LPToken: ', await triPool.getLpToken());
};

export default func;

func.skip = async (hre) => {
  return hre.network.name != 'matic';
};

func.tags = ['3pool'];
