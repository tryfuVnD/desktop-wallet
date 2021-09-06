import { Contracts } from "@payvo/profiles";
import { Address } from "app/components/Address";
import { Avatar } from "app/components/Avatar";
import { Clipboard } from "app/components/Clipboard";
import { Header } from "app/components/Header";
import { Icon } from "app/components/Icon";
import { Image } from "app/components/Image";
import { TruncateMiddleDynamic } from "app/components/TruncateMiddleDynamic";
import { RecipientList } from "domains/transaction/components/RecipientList";
import { RecipientListItem } from "domains/transaction/components/RecipientList/RecipientList.models";
import {
	TransactionDetail,
	TransactionNetwork,
	TransactionSender,
	TransactionType,
} from "domains/transaction/components/TransactionDetail";
import { ExtendedSignedTransactionData } from "domains/transaction/pages/SendRegistration/SendRegistration.models";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { assertString } from "utils/assertions";

interface TransactionSuccessfulProperties {
	children?: React.ReactNode;
	transaction?: ExtendedSignedTransactionData;
	senderWallet?: Contracts.IReadWriteWallet;
}

export const MultiSignatureSuccessful = ({ children, transaction, senderWallet }: TransactionSuccessfulProperties) => {
	const { t } = useTranslation();
	const [generatedAddress, setGeneratedAddress] = useState<string>();
	const [participantAddresses, setParticipantAddresses] = useState<RecipientListItem[]>();

	const [minParticipants, setMinParticipants] = useState<number>();
	const [publicKeys, setPublicKeys] = useState<string[]>();

	useEffect(() => {
		const fetchData = async () => {
			if (!transaction || !senderWallet) {
				return;
			}

			const addressFromPublicKey = async (wallet: Contracts.IReadWriteWallet, publicKey?: string) => {
				if (publicKey === wallet.publicKey() && wallet.isLedger()) {
					const derivationPath = wallet.data().get(Contracts.WalletData.DerivationPath);
					assertString(derivationPath);

					const ledgerWalletPublicKey = await wallet.ledger().getPublicKey(derivationPath);
					return (await wallet.coin().address().fromPublicKey(ledgerWalletPublicKey)).address;
				}

				assertString(publicKey);

				return (await wallet.coin().address().fromPublicKey(publicKey)).address;
			};

			const { min, publicKeys } = transaction.get("multiSignature");
			const { address } = await senderWallet.coin().address().fromMultiSignature(min, publicKeys);

			const addresses: RecipientListItem[] = [];
			for (const publicKey of publicKeys) {
				const address = await addressFromPublicKey(senderWallet, publicKey);
				assertString(address);
				addresses.push({ address });
			}

			setGeneratedAddress(address);
			setParticipantAddresses(addresses);
			setMinParticipants(min);
			setPublicKeys(publicKeys);
		};

		fetchData();
	}, [transaction, senderWallet]);

	const transactionIdReference = useRef(null);

	return (
		<section data-testid="TransactionSuccessful" className="space-y-8">
			<Header title={t("TRANSACTION.SUCCESS.CREATED")} />

			<Image name="TransactionSignedBanner" domain="transaction" className="w-full" />

			<p className="text-theme-secondary-text">{t("TRANSACTION.SUCCESS.MUSIG_DESCRIPTION")}</p>

			<div>
				{senderWallet && transaction && (
					<>
						<TransactionDetail label={t("TRANSACTION.ID")}>
							<div className="flex items-center space-x-3">
								<span ref={transactionIdReference} className="overflow-hidden">
									<TruncateMiddleDynamic
										value={transaction.id()}
										parentRef={transactionIdReference}
									/>
								</span>

								<span className="flex text-theme-primary-300 dark:text-theme-secondary-600">
									<Clipboard variant="icon" data={transaction.id()}>
										<Icon name="Copy" />
									</Clipboard>
								</span>
							</div>
						</TransactionDetail>

						{generatedAddress && (
							<TransactionDetail
								data-testid="TransactionSuccessful__musig-address"
								label={
									<div className="flex items-center space-x-2">
										<span>{t("TRANSACTION.MULTISIGNATURE.GENERATED_ADDRESS")}</span>{" "}
										<Icon name="Multisignature" />
									</div>
								}
								extra={
									<div className="flex items-center -space-x-2">
										<Avatar address={generatedAddress} size="lg" />
									</div>
								}
							>
								<div className="flex flex-grow text-theme-primary-300 dark:text-theme-secondary-600 space-x-2 items-center">
									<div>
										<Address address={generatedAddress} />
									</div>
									<Clipboard variant="icon" data={generatedAddress}>
										<Icon name="Copy" />
									</Clipboard>
								</div>
							</TransactionDetail>
						)}

						<TransactionNetwork network={senderWallet.network()} />

						<TransactionSender
							address={senderWallet.address()}
							alias={senderWallet.alias()}
							isDelegate={senderWallet.isDelegate() && !senderWallet.isResignedDelegate()}
						/>

						<TransactionDetail label={t("TRANSACTION.MULTISIGNATURE.PARTICIPANTS")} paddingPosition="top">
							<RecipientList
								showAmount={false}
								variant="condensed"
								recipients={participantAddresses}
								isEditable={false}
							/>
						</TransactionDetail>

						{publicKeys?.length && (
							<TransactionDetail label={t("TRANSACTION.MULTISIGNATURE.MIN_SIGNATURES")}>
								<span>{minParticipants} </span>
								<span
									data-testid="MultiSignatureSuccessful__publicKeys"
									className="text-theme-secondary-700"
								>
									{t("TRANSACTION.MULTISIGNATURE.OUT_OF_LENGTH", {
										length: publicKeys.length,
									})}
								</span>
							</TransactionDetail>
						)}

						<TransactionType type={transaction.type()} />
					</>
				)}

				{children}
			</div>
		</section>
	);
};