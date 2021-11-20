import { translations } from "domains/transaction/i18n";
import React from "react";
import { Route } from "react-router-dom";
import { TransactionFixture } from "tests/fixtures/transactions";
import { getDefaultProfileId, render, screen } from "utils/testing-library";

import { LegacyMagistrateDetail } from "./LegacyMagistrateDetail";

const fixtureProfileId = getDefaultProfileId();

describe("LegacyMagistrateDetail", () => {
	it("should not render if not open", () => {
		const { asFragment } = render(<LegacyMagistrateDetail isOpen={false} transaction={TransactionFixture} />);

		expect(() => screen.getByTestId("modal__inner")).toThrow(/Unable to find an element by/);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a legacy magistrate modal", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<LegacyMagistrateDetail
					isOpen={true}
					transaction={{
						...TransactionFixture,
						isTransfer: () => false,
						type: () => "magistrate",
					}}
				/>
			</Route>,
			{
				routes: [`/profiles/${fixtureProfileId}`],
			},
		);

		expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.TRANSACTION_TYPES.MAGISTRATE);
		expect(asFragment()).toMatchSnapshot();
	});
});
