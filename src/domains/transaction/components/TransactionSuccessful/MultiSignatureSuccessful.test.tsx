import { Contracts } from "@payvo/profiles";
import React from "react";
import { env, getDefaultProfileId, render, waitFor } from "testing-library";
import { TransactionFixture } from "tests/fixtures/transactions";

import { MultiSignatureSuccessful } from "./MultiSignatureSuccessful";

describe("MultiSignatureSuccessful", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should render", async () => {
		const transaction = {
			...TransactionFixture,
			wallet: () => wallet,
		};

		jest.spyOn(transaction, "get").mockImplementation((attribute) => {
			if (attribute === "multiSignature") {
				return {
					min: 2,
					publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()],
				};
			}

			//@ts-ignore
			return transaction[attribute]();
		});

		jest.spyOn(wallet, "isResignedDelegate").mockReturnValue(true);

		const { asFragment, getByTestId } = render(
			<MultiSignatureSuccessful senderWallet={wallet} transaction={transaction}>
				<div />
			</MultiSignatureSuccessful>,
		);

		await waitFor(() => expect(getByTestId("MultiSignatureSuccessful__publicKeys")).toBeInTheDocument());

		expect(asFragment()).toMatchSnapshot();

		jest.restoreAllMocks();
	});

	it("should render with delegate sender wallet", async () => {
		const transaction = {
			...TransactionFixture,
			wallet: () => wallet,
		};

		jest.spyOn(wallet, "isDelegate").mockReturnValue(true);
		jest.spyOn(wallet, "isResignedDelegate").mockReturnValue(false);

		jest.spyOn(transaction, "get").mockImplementation((attribute) => {
			if (attribute === "multiSignature") {
				return {
					min: 2,
					publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()],
				};
			}

			//@ts-ignore
			return transaction[attribute]();
		});

		jest.spyOn(wallet, "isResignedDelegate").mockReturnValue(true);

		const { asFragment, getByTestId } = render(
			<MultiSignatureSuccessful senderWallet={wallet} transaction={transaction}>
				<div />
			</MultiSignatureSuccessful>,
		);

		await waitFor(() => expect(getByTestId("MultiSignatureSuccessful__publicKeys")).toBeInTheDocument());

		expect(asFragment()).toMatchSnapshot();

		jest.restoreAllMocks();
	});

	it("should handle empty wallet and transation props", async () => {
		const { asFragment, getByTestId } = render(
			<MultiSignatureSuccessful senderWallet={undefined} transaction={undefined}>
				<div />
			</MultiSignatureSuccessful>,
		);

		await waitFor(() => expect(() => getByTestId("MultiSignatureSuccessful__publicKeys")).toThrow());

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render without generated address", async () => {
		const transaction = {
			...TransactionFixture,
			wallet: () => wallet,
		};

		jest.spyOn(transaction, "get").mockImplementation((attribute) => {
			if (attribute === "multiSignature") {
				return {
					min: 2,
					publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()],
				};
			}

			//@ts-ignore
			return transaction[attribute]();
		});

		jest.spyOn(transaction.wallet().coin().address(), "fromMultiSignature").mockResolvedValue({
			address: undefined,
		});

		const { asFragment, getByTestId } = render(
			<MultiSignatureSuccessful senderWallet={wallet} transaction={transaction}>
				<div />
			</MultiSignatureSuccessful>,
		);

		await waitFor(() => expect(getByTestId("MultiSignatureSuccessful__publicKeys")).toBeInTheDocument());

		expect(asFragment()).toMatchSnapshot();

		jest.restoreAllMocks();
	});

	it("should render with ledger sender wallet", async () => {
		const transaction = {
			...TransactionFixture,
			wallet: () => wallet,
		};

		const derivationPath = "m/44'/1'/1'/0/0";
		const publicKey = wallet.publicKey();
		jest.spyOn(wallet, "isLedger").mockImplementation(() => true);

		jest.spyOn(transaction, "get").mockImplementation((attribute) => {
			if (attribute === "multiSignature") {
				return {
					min: 2,
					publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()],
				};
			}

			if (attribute === Contracts.WalletData.DerivationPath) {
				return publicKey;
			}

			//@ts-ignore
			return transaction[attribute]();
		});

		jest.spyOn(wallet.data(), "get").mockImplementation((attribute) => {
			if (attribute === Contracts.WalletData.DerivationPath) {
				return derivationPath;
			}
		});

		jest.spyOn(wallet.ledger(), "getPublicKey").mockResolvedValue(publicKey!);

		jest.spyOn(transaction.wallet().coin().address(), "fromMultiSignature").mockResolvedValue({
			address: undefined,
		});

		const { asFragment, getByTestId } = render(
			<MultiSignatureSuccessful senderWallet={wallet} transaction={transaction}>
				<div />
			</MultiSignatureSuccessful>,
		);

		await waitFor(() => expect(getByTestId("MultiSignatureSuccessful__publicKeys")).toBeInTheDocument());

		expect(asFragment()).toMatchSnapshot();

		jest.restoreAllMocks();
	});
});
