import { sortByDesc } from "@payvo/sdk-helpers";
import { Contracts } from "@payvo/sdk-profiles";
import { AssetItem } from "domains/dashboard/components/PortfolioBreakdown/PortfolioBreakdown.contracts";
import { useEffect, useMemo, useState } from "react";
import { assertString } from "utils/assertions";

type UsePortfolioBreakdownHook = (input: {
	profile: Contracts.IProfile;
	profileIsSyncingExchangeRates: boolean;
	selectedNetworkIds: string[];
}) => {
	assets: AssetItem[];
	balance: number;
	loading: boolean;
	ticker: string;
	walletsCount: number;
};

export const usePortfolioBreakdown: UsePortfolioBreakdownHook = ({
	profile,
	profileIsSyncingExchangeRates,
	selectedNetworkIds,
}) => {
	const [loading, setLoading] = useState(false);
	const [assets, setAssets] = useState<AssetItem[]>([]);
	const [balance, setBalance] = useState<number>(0);

	const isRestored = profile.status().isRestored();

	const isEmpty = assets.length === 0;

	const ticker = useMemo<string>(
		() => {
			if (!isRestored) {
				return "";
			}

			const exchangeCurrency = profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency);
			assertString(exchangeCurrency);

			return exchangeCurrency;
		},
		[profile, isRestored], // eslint-disable-line react-hooks/exhaustive-deps
	);

	const walletIds = profile
		.wallets()
		.values()
		.filter((wallet) => {
			if (!wallet.network().isLive()) {
				return false;
			}

			if (!selectedNetworkIds.includes(wallet.networkId())) {
				return false;
			}

			return true;
		})
		.map((wallet) => wallet.id())
		.sort()
		.join(".");

	useEffect(() => {
		if (!isRestored || (profileIsSyncingExchangeRates && isEmpty)) {
			setLoading(true);
			return;
		}

		const portfolioItems = sortByDesc(
			profile
				.portfolio()
				.breakdown({ networkIds: selectedNetworkIds })
				.map((asset) => ({
					amount: asset.source,
					convertedAmount: asset.target,
					label: asset.coin.network().ticker(),
					percent: asset.shares,
				})),
			(asset) => asset.percent,
		);

		if (portfolioItems.some((asset) => Number.isNaN(asset.convertedAmount))) {
			setLoading(true);
			return;
		}

		let balance = 0;
		for (const item of portfolioItems) {
			balance += item.convertedAmount;
		}

		setBalance(balance);
		setAssets(portfolioItems);
		setLoading(false);
	}, [isEmpty, isRestored, profile, profileIsSyncingExchangeRates, walletIds, selectedNetworkIds]);

	return {
		assets,
		balance,
		loading,
		ticker,
		walletsCount: walletIds.split(".").length,
	};
};
