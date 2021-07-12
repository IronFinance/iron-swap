import {ethers} from 'hardhat';
import {parseUnits} from 'ethers/lib/utils';
import {DeployFunction} from 'hardhat-deploy/types';
import {constants} from 'ethers';

const getBalance = async (token: string, address: string) => {
  const contract = await ethers.getContractAt('MockERC20', token);
  const balance = await contract.balanceOf(address);
  return balance.toString();
};

const deadline = Math.floor(Date.now() / 1000 + 3600);

const func: DeployFunction = async ({deployments, getNamedAccounts, getUnnamedAccounts, ethers}) => {
  const {deploy, execute, get} = deployments;
  const {creator} = await getNamedAccounts();
  console.log('creator', creator);

  const usdc = await get('USDC');
  const usdt = await get('USDT');
  const dai = await get('DAI');
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
    [usdc.address, usdt.address, dai.address], //_coins,
    [6, 6, 18], //token decimals
    'IRON Stableswap LP', // pool token name
    'zDollar', //_pool_token
    600, // _A
    1e6, //_fee = 0.01%
    5e9, //_admin_fee, 50%,
    5e7, //withdraw fee = 0.5%
    feeDistributor.address
  );

  // await execute('zDollar', {from: creator, log: true}, 'setMinter', pool.address);

  await execute(
    'FeeDistributor',
    {from: creator, log: true},
    'setSwapConfig',
    usdt.address,
    0,
    pool.address,
    constants.AddressZero
  );

  await execute(
    'FeeDistributor',
    {from: creator, log: true},
    'setSwapConfig',
    dai.address,
    0,
    pool.address,
    constants.AddressZero
  );

  const poolContract = await ethers.getContract('3pool');
  const lpContract = await ethers.getContractAt('LPToken', await poolContract.getLpToken());

  const [alice, bob] = await getUnnamedAccounts();

  await execute('USDC', {from: alice}, 'approve', pool.address, ethers.constants.MaxInt256);
  await execute('USDT', {from: alice}, 'approve', pool.address, ethers.constants.MaxInt256);
  await execute('DAI', {from: alice}, 'approve', pool.address, ethers.constants.MaxInt256);

  console.log('add_liquidity');
  const tokenAmount = await poolContract.calculateTokenAmount(
    [parseUnits('10', 6), parseUnits('10', 6), parseUnits('10', 18)],
    true
  );
  console.log('Estimated LP', tokenAmount.toString());

  await execute(
    '3pool',
    {from: alice, gasLimit: 2e6},
    'addLiquidity',
    [parseUnits('10', 6), parseUnits('10', 6), parseUnits('10', 18)],
    0,
    deadline
  );

  console.log('add_liquidity_success');
  console.log('USDC balance', await getBalance(usdc.address, alice));
  console.log('USDT balance', await getBalance(usdt.address, alice));
  console.log('DAI balance', await getBalance(dai.address, alice));
  console.log('Curve balance', await getBalance(lpContract.address, alice));
  await execute(
    '3pool',
    {from: alice, gasLimit: 2e6},
    'addLiquidity',
    [parseUnits('10', 6), parseUnits('20', 6), parseUnits('10', 18)],
    0,
    deadline
  );
  console.log('USDC balance', await getBalance(usdc.address, alice));
  console.log('USDT balance', await getBalance(usdt.address, alice));
  console.log('DAI balance', await getBalance(dai.address, alice));
  console.log('Curve balance', await getBalance(lpContract.address, alice));

  const expected = await poolContract.calculateSwap(0, 2, parseUnits('1', 6));
  console.log('expected', expected.toString());
  const tx = await poolContract
    .connect((await ethers.getUnnamedSigners())[0])
    .swap(0, 2, parseUnits('1', 6), 0, deadline);
  const receipt = await tx.wait();

  console.log(receipt.events.find((t: any) => t.event === 'TokenExchange').args.tokensBought.toString());
};

export default func;

func.skip = async (hre) => {
  return hre.network.name != 'localhost' && hre.network.name != 'hardhat';
};

func.tags = ['3pool'];
