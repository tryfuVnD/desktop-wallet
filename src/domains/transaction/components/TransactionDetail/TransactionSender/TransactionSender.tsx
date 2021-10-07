import { Networks } from "@payvo/sdk";
import { Address } from "app/components/Address";
import { Avatar } from "app/components/Avatar";
import { Circle } from "app/components/Circle";
import { Icon } from "app/components/Icon";
import { useActiveProfile, useWalletAlias } from "app/hooks";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { TransactionDetail, TransactionDetailProperties } from "../TransactionDetail";

type TransactionSenderProperties = {
	address: string;
	network: Networks.Network;
} & TransactionDetailProperties;

export const TransactionSender = ({ address, network, ...properties }: TransactionSenderProperties) => {
	const { t } = useTranslation();

	const activeProfile = useActiveProfile();

	const { getWalletAlias } = useWalletAlias();
	const { alias, isDelegate } = useMemo(
		() =>
			getWalletAlias({
				address,
				network,
				profile: activeProfile,
			}),
		[activeProfile, getWalletAlias, address, network],
	);

	return (
		<TransactionDetail
			data-testid="TransactionSender"
			label={t("TRANSACTION.SENDER")}
			extra={
				<div className="flex items-center -space-x-1">
					{isDelegate && (
						<Circle
							className="border-theme-text text-theme-text dark:border-theme-secondary-600 dark:text-theme-secondary-600"
							size="lg"
						>
							<Icon name="Delegate" size="lg" />
						</Circle>
					)}
					<Avatar address={address} size="lg" />
				</div>
			}
			{...properties}
		>
			<Address address={address} walletName={alias} />
		</TransactionDetail>
	);
};

TransactionSender.defaultProps = {
	borderPosition: "top",
};
