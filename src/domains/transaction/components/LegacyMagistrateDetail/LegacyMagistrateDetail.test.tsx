import React from "react";
import { Route } from "react-router-dom";
import { TransactionFixture } from "tests/fixtures/transactions";
import { getDefaultProfileId, render, renderWithRouter } from "utils/testing-library";

import { translations } from "../../i18n";
import { LegacyMagistrateDetail } from "./LegacyMagistrateDetail";

const fixtureProfileId = getDefaultProfileId();

describe("LegacyMagistrateDetail", () => {
	it("should not render if not open", () => {
		const { asFragment, getByTestId } = render(
			<LegacyMagistrateDetail isOpen={false} transaction={TransactionFixture} />,
		);

		expect(() => getByTestId("modal__inner")).toThrow(/Unable to find an element by/);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a legacy magistrate modal", () => {
		const { asFragment, getByTestId } = renderWithRouter(
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

		expect(getByTestId("modal__inner")).toHaveTextContent(translations.TRANSACTION_TYPES.MAGISTRATE);
		expect(asFragment()).toMatchSnapshot();
	});
});
