var SASIToken = artifacts.require("./SASIToken.sol");

contract('SASIToken' , function(accounts) {
	var tokenInstance;

	it('initializes the contract with correct values', function() { 
		return SASIToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.name();
		}).then(function(name) {
			assert.equal(name, 'SASI Token', 'has the correct name');
			return tokenInstance.symbol();
		}).then(function(symbol) {
			assert.equal(symbol, 'SASI', 'has the correct symbol');
			return tokenInstance.standard();
		}).then(function(standard) {
			assert.equal(standard, 'SASI Token v1.0', 'has the correct standard');
		});
	})

	it('allocates the initial token supply on deployment', function() {
		return SASIToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply) {
			assert.equal(totalSupply.toNumber(),  1000000, 'sets totalSupply to 1 Million (10,00,000)');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(adminBalance)	{
			assert.equal(adminBalance.toNumber(), 1000000, "it allocates the initial supply to admin account");	
		});
	});

	it('transfers token ownership', function() {
		return SASIToken.deployed().then(function(instance) {
			tokenInstance = instance;
			// Test "require" stmt first by sending a token transfer greater than the sender's balance
			return tokenInstance.transfer.call(accounts[1], 9999999999999);
		}).then(assert.fail).catch(function(error) {
			assert(error.message.toString().indexOf(' ') >= 0 , 'error message must contain revert');
	      	return tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0] });
	    }).then(function(success) {
      		assert.equal(success, true, 'it returns true');			
			return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'triggers one event');
      		assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
      		assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
      		assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
      		assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');
			return tokenInstance.balanceOf(accounts[1]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(),  250000, 'adds the amount to receiving account');
			return tokenInstance.balanceOf(accounts[0]);
			assert.equal(balance.toNumber(), totalSupply-250000, 'deducts amount from the sending account');

		});
	});

	it('approves tokens for delegated transfer' , function() {
		return SASIToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.approve.call(accounts[1], 100, { from: accounts[0] });
		}).then(function(success) {
			assert.equal(success, true, 'it returns true')
			return tokenInstance.approve(accounts[1], 100)
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'triggers one event');
      		assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
      		assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are approved by');
      		assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs account the tokens are approved to transfer from');
      		assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
      		return tokenInstance.allowance(accounts[0], accounts[1]);
      	}).then(function(allowance) {
			assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer');
		});
	});



	it('handles delegated token transfers' , function() {
		return SASIToken.deployed().then(function(instance) {
			tokenInstance   = instance;
			fromAccount     = accounts[2];
			toAccount       = accounts[3];
			spendingAccount = accounts[4];
			// Transfer some token to fromAccount
			return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
		}).then(function(receipt) {
			// Approve spendingAccount to spend 10 tokens from fromAccount
			return tokenInstance.approve(spendingAccount , 10, { from: fromAccount });
		}).then(function(receipt) {
			// Try transferring tokens larger than sender's balance
			return tokenInstance.transferFrom(fromAccount, toAccount, 9999, {from: spendingAccount });
		}).then(assert.fail).catch(function(error) {
			assert(error.message.toString().indexOf("revert") >= 0, 'cannot transfer value larger than balance');
			// Try transferring tokens larger than approved amount
			return tokenInstance.transferFrom(fromAccount, toAccount, 20, {from: spendingAccount });
		}).then(assert.fail).catch(function(error) {
			assert(error.message.toString().indexOf("revert") >= 0, 'cannot transfer value larger than approved amount');
			return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {from: spendingAccount });
		}).then(function(success) {
			assert.equal(success, true);
			return tokenInstance.transferFrom(fromAccount, toAccount, 10, {from: spendingAccount });
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'triggers one event');
      		assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
      		assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transferred from');
      		assert.equal(receipt.logs[0].args._to, toAccount, 'logs account the tokens are transferred to');
      		assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
			return tokenInstance.balanceOf(fromAccount);
		}).then(function(balance) {			
			assert.equal(balance.toNumber(), 90, 'deducts the amount for sending account');
			return tokenInstance.balanceOf(toAccount);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 10, 'adds the amount for receivng account');
			return tokenInstance.allowance(fromAccount, spendingAccount);
		}).then(function(allowance) {			
			assert.equal(allowance.toNumber(), 0, 'deducts the amount from allowance');
		});
	  });
	});